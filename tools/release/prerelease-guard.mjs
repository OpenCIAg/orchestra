#!/usr/bin/env node
/**
 * Release-candidate guard for release.yml on `release/*` pushes. Exports
 * ORCHESTRA_PUBLISH and ORCHESTRA_DIST_TAG to $GITHUB_ENV, like
 * publish-guard.mjs does for the governed stream. See prerelease-guard-lib.mjs.
 *
 * Local dry run: GITHUB_REF_NAME=release/22.4.0-rc node tools/release/prerelease-guard.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { resolvePrereleasePlan } from './prerelease-guard-lib.mjs';

const root = process.cwd();
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, 'projects/orc-ds/package.json'), 'utf8'),
);
const versions = JSON.parse(
  fs.readFileSync(path.join(root, 'compatibility/versions.json'), 'utf8'),
);

function publishedVersions(name) {
  try {
    const out = execFileSync('npm', ['view', name, 'versions', '--json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const parsed = JSON.parse(out);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    if (String(error.stderr ?? '').includes('E404')) return [];
    throw error;
  }
}

const refName =
  process.env.GITHUB_REF_NAME ||
  execFileSync('git', ['branch', '--show-current'], {
    encoding: 'utf8',
  }).trim();

const plan = resolvePrereleasePlan({
  refName,
  version: manifest.version,
  currentMajor: versions.main.packageMajor,
  published: publishedVersions(manifest.name),
});

console.log(`prerelease-guard: ${plan.reason}`);
if (process.env.GITHUB_ENV) {
  fs.appendFileSync(
    process.env.GITHUB_ENV,
    `ORCHESTRA_PUBLISH=${plan.publish ? 'publish' : 'skip'}\nORCHESTRA_DIST_TAG=${plan.distTag}\n`,
  );
}
