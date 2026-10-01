# DataTable input follow-up — 2026-09-23

## Result

PASS. The focused DataTable suite passed **15/15** and its combined run with P2 expansion passed **139/139**. The complete library suite passed **1233/1233** under Jasmine seeds `4321` and `20260923`. The Angular library package build passed. Documentation integrity and `git diff --check` passed.

## Findings and changes

- Sorting now derives its next direction from the active controlled `sortField`/`sortOrder`, so clicking a column already sorted ascending changes it to descending on the first click.
- Local pagination clamps to the available page range when its data set shrinks, updating both `page` and `first` through the existing synchronization effect.
- `sortMode="multiple"` and `metaKeySelection` are formally deprecated compatibility inputs: DataTable supports single-field sorting and selection without modifier keys.
- Whitespace-only caption, table name, row/select-all label, filter placeholder, and paginator-label overrides now fall back to trimmed visible text or useful defaults.
- The public API guide now lists the implemented inputs, models, outputs, selection/sort limitations, and actual fallback/default behavior.

The inventory contains **40 DataTable inputs/model entries**. At the time of the original gate, the source audit found custom `label`/`ariaLabel`, `filterPlaceholder`, select-all/row labels, loading state/message, custom paginator labels, `selectable=true`, custom `rowKey`, direct `pageSize`, and `size="large"` wired but without focused custom-value assertions. Existing tests cover their primary/default paths. This is a focused component milestone; visual, cross-browser, and remaining input-combination review continues.

A later focused assertion update extends `data-table-behavior.spec.ts` to **17/17**. It directly observes `loading`/`loadingMessage` visibility, `selectable=true` without an explicit selection mode, custom `rowKey` naming, direct `pageSize`, `size="large"`, and controlled filter/selection model inputs. Existing assertions cover the custom table/filter/selection/paginator labels and filter placeholder. Remaining cross-product, visual, cross-browser, and assistive-technology review is still open.

## Complete 40-input review

DataTable has no inherited inputs. The inventory's 40 signal/model entries classify as follows:

- **Behavior-tested (38):** `data`, `value`, `columns`, `rowKey`, `dataKey`, `first`, `rows`, `totalRecords`, `lazy`, `lazyLoadOnInit`, `rowHover`, `stripedRows`, `showGridlines`, `size`, `selectionMode`, `sortField`, `sortOrder`, `styleClass`, `tableStyleClass`, `label`, `ariaLabel`, `emptyText`, `loading`, `selectable`, `filterable`, `filterPlaceholder`, `filterAriaLabel`, `selectAllAriaLabel`, `rowAriaLabel`, `loadingMessage`, `paginatorAriaLabel`, `previousPageAriaLabel`, `nextPageAriaLabel`, `filter`, `paginator`, `pageSize`, `page`, `selected`.
- **Deprecated/no-op (2):** `sortMode`, `metaKeySelection`.
- **Wired but unasserted:** none at the individual-input contract level.
- **Intentionally unsupported:** none beyond the deprecated compatibility inputs.

The separately declared legacy `selection` input alias is also behavior-tested in `p2-expansion.spec.ts`. The focused contracts assert default-off presentation/visibility states as well as enabled values. Cross-input combinations, live visual styling, cross-browser behavior, and assistive-technology behavior remain unverified.

## Evidence

| Check                       | Result                                                                                                        | Log                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| DataTable + P2 expansion    | PASS — 139/139                                                                                                | [focused-tests.log](focused-tests.log)                     |
| Full library, seed 4321     | PASS — 1233/1233                                                                                              | [library-seed-4321.log](library-seed-4321.log)             |
| Full library, seed 20260923 | PASS — 1233/1233                                                                                              | [library-seed-20260923.log](library-seed-20260923.log)     |
| Angular library build       | PASS                                                                                                          | [build-library.log](build-library.log)                     |
| Documentation integrity     | PASS — 106 Markdown files, 797 local links, 407 source anchors, 171 P2 anchors, 147/147 component ledger rows | [documentation-integrity.log](documentation-integrity.log) |
| `git diff --check`          | PASS                                                                                                          | [diff-check.log](diff-check.log)                           |
