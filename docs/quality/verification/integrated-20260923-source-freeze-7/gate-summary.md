# Integrated verification — 2026-09-23 source freeze 7

All checks ran serially from `/Users/matheuscastro/Workspaces/orc_ds` with Node v24.16.0 and `NG_BUILD_MAX_WORKERS=2`. The docs server was stopped before verification and remains stopped. No source files or other audit documents were modified.

| Check                        | Command                                         |                                                              Result | Exit |
| ---------------------------- | ----------------------------------------------- | ------------------------------------------------------------------: | ---: |
| Library tests, seed 4321     | `ORC_JASMINE_SEED=4321 npm run test:lib:ci`     |                                                    1022/1022 passed |    0 |
| Library tests, seed 20260922 | `ORC_JASMINE_SEED=20260922 npm run test:lib:ci` |                                                    1022/1022 passed |    0 |
| Library build                | `npm run build:lib`                             |                              Angular package built to `dist/orc-ds` |    0 |
| Compatibility                | `npm run verify:compatibility`                  |                            Angular 22 / PrimeNG 22 compatibility OK |    0 |
| Themes                       | `npm run test:themes:ci`                        |                                       Light 6/6 and dark 6/6 passed |    0 |
| SSR                          | `npm run verify:ssr`                            |                               147/147 inventory components rendered |    0 |
| Docs tests                   | `npm run test:docs`                             |                                                        52/52 passed |    0 |
| Docs build                   | `npm run build:docs`                            |                                    Application built to `dist/docs` |    0 |
| Template build               | `npm run build:template`                        |                                Application built to `dist/template` |    0 |
| Current package              | `npm run verify:package`                        | 224 JS entries, aliases, declarations, and 5 Sass entries validated |    0 |
| Minimum-Angular package      | `npm run verify:package:minimum`                | 224 JS entries, aliases, declarations, and 5 Sass entries validated |    0 |
| Diff check                   | `git diff --check`                              |                                                No whitespace errors |    0 |

Complete stdout/stderr and individual exit-code records are saved beside this summary:

- `library-seed-4321.log` / `.exit`
- `library-seed-20260922.log` / `.exit`
- `build-lib.log` / `.exit`
- `compatibility.log` / `.exit`
- `themes.log` / `.exit`
- `ssr.log` / `.exit`
- `docs-tests.log` / `.exit`
- `build-docs.log` / `.exit`
- `build-template.log` / `.exit`
- `package-current.log` / `.exit`
- `package-minimum.log` / `.exit`
- `diff-check.log` / `.exit`
