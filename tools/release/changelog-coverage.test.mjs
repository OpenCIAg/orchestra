import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import {
  checkChangelogCoverage,
  extractChangelogSection,
  parseChangelogSections,
} from './changelog-lib.mjs';

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '../..',
);
const CHANGELOG_PATH = path.join(ROOT, 'projects/orc-ds/CHANGELOG.md');
const FIXTURE_PATH = path.join(
  ROOT,
  'tools/release/fixtures/npm-versions.json',
);

function readRepoChangelog() {
  return readFileSync(CHANGELOG_PATH, 'utf8');
}

function readFixture() {
  return JSON.parse(readFileSync(FIXTURE_PATH, 'utf8'));
}

test('every npm-published version has exactly one changelog section (ticket #8 coverage proof)', () => {
  const fixture = readFixture();
  const { sections, malformedHeadings } =
    parseChangelogSections(readRepoChangelog());
  assert.deepEqual(
    malformedHeadings,
    [],
    'the changelog must not carry unparseable level-2 headings',
  );
  const report = checkChangelogCoverage({
    sections,
    publishedVersions: fixture.versions,
  });
  assert.deepEqual(
    report.errors,
    [],
    `changelog coverage errors:\n${report.errors.join('\n')}`,
  );
  assert.equal(report.stats.published, fixture.versions.length);
  assert.equal(
    report.stats.published,
    31,
    'the fixture snapshot expects 31 published versions',
  );
});

test('the tagged-but-never-published versions are marked and genuinely unpublished', () => {
  const fixture = readFixture();
  const { sections } = parseChangelogSections(readRepoChangelog());
  for (const version of ['20.2.0', '21.2.0']) {
    const section = sections.find((entry) => entry.version === version);
    assert.ok(section, `${version} must have a changelog section`);
    assert.equal(
      section.neverPublished,
      true,
      `${version} must carry the (tagged, never published) annotation`,
    );
    assert.equal(
      fixture.versions.includes(version),
      false,
      `${version} must not appear in the npm published list`,
    );
  }
});

test('the coverage checker refuses a published version without a section', () => {
  const report = checkChangelogCoverage({
    sections: parseChangelogSections('# pkg\n\n## 22.2.0\n\n- note\n').sections,
    publishedVersions: ['22.2.0', '22.2.1'],
  });
  assert.equal(report.errors.length, 1);
  assert.match(report.errors[0], /missing a changelog section: 22\.2\.1/);
});

test('the coverage checker refuses duplicate sections', () => {
  const report = checkChangelogCoverage({
    sections: parseChangelogSections(
      '# pkg\n\n## 22.2.0\n\n- a\n\n## 22.2.0\n\n- b\n',
    ).sections,
    publishedVersions: ['22.2.0'],
  });
  assert.ok(report.errors.some((error) => /2 changelog sections/.test(error)));
});

test('the coverage checker refuses an unmarked section for an unpublished version', () => {
  const report = checkChangelogCoverage({
    sections: parseChangelogSections(
      '# pkg\n\n## 20.2.0\n\n- invented\n\n## 22.2.0\n\n- real\n',
    ).sections,
    publishedVersions: ['22.2.0'],
  });
  assert.ok(
    report.errors.some((error) =>
      /20\.2\.0 is not published to npm and carries no/.test(error),
    ),
  );
});

test('the coverage checker refuses a never-published marker on a published version', () => {
  const report = checkChangelogCoverage({
    sections: parseChangelogSections(
      '# pkg\n\n## 22.2.0 (tagged, never published)\n\n- contradiction\n',
    ).sections,
    publishedVersions: ['22.2.0'],
  });
  assert.ok(report.errors.some((error) => /marker is false/.test(error)));
});

test('the coverage checker reports the never-published count in its stats', () => {
  const report = checkChangelogCoverage({
    sections: parseChangelogSections(
      '# pkg\n\n## 20.2.0 (tagged, never published)\n\n- note\n\n## 22.2.0\n\n- real\n',
    ).sections,
    publishedVersions: ['22.2.0'],
  });
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.stats, {
    published: 1,
    sections: 2,
    neverPublished: 1,
  });
});

test('section parsing keeps the preamble out and deep headings inside', () => {
  const { sections } = parseChangelogSections(
    '# @ciag/orchestra\n\n## 22.2.0\n\n### Minor Changes\n\n- a446a80: icons\n\n## 19.2.0\n\n- P0\n',
  );
  assert.equal(sections.length, 2);
  assert.equal(sections[0].version, '22.2.0');
  assert.match(sections[0].body, /### Minor Changes/);
  assert.match(sections[0].body, /a446a80: icons/);
  assert.equal(sections[0].annotation, null);
  assert.equal(sections[1].version, '19.2.0');
});

test('section parsing reads heading annotations', () => {
  const { sections } = parseChangelogSections(
    '# pkg\n\n## 20.2.0 (tagged, never published)\n\n- note\n',
  );
  assert.equal(sections[0].annotation, 'tagged, never published');
  assert.equal(sections[0].neverPublished, true);
});

test('section parsing reports malformed level-2 headings instead of dropping them', () => {
  const { sections, malformedHeadings } = parseChangelogSections(
    '# pkg\n\n## Overview\n\n- prose\n\n## 22.2.0\n\n- real\n',
  );
  assert.equal(sections.length, 1);
  assert.deepEqual(malformedHeadings, ['## Overview']);
});

test('release-notes extraction finds a section by plain version', () => {
  const section = extractChangelogSection(readRepoChangelog(), '21.0.3');
  assert.ok(section);
  assert.match(section.body, /projected icons and table filters/);
});

test('release-notes extraction returns null for an unknown version', () => {
  assert.equal(extractChangelogSection(readRepoChangelog(), '99.0.0'), null);
});

test('every never-published marker in the fixture era is honored by the extractor', () => {
  // The workflow refuses to publish notes for a never-published section; the
  // two known phantom versions must carry that marker so the guard holds.
  const { sections } = parseChangelogSections(readRepoChangelog());
  const marked = sections.filter((section) => section.neverPublished);
  assert.deepEqual(marked.map((section) => section.version).sort(), [
    '20.2.0',
    '21.2.0',
  ]);
});
