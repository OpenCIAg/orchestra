# P2 module separation and input follow-up — 2026-09-23

**PASS.** The full library suite passes **1329/1329** under Jasmine seeds `4321` and `20260923`. Library and docs builds, current/minimum Angular package consumers, compatibility metadata, SSR, docs tests, themes, template build, inventory, and documentation/source integrity pass.

## Component contracts

| Component / family | Focused evidence                                                                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MultiSelect        | **16/16**; all 71 bindings classified (43 supported, 28 deprecated no-ops, none unverified). See [input audit](../multiselect-input-audit-20260923/report.md).    |
| Listbox            | **12/12**; all 46 bindings classified (30 supported, 16 deprecated no-ops, none unverified). See [input audit](../listbox-input-audit-20260923/input-audit.md).   |
| Paginator          | **17/17**; all 44 bindings classified (39 supported, 5 deprecated no-ops, none unverified). See [input audit](../paginator-input-audit-20260923/input-audit.md).  |
| TreeSelect         | **34/34** across the direct 15/15 and presentation 19/19 suites; class and `TreeSelectNode` type identity hold across focused, legacy, P2, and secondary imports. |

MultiSelect now lives in `p2/p2-multi-select-component.ts` and TreeSelect in `p2/p2-tree-select-component.ts`. The previous mixed form/selection modules retain compatibility exports, while P2 and secondary package entry points resolve to each focused class. The packed consumer explicitly asserts class identity for both aliases.

## Integrated gates

| Check                                         | Result                                                                                                                           | Evidence                                                        |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Full library, seed 4321                       | **1329/1329**                                                                                                                    | [log](library-seed-4321.log)                                    |
| Full library, seed 20260923                   | **1329/1329**                                                                                                                    | [log](library-seed-20260923.log)                                |
| Library build and compatibility               | Pass                                                                                                                             | [build](build-library.log), [compatibility](compatibility.log)  |
| Current and minimum Angular package consumers | **224 JavaScript entries/aliases, declarations without `skipLibCheck`, 5 Sass entries each**                                     | [current](package.log), [minimum](package-minimum.log)          |
| SSR lifecycle/render                          | **147/147 components**                                                                                                           | [log](ssr.log)                                                  |
| Docs tests and production build               | **75/75; build passes**                                                                                                          | [tests](docs-tests.log), [build](build-docs.log)                |
| Template production build                     | Pass                                                                                                                             | [log](build-template.log)                                       |
| Light and dark theme contracts                | **6/6 each**                                                                                                                     | [log](themes.log)                                               |
| Regenerated inventory                         | **147 components, 19 directives, 4 services, 223 secondary entries**                                                             | [log](inventory.log), [inventory](../../component-inventory.md) |
| Documentation integrity                       | **125 Markdown files, 946 local links, 408 source anchors, 171 P2 anchors, 147/147 ledger rows; no unresolved links or anchors** | [log](documentation-integrity.log)                              |
| Whitespace and conflict-marker check          | Pass                                                                                                                             | [log](diff-check.log)                                           |

Cross-browser, real screen-reader, physical-mobile, responsive visual, hydration, and projected-view ownership reviews remain open. No component was identified as safely removable from repository evidence alone; public-consumer usage is not available here.
