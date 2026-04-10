"""
Full YU sitemap scraper — scrapes page-sitemap.xml and department-sitemap.xml
and adds structured KB entries for every useful university page.

Run from backend/ directory:
    python seed_kb_full.py

This script:
  1. Fetches all page and department URLs from YU sitemaps
  2. Skips Arabic duplicates (?lang=ar)
  3. Scrapes each page for structured content
  4. Generates intelligent Q&A pairs per page type
  5. Embeds and saves to the knowledge base
"""

import os
import sys
import re
import time
import django
import requests
from xml.etree import ElementTree

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yamamer_project.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from apps.chatbot.models import KnowledgeBase
from apps.chatbot.services.embedding import EmbeddingService

svc = EmbeddingService()

HEADERS = {'User-Agent': 'Mozilla/5.0 (compatible; YamamahBot/2.0)'}
REQUEST_TIMEOUT = 15
DELAY_BETWEEN_REQUESTS = 0.8  # polite crawling

# ── URL filters ────────────────────────────────────────────────────────────────

# Skip these URL patterns (they are not informational pages)
SKIP_PATTERNS = [
    r'\?lang=ar$',         # Arabic duplicates
    r'/author/',
    r'/tag/',
    r'/wp-content/',
    r'#',
    r'/feed/',
    r'/page/\d+',
    r'/gallery/',
    r'/video/',
    r'/%d',                # URL-encoded Arabic slugs in news posts
]

# High-priority pages to always include (even if content is short)
PRIORITY_URLS = {
    'https://yu.edu.sa/',
    'https://yu.edu.sa/about/policies/',
    'https://yu.edu.sa/about/board-of-trustees/',
    'https://yu.edu.sa/about/yu-presidents/',
    'https://yu.edu.sa/about/accreditation/',
    'https://yu.edu.sa/academics/coea/',
    'https://yu.edu.sa/academics/cob/',
    'https://yu.edu.sa/academics/coea/programs/',
    'https://yu.edu.sa/admissions/',
    'https://yu.edu.sa/registration/',
    'https://yu.edu.sa/graduation/',
    'https://yu.edu.sa/library/',
    'https://yu.edu.sa/student-services/',
    'https://yu.edu.sa/financial-aid/',
    'https://yu.edu.sa/career-services/',
    'https://yu.edu.sa/research/',
    'https://yu.edu.sa/global-engagement-office/',
    'https://yu.edu.sa/quality-assurance/',
    'https://yu.edu.sa/it-services/',
}


def should_skip(url: str) -> bool:
    for pattern in SKIP_PATTERNS:
        if re.search(pattern, url, re.IGNORECASE):
            return True
    return False


# ── HTML content extraction ────────────────────────────────────────────────────

def clean(text: str) -> str:
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'&[a-z]+;', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def extract_page_content(html: str) -> dict:
    """Extract title, headings, and body paragraphs from a page."""
    # Title
    m = re.search(r'<title[^>]*>(.*?)</title>', html, re.DOTALL | re.IGNORECASE)
    title = clean(m.group(1)).split('|')[0].split('–')[0].strip() if m else ''

    # H1
    h1 = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL | re.IGNORECASE)
    h1_text = clean(h1.group(1)) if h1 else ''

    # H2s (section headings)
    h2s = [clean(m) for m in re.findall(r'<h2[^>]*>(.*?)</h2>', html, re.DOTALL | re.IGNORECASE)]
    h2s = [h for h in h2s if 5 < len(h) < 200][:6]

    # Main content paragraphs
    # Try to get content from main/article/entry-content first
    main_match = re.search(
        r'(?:<main[^>]*>|<article[^>]*>|class=["\'][^"\']*entry-content[^"\']*["\'])[^>]*>(.*?)(?:</main>|</article>)',
        html, re.DOTALL | re.IGNORECASE
    )
    content_html = main_match.group(1) if main_match else html

    paragraphs = re.findall(r'<p[^>]*>(.*?)</p>', content_html, re.DOTALL | re.IGNORECASE)
    body_parts = []
    for p in paragraphs:
        text = clean(p)
        if len(text) > 60 and not re.search(r'copyright|privacy|cookie|lorem ipsum', text, re.I):
            body_parts.append(text)

    body = ' '.join(body_parts[:10])

    # Extract list items (useful for programs, policies, etc.)
    list_items = re.findall(r'<li[^>]*>(.*?)</li>', content_html, re.DOTALL | re.IGNORECASE)
    list_texts = [clean(li) for li in list_items if 10 < len(clean(li)) < 300][:15]

    return {
        'title': title or h1_text,
        'h1': h1_text,
        'h2s': h2s,
        'body': body,
        'list_items': list_texts,
    }


