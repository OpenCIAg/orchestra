import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CATALOG_ID_FAMILY_ALIASES,
  buildFamilyIndex,
  deriveFamilyId,
  evaluateCoverage,
} from './docs-coverage-lib.mjs';

test('deriveFamilyId uses the canonical directory for library components', () => {
  assert.equal(
    deriveFamilyId({
      name: 'ButtonComponent',
      file: 'projects/orc-ds/button/button.component.ts',
      selector: 'orc-button',
    }),
    'button',
  );
  // Sub-components join their family directory.
  assert.equal(
    deriveFamilyId({
      name: 'CardHeaderComponent',
      file: 'projects/orc-ds/card/card-header.component.ts',
      selector: 'orc-card-header',
    }),
    'card',
  );
});

test('deriveFamilyId resolves nested sub-component directories to the family root', () => {
  assert.equal(
    deriveFamilyId({
      name: 'FileItemComponent',
      file: 'projects/orc-ds/file-uploader/file-item/file-item.component.ts',
      selector: 'orc-file-item',
    }),
    'file-uploader',
  );
});

test('deriveFamilyId joins sub-component selectors to their documented family', () => {
  assert.equal(
    deriveFamilyId({
      name: 'InputGroupAddonComponent',
      file: 'projects/orc-ds/p2/p2-input-gap-components.ts',
      selector: 'orc-input-group-addon',
    }),
    'input-group',
  );
});

test('deriveFamilyId uses the first selector for p2 monolith components', () => {
  assert.equal(
    deriveFamilyId({
      name: 'KnobComponent',
      file: 'projects/orc-ds/p2/p2-org-knob-components.ts',
      selector: 'orc-knob, orc-dial',
    }),
    'knob',
  );
});

test('deriveFamilyId applies documented overrides for shared directories', () => {
  // The overlay-panel directory hosts two distinct public families.
  assert.equal(
    deriveFamilyId({
      name: 'PopoverComponent',
      file: 'projects/orc-ds/overlay-panel/overlay-panel.component.ts',
      selector: 'orc-popover',
    }),
    'popover',
  );
  assert.equal(
    deriveFamilyId({
      name: 'OverlayPanelComponent',
      file: 'projects/orc-ds/overlay-panel/overlay-panel.component.ts',
      selector: 'orc-overlay-panel',
    }),
    'overlay-panel',
  );
});

test('buildFamilyIndex groups every inventoried declaration by family', () => {
  const index = buildFamilyIndex([
    {
      name: 'ButtonComponent',
      file: 'projects/orc-ds/button/button.component.ts',
      selector: 'orc-button',
    },
    {
      name: 'IconButtonComponent',
      file: 'projects/orc-ds/button/icon-button.component.ts',
      selector: 'orc-icon-button',
    },
    {
      name: 'KnobComponent',
      file: 'projects/orc-ds/p2/p2-org-knob-components.ts',
      selector: 'orc-knob',
    },
  ]);
  assert.deepEqual([...index.keys()].sort(), ['button', 'knob']);
  assert.deepEqual(index.get('button').sort(), [
    'ButtonComponent',
    'IconButtonComponent',
  ]);
});

test('evaluateCoverage reports families without catalog entries', () => {
  const result = evaluateCoverage({
    declarations: [
      {
        name: 'ButtonComponent',
        file: 'projects/orc-ds/button/button.component.ts',
        selector: 'orc-button',
      },
      {
        name: 'KnobComponent',
        file: 'projects/orc-ds/p2/p2-org-knob-components.ts',
        selector: 'orc-knob',
      },
    ],
    catalogEntries: [{ id: 'button', route: '/components/button' }],
    routePaths: ['components/button', 'components/:componentId'],
  });
  assert.deepEqual(result.missingCatalog, ['knob']);
  assert.equal(result.coveredComponents, 1);
  assert.equal(result.totalComponents, 2);
});

test('evaluateCoverage accepts catalog ids that alias a documented family', () => {
  const declarations = [
    {
      name: 'FileUploaderComponent',
      file: 'projects/orc-ds/file-uploader/file-uploader.component.ts',
      selector: 'orc-file-uploader, orc-file-upload',
    },
  ];
  const result = evaluateCoverage({
    declarations,
    catalogEntries: [
      { id: 'file-uploader', route: '/components/file-uploader' },
      { id: 'file-upload', route: '/components/file-upload' },
    ],
    routePaths: [
      'components/file-uploader',
      'components/file-upload',
      'components/:componentId',
    ],
  });
  assert.ok(CATALOG_ID_FAMILY_ALIASES['file-upload'] === 'file-uploader');
  assert.deepEqual(result.missingCatalog, []);
  assert.equal(result.coveredComponents, 1);
});

test('evaluateCoverage reports duplicate catalog ids and unmatched ids', () => {
  const result = evaluateCoverage({
    declarations: [
      {
        name: 'ButtonComponent',
        file: 'projects/orc-ds/button/button.component.ts',
        selector: 'orc-button',
      },
    ],
    catalogEntries: [
      { id: 'button', route: '/components/button' },
      { id: 'button', route: '/components/button' },
      { id: 'ghost-widget', route: '/components/ghost-widget' },
    ],
    routePaths: ['components/:componentId'],
  });
  assert.deepEqual(result.duplicateCatalogIds, ['button']);
  assert.deepEqual(result.catalogIdsWithoutFamily, ['ghost-widget']);
});

test('evaluateCoverage resolves bespoke routes, the generic fallback, and query strings', () => {
  const declarations = [
    {
      name: 'OtpInputComponent',
      file: 'projects/orc-ds/otp-input/otp-input.component.ts',
      selector: 'orc-otp-input',
    },
    {
      name: 'StepperComponent',
      file: 'projects/orc-ds/stepper/stepper.component.ts',
      selector: 'orc-stepper',
    },
  ];
  const ok = evaluateCoverage({
    declarations,
    catalogEntries: [
      { id: 'otp-input', route: '/components/otp-input' },
      { id: 'stepper', route: '/components/progress?tab=stepper' },
    ],
    routePaths: [
      'components/otp-input',
      'components/progress',
      'components/:componentId',
    ],
  });
  assert.deepEqual(ok.unresolvedRoutes, []);

  const broken = evaluateCoverage({
    declarations,
    catalogEntries: [{ id: 'otp-input', route: '/components/otp-input' }],
    routePaths: ['components/progress'],
  });
  assert.deepEqual(broken.unresolvedRoutes, [
    { id: 'otp-input', route: '/components/otp-input' },
  ]);
});

test('evaluateCoverage reports zero problems for a fully covered fixture', () => {
  const result = evaluateCoverage({
    declarations: [
      {
        name: 'ButtonComponent',
        file: 'projects/orc-ds/button/button.component.ts',
        selector: 'orc-button',
      },
      {
        name: 'KnobComponent',
        file: 'projects/orc-ds/p2/p2-org-knob-components.ts',
        selector: 'orc-knob',
      },
    ],
    catalogEntries: [
      { id: 'button', route: '/components/button' },
      { id: 'knob', route: '/components/knob' },
    ],
    routePaths: ['components/button', 'components/:componentId'],
  });
  assert.deepEqual(result.missingCatalog, []);
  assert.deepEqual(result.duplicateCatalogIds, []);
  assert.deepEqual(result.catalogIdsWithoutFamily, []);
  assert.deepEqual(result.unresolvedRoutes, []);
  assert.equal(result.coveredComponents, 2);
  assert.equal(result.totalComponents, 2);
});
