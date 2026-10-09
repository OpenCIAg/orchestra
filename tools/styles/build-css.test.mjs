import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { compileString } from 'sass';
import { compileStyles } from './build-css.mjs';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const styles = path.join(root, 'projects/orc-ds/styles');
const declared = (css) => new Set(css.match(/--orc-[\w-]+(?=\s*:)/g));

const out = mkdtempSync(path.join(tmpdir(), 'orc-styles-'));
compileStyles(out);
const stylesCss = readFileSync(path.join(out, 'styles.css'), 'utf8');
const resetCss = readFileSync(path.join(out, 'reset.css'), 'utf8');
const iconsCss = readFileSync(path.join(out, 'icons.css'), 'utf8');
const fontBytes = statSync(
  path.join(out, 'fonts/material-symbols-rounded.woff2'),
).size;
rmSync(out, { recursive: true, force: true });

test('icons.css self-hosts Material Symbols Rounded next to the CSS', () => {
  assert.match(iconsCss, /font-family: 'Material Symbols Rounded';/);
  assert.match(
    iconsCss,
    /src: url\('\.\/fonts\/material-symbols-rounded\.woff2'\) format\('woff2'\);/,
  );
  assert.match(iconsCss, /font-display: block;/);
  assert.ok(!iconsCss.includes('googleapis'), 'icons.css must not call Google');
  // Rounded, weight 400, FILL 0..1: ~0.5 MB. Guard against shipping the full
  // variable font (5+ MB) by accident.
  assert.ok(
    fontBytes > 300_000 && fontBytes < 800_000,
    `font is ${fontBytes} bytes`,
  );
});

test('styles.css is plain CSS that opens with the Orchestra layer order', () => {
  const firstRule = stylesCss.split('\n').find((line) => line.startsWith('@'));
  assert.equal(
    firstRule,
    '@layer orc.reset, orc.tokens, orc.base, orc.components;',
  );
  for (const sass of ['@use', '@include', '@mixin', '#{', '$theme'])
    assert.ok(!stylesCss.includes(sass), `styles.css contains ${sass}`);
  // Every rule lives inside an Orchestra layer: nothing unlayered leaks.
  const topLevel = stylesCss
    .split('\n')
    .filter((line) => /^\S/.test(line) && !line.startsWith('}'))
    .filter((line) => !line.startsWith('/*!'));
  for (const line of topLevel)
    assert.match(
      line,
      /^@layer orc\.(tokens|base|components)\b|^@layer orc\.reset, /,
    );
});

test('styles.css never ships the global reset', () => {
  assert.ok(!stylesCss.includes('@layer orc.reset {'));
  assert.ok(!/(^|\n)\s*body\s*\{/.test(stylesCss));
  assert.ok(!/margin:\s*0/.test(stylesCss));
});

test('reset.css is the optional reset in the lowest Orchestra layer only', () => {
  assert.match(
    resetCss,
    /@layer orc\.reset, orc\.tokens, orc\.base, orc\.components;/,
  );
  assert.match(resetCss, /@layer orc\.reset \{/);
  assert.ok(!/@layer orc\.(tokens|base|components) \{/.test(resetCss));
  for (const name of resetCss.match(/var\(--[\w-]+/g) ?? [])
    assert.match(name, /^var\(--orc-/, `reset.css uses ${name}`);
});

test('TOKENS.md documents exactly the public token vocabulary', () => {
  const publicCss = compileString(
    "@use 'layers'; @use 'tokens'; @use 'themes'; @use 'base';",
    { loadPaths: [styles] },
  ).css;
  const publicTokens = declared(publicCss);
  const docs = readFileSync(path.join(styles, 'TOKENS.md'), 'utf8');
  const [publicSection, legacySection] = docs.split('## Nomes antigos');
  assert.ok(legacySection, 'TOKENS.md lacks the legacy section');
  const documented = new Set(
    [...publicSection.matchAll(/^\| `(--orc-[\w-]+)`\s*\|/gm)].map((m) => m[1]),
  );
  assert.deepEqual([...publicTokens].sort(), [...documented].sort());
  // Every legacy alias shipped in styles.css is listed with its replacement.
  const legacyDocumented = new Set(
    [...legacySection.matchAll(/^\| `(--[\w-]+)`\s*\|/gm)].map((m) => m[1]),
  );
  const shipped = new Set(stylesCss.match(/--[\w-]+(?=\s*:)/g));
  const legacy = [...shipped].filter((name) => !publicTokens.has(name));
  assert.deepEqual(legacy.sort(), [...legacyDocumented].sort());
});
