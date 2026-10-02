// Changelog seam (ticket #8).
//
// Pure seam shared by the coverage checker CLI
// (tools/release/verify-changelog-coverage.mjs), the release-notes extractor
// used by the tag/Release workflow (tools/release/release-notes.mjs), and the
// unit tests. The CLI and workflow supply file/registry reality; this module
// parses CHANGELOG.md into version sections and proves the coverage invariant:
// every npm-published version has exactly one section, and every section is
// either published or explicitly marked as tagged-but-never-published.

export const NEVER_PUBLISHED_MARKER = 'never published';

const SECTION_HEADING =
  /^(## )(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)(?: \(([^)]*)\))?\s*$/;

/**
 * Split a CHANGELOG.md source into version sections.
 *
 * A section starts at a level-2 heading carrying a semver version, optionally
 * annotated — `## 20.2.0 (tagged, never published)` — and runs to the next
 * level-2 heading. The preamble (the package title) and deeper headings
 * (changesets' `### Minor Changes`) stay inside the owning section's body.
 *
 * @param {string} source raw CHANGELOG.md contents
 * @returns {{ sections: Array<{ version: string, annotation: string|null,
 *   neverPublished: boolean, heading: string, body: string }>,
 *   malformedHeadings: string[] }}
 */
export function parseChangelogSections(source) {
  const lines = source.split('\n');
  const sections = [];
  const malformedHeadings = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      const match = SECTION_HEADING.exec(line);
      if (!match) {
        malformedHeadings.push(line);
        current = null;
        continue;
      }
      current = {
        version: match[2],
        annotation: match[3] ?? null,
        neverPublished: (match[3] ?? '')
          .toLowerCase()
          .includes(NEVER_PUBLISHED_MARKER),
        heading: match[1] + match[2] + (match[3] ? ` (${match[3]})` : ''),
        body: [],
      };
      sections.push(current);
      continue;
    }
    // Lines before the first level-2 heading (the title) belong to no section.
    if (current) current.body.push(line);
  }

  return {
    sections: sections.map(({ body, ...section }) => ({
      ...section,
      body: body.join('\n').trim(),
    })),
    malformedHeadings,
  };
}

/**
 * Extract one version's section body for use as release notes.
 * Returns null when the changelog has no section for the version.
 *
 * @param {string} source raw CHANGELOG.md contents
 * @param {string} version plain semver, e.g. '22.2.1'
 */
export function extractChangelogSection(source, version) {
  const { sections } = parseChangelogSections(source);
  return sections.find((section) => section.version === version) ?? null;
}

/**
 * Prove the changelog covers the published npm record.
 *
 * @param {object} input
 * @param {Array<{ version: string, annotation: string|null, neverPublished: boolean }>} input.sections
 *   parsed changelog sections
 * @param {string[]} input.publishedVersions every version published to npm
 * @returns {{ errors: string[], warnings: string[], stats: {
 *   published: number, sections: number, neverPublished: number }}}
 */
export function checkChangelogCoverage({ sections, publishedVersions }) {
  const errors = [];
  const warnings = [];
  const byVersion = new Map();
  for (const section of sections) {
    const seen = byVersion.get(section.version) ?? [];
    seen.push(section);
    byVersion.set(section.version, seen);
  }

  for (const [version, seen] of byVersion) {
    if (seen.length > 1)
      errors.push(
        `Version ${version} has ${seen.length} changelog sections; every version must appear exactly once.`,
      );
  }

  const missing = publishedVersions.filter(
    (version) => !byVersion.has(version),
  );
  if (missing.length)
    errors.push(
      `Published to npm but missing a changelog section: ${missing.join(', ')}.`,
    );

  const published = new Set(publishedVersions);
  const neverPublished = [];
  for (const section of sections) {
    if (section.neverPublished) {
      neverPublished.push(section.version);
      if (published.has(section.version))
        errors.push(
          `Section ${section.version} is marked '${NEVER_PUBLISHED_MARKER}' but npm has that version; the marker is false.`,
        );
    } else if (!published.has(section.version)) {
      errors.push(
        `Changelog section ${section.version} is not published to npm and carries no ` +
          `'${NEVER_PUBLISHED_MARKER}' heading annotation; mark it or remove it.`,
      );
    }
  }

  if (publishedVersions.length !== new Set(publishedVersions).size)
    warnings.push('The published version list itself contains duplicates.');

  return {
    errors,
    warnings,
    stats: {
      published: publishedVersions.length,
      sections: sections.length,
      neverPublished: neverPublished.length,
    },
  };
}
