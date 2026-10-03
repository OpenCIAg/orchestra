// Gate manifest tests (ticket #19).
//
// The manifest must be derivable from library source alone: the tests feed
// small fixture sources shaped after the real library (signal inputs/outputs,
// @deprecated JSDoc tags, alias entry points, orc-p2-* hooks) and assert the
// enumerated removal surface — never a snapshot of the real library, which the
// generator's own --check mode keeps honest.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildGateManifest,
  renderMigrationGuide,
  GATE_VERSION,
} from './gate-manifest-lib.mjs';

// ── fixtures ───────────────────────────────────────────────────────────────

const WIDGET_SOURCE = `import { Component, input, output, model, computed } from '@angular/core';

/** A fixture widget. */
@Component({
  selector: 'orc-widget',
  standalone: true,
  template: '',
})
export class WidgetComponent {
  /** Visual size. Deprecated legacy values (removed at the 23.0.0
   * gate): \`small\` → \`sm\`, \`large\` → \`lg\`.
   */
  readonly size = input<string | undefined>(undefined);
  /** Canonical form of the public \`size\` input. */
  readonly resolvedSize = computed(() => normalizeSize(this.size()));

  /** @deprecated Virtual rendering is not implemented; use the fixed renderer. */
  readonly virtualScroll = input(false, { transform: booleanAttribute });

  readonly blur = output<FocusEvent>();
  readonly focus = output<FocusEvent>();
  /** @deprecated Resize events are not implemented. */
  readonly onResize = output<unknown>();
  readonly onFocus = output<FocusEvent>();
  readonly onBlur = output<FocusEvent>();

  readonly isOpen = model<boolean>(false);
  /** PrimeNG Dialog-compatible visibility model; isOpen remains supported. */
  readonly visible = model<boolean>(false);
}
`;

const TABLE_SOURCE = `import { Component, input } from '@angular/core';

@Component({
  selector: 'orc-table',
  standalone: true,
  template: '',
})
export class TableComponent<T = any> {
  readonly data = input<T[]>([]);
  readonly value = input<T[] | undefined>(undefined);
  readonly rowKey = input<string>('id');
  readonly dataKey = input<string | undefined>(undefined);
  readonly pageSizeOptions = input<number[]>([5, 10]);
  readonly rowsPerPageOptions = input<number[] | undefined>(undefined);
  readonly tableStyleClass = input('');
  readonly tableStyle = input<Record<string, string> | undefined>(undefined);
  readonly filterable = input(false, { transform: booleanAttribute });
  readonly scrollable = input(false, { transform: booleanAttribute });
  readonly globalFilterFields = input<string[]>([]);
}
`;

const PLAIN_SOURCE = `import { Component, input } from '@angular/core';

@Component({
  selector: 'orc-plain',
  standalone: true,
  template: '',
})
export class PlainComponent {
  readonly plainSize = input<string>('md');
  readonly onChange = output<{ value: unknown }>();
}
`;

const TYPES_SOURCE = `/** @deprecated Use PlainStatus instead. */
export type WidgetStatus = 'ok' | 'broken';

export type PlainStatus = 'ok';
`;

