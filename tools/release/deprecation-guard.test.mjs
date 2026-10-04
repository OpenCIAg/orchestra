// Deprecation guard tests (ticket #19).
//
// The guard keeps the 23.0.0 gate manifest honest: a commit that grows the
// deprecated surface or the alias fan-out must arrive with a changeset that
// mentions the symbol. Tests run offline on fixture file maps shaped after
// the real library sources.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  aliasSignature,
  deprecationGuard,
  deprecationSignature,
} from './deprecation-guard-lib.mjs';

const WIDGET_V1 = `import { Component, input } from '@angular/core';

@Component({
  selector: 'orc-widget',
  standalone: true,
  template: '',
})
export class WidgetComponent {
  readonly label = input('');
}
`;

const WIDGET_V2_NEW_DEPRECATION = `import { Component, input } from '@angular/core';

@Component({
  selector: 'orc-widget',
  standalone: true,
  template: '',
})
export class WidgetComponent {
  readonly label = input('');
  /** @deprecated Compatibility input only; rendering is not implemented. */
  readonly legacyMode = input(false, { transform: booleanAttribute });
}
`;

const ALIAS_V1 = `export { WidgetComponent as WidgetAlias } from '@ciag/orchestra/widget';
`;

const ALIAS_V2_NEW_EXPORT = `export { WidgetComponent as WidgetAlias } from '@ciag/orchestra/widget';
export { WidgetService as WidgetCompat } from '@ciag/orchestra/widget';
`;

const CHANGES_MENTIONING = [
  {
    name: 'widen-widget.md',
    content:
      "---\n'@ciag/orchestra': minor\n---\n\nDeprecate `legacyMode` on the widget; removed at the 23.0.0 gate.\n",
  },
];

test('deprecationSignature keys every @deprecated declaration by location and name', () => {
  const signature = deprecationSignature({
    'projects/orc-ds/widget/widget.component.ts': WIDGET_V2_NEW_DEPRECATION,
  });
  assert.deepEqual(
    [...signature],
    ['projects/orc-ds/widget/widget.component.ts::WidgetComponent::legacyMode'],
  );
});

test('aliasSignature keys every alias export by directory and export name', () => {
  const signature = aliasSignature({
    'projects/orc-ds/widget-alias/index.ts': ALIAS_V1,
    'projects/orc-ds/widget-alias/ng-package.json': '{}',
  });
  assert.deepEqual([...signature], ['widget-alias::WidgetAlias']);
});

test('a new @deprecated member without a mentioning changeset violates the guard', () => {
  const report = deprecationGuard({
    baselineFiles: {
      'projects/orc-ds/widget/widget.component.ts': WIDGET_V1,
    },
    currentFiles: {
      'projects/orc-ds/widget/widget.component.ts': WIDGET_V2_NEW_DEPRECATION,
    },
    changesets: [],
  });
  assert.equal(report.violations.length, 1);
  assert.equal(report.violations[0].kind, 'deprecation');
  assert.match(report.violations[0].symbol, /legacyMode/);
  assert.match(report.violations[0].hint, /changeset mentioning `legacyMode`/);
});

test('a new @deprecated member with a mentioning changeset passes', () => {
  const report = deprecationGuard({
    baselineFiles: {
      'projects/orc-ds/widget/widget.component.ts': WIDGET_V1,
    },
    currentFiles: {
      'projects/orc-ds/widget/widget.component.ts': WIDGET_V2_NEW_DEPRECATION,
    },
    changesets: CHANGES_MENTIONING,
  });
  assert.deepEqual(report.violations, []);
});

test('a new alias export without a mentioning changeset violates the guard', () => {
  const report = deprecationGuard({
    baselineFiles: {
      'projects/orc-ds/widget-alias/index.ts': ALIAS_V1,
      'projects/orc-ds/widget-alias/ng-package.json': '{}',
    },
    currentFiles: {
      'projects/orc-ds/widget-alias/index.ts': ALIAS_V2_NEW_EXPORT,
      'projects/orc-ds/widget-alias/ng-package.json': '{}',
    },
    changesets: [],
  });
  assert.equal(report.violations.length, 1);
  assert.equal(report.violations[0].kind, 'alias');
  assert.match(report.violations[0].symbol, /WidgetCompat/);
});

test('a new alias export with a changeset naming the symbol passes', () => {
  const report = deprecationGuard({
    baselineFiles: {
      'projects/orc-ds/widget-alias/index.ts': ALIAS_V1,
      'projects/orc-ds/widget-alias/ng-package.json': '{}',
    },
    currentFiles: {
      'projects/orc-ds/widget-alias/index.ts': ALIAS_V2_NEW_EXPORT,
      'projects/orc-ds/widget-alias/ng-package.json': '{}',
    },
    changesets: [
      {
        name: 'alias-export.md',
        content:
          'Re-export `WidgetCompat` from the widget alias entry point.\n',
      },
    ],
  });
  assert.deepEqual(report.violations, []);
});

test('removing a deprecation or alias export never violates the guard', () => {
  const report = deprecationGuard({
    baselineFiles: {
      'projects/orc-ds/widget/widget.component.ts': WIDGET_V2_NEW_DEPRECATION,
      'projects/orc-ds/widget-alias/index.ts': ALIAS_V1,
      'projects/orc-ds/widget-alias/ng-package.json': '{}',
    },
    currentFiles: {
      'projects/orc-ds/widget/widget.component.ts': WIDGET_V1,
      'projects/orc-ds/widget-alias/index.ts': '',
      'projects/orc-ds/widget-alias/ng-package.json': '{}',
    },
    changesets: [],
  });
  assert.deepEqual(report.violations, []);
});

test('moving a deprecation between files of one commit is a real growth and is flagged', () => {
  // A member that disappears from one file and appears in another in the
  // same commit grew the total surface; the guard treats it as new.
  const report = deprecationGuard({
    baselineFiles: {
      'projects/orc-ds/widget/widget.component.ts': WIDGET_V2_NEW_DEPRECATION,
    },
    currentFiles: {
      'projects/orc-ds/widget/widget-moved.component.ts':
        WIDGET_V2_NEW_DEPRECATION,
    },
    changesets: [],
  });
  assert.equal(report.violations.length, 1);
});

test('an unchanged surface with zero changesets passes', () => {
  const report = deprecationGuard({
    baselineFiles: {
      'projects/orc-ds/widget/widget.component.ts': WIDGET_V2_NEW_DEPRECATION,
      'projects/orc-ds/widget-alias/index.ts': ALIAS_V1,
      'projects/orc-ds/widget-alias/ng-package.json': '{}',
    },
    currentFiles: {
      'projects/orc-ds/widget/widget.component.ts': WIDGET_V2_NEW_DEPRECATION,
      'projects/orc-ds/widget-alias/index.ts': ALIAS_V1,
      'projects/orc-ds/widget-alias/ng-package.json': '{}',
    },
    changesets: [],
  });
  assert.deepEqual(report.violations, []);
});
