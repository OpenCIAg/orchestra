#!/usr/bin/env node
// Deprecation guard CLI (ticket #19).
//
// Fails when the commit under test grows the deprecated surface (new
// @deprecated declarations) or the alias fan-out (new alias entry point
// exports) without a pending changeset mentioning the symbol. This is the
// CI-side check that keeps the generated 23.0.0 gate manifest the single
// source of truth: you cannot quietly add to the surface the gate will
// remove.
//
// Baseline resolution:
//   - pull requests: the merge base with the PR target branch
//   - otherwise:     HEAD~1 (the previous commit), matching the
//     publish-guard's version-changed comparison
// When no baseline commit is available (shallow checkout with depth 1 and
// no PR context) the guard reports that it cannot compare and exits 0 —
// the workflow checks out with fetch-depth: 0 so CI always has one.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  deprecationGuard,
  librarySourceFiles,
} from './deprecation-guard-lib.mjs';

const root = process.cwd();
const CHANGESET_DIR = path.join(root, '.changeset');

const git = (args) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8' });
  } catch {
    return null;
  }
};

/** library file list at a git ref (or the worktree when ref is null). */
function filesAt(ref) {
  if (ref === null) return librarySourceFiles(root);
  const listed = git([
    'ls-tree',
    '-r',
    '--name-only',
    '-z',
    ref,
    '--',
    'projects/orc-ds',
  ]);
  if (listed === null) return null;
  const wanted = (file) =>
    (/\.(ts|html|scss)$/.test(file) &&
      !file.endsWith('.d.ts') &&
      !file.endsWith('.spec.ts') &&
      !file.endsWith('icon-catalog.ts')) ||
    file.endsWith('/ng-package.json');
  const files = {};
  for (const file of listed.split('\0')) {
    if (!file || !wanted(file)) continue;
    const contents = git(['show', `${ref}:${file}`]);
    if (contents !== null) files[file] = contents;
  }
  return files;
}

/** The commit the working tree should be compared against, or null. */
function resolveBaselineRef() {
  const baseRef = process.env.GITHUB_BASE_REF;
  if (baseRef) {
    for (const candidate of [`origin/${baseRef}`, baseRef]) {
      const mergeBase = git(['merge-base', 'HEAD', candidate]);
      if (mergeBase) return mergeBase.trim();
    }
  }
  const parent = git(['rev-parse', 'HEAD~1']);
  return parent ? parent.trim() : null;
}

function pendingChangesets() {
  if (!fs.existsSync(CHANGESET_DIR)) return [];
  return fs
    .readdirSync(CHANGESET_DIR)
    .filter(
      (name) =>
        name.endsWith('.md') && name !== 'README.md' && name !== 'config.json',
    )
    .sort()
    .map((name) => ({
      name,
      content: fs.readFileSync(path.join(CHANGESET_DIR, name), 'utf8'),
    }));
}

const baselineRef = resolveBaselineRef();
if (!baselineRef) {
  console.log(
    'deprecation-guard: no baseline commit available (shallow checkout without PR context); nothing to compare.',
  );
  process.exit(0);
}

const baselineFiles = filesAt(baselineRef);
const currentFiles = filesAt(null);
if (!baselineFiles) {
  console.log(
    `deprecation-guard: baseline ${baselineRef.slice(0, 12)} could not be read; nothing to compare.`,
  );
  process.exit(0);
}

const changesets = pendingChangesets();
const { violations } = deprecationGuard({
  baselineFiles,
  currentFiles,
  changesets,
});

const baselineLabel =
  process.env.GITHUB_BASE_REF != null
    ? `merge base with ${process.env.GITHUB_BASE_REF}`
    : `previous commit (${baselineRef.slice(0, 12)})`;

if (violations.length) {
  console.error(
    `deprecation-guard: ${violations.length} removal-surface growth(s) without changeset coverage (baseline: ${baselineLabel}):`,
  );
  for (const violation of violations) {
    console.error(`  - [${violation.kind}] ${violation.symbol}`);
    console.error(`      ${violation.location}`);
    console.error(`      ${violation.hint}`);
  }
  process.exit(1);
}
console.log(
  `deprecation-guard: no untracked growth of the deprecated/alias surface vs the ${baselineLabel}; ` +
    `${changesets.length} pending changeset(s) scanned.`,
);