const LIBRARY_FILES = {
  'projects/orc-ds/widget/widget.component.ts': WIDGET_SOURCE,
  'projects/orc-ds/widget/widget.types.ts': TYPES_SOURCE,
  'projects/orc-ds/widget/index.ts':
    "export * from './widget.component';\nexport * from './widget.types';\n",
  'projects/orc-ds/widget/ng-package.json':
    '{ "lib": { "entryFile": "index.ts" } }',
  'projects/orc-ds/table/table.component.ts': TABLE_SOURCE,
  'projects/orc-ds/table/index.ts': "export * from './table.component';\n",
  'projects/orc-ds/table/ng-package.json':
    '{ "lib": { "entryFile": "index.ts" } }',
  'projects/orc-ds/plain/plain.component.ts': PLAIN_SOURCE,
  'projects/orc-ds/plain/index.ts': "export * from './plain.component';\n",
  'projects/orc-ds/plain/ng-package.json':
    '{ "lib": { "entryFile": "index.ts" } }',
  // An alias entry point with a renamed export and a star redirect.
  'projects/orc-ds/widget-alias/index.ts':
    "export { WidgetComponent as WidgetAlias } from '@ciag/orchestra/widget';\n",
  'projects/orc-ds/widget-alias/ng-package.json':
    '{ "lib": { "entryFile": "index.ts" } }',
  'projects/orc-ds/widget-star/index.ts':
    "export * from '@ciag/orchestra/widget';\n",
  'projects/orc-ds/widget-star/ng-package.json':
    '{ "lib": { "entryFile": "index.ts" } }',
  // The tier entry point: relative shim re-exports, not package aliases.
  'projects/orc-ds/p2/index.ts': "export * from './p2-widget-shim';\n",
  'projects/orc-ds/p2/ng-package.json':
    '{ "lib": { "entryFile": "index.ts" } }',
  'projects/orc-ds/p2/p2-widget-shim.ts':
    "export * from '@ciag/orchestra/widget';\n",
  // A tier class hook living in a template.
  'projects/orc-ds/p2/p2-widget-shim.ts.hook': '',
};

const TEMPLATE_HOOKS = {
  'projects/orc-ds/p2/widget.template.html':
    '<div class="orc-p2-widget orc-p2-widget--open"><span class="orc-p2-widget orc-p2-badge"></span></div>',
  'projects/orc-ds/widget/widget.component.ts': WIDGET_SOURCE.replace(
    "template: '',",
    'template: \'<span class="orc-p2-inline"></span>\',',
  ),
};

const DECLARED_DUAL_NAMES = [
  {
    component: 'TableComponent',
    name: 'value',
    kind: 'input',
    canonicalName: 'data',
    note: 'Table consolidation: the PrimeNG-era data alias.',
  },
  {
    component: 'TableComponent',
    name: 'dataKey',
    kind: 'input',
    canonicalName: 'rowKey',
    note: 'Table consolidation.',
  },
  {
    component: 'TableComponent',
    name: 'rowsPerPageOptions',
    kind: 'input',
    canonicalName: 'pageSizeOptions',
    note: 'Table consolidation.',
  },
  {
    component: 'TableComponent',
    name: 'globalFilterFields',
    kind: 'input',
    canonicalName: null,
    note: 'Filtering follows declared orc-column keys when unset.',
  },
  {
    component: 'TableComponent',
    name: 'tableStyle',
    kind: 'input',
    canonicalName: 'tableStyleClass',
    note: 'Table consolidation.',
  },
  {
    component: 'TableComponent',
    name: 'filterable',
    kind: 'input',
    canonicalName: null,
    note: 'No other name; removal-or-replacement is a gate decision.',
  },
  {
    component: 'WidgetComponent',
    name: 'visible',
    kind: 'model',
    canonicalName: 'isOpen',
    note: 'PrimeNG Dialog-compatible visibility model.',
  },
];

const PRODUCTION_USE = [
  { component: 'TableComponent', name: 'value' },
  { component: 'TableComponent', name: 'filterable' },
  { component: 'WidgetComponent', name: 'onBlur' },
];

function buildManifest({
  files = { ...LIBRARY_FILES, ...TEMPLATE_HOOKS },
  declaredDualNames = DECLARED_DUAL_NAMES,
  productionUse = PRODUCTION_USE,
} = {}) {
  return buildGateManifest({
    files,
    declaredDualNames,
    productionUse,
    productionScanRef: 'notes/06-consumer-scan.md (2026-10-01)',
  });
}

// ── deprecated surface ─────────────────────────────────────────────────────

