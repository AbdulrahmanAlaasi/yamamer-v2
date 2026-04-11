"""
Scrapes the remaining useful YU sitemaps:
  - post-sitemap1.xml  (126 English news/events)
  - post-sitemap2.xml  (79 English news/events)

Quality filter: only keeps posts with substantial content (>150 chars body)
that are relevant to students (partnerships, events, programs, achievements).

Run from backend/ directory:
    python seed_kb_remaining.py
"""

import os, sys, re, time, django, requests
from xml.etree import ElementTree

# Fix Windows console encoding for Arabic/non-ASCII characters
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yamamer_project.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from apps.chatbot.models import KnowledgeBase
from apps.chatbot.services.embedding import EmbeddingService

svc = EmbeddingService()
HEADERS = {'User-Agent': 'Mozilla/5.0 (compatible; YamamahBot/2.0)'}

# Skip posts that are clearly not useful for students
SKIP_KEYWORDS = [
    'fun and entertainment', 'welcome to the first issue',
    'journey with yu alumni', 'photo gallery', 'press release',
    'congratulations to', 'ramadan', 'national day celebration',
    'happy new year', 'eid mubarak',
]

# Useful signals — keep posts matching any of these
KEEP_KEYWORDS = [
    'program', 'scholarship', 'partnership', 'accreditat', 'mou', 'agreement',
    'award', 'ranking', 'career', 'internship', 'research', 'launch', 'new',
    'conference', 'competition', 'workshop', 'training', 'certification',
    'bloomberg', 'ec-council', 'abet', 'ncaaa', 'ministry', 'approved',
    'faculty', 'dean', 'president', 'visit', 'delegation', 'collaboration',
    'student', 'graduate', 'graduation', 'alumni', 'club', 'expo', 'field trip',
    'ambassador', 'sponsor', 'hackathon', 'project', 'innovation',
]


def clean(html):
    t = re.sub(r'<[^>]+>', ' ', html)
    t = re.sub(r'&[a-zA-Z]+;', ' ', t)
    return re.sub(r'\s+', ' ', t).strip()


def fetch(url):
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        r.raise_for_status()
        return r.text
    except Exception as e:
        print(f'  [FAIL] {e}')
        return ''


def extract_post(html):
    m = re.search(r'<title[^>]*>(.*?)</title>', html, re.DOTALL | re.IGNORECASE)
    title = clean(m.group(1)).split('|')[0].split('–')[0].strip() if m else ''

    dm = re.search(r'"datePublished"\s*:\s*"([^"]+)"', html)
    date = dm.group(1)[:10] if dm else ''

    paras = re.findall(r'<p[^>]*>(.*?)</p>', html, re.DOTALL | re.IGNORECASE)
    body_parts = []
    for p in paras:
        t = clean(p)
        if len(t) > 80 and not re.search(r'cookie|privacy|copyright|subscribe|menu|navigation', t, re.I):
            body_parts.append(t)

    return title, date, ' '.join(body_parts[:6])


def should_keep(title, body):
    if not title or len(body) < 150:
        return False
    combined = (title + ' ' + body).lower()
    if any(k in combined for k in SKIP_KEYWORDS):
        return False
    return any(k in combined for k in KEEP_KEYWORDS)


def get_category(title, body):
    t = (title + ' ' + body).lower()
    if any(k in t for k in ['scholarship', 'financial', 'fee', 'tuition']):
        return 'financial'
    if any(k in t for k in ['admission', 'registration', 'enroll']):
        return 'registration'
    if any(k in t for k in ['graduation', 'graduate']):
        return 'graduation'
    if any(k in t for k in ['internship', 'career', 'job']):
        return 'internship'
    return 'general'


def get_urls(sitemap_url):
    r = requests.get(sitemap_url, headers=HEADERS, timeout=15)
    r.raise_for_status()
    root = ElementTree.fromstring(r.content)
    ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    return [
        loc.text.strip()
        for loc in root.findall('.//sm:loc', ns)
        if '%d' not in loc.text and '?lang=ar' not in loc.text
    ]


def main():
    print('=' * 60)
    print('YU Posts Scraper — Quality-filtered news & events')
    print('=' * 60)

    all_urls = []
    for s in ['https://yu.edu.sa/post-sitemap1.xml', 'https://yu.edu.sa/post-sitemap2.xml']:
        urls = get_urls(s)
        print(f'  {s.split("/")[-1]}: {len(urls)} URLs')
        all_urls.extend(urls)

    print(f'\nProcessing {len(all_urls)} URLs...\n')

    added = skipped = duped = failed = 0

    for i, url in enumerate(all_urls, 1):
        print(f'[{i}/{len(all_urls)}] {url}')
        html = fetch(url)
        if not html:
            failed += 1
            continue

        title, date, body = extract_post(html)

        if not should_keep(title, body):
            print(f'  [SKIP] {title[:60]}')
            skipped += 1
            time.sleep(0.2)
            continue

        cat = get_category(title, body)
        date_str = f' ({date})' if date else ''
        question = f'What happened: {title}?'

        if KnowledgeBase.objects.filter(question__iexact=question).exists():
            duped += 1
            continue

        answer = f'{title}{date_str}\n\n{body[:800]}\n\nSource: {url}'
        kb = KnowledgeBase(question=question, answer=answer, category=cat)
        try:
            kb.embedding = svc.embed(f'{question}\n{answer[:500]}')
        except Exception as e:
            print(f'  [WARN] Embedding: {e}')
        kb.save()
        added += 1
        print(f'  + [{cat}] {title[:65]}')
        time.sleep(0.6)

    total = KnowledgeBase.objects.count()
    print('\n' + '=' * 60)
    print(f'Added: {added}  |  Skipped: {skipped}  |  Duped: {duped}  |  Failed: {failed}')
    print(f'Total KB items: {total}')
    print('=' * 60)


if __name__ == '__main__':
    main()
