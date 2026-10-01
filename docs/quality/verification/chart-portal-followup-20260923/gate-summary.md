# Chart and Portal integrated follow-up — 2026-09-23

## Result

PASS. The integrated library suite passed **1225/1225** under both `ORC_JASMINE_SEED=4321` and `ORC_JASMINE_SEED=20260923`. The requested focused ChromeHeadlessCI batch passed **12/12**: Chart **5/5**, Portal **7/7**, including runtime diagnostics. All build, compatibility, theme, SSR, docs, package-consumer, inventory, documentation-integrity, and whitespace gates passed.

Runtime: bundled Node **v24.19.0**, npm **11.3.0**. Inventory: **147 components**, **19 directives**, **4 services**, and **223 entry points**.

## Commands and evidence

All commands ran from the workspace root with the bundled Node path prepended to `PATH`. Both library runs set `NG_BUILD_MAX_WORKERS=2` and `CI=true`; build commands set `NG_BUILD_MAX_WORKERS=2`.

| Gate                                                                                                         | Result                                                                                                                          | Log                                                        |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `node tools/quality/inventory.mjs`                                                                           | PASS — 147 components, 19 directives, 4 services, 223 entry points                                                              | [inventory.log](inventory.log)                             |
| `ORC_JASMINE_SEED=4321 CI=true npm run test:lib:ci`                                                          | PASS — 1225/1225                                                                                                                | [library-seed-4321.log](library-seed-4321.log)             |
| `ORC_JASMINE_SEED=20260923 CI=true npm run test:lib:ci`                                                      | PASS — 1225/1225                                                                                                                | [library-seed-20260923.log](library-seed-20260923.log)     |
| `NG_BUILD_MAX_WORKERS=2 npm run build:lib`                                                                   | PASS                                                                                                                            | [build-library.log](build-library.log)                     |
| `npm run verify:compatibility`                                                                               | PASS — main / Angular 22 / PrimeNG 22.0.0 / @ciag/orchestra 22.1.0                                                              | [compatibility.log](compatibility.log)                     |
| `npm run test:themes:ci`                                                                                     | PASS — 6/6                                                                                                                      | [themes.log](themes.log)                                   |
| `npm run verify:ssr`                                                                                         | PASS — rendered 147/147 inventory components with Angular 22.1.2                                                                | [ssr.log](ssr.log)                                         |
| `NG_BUILD_MAX_WORKERS=2 npm run test:docs`                                                                   | PASS — 75/75                                                                                                                    | [docs-tests.log](docs-tests.log)                           |
| `NG_BUILD_MAX_WORKERS=2 npm run build:docs`                                                                  | PASS                                                                                                                            | [docs-build.log](docs-build.log)                           |
| `NG_BUILD_MAX_WORKERS=2 npm run build:template`                                                              | PASS                                                                                                                            | [template-build.log](template-build.log)                   |
| `npm run verify:package`                                                                                     | PASS — 224 JavaScript entries/aliases, declarations without `skipLibCheck`, 5 Sass entries                                      | [package-current.log](package-current.log)                 |
| `npm run verify:package:minimum`                                                                             | PASS — same package checks                                                                                                      | [package-minimum.log](package-minimum.log)                 |
| `ORC_CONSUMER_ANGULAR_VERSION=22.1.2 npm run verify:package`                                                 | PASS — explicit-version override consumer                                                                                       | [package-override-22.1.2.log](package-override-22.1.2.log) |
| `node docs/quality/verification/integrated-treeselect-datepicker-final-20260923/documentation-integrity.mjs` | PASS — 104 Markdown files, 782 local links, 407 source anchors, 171 P2 anchors, 147/147 ledger rows; no bad or unresolved links | [documentation-integrity.log](documentation-integrity.log) |
| `git diff --check`                                                                                           | PASS                                                                                                                            | [diff-check.log](diff-check.log)                           |

The focused Chart/Portal/runtime-diagnostics run completed before this integrated gate and is reported as **12/12** (Chart **5/5**, Portal **7/7**).

## Behavior milestone

Chart now uses a single roving tab stop across data marks and supports Arrow/Home/End navigation while retaining Enter, Space, and click outputs. Portal keeps its local-host fallback while a valid selector target is unresolved, observes the owner document only during that interval, moves the content when the target appears, and disconnects the observer on resolution, target change, invalid selector, or destroy. Document-wide target observation remains separate from projected-node ownership reconciliation.

The prior **1221/1221** Tree/TagsInput/spacing checkpoint remains historical; this **1225/1225** run was the latest integrated source/package checkpoint when recorded. The forms/tooltip follow-up supersedes it with **1295/1295** tests and newer input-level regressions; see the [current gate summary](../form-controls-next-followup-20260923/gate-summary.md).