test('every @deprecated member becomes exactly one manifest entry', () => {
  const { manifest, errors } = buildManifest();
  assert.deepEqual(errors, []);
  const deprecated = manifest.entries.filter(
    (entry) => entry.category === 'deprecated-member',
  );
  // virtualScroll, onResize, WidgetStatus — one each, deduplicated.
  assert.equal(deprecated.length, 3);
  const names = deprecated
    .map((entry) => `${entry.component ?? ''}.${entry.name}`)
    .sort();
  assert.deepEqual(names, [
    '.WidgetStatus',
    'WidgetComponent.onResize',
    'WidgetComponent.virtualScroll',
  ]);
});

test('deprecated entries carry kind, entry point, location, and JSDoc note', () => {
  const { manifest } = buildManifest();
  const virtual = manifest.entries.find(
    (entry) =>
      entry.category === 'deprecated-member' && entry.name === 'virtualScroll',
  );
  assert.equal(virtual.kind, 'input');
  assert.equal(virtual.component, 'WidgetComponent');
  assert.equal(virtual.selector, 'orc-widget');
  assert.equal(virtual.entryPoint, '@ciag/orchestra/widget');
  assert.equal(virtual.file, 'projects/orc-ds/widget/widget.component.ts');
  assert.equal(typeof virtual.line, 'number');
  assert.match(virtual.note, /Virtual rendering is not implemented/);
  assert.equal(virtual.productionUse, false);
});

test('a deprecated JSDoc that names a replacement records it; prose does not count', () => {
  const { manifest } = buildManifest();
  const virtual = manifest.entries.find(
    (entry) =>
      entry.name === 'virtualScroll' && entry.category === 'deprecated-member',
  );
  // "use the fixed renderer" is prose (article before the word), not a
  // member reference — no replacement is claimed.
  assert.equal(virtual.replacement, null);
  assert.equal(virtual.replacementTbd, true);
  const status = manifest.entries.find(
    (entry) =>
      entry.name === 'WidgetStatus' && entry.category === 'deprecated-member',
  );
  // "Use PlainStatus instead." names the canonical type.
  assert.equal(status.replacement, 'PlainStatus');
  assert.equal(status.replacementTbd, false);
});

// ── legacy size vocabulary ─────────────────────────────────────────────────

test('size inputs carrying the gate JSDoc produce legacy-value entries with the mapping', () => {
  const { manifest } = buildManifest();
  const sizes = manifest.entries.filter(
    (entry) => entry.category === 'legacy-size-value',
  );
  assert.equal(sizes.length, 1);
  assert.equal(sizes[0].component, 'WidgetComponent');
  assert.equal(sizes[0].name, 'size');
  assert.deepEqual(sizes[0].legacyValues, [
    { from: 'small', to: 'sm' },
    { from: 'large', to: 'lg' },
  ]);
  assert.equal(sizes[0].replacement, 'sm | md | lg');
});

test('inputs whose JSDoc does not declare the gate mapping are not size entries', () => {
  const { manifest } = buildManifest();
  const plainSize = manifest.entries.find(
    (entry) => entry.name === 'plainSize',
  );
  assert.equal(plainSize, undefined);
});

// ── functional dual names ──────────────────────────────────────────────────

test('declared dual names resolve against source and record their canonical', () => {
  const { manifest } = buildManifest();
  const value = manifest.entries.find(
    (entry) =>
      entry.category === 'functional-dual-name' && entry.name === 'value',
  );
  assert.equal(value.component, 'TableComponent');
  assert.equal(value.kind, 'input');
  assert.equal(value.canonical, 'data');
  assert.equal(value.replacementTbd, false);
  const filterable = manifest.entries.find(
    (entry) =>
      entry.category === 'functional-dual-name' && entry.name === 'filterable',
  );
  assert.equal(filterable.canonical, null);
  assert.equal(filterable.replacementTbd, true);
});

test('a declared dual name that no longer exists in source fails generation', () => {
  const { errors } = buildManifest({
    declaredDualNames: [
      {
        component: 'TableComponent',
        name: 'ghost',
        kind: 'input',
        canonicalName: null,
        note: '',
      },
    ],
    productionUse: [],
  });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /ghost/);
  assert.match(errors[0], /TableComponent/);
});

