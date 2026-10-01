# Integrated source-freeze-20 gate

Date: 2026-09-23

Runtime: Node v24.16.0 (`/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin`), `NG_BUILD_MAX_WORKERS=2` for build/test commands, `CI=true` for both seeded library suites.

Execution was serial. The docs server was confirmed stopped before verification and remained stopped afterward. A CSS-only Tooltip max-width refinement landed after the seeded library runs had started; the library build and all downstream affected checks were run afterward against that final source state. No source or audit index documents were edited during verification. No retries were needed.

| Check                   | Command                                                                        | Result                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Library seed 4321       | `ORC_JASMINE_SEED=4321 NG_BUILD_MAX_WORKERS=2 CI=true npm run test:lib:ci`     | 1070/1070 success; exit 0                                                                   |
| Library seed 20260922   | `ORC_JASMINE_SEED=20260922 NG_BUILD_MAX_WORKERS=2 CI=true npm run test:lib:ci` | 1070/1070 success; exit 0                                                                   |
| Library build           | `NG_BUILD_MAX_WORKERS=2 npm run build:lib`                                     | Built Angular Package after final Tooltip refinement; exit 0                                |
| Compatibility           | `npm run verify:compatibility`                                                 | Compatibility OK: main / Angular 22 / PrimeNG 22.0.0 / @ciag/orchestra 22.1.0; exit 0       |
| Themes                  | `npm run test:themes:ci`                                                       | Light 6/6 and dark 6/6 success; exit 0                                                      |
| SSR                     | `npm run verify:ssr`                                                           | 147/147 inventory components rendered with Angular 22.1.2; exit 0                           |
| Docs tests              | `NG_BUILD_MAX_WORKERS=2 npm run test:docs`                                     | 54/54 success; exit 0                                                                       |
| Docs build              | `NG_BUILD_MAX_WORKERS=2 npm run build:docs`                                    | Application bundle generated after final Tooltip refinement; exit 0                         |
| Template build          | `NG_BUILD_MAX_WORKERS=2 npm run build:template`                                | Application bundle generated; exit 0                                                        |
| Current package         | `npm run verify:package`                                                       | 224 JavaScript entry points, public declarations, and 5 Sass entry points validated; exit 0 |
| Minimum Angular package | `npm run verify:package:minimum`                                               | 224 JavaScript entry points, public declarations, and 5 Sass entry points validated; exit 0 |
| Diff check              | `git diff --check`                                                             | Clean; exit 0                                                                               |

All individual exit records in this directory are `0`. Final docs-server state: `STOPPED`. No visual replay was performed, per scope.
