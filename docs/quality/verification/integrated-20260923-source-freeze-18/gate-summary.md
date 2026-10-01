# Integrated source-freeze-18 gate

Date: 2026-09-23
Workspace: `/Users/matheuscastro/Workspaces/orc_ds`
Runtime: Node v24.16.0 (`/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin` prepended to `PATH`)
Angular worker limit: `NG_BUILD_MAX_WORKERS=2`
Library tests: `CI=true`
Execution: serial, in the requested order

The docs server was confirmed stopped before verification. It was started only for the post-gate browser replay, then stopped and confirmed closed afterward. No source or audit-document edits were made during verification. There were no initial failures and no retries; each command has its primary `.log` and `.exit` evidence file.

| Check                                           |                                                                   Result | Exit |
| ----------------------------------------------- | -----------------------------------------------------------------------: | ---: |
| `ORC_JASMINE_SEED=4321 npm run test:lib:ci`     |                                                        1068/1068 success |    0 |
| `ORC_JASMINE_SEED=20260922 npm run test:lib:ci` |                                                        1068/1068 success |    0 |
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

## Post-gate Modal replay

Against the fresh docs build at `/components/modal`, the “Obrigatório (Sem fechar ao clicar fora)” demo stayed open after `Escape` and retained focus on “Salvar e Fechar”. This confirms the added `[closeOnEscape]="false"` binding matches the documented contract. The mandatory modal was then closed through its explicit action. The preview server was stopped afterward and port 4301 was closed.

Full command output and individual exit codes are stored beside this summary.
