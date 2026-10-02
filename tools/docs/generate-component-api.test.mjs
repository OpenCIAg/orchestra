import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildComponentApi,
  parseBindingDeclaration,
  renderFamilyModule,
  renderRegistryModule,
} from './component-api-lib.mjs';

test('parseBindingDeclaration extracts an explicit type and default', () => {
  assert.deepEqual(
    parseBindingDeclaration(
      "readonly variant = input<ButtonVariant>('primary');",
    ),
    { type: 'ButtonVariant', defaultValue: "'primary'", required: false },
  );
});

test('parseBindingDeclaration keeps union types intact', () => {
  assert.deepEqual(
    parseBindingDeclaration(
      'readonly severity = input<ButtonVariant | undefined>(undefined);',
    ),
    {
      type: 'ButtonVariant | undefined',
      defaultValue: 'undefined',
      required: false,
    },
  );
});

test('parseBindingDeclaration uses only the first type argument', () => {
  // input<boolean, unknown> declares the transform input type separately.
  const parsed = parseBindingDeclaration(
    'readonly disabled = input<boolean, unknown>(false, {\n    transform: booleanAttribute,\n  });',
  );
  assert.equal(parsed.type, 'boolean');
  assert.equal(parsed.defaultValue, 'false');
});

test('parseBindingDeclaration infers primitive types from the default', () => {
  assert.equal(
    parseBindingDeclaration('readonly closable = input(false);').type,
    'boolean',
  );
  assert.equal(
    parseBindingDeclaration('readonly cache = input(true);').type,
    'boolean',
  );
  assert.equal(
    parseBindingDeclaration("readonly icon = input('');").type,
    'string',
  );
  assert.equal(
    parseBindingDeclaration('readonly value = input(0);').type,
    'number',
  );
});

test('parseBindingDeclaration handles models and required inputs', () => {
  assert.deepEqual(
    parseBindingDeclaration('readonly selected = model<string[]>([]);'),
    { type: 'string[]', defaultValue: '[]', required: false },
  );
  assert.equal(
    parseBindingDeclaration(
      'readonly columns = input.required<DataTableColumn[]>();',
    ).required,
    true,
  );
});

test('parseBindingDeclaration documents outputs without a default', () => {
  assert.deepEqual(
    parseBindingDeclaration('readonly removed = output<string>();'),
    {
      type: 'string',
      defaultValue: null,
      required: false,
    },
  );
  // Options objects (aliases) are not a default value.
  assert.equal(
    parseBindingDeclaration(
      "readonly click = output<MouseEvent>({ alias: 'clicked' });",
    ).defaultValue,
    null,
  );
  assert.deepEqual(
    parseBindingDeclaration('readonly onRemove = output<{ value: string }>();'),
    { type: '{ value: string }', defaultValue: null, required: false },
  );
});

const fixtureInventory = {
  declarations: [
    {
      name: 'TagComponent',
      kind: 'Component',
      selector: 'orc-tag',
      file: 'projects/orc-ds/tag/tag.component.ts',
      line: 18,
      inputs: [
        {
          name: 'label',
          publicName: 'label',
          kind: 'signal',
          required: false,
          declaration: 'readonly label = input<string | undefined>(undefined);',
          description: 'Texto exibido pela tag.',
        },
        {
          name: 'virtualScroll',
          publicName: 'virtualScroll',
          kind: 'signal',
          required: false,
          declaration: 'readonly virtualScroll = input(false);',
          deprecated: true,
          description:
            'Compatibility input only; virtual scrolling is not implemented.',
        },
        {
          name: 'removable',
          publicName: 'removable',
          kind: 'model',
          required: false,
          declaration: 'readonly removable = model(false);',
        },
      ],
      outputs: [
        {
          name: 'removed',
          kind: 'output',
          declaration: 'readonly removed = output<string>();',
        },
      ],
    },
    {
      name: 'KnobComponent',
      kind: 'Component',
      selector: 'orc-knob',
      file: 'projects/orc-ds/p2/p2-org-knob-components.ts',
      line: 40,
      inputs: [
        {
          name: 'value',
          publicName: 'value',
          kind: 'model',
          required: false,
          declaration: 'readonly value = model<number>(0);',
        },
      ],
      outputs: [],
    },
  ],
};

test('buildComponentApi groups families and drops deprecated bindings', () => {
  const api = buildComponentApi(fixtureInventory);
  assert.deepEqual(Object.keys(api), ['knob', 'tag']);

  const tag = api.tag;
  assert.equal(tag.length, 1);
  assert.equal(tag[0].component, 'TagComponent');
  assert.equal(tag[0].selector, 'orc-tag');
  assert.deepEqual(
    tag[0].entries.map((entry) => `${entry.kind}:${entry.name}`),
    ['input:label', 'model:removable', 'output:removed'],
  );
  const label = tag[0].entries[0];
  assert.equal(label.type, 'string | undefined');
  assert.equal(label.defaultValue, 'undefined');
  assert.equal(label.description, 'Texto exibido pela tag.');
  assert.equal(
    tag[0].entries.some((entry) => entry.name === 'virtualScroll'),
    false,
  );
});

test('renderFamilyModule emits a typed, prettier-stable module', async () => {
  const api = buildComponentApi(fixtureInventory);
  const source = renderFamilyModule('tag', api.tag);
  assert.match(source, /Generated by tools\/docs\/generate-component-api\.mjs/);
  assert.match(
    source,
    /import type \{ ComponentApiMember \} from '\.\.\/\.\.\/models\/component-api\.model';/,
  );
  assert.match(source, /component: 'TagComponent'/);
  assert.match(source, /description: 'Texto exibido pela tag\.'/);
  // Deprecated bindings were dropped by buildComponentApi.
  assert.doesNotMatch(source, /virtualScroll/);

  const prettier = await import('prettier');
  // Mirrors the repo style the generator applies (.editorconfig quote_type =
  // single for *.ts; the prettier CLI picks this up, the programmatic API
  // does not).
  const formatted = await prettier.format(source, {
    filepath: 'tag.generated.ts',
    singleQuote: true,
  });
  assert.equal(source, formatted);
});

test('renderRegistryModule lazy-loads every family and quotes kebab-case ids', () => {
  const source = renderRegistryModule(['knob', 'foo-bar']);
  assert.match(source, /ComponentApiLoader/);
  assert.match(
    source,
    /knob: \(\) => import\('\.\/component-api\/knob\.generated'\)\.then\(\(m\) => m\.COMPONENT_API\),/,
  );
  assert.match(
    source,
    /'foo-bar': \(\) => import\('\.\/component-api\/foo-bar\.generated'\)\.then\(\(m\) => m\.COMPONENT_API\),/,
  );
});
