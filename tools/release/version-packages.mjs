#!/usr/bin/env node
// Version script for the Version-PR flow (ticket #7).
//
// Consumes the pending .changeset/*.md proposals into a source-package
// version bump + generated changelog, exactly the commit shape the publish
// guard recognizes as a governed release (ticket #6): the package version
// differs from the parent commit and zero changeset proposals remain.
//
// Why this wraps `changeset version`: the changesets CLI versions npm
// workspace members, and the root workspaces field points at dist/orc-ds —
// the gitignored build output. Left alone it would bump the artifact and
// never the committed source, so for the duration of the invocation
// workspace discovery is repointed at projects/orc-ds (see
// version-packages-lib.mjs) and the original package.json bytes are
// restored afterwards, win or lose.
//
// Never publishes. Publishing stays in release.yml's guarded path
// (tools/release/publish-guard.mjs, ticket #6); the Version PR merge only
// produces the governed commit.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import {
  pendingChangesetNames,
  workspacesOverride,
} from './version-packages-lib.mjs';

const ROOT = process.cwd();
const ROOT_PACKAGE_JSON = 'package.json';
const CHANGESET_DIR = '.changeset';

function changesetBinPath() {
  const require = createRequire(import.meta.url);
  const packageJsonPath = require.resolve('@changesets/cli/package.json');
  const { bin } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return path.join(path.dirname(packageJsonPath), bin.changeset);
}

function listPendingChangesets() {
  if (!fs.existsSync(path.join(ROOT, CHANGESET_DIR))) return [];
  return pendingChangesetNames(fs.readdirSync(path.join(ROOT, CHANGESET_DIR)));
}

function main() {
  const pending = listPendingChangesets();
  if (pending.length === 0) {
    console.log(
      'version-packages: no pending changeset proposals; nothing to version.',
    );
    return;
  }
  console.log(
    `version-packages: consuming ${pending.length} changeset proposal(s): ${pending.join(', ')}`,
  );

  const rootPackagePath = path.join(ROOT, ROOT_PACKAGE_JSON);
  const originalSource = fs.readFileSync(rootPackagePath, 'utf8');
  fs.writeFileSync(rootPackagePath, workspacesOverride(originalSource));
  try {
    execFileSync(process.execPath, [changesetBinPath(), 'version'], {
      stdio: 'inherit',
      cwd: ROOT,
    });
  } finally {
    fs.writeFileSync(rootPackagePath, originalSource);
  }
  console.log(
    'version-packages: version bumped and changelog generated; publish stays with the guarded release workflow.',
  );
}

try {
  main();
} catch (error) {
  console.error(`version-packages: ${error.message}`);
  process.exit(1);
}