test('same-class blur/onBlur pairs are detected as dual outputs', () => {
  const { manifest } = buildManifest();
  const pair = manifest.entries.find(
    (entry) =>
      entry.category === 'functional-dual-name' &&
      entry.name === 'onBlur' &&
      entry.component === 'WidgetComponent',
  );
  assert.equal(pair.canonical, 'blur');
  const focus = manifest.entries.find(
    (entry) =>
      entry.category === 'functional-dual-name' &&
      entry.name === 'onFocus' &&
      entry.component === 'WidgetComponent',
  );
  assert.equal(focus.canonical, 'focus');
});

test('onXxx outputs without a same-class canonical are enumerated as PrimeNG-era outputs', () => {
  const { manifest } = buildManifest();
  const primeng = manifest.entries.filter(
    (entry) => entry.category === 'primeng-era-output',
  );
  assert.equal(primeng.length, 1);
  assert.equal(primeng[0].name, 'onChange');
  assert.equal(primeng[0].component, 'PlainComponent');
  assert.equal(primeng[0].replacementTbd, true);
});

test('a declared output moves out of the PrimeNG-era scan (exactly once)', () => {
  const { manifest, errors } = buildManifest({
    declaredDualNames: [
      {
        component: 'PlainComponent',
        kind: 'output',
        name: 'onChange',
        canonicalName: null,
        replacementText: 'the `value` model (`valueChange`)',
        note: 'Calendar-consolidation-style semantic replacement.',
      },
    ],
    productionUse: [],
  });
  assert.deepEqual(errors, []);
  assert.equal(
    manifest.entries.filter((entry) => entry.category === 'primeng-era-output')
      .length,
    0,
  );
  const declared = manifest.entries.find(
    (entry) =>
      entry.category === 'functional-dual-name' && entry.name === 'onChange',
  );
  assert.equal(declared.replacement, 'the `value` model (`valueChange`)');
  assert.equal(declared.replacementTbd, false);
});

test('replacementText records a confirmed semantic replacement without a member rename', () => {
  const { manifest } = buildManifest({
    declaredDualNames: [
      {
        component: 'WidgetComponent',
        kind: 'input',
        name: 'size',
        canonicalName: null,
        replacementText: "the native input's `readonly` attribute",
        note: 'Recorded by a consolidation changeset.',
      },
    ],
    productionUse: [],
  });
  const entry = manifest.entries.find(
    (entry) =>
      entry.category === 'functional-dual-name' && entry.name === 'size',
  );
  assert.equal(entry.replacement, "the native input's `readonly` attribute");
  assert.equal(entry.replacementTbd, false);
  assert.equal(entry.canonical, null);
});

// ── alias fan-out, tier entry point, tier artifacts ────────────────────────

test('alias entry points record their re-exports with renamed-class resolution', () => {
  const { manifest } = buildManifest();
  const aliases = manifest.entries.filter(
    (entry) => entry.category === 'alias-entry-point',
  );
  // One entry per exported symbol: widget-alias renames one, widget-star
  // expands the widget entry's whole surface (component + both types).
  assert.equal(aliases.length, 4);
  const renamed = aliases.find(
    (entry) => entry.entryPoint === '@ciag/orchestra/widget-alias',
  );
  assert.equal(renamed.name, 'WidgetAlias');
  assert.equal(renamed.canonical, 'WidgetComponent');
  assert.equal(renamed.canonicalEntryPoint, '@ciag/orchestra/widget');
  assert.equal(renamed.renamed, true);
  const star = aliases.find(
    (entry) =>
      entry.entryPoint === '@ciag/orchestra/widget-star' &&
      entry.name === 'WidgetComponent',
  );
  assert.equal(star.renamed, false);
  assert.equal(star.canonicalEntryPoint, '@ciag/orchestra/widget');
});

