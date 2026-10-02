// Version-PR versioning seam (ticket #7).
//
// Pure seam shared by the CLI (tools/release/version-packages.mjs) and the
// unit tests. The CLI supplies filesystem/git reality; this module decides
// which packages the changesets CLI versions, which changeset files are
// pending proposals, and which bump kinds they declare.
//
// The workspaces override exists because the root package.json points npm
// workspaces at dist/orc-ds — the GITIGNORED build output the docs and
// template apps resolve `@ciag/orchestra` against after `build:lib`. The
// changesets CLI versions workspace members, so left alone it would bump the
// build artifact and never the committed source. For the duration of one
// `changeset version` invocation, discovery is repointed at the source
// package (projects/orc-ds); the CLI restores the original bytes afterwards.

const LIBRARY_DIR = 'projects/orc-ds';

/**
 * Rewrite a root package.json source so workspace discovery resolves the
 * library source package instead of the gitignored build output. Pure string
 * -> string: output is valid JSON, identical to the input but for the
 * workspaces field.
 *
 * @param {string} rootPackageSource raw package.json contents
 * @param {string} [libraryDir] package directory to discover instead
 * @returns {string} rewritten package.json contents
 */
export function workspacesOverride(
  rootPackageSource,
  libraryDir = LIBRARY_DIR,
) {
  const rootPackage = JSON.parse(rootPackageSource);
  return `${JSON.stringify(
    { ...rootPackage, workspaces: [libraryDir] },
    null,
    2,
  )}\n`;
}

/**
 * Filter a .changeset directory listing down to the pending proposals:
 * markdown files other than the directory README (the same convention the
 * publish guard uses to count pending changesets).
 *
 * @param {string[]} names directory entry names
 * @returns {string[]} pending changeset file names
 */
export function pendingChangesetNames(names) {
  return names.filter((name) => name.endsWith('.md') && name !== 'README.md');
}

/**
 * Read the bump kind a changeset front-matter declares for the library
 * package. Entries for other packages are ignored; a changeset without a
 * library entry yields null.
 *
 * @param {string} source raw changeset markdown contents
 * @param {string} [packageName] package the release flow versions
 * @returns {'major'|'minor'|'patch'|null}
 */
export function changesetBumpKind(source, packageName = '@ciag/orchestra') {
  const frontMatter = /^---\n([\s\S]*?)\n---/.exec(source);
  if (!frontMatter) return null;
  const entry = new RegExp(
    `['"]?${packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]?\\s*:\\s*(major|minor|patch)`,
  ).exec(frontMatter[1]);
  return entry ? entry[1] : null;
}

/**
 * Collapse bump kinds into the single kind `changeset version` would apply
 * (major > minor > patch). Null when no kind is declared.
 *
 * @param {Array<'major'|'minor'|'patch'|null>} kinds
 * @returns {'major'|'minor'|'patch'|null}
 */
export function highestBumpKind(kinds) {
  const rank = { patch: 1, minor: 2, major: 3 };
  return kinds.reduce(
    (highest, kind) =>
      kind !== null && (highest === null || rank[kind] > rank[highest])
        ? kind
        : highest,
    null,
  );
}
