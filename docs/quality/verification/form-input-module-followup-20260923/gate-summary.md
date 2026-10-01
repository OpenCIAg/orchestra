# Public input and MultiSelect module follow-up — 2026-09-23

**PASS.** The library suite passes **1328/1328** with both Jasmine seeds. The library and docs builds, current and minimum Angular package consumers, SSR, themes, docs tests, compatibility metadata, inventory, and documentation source checks pass.

## Input audits

| Component    | Public bindings classified                                 | Focused suite | Audit                                                                     |
| ------------ | ---------------------------------------------------------- | ------------: | ------------------------------------------------------------------------- |
| DatePicker   | 90: 86 behavior-tested, 4 deprecated no-ops, 0 unverified  |         49/49 | [DatePicker audit](../datepicker-input-audit-20260923/input-audit.md)     |
| Autocomplete | 34: 34 behavior-tested, 0 no-ops, 0 unverified             |         25/25 | [Autocomplete audit](../autocomplete-input-audit-20260923/input-audit.md) |
| MultiSelect  | 71: 43 behavior-tested, 28 deprecated no-ops, 0 unverified |         16/16 | [MultiSelect audit](../multiselect-input-audit-20260923/report.md)        |
| Listbox      | 46: 30 behavior-tested, 16 deprecated no-ops, 0 unverified |         12/12 | [Listbox audit](../listbox-input-audit-20260923/input-audit.md)           |
| Paginator    | 44: 39 behavior-tested, 5 deprecated no-ops, 0 unverified  |         17/17 | [Paginator audit](../paginator-input-audit-20260923/input-audit.md)       |
| FileUploader | 44: 44 behavior-tested, 0 no-ops, 0 unverified             |         23/23 | [FileUploader audit](../fileuploader-input-audit-20260923/input-audit.md) |
| TreeTable    | 76: 48 behavior-tested, 28 deprecated no-ops, 0 unverified |         19/19 | [TreeTable audit](../tree-table-input-audit-20260923/input-audit.md)      |
| NumberInput  | 55: 55 behavior-tested, 0 no-ops, 0 unverified             |         12/12 | [NumberInput audit](../number-input-audit-20260923/input-audit.md)        |
| Modal        | 49: 38 behavior-tested, 11 deprecated no-ops, 0 unverified |         21/21 | [Modal audit](../modal-input-audit-20260923/report.md)                    |

DatePicker's document-level outside-click path closes the rendered date-time panel and emits one outside event; Escape, focus return, and overlay cleanup remain covered. Autocomplete now supplies a fallback accessible name when no label is provided. MultiSelect fixes primitive `dataKey` comparison, selected-count feedback, fluid width, and blank loading feedback. Listbox now implements its declared filtering modes and identity/label behavior. NumberInput applies its sizing/layout inputs and corrects decimal stepping. TreeTable reports its selection mode to assistive technology. Modal avoids competing `aria-label` and `aria-labelledby` names.

## Integrated gates

| Check                             | Result                                                                                                                                                                          | Evidence                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Full library, seed 4321           | **1328/1328**                                                                                                                                                                   | [log](library-seed-4321.log)                                     |
| Full library, seed 20260923       | **1328/1328**                                                                                                                                                                   | [log](library-seed-20260923.log)                                 |
| Library build                     | Pass                                                                                                                                                                            | [log](build-library.log)                                         |
| Compatibility metadata            | Pass                                                                                                                                                                            | [log](compatibility.log)                                         |
| Current Angular package consumer  | **224 JavaScript exports/aliases, declarations without `skipLibCheck`, 5 Sass exports**                                                                                         | [log](package.log)                                               |
| Minimum Angular package consumer  | **224 JavaScript exports/aliases, declarations without `skipLibCheck`, 5 Sass exports**                                                                                         | [log](package-minimum.log)                                       |
| Class identity in packed consumer | MultiSelect secondary entry equals P2 export                                                                                                                                    | [package verifier](../../../../tools/quality/verify-package.mjs) |
| SSR lifecycle/render              | **147/147 components**                                                                                                                                                          | [log](ssr.log)                                                   |
| Light/dark theme contracts        | **6/6 in each mode**                                                                                                                                                            | [log](themes.log)                                                |
| Docs tests and production build   | **75/75; build passes**                                                                                                                                                         | [tests](docs-tests.log), [build](build-docs.log)                 |
| Template production build         | Pass                                                                                                                                                                            | [log](build-template.log)                                        |
| Regenerated inventory             | **147 components, 19 directives, 4 services, 223 secondary entries**                                                                                                            | [log](inventory.log), [inventory](../../component-inventory.md)  |
| Documentation/source integrity    | **124** quality Markdown files, **925** local links, **1** public LLM link, **408** source anchors, **171** P2 anchors, **147/147** ledger rows; no unresolved links or anchors | [log](documentation-integrity.log)                               |
| `git diff --check`                | Pass                                                                                                                                                                            | [log](diff-check.log)                                            |

The MultiSelect implementation now lives in `p2/p2-multi-select-component.ts`; `p2-form-components.ts` remains a compatibility export. The P2 barrel and `multi-select` secondary entry resolve to the same class, verified in focused tests and the isolated packed consumer. No component was identified as safe to remove from repository evidence alone. Cross-browser, real assistive-technology, physical mobile, responsive visual, and hydration checks remain open.
