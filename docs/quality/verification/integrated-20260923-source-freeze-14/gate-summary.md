# Integrated source-freeze-14 gate

Date: 2026-09-23
Workspace: `/Users/matheuscastro/Workspaces/orc_ds`
Runtime: Node v24.16.0 (`/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin` prepended to `PATH`)
Angular worker limit: `NG_BUILD_MAX_WORKERS=2`
Library tests: `CI=true`
Execution: serial, in the requested order

The docs server was confirmed stopped before the gate and remained stopped after the gate. No source or audit-document edits were made during this verification. There were no initial failures and no retries; each command has its primary `.log` and `.exit` evidence file.

| Check                                           |                                                                   Result | Exit |
| ----------------------------------------------- | -----------------------------------------------------------------------: | ---: |
| `ORC_JASMINE_SEED=4321 npm run test:lib:ci`     |                                                        1047/1047 success |    0 |
| `ORC_JASMINE_SEED=20260922 npm run test:lib:ci` |                                                        1047/1047 success |    0 |
| `npm run build:lib`                             |                                    Angular package built (`dist/orc-ds`) |    0 |
| `npm run verify:compatibility`                  |         main / Angular 22 / PrimeNG 22.0.0 / orchestra 22.1.0 compatible |    0 |
| `npm run test:themes:ci`                        |                                              light 6/6, dark 6/6 success |    0 |
| `npm run verify:ssr`                            |                                    147/147 inventory components rendered |    0 |
| `npm run test:docs`                             |                                                            54/54 success |    0 |
| `npm run build:docs`                            |                                          docs bundle built (`dist/docs`) |    0 |
| `npm run build:template`                        |                                  template bundle built (`dist/template`) |    0 |
| `npm run verify:package`                        | 224 JavaScript entry points, declarations, 5 Sass entry points validated |    0 |
| `npm run verify:package:minimum`                | 224 JavaScript entry points, declarations, 5 Sass entry points validated |    0 |
| `git diff --check`                              |                                                                    clean |    0 |

The full command output and individual exit code are stored beside this summary in this directory.
