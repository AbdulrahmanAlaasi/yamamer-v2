"""Scrape YU staff sitemap and add faculty profiles to the Knowledge Base."""
import os
import sys
import time
import django
import requests
from xml.etree import ElementTree
from html.parser import HTMLParser

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yamamer_project.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from apps.chatbot.models import KnowledgeBase
from apps.chatbot.services.embedding import EmbeddingService

svc = EmbeddingService()

HEADERS = {'User-Agent': 'Mozilla/5.0 (compatible; YamamahBot/1.0)'}
SITEMAP_URL = 'https://yu.edu.sa/staff-sitemap.xml'


# ── HTML parser: extracts name, title, and bio from faculty pages ──────────────

import re as _re

def parse_faculty_page(html: str) -> dict:
    """Extract name, title, and profile text from a YU faculty page."""
    # Name: always in <h1>
    h1 = _re.search(r'<h1[^>]*>(.*?)</h1>', html, _re.DOTALL)
    name = _re.sub(r'<[^>]+>', '', h1.group(1)).strip() if h1 else ''

    # Title: text node immediately after </h1>
    title = ''
    if h1:
        after_h1 = html[h1.end():h1.end()+300]
        title = _re.sub(r'<[^>]+>', '', after_h1).strip().splitlines()[0].strip()

    # Bio: all <p> tag content (actual prose, skip short ones)
    paragraphs = _re.findall(r'<p[^>]*>(.*?)</p>', html, _re.DOTALL)
    bio_parts = []
    for p in paragraphs:
        text = _re.sub(r'<[^>]+>', '', p).strip()
        text = _re.sub(r'\s+', ' ', text)
        if len(text) > 60:
            bio_parts.append(text)

    return {
        'name': name,
        'title': title,
        'profile': ' '.join(bio_parts[:8]),  # cap at 8 paragraphs
    }


def fetch_html(url: str) -> str:
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        r.raise_for_status()
        return r.text
    except Exception as e:
        print(f"  [WARN] Could not fetch {url}: {e}")
        return ''


# ── Build KB entries from a parsed profile ────────────────────────────────────

def make_kb_entries(data: dict, url: str) -> list[tuple]:
    """Return list of (question, answer, category) tuples."""
    name = data['name']
    title = data['title']
    profile = data['profile']

    if not name or not profile:
        return []

    entries = []

    # Main "who is X" entry with full profile
    answer = f"{name} — {title}\n\n{profile}\n\nProfile: {url}"
    entries.append((
        f"Who is {name}?",
        answer,
        'faculty'
    ))

    # Short "what is X's role" entry
    if title:
        entries.append((
            f"What is the role of {name} at Al Yamamah University?",
            f"{name} serves as {title} at Al Yamamah University.",
            'faculty'
        ))

    return entries


# ── Main ──────────────────────────────────────────────────────────────────────

def get_sitemap_urls() -> list[str]:
    r = requests.get(SITEMAP_URL, headers=HEADERS, timeout=15)
    r.raise_for_status()
    root = ElementTree.fromstring(r.content)
    ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    urls = [loc.text.strip() for loc in root.findall('.//sm:loc', ns)]
    # Skip the listing page itself
    return [u for u in urls if u != 'https://yu.edu.sa/faculty/']


def main():
    print("Fetching staff sitemap...")
    urls = get_sitemap_urls()
    print(f"Found {len(urls)} faculty profile URLs.\n")

    # Remove existing faculty KB entries so we don't duplicate
    deleted = KnowledgeBase.objects.filter(category='faculty').delete()
    print(f"Cleared {deleted[0]} existing faculty KB entries.")

    total_added = 0
    failed = 0

    for i, url in enumerate(urls, 1):
        print(f"[{i}/{len(urls)}] {url}")
        html = fetch_html(url)
        if not html:
            failed += 1
            continue

        data = parse_faculty_page(html)
        if not data.get('name'):
            print("  [SKIP] Could not parse profile.")
            failed += 1
            continue

        entries = make_kb_entries(data, url)
        for question, answer, category in entries:
            kb = KnowledgeBase(question=question, answer=answer, category=category)
            try:
                embedding = svc.embed(f"{question}\n{answer[:500]}")
                kb.embedding = embedding
            except Exception as e:
                print(f"  [WARN] Embedding failed: {e}")
            kb.save()
            total_added += 1

        print(f"  Added {len(entries)} entries for: {data['name']} — {data['title']}")

        # Polite delay to avoid hammering the server
        time.sleep(0.5)

    print(f"\nDone! Added {total_added} KB entries. Failed/skipped: {failed}.")


if __name__ == '__main__':
    main()
