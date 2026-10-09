import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildUrlEntries,
  lastmodSources,
  normalizeLastmod,
  renderRobots,
  renderSitemap,
  staticPages,
} from './sitemap-lib.mjs';

const catalogEntries = [
  { id: 'button', route: '/components/button' },
  { id: 'accordion', route: '/components/accordion' },
  { id: 'chip', route: '/components/chip#demo' },
];

test('buildUrlEntries orders static pages first, then catalog routes', () => {
  const entries = buildUrlEntries(catalogEntries);
  assert.deepEqual(
    entries.slice(0, 5).map((entry) => entry.path),
    ['/', '/primeiros-passos', '/docs', '/llms.txt', '/llms.md'],
  );
  assert.deepEqual(
    entries.slice(5).map((entry) => entry.path),
    ['/components/accordion', '/components/button', '/components/chip#demo'],
  );
  assert.equal(staticPages().length, 5);
});

test('renderSitemap emits canonical URLs with lastmod, changefreq and priority', () => {
  const xml = renderSitemap(
    buildUrlEntries(catalogEntries),
    () => '2026-10-02',
  );
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(
    xml,
    /<url><loc>https:\/\/orchestra\.ciag\.org\.br\/<\/loc><lastmod>2026-10-02<\/lastmod><changefreq>weekly<\/changefreq><priority>1\.0<\/priority><\/url>/,
  );
  assert.match(
    xml,
    /<loc>https:\/\/orchestra\.ciag\.org\.br\/components\/chip#demo<\/loc>/,
  );
  assert.equal(xml.split('<url>').length - 1, 8);
  assert.match(xml, /<\/urlset>\n$/);
});

test('normalizeLastmod masks generation-time dates for the drift check', () => {
  const xml = renderSitemap(
    buildUrlEntries(catalogEntries),
    () => '2026-10-02',
  );
  const normalized = normalizeLastmod(xml);
  assert.equal(
    normalized,
    normalizeLastmod(xml.replace(/2026-10-02/g, '2020-01-01')),
  );
  assert.match(normalized, /<lastmod>1970-01-01<\/lastmod>/);
});

test('lastmodSources pins each URL to its backing sources', () => {
  const root = '/repo';
  const options = lastmodSources(root, { path: '/' });
  assert.deepEqual(options, [
    '/repo/projects/docs/src/app/pages/home',
    '/repo/projects/docs/src/app/catalog',
    '/repo/projects/docs/src/app/content/components',
  ]);
  const llms = lastmodSources(root, { path: '/llms.md' });
  assert.ok(llms.some((source) => source.endsWith('agent-reference')));
  const component = lastmodSources(root, {
    path: '/components/button',
    catalogId: 'button',
  });
  assert.deepEqual(component, [
    '/repo/projects/docs/src/app/content/components/button',
    '/repo/projects/docs/src/app/catalog/button.catalog.ts',
    '/repo/projects/docs/src/app/pages/components/button',
  ]);
});

test('renderRobots declares the canonical sitemap', () => {
  assert.equal(
    renderRobots(),
    'User-agent: *\nAllow: /\n\nSitemap: https://orchestra.ciag.org.br/sitemap.xml\n',
  );
});
