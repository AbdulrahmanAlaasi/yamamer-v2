"""
Scrapes YU post sitemaps (news, events, partnerships, achievements).
These contain real university announcements that students ask about.

Run from backend/ directory:
    python seed_kb_posts.py
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
DELAY   = 0.6

# Keywords that make a post worth indexing
USEFUL_KEYWORDS = [
    'scholarship', 'program', 'partnership', 'accreditat', 'award',
    'ranking', 'tuition', 'admission', 'registration', 'graduation',
    'internship', 'career', 'research', 'mou', 'agreement', 'launch',
    'new program', 'degree', 'certificate', 'faculty', 'dean', 'president',
    'fee', 'financial', 'exam', 'schedule', 'calendar', 'event', 'club',
    'student', 'alumni', 'council', 'board', 'ministry', 'approved',
    'accredited', 'ranked', 'collaboration', 'training', 'workshop',
    'conference', 'competition', 'achievement', 'excellence', 'bloomberg',
    'ec-council', 'abet', 'ncaaa', 'interlink', 'emba', 'mba', 'law',
]

def clean(html: str) -> str:
    text = re.sub(r'<[^>]+>', ' ', html)
    text = re.sub(r'&[a-z]+;', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def fetch(url: str) -> str:
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        r.raise_for_status()
        return r.text
    except Exception as e:
        print(f'  [WARN] {e}')
        return ''


def extract_post(html: str) -> dict:
    # Title
    m = re.search(r'<title[^>]*>(.*?)</title>', html, re.DOTALL | re.IGNORECASE)
    title = clean(m.group(1)).split('|')[0].split('–')[0].strip() if m else ''

    # Published date
    date = ''
    dm = re.search(r'"datePublished"\s*:\s*"([^"]+)"', html)
    if dm:
        date = dm.group(1)[:10]

    # Try to get the post body from entry-content or article
    content_match = re.search(
        r'class=["\'][^"\']*(?:entry-content|post-content|article-content)[^"\']*["\'][^>]*>(.*?)(?:</article>|<div[^>]*class=["\'][^"\']*(?:sidebar|footer|related)[^"\']*)',
        html, re.DOTALL | re.IGNORECASE
    )
    content_html = content_match.group(1) if content_match else html

    # Extract paragraphs
    paras = re.findall(r'<p[^>]*>(.*?)</p>', content_html, re.DOTALL | re.IGNORECASE)
    body_parts = []
    for p in paras:
        text = clean(p)
        if len(text) > 60 and not re.search(r'cookie|privacy|copyright|subscribe|newsletter', text, re.I):
            body_parts.append(text)

    body = ' '.join(body_parts[:8])

    return {'title': title, 'date': date, 'body': body}


def is_useful(title: str, body: str) -> bool:
    """Only index posts that are genuinely informative for students."""
    combined = (title + ' ' + body).lower()
    return any(kw in combined for kw in USEFUL_KEYWORDS) and len(body) > 100


def categorize(title: str, body: str) -> str:
    text = (title + ' ' + body).lower()
    if any(k in text for k in ['scholarship', 'financial', 'fee', 'tuition', 'aid']):
        return 'financial'
    if any(k in text for k in ['admission', 'registration', 'enroll', 'apply']):
        return 'registration'
    if any(k in text for k in ['graduation', 'graduate', 'commencement']):
        return 'graduation'
    if any(k in text for k in ['internship', 'career', 'job', 'employment']):
        return 'internship'
    return 'general'


def get_urls(sitemap_url: str) -> list[str]:
    r = requests.get(sitemap_url, headers=HEADERS, timeout=15)
    r.raise_for_status()
    root = ElementTree.fromstring(r.content)
    ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    all_urls = [loc.text.strip() for loc in root.findall('.//sm:loc', ns)]
    # Only English URLs (skip Arabic and numeric-slug duplicates for common pages)
    return [
        u for u in all_urls
        if '%d' not in u
        and '?lang=ar' not in u
        and u != 'https://yu.edu.sa/faculty/'
    ]


def main():
    print('=' * 60)
    print('YU Posts Scraper (news, events, partnerships)')
    print('=' * 60)

    all_urls = []
    for sitemap in [
        'https://yu.edu.sa/post-sitemap1.xml',
        'https://yu.edu.sa/post-sitemap2.xml',
    ]:
        urls = get_urls(sitemap)
        print(f'  {sitemap.split("/")[-1]}: {len(urls)} English URLs')
        all_urls.extend(urls)

    print(f'\nTotal URLs to process: {len(all_urls)}\n')

    added = 0
    skipped_content = 0
    skipped_dup = 0
    failed = 0

    for i, url in enumerate(all_urls, 1):
        print(f'[{i}/{len(all_urls)}] {url}')
        html = fetch(url)
        if not html:
            failed += 1
            continue

        post = extract_post(html)
        title = post['title']
        body  = post['body']
        date  = post['date']

        if not is_useful(title, body):
            print(f'  [SKIP] Not useful: {title[:60]}')
            skipped_content += 1
            time.sleep(0.2)
            continue

        category = categorize(title, body)
        date_str = f' ({date})' if date else ''

        # Main Q&A entry
        question = f'What is the news about: {title}?'
        if KnowledgeBase.objects.filter(question__iexact=question).exists():
            print(f'  [DUP] {title[:60]}')
            skipped_dup += 1
            continue

        answer = f'{title}{date_str}\n\n{body[:800]}\n\nSource: {url}'

        kb = KnowledgeBase(question=question, answer=answer, category=category)
        try:
            emb = svc.embed(f'{question}\n{answer[:500]}')
            kb.embedding = emb
        except Exception as e:
            print(f'  [WARN] Embedding failed: {e}')

        kb.save()
        added += 1
        print(f'  Added [{category}] {title[:60]}')
        time.sleep(DELAY)

    total = KnowledgeBase.objects.count()
    print('\n' + '=' * 60)
    print('DONE')
    print('=' * 60)
    print(f'  Added:          {added}')
    print(f'  Skipped (low quality): {skipped_content}')
    print(f'  Skipped (dup):  {skipped_dup}')
    print(f'  Failed:         {failed}')
    print(f'  Total KB items: {total}')


if __name__ == '__main__':
    main()
