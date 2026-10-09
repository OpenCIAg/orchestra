import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  CONTENT_DIR,
  EXPERIMENTAL_FAMILIES,
  FAMILY_GROUPS,
  exampleClassName,
  groupForFamily,
  loadDocsRegistry,
  readContentFamily,
  renderRegistryOutputs,
} from './docs-registry-lib.mjs';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

const LOCALE = {
  description: 'Descrição.',
  whenToUse: ['Quando X.'],
  whenNotToUse: [{ text: 'Quando Y.' }],
  anatomy: [{ part: 'orc-demo', description: 'Host.' }],
  accessibility: { keyboard: [], aria: ['role="group"'] },
  migration: [{ before: '`a`', after: '`b`' }],
  examples: { basic: { title: 'Básico', description: 'Uso básico.' } },
};

function docSource(overrides = {}) {
  const doc = {
    id: 'demo',
    name: 'Demo',
    group: 'actions',
    status: 'stable',
    icon: 'star',
    packagePath: '@ciag/orchestra/demo',
    tags: ['demo'],
    examples: ['basic'],
    i18n: { 'pt-BR': LOCALE },
    ...overrides,
  };
  return `import type { ComponentDocSource } from '../../../models/component-page.model';\n\nexport const DOC: ComponentDocSource = ${JSON.stringify(doc, null, 2)};\n`;
}

const EXAMPLE = `import { Component } from '@angular/core';

@Component({ selector: 'doc-demo-basic-example', template: '<p>oi</p>' })
export class DemoBasicExampleComponent {}
`;

function scaffold({ doc = docSource(), examples = { basic: EXAMPLE } } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-registry-'));
  const dir = path.join(root, CONTENT_DIR, 'demo');
  fs.mkdirSync(path.join(dir, 'examples'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'demo.doc.ts'), doc);
  for (const [slug, source] of Object.entries(examples))
    fs.writeFileSync(path.join(dir, 'examples', `${slug}.example.ts`), source);
  return root;
}

test('exampleClassName joins family and slug in PascalCase', () => {
  assert.equal(
    exampleClassName('tree-select', 'lazy-load'),
    'TreeSelectLazyLoadExampleComponent',
  );
});

test('the family map covers the 58 core plus 12 experimental families', () => {
  const ids = Object.values(FAMILY_GROUPS).flat();
  assert.equal(ids.length, 70);
  assert.equal(new Set(ids).size, 70);
  for (const id of EXPERIMENTAL_FAMILIES) assert.ok(ids.includes(id), id);
  assert.equal(groupForFamily('modal'), 'overlays');
  assert.equal(groupForFamily('dock', 'Navigation'), 'navigation');
});

test('readContentFamily accepts a complete family and embeds example sources', () => {
  const root = scaffold();
  const family = readContentFamily(root, 'demo');
  assert.deepEqual(family.problems, []);
  assert.equal(family.doc.name, 'Demo');
  assert.equal(family.examples[0].className, 'DemoBasicExampleComponent');
  assert.equal(family.examples[0].source, EXAMPLE);
});

test('readContentFamily reports missing texts, orphans and wrong class names', () => {
  const root = scaffold({
    doc: docSource({
      status: 'experimental',
      i18n: { 'pt-BR': { ...LOCALE, whenToUse: [], examples: {} } },
    }),
    examples: {
      basic: EXAMPLE.replace('DemoBasic', 'Wrong'),
      extra: EXAMPLE,
    },
  });
  const problems = readContentFamily(root, 'demo').problems.join('\n');
  assert.match(problems, /não está entre as experimentais/);
  assert.match(problems, /whenToUse/);
  assert.match(problems, /exemplo "basic" sem/);
  assert.match(problems, /extra\.example\.ts: exemplo órfão/);
  assert.match(problems, /DemoBasicExampleComponent/);
});

test('readContentFamily rejects non-literal DOC values', () => {
  const root = scaffold({
    doc: "const name = 'Demo';\nexport const DOC = { id: 'demo', name };\n",
  });
  assert.match(
    readContentFamily(root, 'demo').problems.join('\n'),
    /só propriedades literais/,
  );
});

test('the committed registry is valid and renders every generated module', () => {
  const registry = loadDocsRegistry(repoRoot);
  assert.deepEqual(registry.problems, []);
  const ids = registry.content.map((family) => family.id);
  for (const pilot of ['button', 'select', 'modal'])
    assert.ok(ids.includes(pilot), pilot);
  const outputs = [...renderRegistryOutputs(repoRoot, registry).keys()].map(
    (file) => path.basename(file),
  );
  assert.ok(outputs.includes('catalog.generated.ts'));
  assert.ok(outputs.includes('routes.generated.ts'));
  assert.ok(outputs.includes('button.page.generated.ts'));
});
