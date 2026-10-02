/**
 * Builds the deployable site metadata for the docs SPA from committed data:
 *
 *   projects/docs/public/sitemap.xml — every catalog route plus the static
 *                                      pages, with lastmod dates
 *   projects/docs/public/robots.txt  — canonical crawl policy
 *
 * Routes come from the colocated docs catalog (the same source the coverage
 * gate enforces), so a component documented in the app is always discoverable
 * and nothing hand-maintained can drift. `lastmod` is the newest git commit
 * date among the sources that back each URL (catalog file, page directory,
 * narrative sources); it falls back to the generation date when git history
 * is unavailable. Because CI runs on shallow checkouts, `--check` compares
 * structure and normalizes `lastmod` to a placeholder — URL drift still fails
 * CI, while date drift stays deterministic.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadCatalogEntries } from './agent-reference-lib.mjs';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const canonicalBase = 'https://orchestra.ciag.org.br';
const catalogDir = path.join(root, 'projects/docs/src/app/catalog');

/** URL entries for the static pages outside the catalog. */
export function staticPages() {
  return [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/docs', changefreq: 'monthly', priority: '0.9' },
    { path: '/llms.txt', changefreq: 'monthly', priority: '0.8' },
    { path: '/llms.md', changefreq: 'monthly', priority: '0.8' },
  ];
}

/** Static pages plus every catalog route, in sitemap order. */
export function buildUrlEntries(catalogEntries) {
  const catalogPages = catalogEntries
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((entry) => ({
      path: entry.route ?? `/components/${entry.id}`,
      changefreq: 'monthly',
      priority: '0.7',
      catalogId: entry.id,
    }));
  return [...staticPages(), ...catalogPages];
}

function gitCommitDate(files) {
  const existing = files.filter((file) => fs.existsSync(file));
  if (!existing.length) return null;
  try {
    const out = execFileSync(
      'git',
      [
        'log',
        '--max-count=1',
        '--format=%cs',
        '--',
        ...existing.map((file) => path.relative(root, file)),
      ],
      { cwd: root, encoding: 'utf8' },
    ).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : null;
  } catch {
    return null;
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Sources backing each URL's freshness: page directory, catalog file, and the
 * narrative sources that feed llms.md.
 */
export function lastmodSources(rootPath, entry) {
  const publicDir = path.join(rootPath, 'projects/docs/public');
  const appDir = path.join(rootPath, 'projects/docs/src/app');
  const catalogDir = path.join(appDir, 'catalog');
  if (entry.path === '/') {
    return [path.join(appDir, 'pages/home'), catalogDir];
  }
  if (entry.path === '/docs') {
    return [path.join(appDir, 'pages/docs')];
  }
  if (entry.path === '/llms.txt' || entry.path === '/llms.md') {
    return [
      path.join(publicDir, path.basename(entry.path)),
      path.join(rootPath, 'tools/docs/agent-reference'),
      path.join(rootPath, 'tools/docs/agent-reference-lib.mjs'),
    ];
  }
  return [
    path.join(catalogDir, `${entry.catalogId}.catalog.ts`),
    path.join(appDir, 'pages/components', entry.catalogId),
  ];
}

/** Renders sitemap.xml; `resolveLastmod` maps a URL entry to a YYYY-MM-DD. */
export function renderSitemap(entries, resolveLastmod) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const entry of entries) {
    lines.push(
      `  <url><loc>${canonicalBase}${entry.path}</loc><lastmod>${resolveLastmod(entry)}</lastmod><changefreq>${entry.changefreq}</changefreq><priority>${entry.priority}</priority></url>`,
    );
  }
  lines.push('</urlset>');
  return `${lines.join('\n')}\n`;
}

export function renderRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${canonicalBase}/sitemap.xml
`;
}

const LASTMOD_PLACEHOLDER = '1970-01-01';

/** Normalizes lastmod so --check compares structure, not generation-time dates. */
export function normalizeLastmod(sitemapXml) {
  return sitemapXml.replaceAll(
    /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g,
    `<lastmod>${LASTMOD_PLACEHOLDER}</lastmod>`,
  );
}

export function buildSitemap(rootPath, catalogEntries, { fallbackDate } = {}) {
  const entries = buildUrlEntries(catalogEntries);
  const fallback = fallbackDate ?? today();
  return renderSitemap(entries, (entry) => {
    const date = gitCommitDate(lastmodSources(rootPath, entry)) ?? fallback;
    return date;
  });
}

export function loadCatalogEntriesForSitemap() {
  return loadCatalogEntries(catalogDir).entries;
}

export const CANONICAL_BASE = canonicalBase;