test('the p2 tier entry point is a single manifest entry', () => {
  const { manifest } = buildManifest();
  const tier = manifest.entries.filter(
    (entry) => entry.category === 'tier-entry-point',
  );
  assert.equal(tier.length, 1);
  assert.equal(tier[0].entryPoint, '@ciag/orchestra/p2');
});

test('orc-p2-* class hooks are enumerated once each with occurrence counts', () => {
  const { manifest } = buildManifest();
  const hooks = manifest.entries.filter(
    (entry) => entry.category === 'tier-artifact',
  );
  const names = hooks.map((hook) => hook.name);
  assert.deepEqual(names.sort(), [
    'orc-p2-badge',
    'orc-p2-inline',
    'orc-p2-widget',
    'orc-p2-widget--open',
  ]);
  const widget = hooks.find((hook) => hook.name === 'orc-p2-widget');
  assert.equal(widget.occurrenceCount, 2);
  assert.equal(widget.replacementTbd, true);
});

// ── production-use flags ───────────────────────────────────────────────────

test('production-used entries are flagged and unknown scan rows fail generation', () => {
  const { manifest } = buildManifest();
  const value = manifest.entries.find(
    (entry) =>
      entry.category === 'functional-dual-name' && entry.name === 'value',
  );
  assert.equal(value.productionUse, true);
  const onBlur = manifest.entries.find(
    (entry) =>
      entry.category === 'functional-dual-name' && entry.name === 'onBlur',
  );
  assert.equal(onBlur.productionUse, true);

  const missing = buildManifest({
    productionUse: [{ component: 'TableComponent', name: 'ghost' }],
  });
  assert.equal(missing.errors.length, 1);
  assert.match(missing.errors[0], /ghost/);
});

// ── invariants ─────────────────────────────────────────────────────────────

test('every entry appears exactly once (no category collisions)', () => {
  const { manifest } = buildManifest();
  const seen = new Set();
  for (const entry of manifest.entries) {
    const key = `${entry.category}::${entry.entryPoint}::${entry.component ?? ''}::${entry.name}`;
    assert.equal(seen.has(key), false, `duplicate entry: ${key}`);
    seen.add(key);
  }
});

test('manifest stats summarize the removal surface', () => {
  const { manifest } = buildManifest();
  assert.equal(manifest.stats.totalEntries, manifest.entries.length);
  assert.equal(manifest.stats.gate, GATE_VERSION);
  assert.equal(
    manifest.stats.replacementTbd,
    manifest.entries.filter((entry) => entry.replacementTbd).length,
  );
  assert.equal(
    manifest.stats.productionUsed,
    manifest.entries.filter((entry) => entry.productionUse).length,
  );
});

// ── migration guide rendering ──────────────────────────────────────────────

test('the migration guide renders per family with old→new rows and flags', () => {
  const guide = renderMigrationGuide(buildManifest().manifest);
  assert.match(guide, /# 23\.0\.0 gate migration guide/);
  assert.match(guide, /23\.0\.0 release \(Angular 23\)/);
  // dual names table
  assert.match(guide, /`\[value\]`.*`\[data\]`/);
  assert.match(guide, /`\(onBlur\)`.*`\(blur\)`/);
  // production-use marking cites the consumer scan
  assert.match(guide, /in production use/);
  assert.match(guide, /notes\/06-consumer-scan\.md/);
  // replacement-TBD list
  assert.match(guide, /replacement TBD/i);
  // alias + tier sections
  assert.match(guide, /widget-alias/);
  assert.match(guide, /orc-p2-widget/);
  assert.match(guide, /@ciag\/orchestra\/p2/);
  // size vocabulary
  assert.match(guide, /`small`.*`sm`/);
});

test('the guide is deterministic for identical input', () => {
  const first = renderMigrationGuide(buildManifest().manifest);
  const second = renderMigrationGuide(buildManifest().manifest);
  assert.equal(first, second);
});
