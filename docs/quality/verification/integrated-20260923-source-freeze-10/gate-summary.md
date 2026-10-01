# Integrated verification — 2026-09-23 source freeze 10

Serial gate against the combined working tree, including Editor documentation/ARIA/beta metadata and Progress fixes. The docs server was verified stopped before the run and remained stopped. No source files or prior verification evidence were modified. Runtime used Node v24.16.0 via `/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin` and `NG_BUILD_MAX_WORKERS=2` where applicable.

## Results

| Check                        | Exact command                                                                                                                                  |                                                                      Result | Exit |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------: | ---: |
| Library tests, seed 4321     | `ORC_JASMINE_SEED=4321 NG_BUILD_MAX_WORKERS=2 CI=true PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH npm run test:lib:ci`     |                                                            1039/1039 passed |    0 |
| Library tests, seed 20260922 | `ORC_JASMINE_SEED=20260922 NG_BUILD_MAX_WORKERS=2 CI=true PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH npm run test:lib:ci` |                                                            1039/1039 passed |    0 |
| Library build                | `PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH NG_BUILD_MAX_WORKERS=2 npm run build:lib`                                     |                                      Angular package built to `dist/orc-ds` |    0 |
| Compatibility                | `PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH npm run verify:compatibility`                                                 |                                Angular 22 / PrimeNG 22.0.0 compatibility OK |    0 |
| Themes                       | `PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH npm run test:themes:ci`                                                       |                                               Light 6/6 and dark 6/6 passed |    0 |
| SSR                          | `PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH npm run verify:ssr`                                                           |                                       147/147 inventory components rendered |    0 |
| Docs tests                   | `PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH NG_BUILD_MAX_WORKERS=2 npm run test:docs`                                     |                                                                54/54 passed |    0 |
| Docs build                   | `PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH NG_BUILD_MAX_WORKERS=2 npm run build:docs`                                    |                                            Application built to `dist/docs` |    0 |
| Template build               | `PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH NG_BUILD_MAX_WORKERS=2 npm run build:template`                                |                                        Application built to `dist/template` |    0 |
| Current package              | `PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH npm run verify:package`                                                       | 224 JavaScript entries, declarations, aliases, and 5 Sass entries validated |    0 |
| Minimum-Angular package      | `PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH npm run verify:package:minimum`                                               | 224 JavaScript entries, declarations, aliases, and 5 Sass entries validated |    0 |
| Diff check                   | `git diff --check`                                                                                                                             |                                                        No whitespace errors |    0 |

All docs tests used Node v24.16.0, as recorded in the command table.

## Evidence

Each command has a complete `.log` and individual `.exit` file in this directory. There were no command retries. The first seed wrapper initially failed to persist its exit file because zsh treats `status` as read-only after the test completed; its log ended with `TOTAL: 1039 SUCCESS`, and the observed zero exit was recorded in `library-seed-4321.exit`. The second seed and all later commands used a safe exit variable.
