# TreeSelect input follow-up — 2026-09-23

## Result

PASS. The two focused TreeSelect suites passed **27/27**. The complete library suite passed **1230/1230** with Jasmine seeds `4321` and `20260923`. The Angular library package build passed. Documentation integrity reported no broken or unresolved links, anchors, or inventory rows; `git diff --check` passed.

## Findings and changes

- The filter input now has the accessible name `Filter options` by default; a nonblank `filterAriaLabel` overrides it, and whitespace-only overrides fall back to the default.
- Whitespace-only trigger, clear, and expansion labels no longer suppress useful names. Blank component labels are omitted.
- `panelClass` and `panelStyleClass` are both applied, with repeated class tokens removed.
- `selectionMode="multiple"` now selects individual nodes. Parent/child propagation is reserved for checkbox mode; tests cover both disabled propagation directions.
- The public API guide now describes the implemented value type, absent placeholder default, models, outputs, selection behavior, and deprecated compatibility inputs.

The source inventory lists **46 TreeSelect input/model entries**. The focused audit classifies supported but still-unverified configuration as `styleClass`, `placeholder`, `readonly`, `inputId`, `tabindex`, `fluid`, root `style`, `filterPlaceholder`, custom clear/expand/collapse labels, and `resetFilterOnHide=false`. Compatibility no-ops are documented and deprecated in source: `display`, `appendTo`, `overlayOptions`, `filterInputAutoFocus`, `virtualScroll`, `virtualScrollItemSize`, `virtualScrollOptions`, `autofocus`, and `metaKeySelection`. Virtual scrolling and popup attachment remain unimplemented; large-tree windowing needs an explicit API decision before changing that compatibility contract. This is a component milestone, not completion of the whole-library input audit.

## Completed input audit — 2026-09-23

The follow-up contract now passes **33/33** focused cases (14 direct and 19 presentation). All 46 inputs are classified: **37 supported inputs are behavior-tested**, the nine compatibility no-ops above are deprecated, and no live input remains unasserted. Public `disabled`, CVA-disabled and `readonly` transitions now disable the already-open tree, its row/expansion controls and its filter, and block expansion, selection and filter edits. Loading disables tree selection while deliberately preserving filter interaction. See the [current integrated gate](../form-controls-next-followup-20260923/gate-summary.md) for the updated 1295/1295 full-suite evidence. Cross-input combinations and live visual, cross-browser, and assistive-technology reviews remain open.

## Evidence

| Check                       | Result                                                                                                        | Log                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| TreeSelect contracts        | PASS — 27/27                                                                                                  | [tree-select-tests.log](tree-select-tests.log)             |
| Full library, seed 4321     | PASS — 1230/1230                                                                                              | [library-seed-4321.log](library-seed-4321.log)             |
| Full library, seed 20260923 | PASS — 1230/1230                                                                                              | [library-seed-20260923.log](library-seed-20260923.log)     |
| Angular library build       | PASS                                                                                                          | [build-library.log](build-library.log)                     |
| Documentation integrity     | PASS — 105 Markdown files, 790 local links, 407 source anchors, 171 P2 anchors, 147/147 component ledger rows | [documentation-integrity.log](documentation-integrity.log) |
| `git diff --check`          | PASS                                                                                                          | [diff-check.log](diff-check.log)                           |
