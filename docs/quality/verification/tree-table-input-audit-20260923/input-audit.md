# TreeTableComponent input audit — 2026-09-23

## Scope and result

Audited `TreeTableComponent` in `projects/orc-ds/p2/p2-tree-table-component.ts`, its inline template and methods, and the focused TreeTable runtime specs. The class has no component superclass and no host directives, so its complete input surface is its own 76 `input()`/`model()` declarations: 70 `input()` declarations and six writable models. Of these, 48 are active and behavior-tested; 28 are explicitly deprecated compatibility no-ops with an adjacent JSDoc reason; zero remain unverified. No input was removed or had its compatibility status changed.

“Behavior-tested supported” means the binding is read by the template or a runtime method and a focused TreeTable spec verifies the resulting behavior. “Deprecated no-op” means the declaration is retained for compatibility, has an adjacent `@deprecated` comment that names the unsupported behavior or replacement, and is not read by the implementation. The audit checked source usage as well as test references; a declaration’s mere acceptance by Angular was not counted as behavior support.

## Input-by-input trace

| Input                       | Classification            | Source/template/runtime trace or compatibility rationale                                     |
| --------------------------- | ------------------------- | -------------------------------------------------------------------------------------------- |
| `id`                        | Behavior-tested supported | Host `[attr.id]`; checked on rendered host.                                                  |
| `selectionMode`             | Behavior-tested supported | Chooses radio/checkbox template and single/multiple selection logic.                         |
| `propagateSelectionUp`      | Behavior-tested supported | Selection normalization walks the tree and selects eligible parents.                         |
| `propagateSelectionDown`    | Behavior-tested supported | Selection adds/removes descendant keys, excluding disabled nodes.                            |
| `value`                     | Behavior-tested supported | Supplies root data to filtering, sorting, paging, rendering, and selection lookup.           |
| `columns`                   | Behavior-tested supported | Builds sortable headers and data cells.                                                      |
| `frozenColumns`             | Deprecated no-op          | JSDoc: frozen columns are not rendered.                                                      |
| `frozenWidth`               | Deprecated no-op          | JSDoc: frozen columns are not rendered.                                                      |
| `label`                     | Behavior-tested supported | Fallback for treegrid `aria-label`.                                                          |
| `ariaLabel`                 | Behavior-tested supported | Preferred explicit treegrid `aria-label`.                                                    |
| `ariaLabelledBy`            | Behavior-tested supported | Wires treegrid `aria-labelledby`.                                                            |
| `treeColumnHeader`          | Behavior-tested supported | Replaces the default first-column heading.                                                   |
| `emptyText`                 | Behavior-tested supported | Renders the empty-state table row.                                                           |
| `filterable`                | Behavior-tested supported | Controls the search form and local filter interaction.                                       |
| `filterLabel`               | Behavior-tested supported | Visible filter label.                                                                        |
| `filterAriaLabel`           | Behavior-tested supported | Overrides the search field accessible name.                                                  |
| `rowsPerPageLabel`          | Behavior-tested supported | Visible label for the page-size selector.                                                    |
| `paginatorAriaLabel`        | Behavior-tested supported | Names the paginator navigation landmark.                                                     |
| `firstPageLabel`            | Behavior-tested supported | Text for the first-page control.                                                             |
| `previousPageLabel`         | Behavior-tested supported | Text for the previous-page control.                                                          |
| `nextPageLabel`             | Behavior-tested supported | Text for the next-page control.                                                              |
| `lastPageLabel`             | Behavior-tested supported | Text for the last-page control.                                                              |
| `loading`                   | Behavior-tested supported | Sets the component container’s `aria-busy` state.                                            |
| `loadingIcon`               | Deprecated no-op          | JSDoc: loading icons are not rendered.                                                       |
| `showLoader`                | Deprecated no-op          | JSDoc: no loader element is rendered.                                                        |
| `expandAriaLabel`           | Behavior-tested supported | Accessible name for a collapsed node toggle.                                                 |
| `collapseAriaLabel`         | Behavior-tested supported | Accessible name for an expanded node toggle.                                                 |
| `styleClass`                | Behavior-tested supported | Appends consumer classes to the container.                                                   |
| `style`                     | Behavior-tested supported | Applies inline styles to the container.                                                      |
| `tableStyle`                | Behavior-tested supported | Applies inline styles to the table.                                                          |
| `tableStyleClass`           | Behavior-tested supported | Appends consumer class to the table.                                                         |
| `autoLayout`                | Behavior-tested supported | Adds container class activating the auto table-layout CSS rule.                              |
| `lazy`                      | Behavior-tested supported | Enables the initial lazy-load request in `ngOnInit`.                                         |
| `lazyLoadOnInit`            | Behavior-tested supported | Gates the initial lazy-load request.                                                         |
| `paginator`                 | Behavior-tested supported | Shows paginator and activates root paging.                                                   |
| `rows`                      | Behavior-tested supported | Model used as local page size and initial lazy request size.                                 |
| `first`                     | Behavior-tested supported | Model used as the page offset; clamped to the current data.                                  |
| `rowsPerPageOptions`        | Behavior-tested supported | Populates page-size selector; current size is retained as an option.                         |
| `pageLinks`                 | Deprecated no-op          | JSDoc: numbered page links are not rendered.                                                 |
| `alwaysShowPaginator`       | Deprecated no-op          | JSDoc: `paginator` controls visibility.                                                      |
| `paginatorPosition`         | Deprecated no-op          | JSDoc: local paginator is rendered below the rows.                                           |
| `paginatorStyleClass`       | Deprecated no-op          | JSDoc: style customization belongs on the component.                                         |
| `currentPageReportTemplate` | Behavior-tested supported | Replaces the report text placeholders with page and record values.                           |
| `showCurrentPageReport`     | Deprecated no-op          | JSDoc: local page report is always shown.                                                    |
| `showJumpToPageDropdown`    | Deprecated no-op          | JSDoc: paginator controls are not rendered.                                                  |
| `showFirstLastIcon`         | Deprecated no-op          | JSDoc: paginator controls are not rendered.                                                  |
| `showPageLinks`             | Deprecated no-op          | JSDoc: paginator controls are not rendered.                                                  |
| `defaultSortOrder`          | Behavior-tested supported | Sets direction for a field’s first sort; reflected in button accessible name and sort state. |
| `sortMode`                  | Deprecated no-op          | JSDoc: multiple sort fields are not implemented.                                             |
| `resetPageOnSort`           | Behavior-tested supported | Controls whether sorting resets the local page offset.                                       |
| `customSort`                | Deprecated no-op          | JSDoc: custom comparison callbacks are not supported.                                        |
| `dataKey`                   | Deprecated no-op          | JSDoc: row identity uses node keys directly.                                                 |
| `metaKeySelection`          | Deprecated no-op          | JSDoc: selection does not inspect modifier keys.                                             |
| `compareSelectionBy`        | Deprecated no-op          | JSDoc: selection comparison uses node keys.                                                  |
| `contextMenuSelection`      | Deprecated no-op          | JSDoc: context-menu integration is not provided.                                             |
| `contextMenuSelectionMode`  | Deprecated no-op          | JSDoc: context-menu integration is not provided.                                             |
| `rowHover`                  | Behavior-tested supported | Adds the row-hover class and CSS behavior.                                                   |
| `scrollable`                | Behavior-tested supported | Enables the scroll-height style on the container.                                            |
| `scrollHeight`              | Behavior-tested supported | Supplies container `max-height` when scrolling is enabled.                                   |
| `virtualScroll`             | Deprecated no-op          | JSDoc: virtual scrolling is not implemented.                                                 |
| `virtualScrollItemSize`     | Deprecated no-op          | JSDoc: virtual scrolling is not implemented.                                                 |
| `virtualScrollOptions`      | Deprecated no-op          | JSDoc: virtual scrolling is not implemented.                                                 |
| `virtualScrollDelay`        | Deprecated no-op          | JSDoc: virtual scrolling is not implemented.                                                 |
| `resizableColumns`          | Deprecated no-op          | JSDoc: column resizing is not implemented.                                                   |
| `reorderableColumns`        | Deprecated no-op          | JSDoc: column reordering is not implemented.                                                 |
| `columnResizeMode`          | Deprecated no-op          | JSDoc: column resizing is not implemented.                                                   |
| `showGridlines`             | Behavior-tested supported | Adds the gridlines class and CSS borders.                                                    |
| `globalFilterFields`        | Behavior-tested supported | Adds configured node data paths to local filtering.                                          |
| `filterDelay`               | Deprecated no-op          | JSDoc: filtering is synchronous.                                                             |
| `filterMode`                | Behavior-tested supported | Passed to `filterTreeNodes` to choose match retention semantics.                             |
| `filterLocale`              | Behavior-tested supported | Passed to tree filtering and sorting collation.                                              |
| `paginatorLocale`           | Deprecated no-op          | JSDoc: paginator labels are configured explicitly.                                           |
| `filterValue`               | Behavior-tested supported | Writable filter model drives filtered roots and search field value.                          |
| `sortField`                 | Behavior-tested supported | Writable sort model chooses the field used when deriving sorted roots.                       |
| `sortOrder`                 | Behavior-tested supported | Writable sort model sets comparison direction and sort ARIA state.                           |
| `selected`                  | Behavior-tested supported | Writable key-set controls row checked/selected state and selection updates.                  |

