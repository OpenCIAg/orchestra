import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import {
  changesetBumpKind,
  highestBumpKind,
  pendingChangesetNames,
  workspacesOverride,
} from './version-packages-lib.mjs';

// Fixture shaped after the real root package.json: npm workspaces point at
// dist/orc-ds, the GITIGNORED build output, while the versioned source lives
// at projects/orc-ds. The Version-PR flow (ticket #7) must version the source.
const rootPackageSource = `{
  "name": "orc-ds-workspace",
  "version": "0.0.0",
  "private": true,
  "workspaces": [
    "dist/orc-ds"
  ],
  "scripts": {
    "changeset": "changeset"
  }
}
`;

test('the workspaces override points changeset discovery at the library source', () => {
  const overridden = JSON.parse(workspacesOverride(rootPackageSource));
  assert.deepEqual(overridden.workspaces, ['projects/orc-ds']);
});

test('the workspaces override changes nothing but the workspaces field', () => {
  const before = JSON.parse(rootPackageSource);
  const after = JSON.parse(workspacesOverride(rootPackageSource));
  assert.deepEqual({ ...after, workspaces: before.workspaces }, before);
});

test('pending changeset names exclude the config file and the README', () => {
  assert.deepEqual(
    pendingChangesetNames([
      'config.json',
      'README.md',
      'brave-lions-run.md',
      'quiet-moons-read.md',
    ]),
    ['brave-lions-run.md', 'quiet-moons-read.md'],
  );
});

test('a changeset bump kind is read for the library package only', () => {
  const source = `---
'@ciag/orchestra': minor
'@ciag/other': patch
---

Overhaul summary.
`;
  assert.equal(changesetBumpKind(source), 'minor');
});

test('a changeset without a library entry yields no bump kind', () => {
  const source = `---
'@other/pkg': major
---

Unrelated.
`;
  assert.equal(changesetBumpKind(source), null);
});

test('the highest bump kind wins regardless of declaration order', () => {
  assert.equal(highestBumpKind(['patch', 'minor']), 'minor');
  assert.equal(highestBumpKind(['minor', 'major', 'patch']), 'major');
  assert.equal(highestBumpKind([]), null);
});

test('pending changesets never declare a major bump while 22 is the current line', () => {
  // Generation-collapse policy (ticket #7): breaking changes land only at
  // Angular-major boundaries, and the boundary is a versions.json decision
  // (packageMajor 22 -> 23), never a stray `major` changeset on main.
  const dir = path.join(process.cwd(), '.changeset');
  const pending = fs
    .readdirSync(dir)
    .filter((name) => pendingChangesetNames([name]).length > 0);
  if (pending.length === 0) return; // nothing pending; the policy is vacuous
  const kinds = pending
    .map((name) =>
      changesetBumpKind(fs.readFileSync(path.join(dir, name), 'utf8')),
    )
    .filter((kind) => kind !== null);
  assert.ok(kinds.length > 0, 'pending changesets must target @ciag/orchestra');
  assert.ok(
    !kinds.includes('major'),
    `a major changeset would leave the Angular-22 line: ${kinds.join(', ')}`,
  );
});