# ── Page type detection & Q&A generation ──────────────────────────────────────

def detect_page_type(url: str, content: dict) -> str:
    """Classify page type based on URL and content."""
    url_lower = url.lower()
    title_lower = content['title'].lower()

    if '/department/' in url_lower:            return 'department'
    if '/academics/' in url_lower:             return 'academics'
    if '/admissions' in url_lower:             return 'admissions'
    if '/about/' in url_lower:                 return 'about'
    if '/registration' in url_lower:           return 'registration'
    if '/library' in url_lower:                return 'library'
    if '/graduation' in url_lower:             return 'graduation'
    if '/financial' in url_lower:              return 'financial'
    if '/career' in url_lower:                 return 'career'
    if '/research' in url_lower:               return 'general'
    if '/student' in url_lower:               return 'general'
    if '/policy' in url_lower or '/policies' in url_lower: return 'general'
    if '/global' in url_lower:                 return 'general'
    if '/quality' in url_lower:               return 'general'
    return 'general'


def make_category(page_type: str) -> str:
    MAP = {
        'department':   'general',
        'academics':    'general',
        'admissions':   'registration',
        'about':        'general',
        'registration': 'registration',
        'library':      'general',
        'graduation':   'graduation',
        'financial':    'financial',
        'career':       'internship',
    }
    return MAP.get(page_type, 'general')


def generate_qa_pairs(url: str, content: dict, page_type: str) -> list[tuple]:
    """
    Returns list of (question, answer, category) tuples for a page.
    Each page generates 2-4 targeted Q&A pairs.
    """
    title = content['title']
    body  = content['body']
    h2s   = content['h2s']
    items = content['list_items']
    cat   = make_category(page_type)

    if not title or (len(body) < 50 and not items):
        return []

    pairs = []
    summary = body[:600] if body else ' | '.join(items[:5])

    # ── Department pages ───────────────────────────────────────────
    if page_type == 'department':
        dept_name = title.replace('Department', '').replace('department', '').strip()
        pairs.append((
            f'What is the {title} at Al Yamamah University?',
            f'{title}\n\n{summary}\n\nMore info: {url}',
            cat
        ))
        if items:
            pairs.append((
                f'What programs or courses does the {dept_name} offer?',
                f'The {title} offers the following:\n' + '\n'.join(f'• {i}' for i in items[:8]) + f'\n\nMore: {url}',
                cat
            ))
        return pairs

    # ── Academics pages ───────────────────────────────────────────
    if page_type == 'academics':
        pairs.append((
            f'What does the {title} page cover at Al Yamamah University?',
            f'{summary}\n\nReference: {url}',
            cat
        ))
        if items:
            pairs.append((
                f'What programs are available in {title}?',
                'Available programs and offerings:\n' + '\n'.join(f'• {i}' for i in items[:10]) + f'\n\nSee: {url}',
                cat
            ))
        if h2s:
            pairs.append((
                f'What sections does the {title} page include?',
                f'The {title} page includes: {", ".join(h2s)}.\n\nSee: {url}',
                cat
            ))
        return pairs

    # ── Admissions ────────────────────────────────────────────────
    if page_type == 'admissions':
        pairs.append((
            f'How do I apply to Al Yamamah University?',
            f'{summary}\n\nFor complete admissions information: {url}',
            cat
        ))
        if items:
            pairs.append((
                f'What are the admission requirements at Al Yamamah University?',
                'Admission requirements include:\n' + '\n'.join(f'• {i}' for i in items[:10]) + f'\n\nSee: {url}',
                cat
            ))
        return pairs

    # ── About pages ──────────────────────────────────────────────
    if page_type == 'about':
        q = f'What is the {title} of Al Yamamah University?'
        if 'board' in url.lower():
            q = 'Who is on the Board of Trustees of Al Yamamah University?'
        elif 'president' in url.lower():
            q = 'Who are the presidents of Al Yamamah University?'
        elif 'accreditat' in url.lower():
            q = 'What accreditations does Al Yamamah University have?'
        elif 'polic' in url.lower():
            q = 'What are the policies at Al Yamamah University?'

        pairs.append((
            q,
            f'{summary}\n\nMore: {url}',
            cat
        ))
        if items:
            pairs.append((
                f'List key information from the {title} page',
                '\n'.join(f'• {i}' for i in items[:8]) + f'\n\nSee: {url}',
                cat
            ))
        return pairs

    # ── Registration ─────────────────────────────────────────────
    if page_type == 'registration':
        pairs.append((
            f'How do I {title.lower()} at Al Yamamah University?',
            f'{summary}\n\nRegistration Office: {url}',
            cat
        ))
        if items:
            pairs.append((
                f'What are the steps for {title.lower()}?',
                '\n'.join(f'{i+1}. {s}' for i, s in enumerate(items[:8])) + f'\n\nSee: {url}',
                cat
            ))
        return pairs

    # ── Generic pages ────────────────────────────────────────────
    if title and (body or items):
        pairs.append((
            f'What is the {title} at Al Yamamah University?',
            f'{summary}\n\nReference: {url}',
            cat
        ))
        if items:
            pairs.append((
                f'What information is available about {title}?',
                '\n'.join(f'• {i}' for i in items[:8]) + f'\n\nMore: {url}',
                cat
            ))

    return pairs


