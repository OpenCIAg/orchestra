# Integrated verification — 2026-09-23 source freeze 11

Serial gate against the corrected current working tree. Before the gate, the docs claim copy was corrected in `projects/docs/src/app/pages/docs/docs.component.html`: the duplicate focus/contrast phrase was removed, and the universal 4.5:1 principle was reworded as a goal to verify per component and flow. The docs server was verified stopped before and after the gate. No source, audit, or prior verification files were modified during the retry sequence. Runtime used Node v24.16.0 via `/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin` and `NG_BUILD_MAX_WORKERS=2` where applicable.

## Initial attempt before copy correction

The first library seed ran against the pre-correction source and passed 1039/1039 (exit 0). Its complete output is preserved in `library-seed-4321.log` and `library-seed-4321.exit`. Because the docs source changed afterward, this result is informational only; the full gate was restarted from the beginning using `-retry1` evidence names.

## Successful retry after copy correction

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

All retry logs use the `-retry1` suffix and each has an individual `.exit` file. There were no failed commands and no no-op command retries in the successful sequence; the only restart was intentional after the requested docs copy correction.
