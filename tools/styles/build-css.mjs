// Compiles the library's Sass style sources into the plain CSS files the
// package exports (`@ciag/orchestra/styles.css` and `@ciag/orchestra/reset.css`)
// and writes the opt-in icon font entry (`@ciag/orchestra/icons.css` plus
// `fonts/material-symbols-rounded.woff2`).
// Runs after `ng build orc-ds`, which recreates dist/orc-ds from scratch.
import { spawn } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  watch,
  watchFile,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'sass';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const sources = path.join(root, 'projects/orc-ds/styles');
const defaultOut = path.join(root, 'dist/orc-ds');

export const STYLE_ENTRIES = [
  { source: 'orchestra.scss', output: 'styles.css' },
  { source: 'reset.scss', output: 'reset.css' },
];

// Sass constructs that must never reach a consumer's plain CSS pipeline.
const SASS_LEFTOVERS =
  /(^|\s)@(use|forward|mixin|include|function|each|if|else|return)\b|\$[a-z_-]+\s*:|#\{/m;

export function compileStyles(outDir = defaultOut) {
  const { version } = JSON.parse(
    readFileSync(path.join(root, 'projects/orc-ds/package.json'), 'utf8'),
  );
  mkdirSync(outDir, { recursive: true });
  const written = [];
  for (const { source, output } of STYLE_ENTRIES) {
    const result = compile(path.join(sources, source), {
      style: 'expanded',
      charset: false,
      logger: {
        warn(message) {
          throw new Error(`Sass warning in ${source}: ${message}`);
        },
      },
    });
    const css = `/*! @ciag/orchestra ${version} | ${output} | MIT */\n${result.css}\n`;
    if (SASS_LEFTOVERS.test(css))
      throw new Error(`${output} still contains Sass syntax`);
    if (!css.includes('@layer orc.reset, orc.tokens, orc.base, orc.components'))
      throw new Error(`${output} is missing the Orchestra layer order`);
    writeFileSync(path.join(outDir, output), css);
    written.push(output);
  }
  written.push(...writeIconFont(outDir, version));
  return written;
}

/**
 * Bundled Material Symbols Rounded (weight 400, FILL 0..1 — the axes Orchestra
 * uses), self-hosted so apps need no Google Fonts `<link>` and icons work
 * offline. Apps that need other families or weights skip `icons.css` and load
 * the font themselves.
 */
export const ICON_FONT = {
  source: 'fonts/material-symbols-rounded.woff2',
  css: 'icons.css',
};

export function iconFontCss(version) {
  return `/*! @ciag/orchestra ${version} | ${ICON_FONT.css} | Material Symbols Rounded (Apache-2.0) */
@font-face {
  font-family: 'Material Symbols Rounded';
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url('./${ICON_FONT.source}') format('woff2');
}
`;
}

function writeIconFont(outDir, version) {
  mkdirSync(path.join(outDir, 'fonts'), { recursive: true });
  copyFileSync(
    path.join(sources, ICON_FONT.source),
    path.join(outDir, ICON_FONT.source),
  );
  writeFileSync(path.join(outDir, ICON_FONT.css), iconFontCss(version));
  return [ICON_FONT.css, ICON_FONT.source];
}

// `--watch`: run `ng build orc-ds --watch` and recompile the CSS whenever
// ng-packagr rewrites the distribution or a style source changes. ng-packagr
// wipes dist/orc-ds on its first build, so the CSS must follow each build.
function watchLibrary() {
  const ng = spawn(
    process.execPath,
    [
      path.join(root, 'node_modules/@angular/cli/bin/ng.js'),
      'build',
      'orc-ds',
      '--watch',
      '--configuration',
      'development',
    ],
    { cwd: root, stdio: 'inherit' },
  );
  ng.once('exit', (code) => process.exit(code ?? 1));
  for (const signal of ['SIGINT', 'SIGTERM'])
    process.once(signal, () => ng.kill(signal));
  let timer;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!existsSync(path.join(defaultOut, 'package.json'))) return;
      try {
        console.log(`[styles] compiled ${compileStyles().join(', ')}`);
      } catch (error) {
        console.error(`[styles] ${error.message}`);
      }
    }, 300);
  };
  watch(sources, { recursive: true }, schedule);
  // dist/orc-ds may not exist yet; poll its manifest, which ng-packagr
  // rewrites at the end of every (re)build.
  watchFile(path.join(defaultOut, 'package.json'), { interval: 500 }, schedule);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--watch')) {
    watchLibrary();
  } else {
    buildOnce();
  }
}

function buildOnce() {
  const outIndex = process.argv.indexOf('--out');
  const outDir =
    outIndex > -1 ? path.resolve(process.argv[outIndex + 1]) : defaultOut;
  if (outIndex === -1 && !existsSync(path.join(outDir, 'package.json')))
    throw new Error(
      `${outDir} has no package.json; run \`ng build orc-ds\` first.`,
    );
  const written = compileStyles(outDir);
  console.log(
    `Compiled ${written.join(', ')} into ${path.relative(root, outDir) || '.'}`,
  );
}
