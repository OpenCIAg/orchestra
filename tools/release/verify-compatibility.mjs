import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { resolveBranchForTag, validateTopology } from './topology-lib.mjs';

const root = process.cwd();
const versions = JSON.parse(
  fs.readFileSync(path.join(root, 'compatibility/versions.json'), 'utf8'),
);

// The publishing topology is a contract (ticket #6): exactly one branch may own
// publishing for a package major, backport lines publish from tags only, and
// the frozen lines are restricted to patch releases. Assert it before anything
// else so a topology typo fails every gate, not just the release.
const topologyErrors = validateTopology(versions);
if (topologyErrors.length) {
  console.error('Release topology check failed (compatibility/versions.json):');
  for (const error of topologyErrors) console.error(`- ${error}`);
  process.exit(1);
}

// On a tag event the checkout is detached: resolve the release line from the
// tag through the publishing topology (the same routing the publish guard
// applies), falling back to RELEASE_BRANCH or the checked-out branch.
function resolveTagBranch() {
  const ref = process.env.GITHUB_REF ?? '';
  if (!ref.startsWith('refs/tags/')) return null;
  return resolveBranchForTag(versions, ref.replace('refs/tags/', ''));
}

const branch =
  process.env.RELEASE_BRANCH ||
  resolveTagBranch() ||
  execFileSync('git', ['branch', '--show-current'], {
    encoding: 'utf8',
  }).trim();
const target = versions[branch];

if (!target) {
  throw new Error(
    `Unsupported release branch '${branch}'. Expected one of ${Object.keys(versions).join(', ')}.`,
  );
}

const library = JSON.parse(
  fs.readFileSync(path.join(root, 'projects/orc-ds/package.json'), 'utf8'),
);
const angularPackages = [
  '@angular/common',
  '@angular/core',
  '@angular/forms',
  '@angular/cdk',
  '@angular/platform-browser',
  '@angular/router',
];
const mismatches = [];

if (!library.version.startsWith(`${target.packageMajor}.`)) {
  mismatches.push(
    `projects/orc-ds/package.json version ${library.version} is not ${target.packageMajor}.x`,
  );
}
for (const name of angularPackages) {
  const range = library.peerDependencies?.[name];
  if (range !== target.angularRange)
    mismatches.push(
      `${name} peer range ${range ?? '<missing>'} !== ${target.angularRange}`,
    );
}

if (mismatches.length) {
  console.error(`Compatibility check failed for ${branch}:`);
  for (const mismatch of mismatches) console.error(`- ${mismatch}`);
  process.exit(1);
}

console.log(
  `Compatibility OK: ${branch} / Angular ${target.angular} / PrimeNG ${target.primeNg} / ` +
    `role ${target.role} (${target.publish}) / @ciag/orchestra ${library.version}`,
);
