# Integrated source-freeze-21 gate

Date: 2026-09-23

Runtime: Node v24.16.0, `NG_BUILD_MAX_WORKERS=2` for build/test commands, `CI=true` for both seeded library suites.

Execution was serial with no retries. The docs server was stopped throughout the integrated gate. After the library, SSR, package, and template checks completed, a type-only docs import was aligned with the dedicated `cascade-select` entry; the docs suite and production docs build were rerun against that final docs source. The CascadeSelect route was opened in the in-app browser for a desktop smoke review, then the server was stopped. Audit index documents were updated after verification.

| Check                   | Command                                                                        | Result                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Library seed 4321       | `ORC_JASMINE_SEED=4321 NG_BUILD_MAX_WORKERS=2 CI=true npm run test:lib:ci`     | 1070/1070 success; exit 0 ([log](library-seed-4321.log))                                                                    |
| Library seed 20260922   | `ORC_JASMINE_SEED=20260922 NG_BUILD_MAX_WORKERS=2 CI=true npm run test:lib:ci` | 1070/1070 success; exit 0 ([log](library-seed-20260922.log))                                                                |
| Library build           | `NG_BUILD_MAX_WORKERS=2 npm run build:lib`                                     | Built Angular Package; exit 0 ([log](build-lib.log))                                                                        |
| Compatibility           | `npm run verify:compatibility`                                                 | Compatibility OK: main / Angular 22 / PrimeNG 22.0.0 / @ciag/orchestra 22.1.0; exit 0 ([log](compatibility.log))            |
| Themes                  | `npm run test:themes:ci`                                                       | Light 6/6 and dark 6/6 success; exit 0 ([log](themes.log))                                                                  |
| SSR                     | `npm run verify:ssr`                                                           | 147/147 inventory components rendered and completed default lifecycle teardown with Angular 22.1.2; exit 0 ([log](ssr.log)) |
| Docs tests              | `NG_BUILD_MAX_WORKERS=2 npm run test:docs`                                     | 56/56 success, including CascadeSelect catalog, API and controlled leaf-selection tests; exit 0 ([log](test-docs.log))      |
| Docs build              | `NG_BUILD_MAX_WORKERS=2 npm run build:docs`                                    | Application bundle generated; exit 0 ([log](build-docs.log))                                                                |
| Template build          | `NG_BUILD_MAX_WORKERS=2 npm run build:template`                                | Application bundle generated; exit 0 ([log](build-template.log))                                                            |
| Current package         | `npm run verify:package`                                                       | 224 JavaScript entry points, public declarations and 5 Sass entry points validated; exit 0 ([log](package-current.log))     |
| Minimum Angular package | `npm run verify:package:minimum`                                               | 224 JavaScript entry points, public declarations and 5 Sass entry points validated; exit 0 ([log](package-minimum.log))     |
| Diff check              | `git diff --check`                                                             | Clean; exit 0                                                                                                               |

The focused CascadeSelect page smoke review confirmed the discoverable catalog route, keyboard guidance, API table, nested level expansion, controlled selection (`value = web`), and no horizontal page overflow at the browser's effective 1910×1075 desktop viewport. A requested 320×800 override produced an effective 477×1194 viewport; the page stacked the preview and live-state panel with no horizontal overflow at 477px, while exact 320px behavior remains open. This is not cross-browser or assistive-technology certification; detailed observation is recorded in [CascadeSelect docs browser QA](../cascade-select-docs-browser-qa.md).
