import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  aliasTarget,
  buildReferenceContext,
  docsUrl,
  entryPointDir,
  renderAgentReference,
  renderLlmsTxt,
  resolveEntryPointFamily,
  resolveSymbolFamily,
} from './agent-reference-lib.mjs';

const catalogEntries = [
  {
    id: 'button',
    name: 'Button',
    category: 'Inputs',
    status: 'stable',
    route: '/components/button',
  },
  {
    id: 'switch',
    name: 'Switch',
    category: 'Inputs',
    status: 'stable',
    route: '/components/switch',
  },
];

const inventory = {
  entryPoints: [
    {
      name: '@ciag/orchestra/button',
      file: 'projects/orc-ds/button/index.ts',
      exports:
        "export * from './button.component';\nexport * from './icon-button.component';",
    },
    {
      name: '@ciag/orchestra/toggle',
      file: 'projects/orc-ds/toggle/index.ts',
      exports:
        "export { SwitchComponent as ToggleComponent } from '@ciag/orchestra/switch';",
    },
    {
      name: '@ciag/orchestra/p2',
      file: 'projects/orc-ds/p2/index.ts',
      exports: "export * from './p2-form-components';",
    },
  ],
  declarations: [
    {
      name: 'ButtonComponent',
      kind: 'Component',
      selector: 'orc-button',
      file: 'projects/orc-ds/button/button.component.ts',
      inputs: [
        {
          name: 'variant',
          publicName: 'variant',
          kind: 'signal',
          required: false,
          declaration: "readonly variant = input<ButtonVariant>('primary');",
        },
        {
          name: 'loading',
          publicName: 'loading',
          kind: 'signal',
          required: false,
          declaration:
            'readonly loading = input(false, { transform: booleanAttribute });',
        },
      ],
      outputs: [
        {
          name: 'click',
          kind: 'output',
          declaration: 'readonly click = output<MouseEvent>();',
        },
      ],
    },
    {
      name: 'SwitchComponent',
      kind: 'Component',
      selector: 'orc-switch',
      file: 'projects/orc-ds/switch/switch.component.ts',
      inputs: [],
      outputs: [],
    },
  ],
};

function buildContext() {
  return buildReferenceContext(
    inventory,
    catalogEntries,
    'https://orchestra.example',
  );
}

test('entryPointDir extracts the library directory of an entry point', () => {
  assert.equal(entryPointDir(inventory.entryPoints[0]), 'button');
  assert.equal(entryPointDir({ file: 'other/place/index.ts' }), null);
});

test('aliasTarget detects package re-exports and p2 relative re-exports', () => {
  assert.equal(aliasTarget(inventory.entryPoints[1]), 'switch');
  assert.equal(
    aliasTarget({
      exports: "export { AspectRatioComponent } from '../p2';",
    }),
    'p2',
  );
  assert.equal(aliasTarget(inventory.entryPoints[0]), null);
});

test('resolveEntryPointFamily prefers the catalog id, then declarations', () => {
  const context = buildContext();
  assert.equal(
    resolveEntryPointFamily(inventory.entryPoints[0], context),
    'button',
  );
  assert.equal(
    resolveEntryPointFamily(
      {
        name: '@ciag/orchestra/button',
        file: 'projects/orc-ds/button/index.ts',
      },
      context,
    ),
    'button',
  );
  assert.equal(
    resolveEntryPointFamily(
      { name: '@ciag/orchestra/nope', file: '' },
      context,
    ),
    null,
  );
});

test('resolveSymbolFamily maps re-exported classes to their family', () => {
  const context = buildContext();
  assert.equal(resolveSymbolFamily('SwitchComponent', context), 'switch');
  assert.equal(resolveSymbolFamily('UnknownComponent', context), null);
});

test('docsUrl only links ids the catalog documents', () => {
  const context = buildContext();
  assert.equal(
    docsUrl(context, 'button'),
    'https://orchestra.example/components/button',
  );
  assert.equal(docsUrl(context, ' undisclosed'), null);
});

test('renderAgentReference renders hand-written narrative and generated bodies', () => {
  const md = renderAgentReference({
    header: '# Header\n\nVersion {{VERSION}} prose.\n',
    footer: '## 6. Recipes\n\nContent.\n',
    notes: { button: 'Hand-written button guidance.\n' },
    context: buildContext(),
    entryPoints: inventory.entryPoints,
    version: '9.9.9',
  });

  assert.match(md, /^# Header/);
  assert.match(md, /Version 9\.9\.9 prose\./);
  assert.match(md, /## 4\. Complete package and entry-point map/);
  assert.match(md, /exposes 3 secondary entry points/);
  assert.match(
    md,
    /\| `button` \| `orc-button` \| \[interactive docs\]\(https:\/\/orchestra\.example\/components\/button\) \|/,
  );
  assert.match(md, /\| `toggle` \| alias of `switch` \(`ToggleComponent`\) \|/);
  assert.match(md, /## 5\. Component reference/);
  assert.match(md, /### Button — `@ciag\/orchestra\/button`/);
  assert.match(md, /Hand-written button guidance\./);
  assert.match(md, /- Inputs: `variant` \(ButtonVariant\) default `'primary'`/);
  assert.match(md, /- Outputs: `click` \(MouseEvent\)/);
  assert.match(md, /### Switch — `@ciag\/orchestra\/switch`/);
  assert.match(md, /## 6\. Recipes/);
  assert.match(md, /\n$/);
});

test('renderLlmsTxt links the canonical surfaces', () => {
  const txt = renderLlmsTxt({ canonicalBase: 'https://orchestra.example' });
  assert.match(txt, /\(https:\/\/orchestra\.example\/llms\.md\)/);
  assert.match(txt, /\(https:\/\/orchestra\.example\/docs\)/);
  assert.match(txt, /@import '@ciag\/orchestra\/styles\.css';/);
});
