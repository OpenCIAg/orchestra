#!/usr/bin/env node
// Mede cada família do catálogo da docs: entry points, declarações, inputs/outputs
// (com deprecados), linhas de código e spec, uso de CDK, chunk FESM (raw/gzip),
// dependências entre entry points e uso no consumidor gestao-de-projetos.
// Saída: docs/overhaul/measurements.json (consumida pelos avaliadores e pela consolidação).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const lib = path.join(root, 'projects/orc-ds');
const fesm = path.join(root, 'dist/orc-ds/fesm2022');
const consumer =
  process.env.CONSUMER_DIR ??
  path.join(process.env.HOME, 'Workspaces/gestao-de-projetos-frontend/src');
const inv = JSON.parse(
  fs.readFileSync(path.join(root, 'docs/quality/inventory.json'), 'utf8'),
);

const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== 'node_modules') walk(p, out);
    } else out.push(p);
  }
  return out;
};
const lines = (f) => fs.readFileSync(f, 'utf8').split('\n').length;

// Família do catálogo
const catalogDir = path.join(root, 'projects/docs/src/app/catalog');
const families = fs
  .readdirSync(catalogDir)
  .filter((f) => f.endsWith('.catalog.ts'))
  .map((f) => {
    const s = fs.readFileSync(path.join(catalogDir, f), 'utf8');
    const g = (k) => s.match(new RegExp(`${k}: '([^']+)'`))?.[1];
    return {
      id: g('id'),
      name: g('name'),
      category: g('category'),
      status: g('status'),
      description: g('description'),
    };
  });

// Entry points: o barrel de cada diretório e quem é alias (re-export puro de outro entry)
const entries = inv.entryPoints.map((e) => {
  const dir = path
    .dirname(e.file)
    .replace(lib + '/', '')
    .replace('projects/orc-ds/', '');
  const reexportsOnly =
    /^(\s*(export \*|export \{[^}]*\}) from '@ciag\/orchestra\/[^']+';\s*|\s*\/\/.*\n|\s*\/\*[\s\S]*?\*\/\s*)+$/.test(
      e.exports,
    );
  return {
    name: e.name,
    dir,
    aliasOf: reexportsOnly
      ? [...e.exports.matchAll(/'@ciag\/orchestra\/([^']+)'/g)].map((m) => m[1])
      : null,
  };
});

// Consumidor: imports e seletores
const consumerFiles = walk(consumer).filter((f) => /\.(ts|html)$/.test(f));
const consumerText = consumerFiles
  .map((f) => fs.readFileSync(f, 'utf8'))
  .join('\n');
const consumerImports = {};
for (const m of consumerText.matchAll(/from '@ciag\/orchestra\/([^']+)'/g))
  consumerImports[m[1]] = (consumerImports[m[1]] ?? 0) + 1;
const consumerTags = {};
for (const m of consumerText.matchAll(/<(orc-[a-z-]+)/g))
  consumerTags[m[1]] = (consumerTags[m[1]] ?? 0) + 1;

const chunk = (entry) => {
  const f = path.join(fesm, `ciag-orchestra-${entry}.mjs`);
  if (!fs.existsSync(f)) return null;
  const b = fs.readFileSync(f);
  const deps = [
    ...new Set(
      [...b.toString().matchAll(/from '@ciag\/orchestra\/([^']+)'/g)].map(
        (m) => m[1],
      ),
    ),
  ];
  return { raw: b.length, gzip: zlib.gzipSync(b).length, deps };
};

const out = families.map((fam) => {
  const dirCandidates = [fam.id, fam.id.replace(/-/g, '')];
  const dir =
    dirCandidates.find((d) => fs.existsSync(path.join(lib, d))) ?? null;
  const files = dir ? walk(path.join(lib, dir)) : [];
  const src = files.filter(
    (f) => /\.(ts|html|scss)$/.test(f) && !f.endsWith('.spec.ts'),
  );
  const specs = files.filter((f) => f.endsWith('.spec.ts'));
  const decls = inv.declarations.filter(
    (d) => dir && d.file.startsWith(`projects/orc-ds/${dir}/`),
  );
  const declsInP2 = inv.declarations.filter(
    (d) =>
      d.file.includes('/p2/') &&
      d.selector &&
      d.selector.split(',').some((s) => s.trim() === `orc-${fam.id}`),
  );
  const allDecls = [...decls, ...declsInP2];
  const srcText = src.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const deprecatedInputs = (
    srcText.match(
      /@deprecated[\s\S]{0,400}?\n\s*(readonly \w+ = (input|model)|@Input)/g,
    ) ?? []
  ).length;
  const aliases = entries
    .filter((e) => e.aliasOf?.includes(dir ?? fam.id))
    .map((e) => e.name);
  const selectors = allDecls.flatMap((d) =>
    (d.selector ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
  return {
    id: fam.id,
    name: fam.name,
    category: fam.category,
    status: fam.status,
    description: fam.description,
    dir,
    declarations: allDecls.map((d) => ({
      name: d.name,
      kind: d.kind,
      selector: d.selector,
      file: d.file,
      inputs: d.inputs.length,
      outputs: d.outputs.length,
    })),
    inputs: allDecls.reduce((n, d) => n + d.inputs.length, 0),
    outputs: allDecls.reduce((n, d) => n + d.outputs.length, 0),
    primengOutputs: allDecls.reduce(
      (n, d) =>
        n +
        d.outputs.filter((o) => /^on[A-Z]/.test(o.publicName ?? o.name)).length,
      0,
    ),
    deprecatedInputsApprox: deprecatedInputs,
    srcLines: src.reduce((n, f) => n + lines(f), 0),
    specLines: specs.reduce((n, f) => n + lines(f), 0),
    specFiles: specs.length,
    usesCdk: /@angular\/cdk/.test(srcText),
    implementsCva: /NG_VALUE_ACCESSOR|CvaControl|ControlValueAccessor/.test(
      srcText,
    ),
    chunk: dir ? chunk(dir) : null,
    aliasEntryPoints: aliases,
    consumer: {
      imports: consumerImports[dir ?? fam.id] ?? 0,
      tags: Object.fromEntries(
        selectors
          .filter((s) => consumerTags[s])
          .map((s) => [s, consumerTags[s]]),
      ),
    },
  };
});

const summary = {
  generatedAt: new Date().toISOString(),
  families: out.length,
  entryPoints: entries.length,
  aliasEntryPoints: entries.filter((e) => e.aliasOf).length,
  consumerImports,
  consumerTags,
  unmappedEntries: entries
    .filter((e) => !e.aliasOf && !out.some((f) => f.dir === e.dir))
    .map((e) => e.name),
};
fs.mkdirSync(path.join(root, 'docs/overhaul'), { recursive: true });
fs.writeFileSync(
  path.join(root, 'docs/overhaul/measurements.json'),
  JSON.stringify({ summary, families: out }, null, 2) + '\n',
);
console.log(
  `${out.length} famílias, ${summary.entryPoints} entry points (${summary.aliasEntryPoints} aliases), ${summary.unmappedEntries.length} sem família.`,
);
