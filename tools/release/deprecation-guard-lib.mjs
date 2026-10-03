// Deprecation guard library (ticket #19).
//
// Pure seam shared by the CLI (tools/release/verify-deprecation-guard.mjs)
// and the unit tests. The caller supplies the library sources at the guard
// baseline (previous commit / PR merge-base) and in the working tree, plus
// the pending changesets; this module decides whether the deprecated surface
// or the alias fan-out grew without changeset coverage.
//
// A changeset "mentions" a symbol when its text contains the member name
// (for deprecations) or the exported name (for alias exports). The check is
// a deterministic substring heuristic — precise enough to force the
// conversation, cheap to test offline.
import {
  librarySourceFiles,
  scanAliasEntryPoints,
  scanDeprecatedMembers,
} from './gate-manifest-lib.mjs';

export { librarySourceFiles };

/**
 * Signature of the deprecated surface: one key per @deprecated declaration.
 */
export function deprecationSignature(files) {
  const signature = new Set();
  for (const entry of scanDeprecatedMembers(files)) {
    signature.add(`${entry.file}::${entry.component ?? ''}::${entry.name}`);
  }
  return signature;
}

/**
 * Signature of the alias fan-out: one key per alias entry point export.
 */
export function aliasSignature(files) {
  const signature = new Set();
  for (const entry of scanAliasEntryPoints(files)) {
    const dir = entry.entryPoint.replace(/^@ciag\/orchestra\//, '');
    signature.add(`${dir}::${entry.name}`);
  }
  return signature;
}

const changesetMentions = (changesets, symbol) =>
  changesets.some((changeset) => changeset.content.includes(symbol));

/**
 * Decide whether the working tree grew the removal surface without a
 * changeset entry.
 *
 * @param {{
 *   baselineFiles: Record<string, string>,
 *   currentFiles: Record<string, string>,
 *   changesets: Array<{ name: string, content: string }>,
 * }} input
 * @returns {{ violations: Array<{ kind: 'deprecation'|'alias', symbol: string, location: string, hint: string }> }}
 */
export function deprecationGuard({ baselineFiles, currentFiles, changesets }) {
  const violations = [];
  const baselineDeprecated = deprecationSignature(baselineFiles);
  const currentDeprecated = deprecationSignature(currentFiles);
  for (const key of currentDeprecated) {
    if (baselineDeprecated.has(key)) continue;
    const [, container, name] = key.split('::');
    if (changesetMentions(changesets, name)) continue;
    violations.push({
      kind: 'deprecation',
      symbol: container ? `${container}.${name}` : name,
      location: key,
      hint: `add a changeset mentioning \`${name}\`, or do not deprecate: the 23.0.0 gate manifest is generated from this surface`,
    });
  }
  const baselineAliases = aliasSignature(baselineFiles);
  const currentAliases = aliasSignature(currentFiles);
  for (const key of currentAliases) {
    if (baselineAliases.has(key)) continue;
    const [dir, name] = key.split('::');
    if (changesetMentions(changesets, name)) continue;
    violations.push({
      kind: 'alias',
      symbol: `@ciag/orchestra/${dir}#${name}`,
      location: key,
      hint: `add a changeset mentioning \`${name}\`, or do not grow the alias fan-out: it is scheduled for removal at the 23.0.0 gate`,
    });
  }
  violations.sort((a, b) => a.location.localeCompare(b.location));
  return { violations };
}
