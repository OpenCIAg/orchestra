#!/usr/bin/env node
// Changelog coverage check (ticket #8).
//
// Proves the mechanical invariant the backfill established: every version
// published to npm has exactly one section in projects/orc-ds/CHANGELOG.md,
// and every section is either an npm version or explicitly annotated as
// tagged-but-never-published (## 20.2.0 (tagged, never published)).
//
// Registry access is read-only (a single packument GET), the same shape the
// publish guard uses. Tests run offline against the committed fixture
// (tools/release/fixtures/npm-versions.json); CI and release jobs may run this
// live.
//
//   node tools/release/verify-changelog-coverage.mjs                live check
//   node tools/release/verify-changelog-coverage.mjs --fixture      offline check
//   node tools/release/verify-changelog-coverage.mjs --write-fixture
//                                                                   refresh fixture
import fs from 'node:fs';
import path from 'node:path';
import {
  checkChangelogCoverage,
  parseChangelogSections,
} from './changelog-lib.mjs';

const ROOT = process.cwd();
const CHANGELOG = 'projects/orc-ds/CHANGELOG.md';
const FIXTURE = 'tools/release/fixtures/npm-versions.json';
const DEFAULT_REGISTRY = 'https://registry.npmjs.org';
const PACKAGE_SPEC = '@ciag%2Forchestra';

function parseArgs(argv) {
  const args = {
    fixture: false,
    writeFixture: false,
    registry: DEFAULT_REGISTRY,
  };
  for (let i = 0; i < argv.length; i += 1) {
    switch (argv[i]) {
      case '--fixture':
        args.fixture = true;
        break;
      case '--write-fixture':
        args.writeFixture = true;
        break;
      case '--registry':
        args.registry = argv[i + 1];
        i += 1;
        break;
      default:
        console.error(`Unknown argument '${argv[i]}'.`);
        process.exit(2);
    }
  }
  return args;
}

async function fetchPublishedVersions(registryUrl) {
  const response = await fetch(`${registryUrl}/${PACKAGE_SPEC}`, {
    headers: { accept: 'application/vnd.npm.install-v1+json' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok)
    throw new Error(`Registry responded ${response.status} for the packument.`);
  const doc = await response.json();
  return {
    versions: Object.keys(doc.versions ?? {}).sort(),
    distTags: doc['dist-tags'] ?? {},
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.writeFixture) {
    const snapshot = await fetchPublishedVersions(args.registry);
    fs.writeFileSync(
      path.join(ROOT, FIXTURE),
      `${JSON.stringify(
        {
          comment:
            'Point-in-time snapshot of the npm registry for @ciag/orchestra. ' +
            'The node --test suite checks the changelog against this fixture ' +
            '(no network in tests); refresh with: node ' +
            'tools/release/verify-changelog-coverage.mjs --write-fixture',
          package: '@ciag/orchestra',
          snapshotDate: new Date().toISOString().slice(0, 10),
          versions: snapshot.versions,
          distTags: snapshot.distTags,
        },
        null,
        2,
      )}\n`,
    );
    console.log(
      `verify-changelog-coverage: wrote ${snapshot.versions.length} published versions to ${FIXTURE}.`,
    );
    return;
  }

  const published = args.fixture
    ? JSON.parse(fs.readFileSync(path.join(ROOT, FIXTURE), 'utf8'))
    : await fetchPublishedVersions(args.registry);
  const publishedVersions = published.versions;

  const source = fs.readFileSync(path.join(ROOT, CHANGELOG), 'utf8');
  const { sections, malformedHeadings } = parseChangelogSections(source);
  const report = checkChangelogCoverage({ sections, publishedVersions });
  for (const heading of malformedHeadings)
    report.errors.push(
      `Malformed changelog heading (expected '## X.Y.Z'): ${heading}`,
    );

  const mode = args.fixture ? `fixture ${FIXTURE}` : 'the live npm registry';
  console.log(
    `verify-changelog-coverage: ${report.stats.published} npm-published versions ` +
      `(${mode}) ↔ ${report.stats.sections} changelog sections ` +
      `(${report.stats.neverPublished} marked tagged-but-never-published).`,
  );
  for (const warning of report.warnings)
    console.log(`verify-changelog-coverage: warning: ${warning}`);
  if (report.errors.length) {
    for (const error of report.errors)
      console.error(`verify-changelog-coverage: ${error}`);
    process.exit(1);
  }
  console.log('verify-changelog-coverage: coverage holds.');
}

try {
  await main();
} catch (error) {
  console.error(`verify-changelog-coverage: ${error.message}`);
  process.exit(1);
}
