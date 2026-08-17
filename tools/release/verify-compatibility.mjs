import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const versions = JSON.parse(fs.readFileSync(path.join(root, 'compatibility/versions.json'), 'utf8'));
const branch = process.env.RELEASE_BRANCH || execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
const target = versions[branch];

if (!target) {
  throw new Error(`Unsupported release branch '${branch}'. Expected one of ${Object.keys(versions).join(', ')}.`);
}

const library = JSON.parse(fs.readFileSync(path.join(root, 'projects/orc-ds/package.json'), 'utf8'));
const angularPackages = ['@angular/common', '@angular/core', '@angular/forms', '@angular/cdk'];
const mismatches = [];

if (!library.version.startsWith(`${target.packageMajor}.`)) {
  mismatches.push(`projects/orc-ds/package.json version ${library.version} is not ${target.packageMajor}.x`);
}
for (const name of angularPackages) {
  const range = library.peerDependencies?.[name];
  if (range !== target.angularRange) mismatches.push(`${name} peer range ${range ?? '<missing>'} !== ${target.angularRange}`);
}

if (mismatches.length) {
  console.error(`Compatibility check failed for ${branch}:`);
  for (const mismatch of mismatches) console.error(`- ${mismatch}`);
  process.exit(1);
}

console.log(`Compatibility OK: ${branch} / Angular ${target.angular} / PrimeNG ${target.primeNg} / @ciag/orchestra ${library.version}`);
