"""Dependency-free checks for the shipped static site's SEO contracts."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import struct
import unittest
from urllib.parse import urlsplit, unquote
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://yormio-app.netlify.app/'


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.head_tags = []
        self.in_head = False
        self.json_script = False
        self.structured_data = []
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'head':
            self.in_head = True
        self.tags.append((tag, attrs))
        if self.in_head:
            self.head_tags.append((tag, attrs))
        self.json_script = tag == 'script' and attrs.get('type') == 'application/ld+json'

    def handle_endtag(self, tag):
        if tag == 'head':
            self.in_head = False
        if tag == 'script':
            self.json_script = False

    def handle_data(self, data):
        if self.json_script:
            self.structured_data.append(json.loads(data))


class SEOChecks(unittest.TestCase):
    def setUp(self):
        self.page = Page(ROOT / 'index.html')

    def test_unique_head_metadata_and_canonical(self):
        meta = [(a.get('name') or a.get('property'), a.get('content'))
                for tag, a in self.page.head_tags if tag == 'meta']
        counts = Counter(key for key, _ in meta if key)
        for key, count in counts.items():
            self.assertEqual(count, 1, key)
        values = dict(meta)
        for key in ['description', 'og:title', 'og:description', 'og:url',
                    'og:image', 'og:image:alt', 'twitter:title',
                    'twitter:description', 'twitter:image', 'twitter:image:alt']:
            self.assertTrue(values.get(key), key)
        self.assertEqual(values['google-site-verification'],
                         'UmdNBBzan2DNb3ATfU70uPWo_S9FNsxRKBIwvK98AVA')
        self.assertEqual(values['og:url'], ORIGIN)
        self.assertTrue(values['og:image'].startswith(ORIGIN))
        self.assertEqual(values['og:image'], values['twitter:image'])
        canonicals = [a['href'] for tag, a in self.page.head_tags
                      if tag == 'link' and a.get('rel') == 'canonical']
        self.assertEqual(canonicals, [ORIGIN])
        self.assertEqual(sum(tag == 'title' for tag, _ in self.page.tags), 1)
        self.assertFalse(any(a.get('hreflang') for _, a in self.page.tags))

    def test_app_schema_is_factual_and_store_links_match_config(self):
        self.assertEqual(len(self.page.structured_data), 1)
        app = self.page.structured_data[0]
        self.assertEqual(app['@context'], 'https://schema.org')
        self.assertEqual(app['@type'], 'MobileApplication')
        self.assertEqual(app['url'], ORIGIN)
        self.assertEqual(set(app['operatingSystem']), {'iOS', 'Android'})
        config = (ROOT / 'config.js').read_text()
        store_urls = re.findall(r'(?:appStoreUrl|googlePlayUrl): "([^"]+)"', config)
        self.assertEqual(app['installUrl'], store_urls)
        self.assertEqual(app['sameAs'], store_urls)
        self.assertEqual([offer['url'] for offer in app['offers']], store_urls)
        self.assertTrue(all(offer['price'] == 0 for offer in app['offers']))
        self.assertTrue(all('Premium' in offer['description'] for offer in app['offers']))
        for key in ['aggregateRating', 'review', 'award', 'softwareVersion']:
            self.assertNotIn(key, app)
        self.assertIn('Premium', app['description'])
        self.assertIn('independent', app['description'])

    def test_crawlers_sitemap_and_training_policy(self):
        source = (ROOT / 'robots.txt').read_text()
        robots = RobotFileParser()
        robots.parse(source.splitlines())
        for bot in ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'Claude-SearchBot', 'Claude-User']:
            self.assertTrue(robots.can_fetch(bot, ORIGIN), bot)
            self.assertTrue(robots.can_fetch(bot, ORIGIN + 'assets/yormio-branding.png'), bot)
        self.assertTrue(robots.can_fetch('GPTBot', ORIGIN))  # Previous unrestricted default.
        self.assertNotRegex(source, r'(?im)^User-agent:\s*GPTBot')
        self.assertEqual(robots.site_maps(), [ORIGIN + 'sitemap.xml'])
        sitemap = ET.parse(ROOT / 'sitemap.xml')
        urls = [node.text for node in sitemap.findall('.//{*}loc')]
        self.assertEqual(urls, [ORIGIN])
        self.assertFalse((ROOT / 'llms.txt').exists())

    def test_all_images_and_local_links_resolve_without_javascript(self):
        ids = [a['id'] for _, a in self.page.tags if 'id' in a]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(sum(tag == 'h1' for tag, _ in self.page.tags), 1)
        for tag, a in self.page.tags:
            if tag == 'img':
                self.assertIn('alt', a)
                image = ROOT / a['src']
                self.assertTrue(image.is_file())
                width, height = struct.unpack('>II', image.read_bytes()[16:24])
                self.assertEqual((int(a['width']), int(a['height'])), (width, height))
            if tag == 'a':
                href = a['href']
                self.assertNotEqual(href, '#')
                if href.startswith('#'):
                    self.assertIn(href[1:], ids)
            if tag in ['script', 'source', 'img', 'link']:
                url = a.get('src') or a.get('href')
                if url and not urlsplit(url).scheme and not url.startswith('#'):
                    self.assertTrue((ROOT / unquote(url.lstrip('/'))).is_file(), url)
        stores = [a['href'] for tag, a in self.page.tags if tag == 'a' and 'data-store' in a]
        self.assertEqual(stores, self.page.structured_data[0]['installUrl'])
        self.assertEqual([a['aria-pressed'] for tag, a in self.page.tags
                          if tag == 'button' and 'data-filter' in a], ['true', 'false', 'false'])

    def test_share_is_noindex_without_blocking_crawlers_or_changing_token_handling(self):
        page = Page(ROOT / 'share/index.html')
        self.assertEqual([a['content'] for tag, a in page.head_tags
                          if tag == 'meta' and a.get('name') == 'robots'], ['noindex, follow'])
        netlify = (ROOT / 'netlify.toml').read_text()
        self.assertIn('X-Robots-Tag = "noindex, follow"', netlify)
        self.assertIn("connect-src 'none'", netlify)
        self.assertIn('from = "/share"', netlify)
        self.assertIn('from = "/share/"', netlify)
        self.assertIn('from = "/index.html"', netlify)


if __name__ == '__main__':
    unittest.main(verbosity=2)
