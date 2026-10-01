# Integrated verification — 2026-09-23 source freeze 9

The first attempt stopped at the library test failure. Root then isolated the expected sanitizer warnings with the one-use diagnostics matcher and removed the conflicting nested spy. The retry reran the full sequence serially and passed. The docs server remained stopped throughout. No source files or existing audit documents were modified.

## Initial attempt

| Check                    | Command                                                                                                                                  |                                Result | Exit |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------: | ---: |
| Library tests, seed 4321 | ORC_JASMINE_SEED=4321 NG_BUILD_MAX_WORKERS=2 CI=true PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH npm run test:lib:ci | **1034 passed, 2 failed, 1036 total** |    1 |

Failures were the two new Editor sanitizer regressions: an unexpected console.warn during teardown, followed by <spyOn> : warn has already been spied upon at projects/orc-ds/editor-selection-contract.spec.ts:185. The initial full output is preserved in library-seed-4321.log and library-seed-4321.exit; no later checks were run in that attempt.

## Successful retry (retry1)

| Check                        | Command                                                                                                                                      |                                                              Result | Exit |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------: | ---: |
| Library tests, seed 4321     | ORC_JASMINE_SEED=4321 NG_BUILD_MAX_WORKERS=2 CI=true PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH npm run test:lib:ci     |                                                    1036/1036 passed |    0 |
| Library tests, seed 20260922 | ORC_JASMINE_SEED=20260922 NG_BUILD_MAX_WORKERS=2 CI=true PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH npm run test:lib:ci |                                                    1036/1036 passed |    0 |
| Library build                | npm run build:lib                                                                                                                            |                                Angular package built to dist/orc-ds |    0 |
| Compatibility                | npm run verify:compatibility                                                                                                                 |                            Angular 22 / PrimeNG 22 compatibility OK |    0 |
| Themes                       | npm run test:themes:ci                                                                                                                       |                                       Light 6/6 and dark 6/6 passed |    0 |
| SSR                          | npm run verify:ssr                                                                                                                           |                               147/147 inventory components rendered |    0 |
| Docs tests                   | npm run test:docs                                                                                                                            |                                                        52/52 passed |    0 |
| Docs build                   | npm run build:docs                                                                                                                           |                                      Application built to dist/docs |    0 |
| Template build               | npm run build:template                                                                                                                       |                                  Application built to dist/template |    0 |
| Current package              | npm run verify:package                                                                                                                       | 224 JS entries, aliases, declarations, and 5 Sass entries validated |    0 |
| Minimum-Angular package      | npm run verify:package:minimum                                                                                                               | 224 JS entries, aliases, declarations, and 5 Sass entries validated |    0 |
| Diff check                   | git diff --check                                                                                                                             |                                                No whitespace errors |    0 |

The passing library suites include the Editor extraction/import compatibility coverage, sanitized model-write and pasted-markup selection coverage, and the VirtualScroller re-export/box-geometry contract (including spacer/range metadata and rendered row geometry).

Retry output and individual exit records use the -retry1 suffix, for example library-seed-4321-retry1.log / .exit, and are preserved alongside the initial failed attempt.
