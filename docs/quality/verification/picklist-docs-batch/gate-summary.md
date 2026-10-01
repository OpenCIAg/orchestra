# PickList docs verification

## Docs browser tests

Command:

```text
PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH NG_BUILD_MAX_WORKERS=2 ORC_KARMA_PORT=9878 npm run test:docs -- --include='projects/docs/src/app/app-routing.spec.ts' --include='projects/docs/src/app/pages/components/pick-list/pick-list-page.component.spec.ts'
```

Result: **34/34 SUCCESS**. This covers route and catalog discoverability across the docs router plus the PickList page's named panes, disabled row, independent filtering, selected transfer, all enabled-item transfer, controlled source/target state, and disabled interaction state. Full output: [docs-tests.log](docs-tests.log).

## Production docs build

Command:

```text
PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH NG_BUILD_MAX_WORKERS=2 npm run build:docs
```

Result: **SUCCESS**. Output was generated at `dist/docs`. Full output: [docs-build.log](docs-build.log).

The page uses the sealed library package available to the docs app at that build. Live viewport and interaction observations, their viewport limitation, and the discovered keyboard-focus defect are recorded in [browser-qa.md](browser-qa.md). The corrected source tests pass; browser replay against the rebuilt package remains pending.

## Diff hygiene recheck

The shared docs files retain their pre-existing formatting and semantic catalog changes. The bounded PickList additions are 8 route lines and 14 catalog lines; the catalog also retains the pre-existing Date Picker, Toast, and Spinner naming/description updates (3 changed lines). No formatter-only churn remains in either shared file.
