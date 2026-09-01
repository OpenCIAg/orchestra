#!/usr/bin/env node

/**
 * Generate the Orchestra Material Symbols metadata catalog.
 *
 * Usage:
 *   node tools/material-symbols/generate.mjs \
 *     --metadata /path/to/google-icons.json
 *
 * The metadata file is downloaded from Google's Material Symbols metadata
 * endpoint at authoring time. The published package contains names and search
 * metadata only; glyphs are rendered by the Google Fonts CSS loaded by
 * `orc-icon`.
 */
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, values) => {
  if (value.startsWith('--')) pairs.push([value.slice(2), values[index + 1]]);
  return pairs;
}, []));

if (!args.metadata) {
  console.error('Expected --metadata');
  process.exit(1);
}

const root = path.resolve(new URL('../..', import.meta.url).pathname);
const metadataText = fs.readFileSync(path.resolve(args.metadata), 'utf8').replace(/^\)\]\}'\n/, '');
const sourceMetadata = JSON.parse(metadataText);
const family = args.family ?? 'Material Symbols Rounded';

const esc = (value) => JSON.stringify(value);
const availableIcons = sourceMetadata.icons
  .filter((icon) => !(icon.unsupported_families ?? []).includes(family))
  .sort((a, b) => b.popularity - a.popularity || a.name.localeCompare(b.name))
  .map((icon, index) => ({
    name: icon.name,
    rank: index + 1,
    popularity: icon.popularity,
    categories: icon.categories ?? [],
    tags: icon.tags ?? [],
    codepoint: icon.codepoint,
    version: icon.version,
  }));

if (!availableIcons.length) throw new Error(`No icons found for ${family}`);

const output = path.join(root, 'projects/orc-ds/icons');
const metadata = availableIcons.map((icon) => `  {
    name: ${esc(icon.name)},
    rank: ${icon.rank},
    popularity: ${icon.popularity},
    categories: ${JSON.stringify(icon.categories)},
    tags: ${JSON.stringify(icon.tags)},
    codepoint: ${icon.codepoint},
    version: ${icon.version},
  },`).join('\n');

fs.writeFileSync(path.join(output, 'icon-catalog.ts'), `import type { OrcMaterialSymbolMetadata } from '@ciag/orchestra/icon';

/** All Material Symbols available in the Rounded family at generation time. */
export const ORC_MATERIAL_SYMBOLS: readonly OrcMaterialSymbolMetadata[] = [
${metadata}
];

export const ORC_MATERIAL_SYMBOL_CATALOG: Readonly<Record<string, OrcMaterialSymbolMetadata>> = Object.fromEntries(
  ORC_MATERIAL_SYMBOLS.map((icon) => [icon.name, icon]),
);
`);

fs.writeFileSync(path.join(output, 'index.ts'), `export * from './icon-catalog';\n`);
fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify({
  source: 'Google Material Symbols metadata',
  sourceUrl: 'https://fonts.google.com/metadata/icons?incomplete=1&key=material_symbols',
  family,
  rendering: 'Google Fonts Material Symbols variable font',
  iconCount: availableIcons.length,
  icons: availableIcons,
}, null, 2) + '\n');

console.log(`Generated ${availableIcons.length} ${family} icons in ${output}`);