## Focused evidence

The existing coverage in `projects/orc-ds/tree-table-contract.spec.ts`, `projects/orc-ds/p2/tree-table-data-contract.spec.ts`, `projects/orc-ds/p2-expansion.spec.ts`, and `projects/orc-ds/public-binding-behavior.spec.ts` covers rendering, local filter/sort/page behavior, selection modes and propagation, lazy initialization, labels, and layout. This audit added direct assertions for the previously uncovered public labels and sort options, node-toggle accessible names, lenient/strict filtering, runtime host/style/loading/page-report bindings, and selection cardinality metadata.

The treegrid now sets `aria-multiselectable` to `false` for single selection and `true` for multiple or checkbox selection. This exposes an existing selection-mode distinction to assistive technology without changing selection behavior or input compatibility.

Focused validation passed with bundled Node and Angular CLI:

```text
ng test orc-ds --watch=false --browsers=ChromeHeadless \
  --include=projects/orc-ds/tree-table-contract.spec.ts \
  --include=projects/orc-ds/p2/tree-table-data-contract.spec.ts
TOTAL: 19 SUCCESS
```

## Unresolved risks

No active input remains unverified in the audited class. The 28 deprecated inputs intentionally have no runtime effect, as documented beside their declarations; consumers that still rely on those behaviors must migrate to the supported TreeTable contracts or another component that implements them. This report does not assess component outputs or other TreeTable implementations outside the audited class.
