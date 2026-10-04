#!/usr/bin/env node
// 23.0.0 gate manifest generator (ticket #19).
//
// Scans the library source and writes the machine-readable removal manifest
// (docs/quality/gate-23-manifest.json) plus the human migration guide
// (docs/quality/gate-23-migration.md) rendered from it. No hand-maintained
// lists: every entry is scanned or verified against source on each run, and
// the alias classification is cross-checked against the generated
// alias-parity spec.
//
// Usage:
//   node tools/release/generate-gate-manifest.mjs          regenerate
//   node tools/release/generate-gate-manifest.mjs --check  fail if stale (CI)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import {
  MANIFEST_PATHS,
  buildGateManifest,
  librarySourceFiles,
  renderMigrationGuide,
} from './gate-manifest-lib.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const checkOnly = process.argv.includes('--check');

const files = librarySourceFiles(root);
let aliasParitySpecSource = null;
const aliasSpecPath = path.join(
  root,
  'projects/orc-ds/alias-parity.generated.spec.ts',
);
if (fs.existsSync(aliasSpecPath))
  aliasParitySpecSource = fs.readFileSync(aliasSpecPath, 'utf8');

const { manifest, errors } = buildGateManifest({
  files,
  aliasParitySpecSource,
});

if (errors.length) {
  console.error(
    'gate-manifest: source scan findings (these block generation):',
  );
  for (const error of errors) console.error(`  - ${error}`);
  process.exitCode = 1;
}

const relative = (file) => path.relative(root, file).split(path.sep).join('/');
const jsonPath = path.join(root, MANIFEST_PATHS.json);
const guidePath = path.join(root, MANIFEST_PATHS.guide);

const formattedJson = `${JSON.stringify(manifest, null, 2)}\n`;
const formatOptionsFor = async (filepath) => ({
  ...(await prettier.resolveConfig(filepath, { editorconfig: true })),
  filepath,
});
const formattedGuide = await prettier.format(
  renderMigrationGuide(manifest),
  await formatOptionsFor(guidePath),
);

const stale = [];
if (checkOnly) {
  for (const [file, contents] of [
    [jsonPath, formattedJson],
    [guidePath, formattedGuide],
  ]) {
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== contents)
      stale.push(relative(file));
  }
  if (stale.length) {
    console.error(
      `gate-manifest: stale generated artifacts: ${stale.join(', ')}. Run: npm run generate:gate-manifest`,
    );
    process.exitCode = 1;
  } else {
    console.log(
      `gate manifest up to date (${manifest.stats.totalEntries} entries, ` +
        `${manifest.stats.productionUsed} in production use, ` +
        `${manifest.stats.replacementTbd} replacement TBD)`,
    );
  }
} else {
  fs.writeFileSync(jsonPath, formattedJson);
  fs.writeFileSync(guidePath, formattedGuide);
  console.log(
    `wrote ${relative(jsonPath)} and ${relative(guidePath)} ` +
      `(${manifest.stats.totalEntries} entries across ${Object.keys(manifest.stats.byCategory).length} categories)`,
  );
}
if (errors.length && !checkOnly) {
  console.error('gate-manifest: generation completed with findings above');
  process.exitCode = 1;
}