# ── Fetching & scraping ────────────────────────────────────────────────────────

def fetch(url: str) -> str:
    try:
        r = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        r.raise_for_status()
        return r.text
    except Exception as e:
        print(f'  [WARN] Fetch failed: {e}')
        return ''


def get_sitemap_urls(sitemap_url: str) -> list[str]:
    r = requests.get(sitemap_url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
    r.raise_for_status()
    root = ElementTree.fromstring(r.content)
    ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    return [loc.text.strip() for loc in root.findall('.//sm:loc', ns)]


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print('=' * 60)
    print('YU Full Sitemap Scraper')
    print('=' * 60)

    # Collect URLs from relevant sitemaps
    all_urls = []

    for sitemap in [
        'https://yu.edu.sa/page-sitemap.xml',
        'https://yu.edu.sa/department-sitemap.xml',
    ]:
        try:
            urls = get_sitemap_urls(sitemap)
            print(f'  {sitemap}: {len(urls)} URLs')
            all_urls.extend(urls)
        except Exception as e:
            print(f'  ERROR {sitemap}: {e}')

    # Filter URLs
    filtered = []
    seen = set()
    for url in all_urls:
        if should_skip(url):
            continue
        # Normalize: remove trailing slash for dedup
        key = url.rstrip('/')
        if key in seen:
            continue
        seen.add(key)
        filtered.append(url)

    print(f'\nTotal after filtering: {len(filtered)} URLs')
    print('Starting scrape...\n')

    # Clear existing non-seeded general KB items that came from pages
    # (We keep the original seed_kb.py data, just add new ones)
    # Only delete if re-running this script to avoid duplicates
    existing_urls = set(
        KnowledgeBase.objects.filter(
            answer__contains='yu.edu.sa'
        ).values_list('answer', flat=True)
    )

    total_added   = 0
    total_skipped = 0
    total_failed  = 0
    category_counts = {}

    for i, url in enumerate(filtered, 1):
        print(f'[{i}/{len(filtered)}] {url}')

        html = fetch(url)
        if not html:
            total_failed += 1
            continue

        content   = extract_page_content(html)
        page_type = detect_page_type(url, content)
        pairs     = generate_qa_pairs(url, content, page_type)

        if not pairs:
            print(f'  [SKIP] No useful content extracted')
            total_skipped += 1
            time.sleep(0.3)
            continue

        for question, answer, category in pairs:
            # Skip if we already have a very similar entry
            if KnowledgeBase.objects.filter(question__iexact=question).exists():
                print(f'  [DUP] Already exists: {question[:60]}')
                continue

            kb = KnowledgeBase(question=question, answer=answer, category=category)
            try:
                embedding = svc.embed(f'{question}\n{answer[:500]}')
                kb.embedding = embedding
            except Exception as e:
                print(f'  [WARN] Embedding failed: {e}')

            kb.save()
            total_added += 1
            category_counts[category] = category_counts.get(category, 0) + 1

        print(f'  Added {len(pairs)} entries — [{page_type}] {content["title"][:60]}')
        time.sleep(DELAY_BETWEEN_REQUESTS)

    # Summary
    total_kb = KnowledgeBase.objects.count()
    print('\n' + '=' * 60)
    print('SCRAPING COMPLETE')
    print('=' * 60)
    print(f'  Pages scraped:  {len(filtered) - total_failed}')
    print(f'  Entries added:  {total_added}')
    print(f'  Skipped:        {total_skipped}')
    print(f'  Failed:         {total_failed}')
    print(f'  Total KB items: {total_kb}')
    print('\nBy category:')
    for cat, count in sorted(category_counts.items(), key=lambda x: -x[1]):
        print(f'  {cat:<20} {count}')


if __name__ == '__main__':
    main()
