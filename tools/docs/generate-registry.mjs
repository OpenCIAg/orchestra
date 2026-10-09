#!/usr/bin/env node
/**
 * Gera o registro da documentação a partir dos diretórios de conteúdo:
 *
 *   generated/docs-registry/catalog.generated.ts         catálogo (novo + legacy)
 *   generated/docs-registry/routes.generated.ts          rotas lazy de componentes
 *   generated/docs-registry/pages.generated.ts           loaders das páginas novas
 *   generated/docs-registry/pages/<id>.page.generated.ts DOC + exemplos + código
 *   generated/docs-registry/legacy-examples.generated.ts exemplos da página antiga
 *
 * Nenhum arquivo compartilhado é escrito à mão: quem documenta uma família
 * só cria/apaga `content/components/<id>/` e roda este script.
 *
 * Uso:
 *   node tools/docs/generate-registry.mjs          # regenera
 *   node tools/docs/generate-registry.mjs --check  # falha se algo estiver
 *                                                  # inválido ou desatualizado
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import {
  GENERATED_DIR,
  loadDocsRegistry,
  renderRegistryOutputs,
} from './docs-registry-lib.mjs';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const check = process.argv.includes('--check');
const rel = (file) => path.relative(root, file).replace(/\\/g, '/');

const registry = loadDocsRegistry(root);
if (registry.problems.length) {
  console.error('Registro da documentação inválido:');
  for (const problem of registry.problems) console.error(`  - ${problem}`);
  console.error('\nCorrija os itens acima (guia: docs/overhaul/GUIA-DOCS.md).');
  process.exit(1);
}

async function format(source, filepath) {
  const config = {
    ...(await prettier.resolveConfig(filepath, { editorconfig: true })),
    filepath,
  };
  return prettier.format(source, config);
}

const outputs = new Map();
for (const [file, source] of renderRegistryOutputs(root, registry))
  outputs.set(file, await format(source, file));

const pagesDir = path.join(root, GENERATED_DIR, 'pages');
const generatedOnDisk = (dir) =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((name) => name.endsWith('.generated.ts'))
        .map((name) => path.join(dir, name))
    : [];
const orphans = [
  ...generatedOnDisk(path.join(root, GENERATED_DIR)),
  ...generatedOnDisk(pagesDir),
].filter((file) => !outputs.has(file));

const summary = `${registry.entries.length} famílias no catálogo (${registry.content.length} no formato novo, ${registry.legacyCatalog.length} legacy), ${registry.content.reduce((total, family) => total + family.examples.length, 0)} exemplos novos, ${registry.legacyPages.length} páginas antigas`;

if (check) {
  const stale = [];
  for (const [file, formatted] of outputs) {
    const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    if (current !== formatted) stale.push(rel(file));
  }
  for (const file of orphans) stale.push(`${rel(file)} (órfão)`);
  if (stale.length) {
    console.error(
      'Registro da documentação desatualizado. Rode: npm run docs:generate-registry',
    );
    for (const file of stale) console.error(`  ${file}`);
    process.exit(1);
  }
  console.log(`registro da documentação em dia: ${summary}.`);
  process.exit(0);
}

fs.mkdirSync(pagesDir, { recursive: true });
let written = 0;
for (const [file, formatted] of outputs) {
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (current === formatted) continue;
  fs.writeFileSync(file, formatted);
  written++;
}
for (const file of orphans) fs.unlinkSync(file);
console.log(
  `registro gerado em ${GENERATED_DIR}: ${summary}; ${written} arquivo(s) escrito(s), ${orphans.length} órfão(s) removido(s).`,
);
