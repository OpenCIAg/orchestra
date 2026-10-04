#!/usr/bin/env node
/**
 * Generates projects/docs/public/sitemap.xml and robots.txt from the docs
 * catalog and static pages. See sitemap-lib.mjs for the data flow; outputs
 * are committed and checked in CI via --check (part of verify:docs).
 *
 * Usage:
 *   node tools/docs/generate-sitemap.mjs          # regenerate
 *   node tools/docs/generate-sitemap.mjs --check  # fail on drift
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildSitemap,
  loadCatalogEntriesForSitemap,
  normalizeLastmod,
  renderRobots,
} from './sitemap-lib.mjs';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const sitemapPath = path.join(root, 'projects/docs/public/sitemap.xml');
const robotsPath = path.join(root, 'projects/docs/public/robots.txt');

const check = process.argv.includes('--check');

const catalogEntries = loadCatalogEntriesForSitemap();
const sitemap = buildSitemap(root, catalogEntries);
const robots = renderRobots();

if (check) {
  const stale = [];
  const currentSitemap = fs.readFileSync(sitemapPath, 'utf8');
  if (normalizeLastmod(currentSitemap) !== normalizeLastmod(sitemap))
    stale.push(path.relative(root, sitemapPath));
  const staleDates = [
    ...currentSitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g),
  ]
    .map((match) => match[1])
    .filter((date) => !/^\d{4}-\d{2}-\d{2}$/.test(date));
  if (staleDates.length)
    stale.push(
      `${path.relative(root, sitemapPath)} has malformed lastmod values: ${staleDates.join(', ')}`,
    );
  if (fs.readFileSync(robotsPath, 'utf8') !== robots)
    stale.push(path.relative(root, robotsPath));
  if (stale.length) {
    console.error(
      'Stale site metadata files. Run: npm run docs:generate-sitemap',
    );
    for (const file of stale) console.error(`  ${file}`);
    process.exit(1);
  }
  console.log(
    `sitemap and robots up to date (${sitemap.split('<url>').length - 1} URLs).`,
  );
  process.exit(0);
}

fs.writeFileSync(sitemapPath, sitemap);
fs.writeFileSync(robotsPath, robots);
console.log(
  `wrote ${path.relative(root, sitemapPath)} (${sitemap.split('<url>').length - 1} URLs) and ${path.relative(root, robotsPath)}.`,
);
