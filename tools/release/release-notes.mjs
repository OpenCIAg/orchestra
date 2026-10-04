#!/usr/bin/env node
// Release notes extractor (ticket #8).
//
// Prints the CHANGELOG.md section body for one version as GitHub-Release-ready
// markdown. The tag/Release workflow (tag-release.yml) pipes this into
// `gh release create --notes-file`; a version without a section exits 1 so the
// workflow fails loudly instead of shipping placeholder notes.
//
//   node tools/release/release-notes.mjs 22.2.1
//   node tools/release/release-notes.mjs 19.3.0 --changelog projects/orc-ds/CHANGELOG.md
import fs from 'node:fs';
import path from 'node:path';
import { extractChangelogSection } from './changelog-lib.mjs';

const DEFAULT_CHANGELOG = 'projects/orc-ds/CHANGELOG.md';

function parseArgs(argv) {
  const args = { changelog: DEFAULT_CHANGELOG, version: null };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i + 1];
    switch (argv[i]) {
      case '--changelog':
        args.changelog = value;
        i += 1;
        break;
      default:
        if (args.version !== null) {
          console.error(`Unexpected argument '${argv[i]}'.`);
          process.exit(2);
        }
        args.version = argv[i];
    }
  }
  if (!args.version || !/^\d+\.\d+\.\d+/.test(args.version)) {
    console.error('Usage: release-notes.mjs <version> [--changelog <path>]');
    process.exit(2);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const source = fs.readFileSync(path.resolve(args.changelog), 'utf8');
const section = extractChangelogSection(source, args.version);
if (!section) {
  console.error(
    `release-notes: no changelog section for ${args.version} in ${args.changelog}.`,
  );
  process.exit(1);
}
if (section.neverPublished) {
  console.error(
    `release-notes: section ${args.version} is marked tagged-but-never-published; ` +
      'refusing to turn it into release notes.',
  );
  process.exit(1);
}
process.stdout.write(
  section.body
    ? `${section.heading.replace(/^## /, '# ')}\n\n${section.body}\n`
    : `${section.heading.replace(/^## /, '# ')}\n`,
);
