#!/usr/bin/env node

/**
 * Generate the Orchestra Material Symbols catalog.
 *
 * Usage:
 *   node tools/material-symbols/generate.mjs \
 *     --source /path/to/@material-symbols/svg-400/package \
 *     --metadata /path/to/google-icons.json
 *
 * The source package is an authoring-time input only. Generated files are
 * committed so consumers do not need a runtime icon dependency.
 */
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, values) => {
  if (value.startsWith('--')) pairs.push([value.slice(2), values[index + 1]]);
  return pairs;
}, []));

if (!args.source || !args.metadata) {
  console.error('Expected --source and --metadata');
  process.exit(1);
}

const root = path.resolve(new URL('../..', import.meta.url).pathname);
const output = path.join(root, 'projects/orc-ds/icons/generated');
const metadataText = fs.readFileSync(path.resolve(args.metadata), 'utf8').replace(/^\)\]\}'\n/, '');
const sourceMetadata = JSON.parse(metadataText);
const source = path.resolve(args.source);

const esc = (value) => JSON.stringify(value);
const identifier = (name) => `orc${name.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('')}Icon`;
const readPaths = (file) => {
  const svg = fs.readFileSync(file, 'utf8');
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 24 24';
  const paths = [...svg.matchAll(/<path\b([^>]*)\/>/g)].map((match) => {
    const d = match[1].match(/\bd="([^"]*)"/)?.[1];
    if (!d) throw new Error(`Missing path data in ${file}`);
    return { d };
  });
  if (!paths.length) throw new Error(`No paths found in ${file}`);
  return { viewBox, paths };
};

const candidates = sourceMetadata.icons
  .filter((icon) => fs.existsSync(path.join(source, 'rounded', `${icon.name}.svg`)))
  .sort((a, b) => b.popularity - a.popularity || a.name.localeCompare(b.name))
  .slice(0, 500)
  .map((icon, index) => ({
    name: icon.name,
    rank: index + 1,
    popularity: icon.popularity,
    categories: icon.categories ?? [],
    tags: icon.tags ?? [],
  }));

if (candidates.length !== 500) throw new Error(`Expected 500 icons, found ${candidates.length}`);

fs.mkdirSync(output, { recursive: true });
for (const icon of candidates) {
  const regular = readPaths(path.join(source, 'rounded', `${icon.name}.svg`));
  const filledPath = path.join(source, 'rounded', `${icon.name}-fill.svg`);
  const filled = fs.existsSync(filledPath) ? readPaths(filledPath) : regular;
  const definition = `import type { OrcIconDefinition } from '@ciag/orchestra/icon';\n\nexport const ${identifier(icon.name)}: OrcIconDefinition = {\n  name: ${esc(icon.name)},\n  viewBox: ${esc(regular.viewBox)},\n  paths: ${JSON.stringify(regular.paths)},\n  filledPaths: ${JSON.stringify(filled.paths)},\n};\n`;
  fs.writeFileSync(path.join(output, `${icon.name}.ts`), definition);
}

const exports = candidates.map((icon) => `export { ${identifier(icon.name)} } from './generated/${icon.name}';`).join('\n');
fs.writeFileSync(path.join(root, 'projects/orc-ds/icons/index.ts'), `${exports}\n\nexport * from './icon-catalog';\n`);
const catalog = candidates.map((icon) => `  ${esc(icon.name)}: ${identifier(icon.name)},`).join('\n');
const metadata = candidates.map((icon) => `  { name: ${esc(icon.name)}, rank: ${icon.rank}, popularity: ${icon.popularity}, categories: ${JSON.stringify(icon.categories)}, tags: ${JSON.stringify(icon.tags)} },`).join('\n');
fs.writeFileSync(path.join(root, 'projects/orc-ds/icons/icon-catalog.ts'), `import type { OrcIconDefinition } from '@ciag/orchestra/icon';\n${candidates.map((icon) => `import { ${identifier(icon.name)} } from './generated/${icon.name}';`).join('\n')}\n\nexport const ORC_ICON_CATALOG: Readonly<Record<string, OrcIconDefinition>> = {\n${catalog}\n};\n\nexport const ORC_ICON_METADATA = [\n${metadata}\n] as const;\n`);
fs.writeFileSync(path.join(root, 'projects/orc-ds/icons/manifest.json'), JSON.stringify({ source: '@material-symbols/svg-400', style: 'rounded', fill: 'opt-in', ranking: 'Google Fonts metadata popularity descending', icons: candidates }, null, 2) + '\n');
console.log(`Generated ${candidates.length} icons in ${output}`);
