// ESLint flat config for the Orchestra workspace.
//
// Day-one policy (tooling baseline, overhaul ticket #5):
// - real hazards and compile-visible conventions are ERRORS,
// - stylistic rules are OFF (formatting is Prettier's job),
// - rules whose fixes would be repo-wide campaigns (public API renames,
//   typing, template modernization, a11y rework) are muted at the bottom
//   with a TODO referencing the overhaul, so they can be re-enabled
//   ticket by ticket,
// - generated files are not linted (icon catalog, generated lifecycle spec).
//
// Shape follows the config that `ng add angular-eslint` generates for v22.
import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default defineConfig([
  globalIgnores([
    'dist/**',
    'out-tsc/**',
    'coverage/**',
    'test-results/**',
    'playwright-report/**',
    '.angular/**',
    // Standalone vendored demo workspace (own lockfile, Angular 19).
    'orchestra-demo/**',
    // Markdown documentation and audit ledgers are not lint targets.
    'docs/**',
    // Generated files — do not hand-edit or lint (regenerate instead):
    // icon catalog + manifest (tools/material-symbols/generate.mjs),
    // lifecycle spec (tools/quality/generate-lifecycle-tests.mjs),
    // alias-parity spec (npm run generate:alias-parity),
    // docs component-api modules (npm run docs:generate-api).
    // NOTE: projects/docs/src/app/catalog/*.catalog.ts is HAND-WRITTEN and
    // stays linted.
    'projects/orc-ds/icons/icon-catalog.ts',
    'projects/orc-ds/icons/manifest.json',
    'projects/orc-ds/all-components-lifecycle.spec.ts',
    'projects/orc-ds/alias-parity.generated.spec.ts',
    'projects/docs/src/app/generated/**',
  ]),

  // Plain JS/MJS: tooling scripts, Playwright specs, karma + eslint configs.
  {
    files: ['**/*.mjs', 'karma.conf.js'],
    extends: [eslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      // Tools and specs log to stdout/stderr by design.
      'no-console': 'off',
    },
  },

  // Browser interaction specs: Playwright drives from Node, but callbacks
  // passed to page.evaluate() run against browser globals (DragEvent, ...).
  {
    files: ['tests/browser/**/*.mjs'],
    extends: [eslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      'no-console': 'off',
    },
  },

  // TypeScript tooling helpers (no tsconfig project of their own).
  {
    files: ['tools/**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      prettier,
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // Angular application sources (docs, template): prefix "app".
  {
    files: ['projects/docs/**/*.ts', 'projects/template/**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      angular.configs.tsRecommended,
      prettier,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // "doc" is the deliberate prefix for the lazy example components under
      // pages/components/component-doc/examples/ (data-driven renderer,
      // overhaul ticket #17); they are routed by import, never matched by
      // tag name in external templates.
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: ['app', 'doc'], style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: ['app', 'doc'], style: 'kebab-case' },
      ],
    },
  },

  // Library sources (orc-ds): prefix "orc".
  {
    files: ['projects/orc-ds/**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      angular.configs.tsRecommended,
      prettier,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'orc', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'orc', style: 'kebab-case' },
      ],
    },
  },

  // Angular templates (external and inline via the processor above).
  {
    files: ['projects/**/*.html'],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
      prettier,
    ],
  },

  // A `let { a, b } = ...` where only some bindings are reassigned stays
  // `let`; firing on the destructuring as a whole would force awkward splits.
  {
    files: ['**/*.{js,mjs,ts}'],
    rules: {
      'prefer-const': ['error', { destructuring: 'all' }],
    },
  },

  // ------------------------------------------------------------------
  // Day-one mutes: rules that fire today only on violations whose fixes
  // are coordinated campaigns, not local mechanical edits. Each entry
  // lists the violation count at seed time (2026-10, measured on the
  // merged integration base with generated files ignored) so re-enabling
  // can be tracked. NOTE: a rule can only be re-enabled from the project
  // blocks above — a standalone block cannot resolve the plugin.
  // TODO(orchestra-overhaul #2): re-enable rule by rule.
  // ------------------------------------------------------------------
  {
    files: ['**/*.ts'],
    rules: {
      // 189 sites. Removing `any` across lib and docs is a typing campaign.
      '@typescript-eslint/no-explicit-any': 'off',
      // 286 outputs named `on*`. Renaming is a public API break.
      '@angular-eslint/no-output-on-prefix': 'off',
      // 19 + 3 sites. Renaming inputs/outputs is a public API break.
      '@angular-eslint/no-input-rename': 'off',
      '@angular-eslint/no-output-rename': 'off',
      // 18 outputs shadowing native event names. Renaming is an API break.
      '@angular-eslint/no-output-native': 'off',
    },
  },
  {
    files: ['**/*.html'],
    rules: {
      // 157 `*ngIf`/`*ngFor` sites. Migrating to built-in control flow is a
      // template modernization sweep with subtle alias/empty-check semantics.
      '@angular-eslint/template/prefer-control-flow': 'off',
      // 214 a11y findings (label 126, focus 34, click/keys 30, autofocus 16,
      // aria 8). Fixes change interaction behavior; runtime a11y is already
      // gated by the axe-based jasmine suites until this campaign happens.
      '@angular-eslint/template/label-has-associated-control': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/no-autofocus': 'off',
      '@angular-eslint/template/role-has-required-aria': 'off',
    },
  },
]);
