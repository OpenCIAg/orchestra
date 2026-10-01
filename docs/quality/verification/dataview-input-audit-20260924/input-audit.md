# DataView input and state-transition audit

- **Date:** 2026-09-24
- **Component:** `DataViewComponent` (`orc-data-view`)
- **Source:** [`p2-data-view-component.ts`](../../../../projects/orc-ds/p2/p2-data-view-component.ts)
- **Focused suite:** [`data-view-pagination-contract.spec.ts`](../../../../projects/orc-ds/data-view-pagination-contract.spec.ts)

## Result

All 38 public inputs are supported and behavior-tested; none is classified as a deprecated no-op or unverified input. The focused suite passes **14/14** in Chrome Headless, and `ng build orc-ds` completes with Node 24.16. The audit fixed four reproducible edge cases: whitespace-only headers rendered an empty heading, whitespace-only empty messages created blank live statuses, whitespace-only paginator labels produced an empty accessible name, and cyclic records threw during the default JSON display path. Blank heading/status content is now suppressed, paginator labels are trimmed with a useful fallback, and default record rendering catches serialization failures.

The component remains intentionally narrow in lazy mode: it emits page/filter load ranges but does not fetch or remotely sort records. The consumer owns the request, `value` and `totalRecords` updates, and remote sorting. This matches the DataView docs guidance in `component-doc-page.component.ts:2864` and `:2950-2978`. `filterBy` and `sortField` address direct item properties; nested paths and an item-template index are not part of the documented contract.

## Input matrix

Evidence IDs refer to tests in the focused suite:

| ID  | Test                                                                                      |
| --- | ----------------------------------------------------------------------------------------- |
| T1  | Resets local paging when filtering and counts filtered results instead of server totals   |
| T2  | Renders a lazy server page without applying its global offset a second time               |
| T3  | Renders the configured paginator at both positions with accessible controls               |
| T4  | Emits normalized local page and page-size changes while honoring page bounds              |
| T5  | Renders an empty always-visible paginator and requests a fresh lazy page after filtering  |
| T6  | Switches large page counts to a bounded numeric jump control and keeps page links bounded |
| T7  | Renders a named loading state and honors a custom loading icon                            |
| T8  | Sorts through controlled sort inputs and emits `onSort` for programmatic sort changes     |
| T9  | Renders named presentation, styling and empty-state inputs                                |
| T10 | Bounds paginator inputs and applies them at the configured positions                      |
| T11 | Requests and normalizes the initial lazy page, then emits page and load ranges            |
| T12 | Keeps the item template context and identity stable across live updates                   |
| T13 | Keeps public models and transition outputs synchronized with the rendered view            |
| T14 | Renders safe fallback labels for cyclic record values and blank status text               |

Every row is classified **behavior-tested supported**. No compatibility-only or intentionally deprecated input was found.

| Public input                | Kind   | Behavior and evidence                                                                                                                               |
| --------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`                     | signal | Supplies visible records; local and lazy arrays, empty values, updates, filtering, and projected rows are exercised (T1, T2, T4, T5, T9, T12, T14). |
| `layout`                    | model  | Starts from a bound host value and updates list/grid rendering; component transitions write back to the host (T9, T13).                             |
| `header`                    | signal | Renders a named heading; whitespace-only content is omitted and no blank heading remains (T9).                                                      |
| `emptyMessage`              | signal | Displays the configured empty result as a live status; whitespace-only content suppresses the blank status node (T5, T9).                           |
| `ariaLabel`                 | signal | Trims a custom collection name; blank values fall back to the visible header or “Data view” (T9, T14).                                              |
| `itemTemplate`              | signal | Accepts a `TemplateRef` with `$implicit` item context and preserves row DOM identity through reorder (T12).                                         |
| `style`                     | signal | Applies a style map to the collection root (T9).                                                                                                    |
| `styleClass`                | signal | Adds the configured root class without removing the base class (T9).                                                                                |
| `gridStyleClass`            | signal | Applies the grid-specific class and removes the list-specific class on layout change (T9).                                                          |
| `listStyleClass`            | signal | Applies the list-specific class with list presentation (T9).                                                                                        |
| `trackBy`                   | signal | Uses the consumer callback key to retain row DOM identity; the callback receives index and item (T12).                                              |
| `paginator`                 | signal | Enables and disables the paginator; its visible presence also respects page count and `alwaysShowPaginator` (T3, T4, T5, T10).                      |
| `rows`                      | signal | Sets page size for local pages and lazy requests; invalid/out-of-range page state is normalized (T3, T4, T5, T11).                                  |
| `first`                     | model  | Tracks page offsets, normalizes and clamps them, and writes paginator changes back to the host (T2, T4, T5, T11, T13).                              |
| `totalRecords`              | signal | Local mode uses filtered result count; lazy mode uses the supplied server total for page count and reports (T1, T2, T3, T5, T6, T11).               |
| `pageLinks`                 | signal | Controls numeric link count and is bounded for high page counts (T3, T6, T10).                                                                      |
| `rowsPerPageOptions`        | signal | Adds the size selector, accepts page-size changes, and preserves the active size in the options (T3, T4, T10).                                      |
| `paginatorPosition`         | signal | Renders top, bottom, or both paginator placements (T3, T10).                                                                                        |
| `paginatorStyleClass`       | signal | Forwards the class to each rendered paginator (T10).                                                                                                |
| `alwaysShowPaginator`       | signal | Keeps a one-page/empty paginator visible when true and hides it when false (T4, T5, T10).                                                           |
| `currentPageReportTemplate` | signal | Forwards the template and renders the expected first/last/total/page values (T3, T10).                                                              |
| `showCurrentPageReport`     | signal | Toggles the report output (T3, T10).                                                                                                                |
| `showJumpToPageDropdown`    | signal | Renders jump controls and uses bounded numeric entry for very large page counts (T3, T6, T10).                                                      |
| `showFirstLastIcon`         | signal | Shows the first-page control in both paginator instances (T3, T10).                                                                                 |
| `showPageLinks`             | signal | Toggles page links while retaining the other paginator controls (T3, T10).                                                                          |
| `lazy`                      | signal | Preserves the supplied page array without slicing by its global offset and emits load ranges for filter/page transitions (T2, T5, T11).             |
| `lazyLoadOnInit`            | signal | Emits a normalized initial range only when enabled in lazy mode (T11).                                                                              |
| `loading`                   | signal | Sets `aria-busy`, replaces rows with a live loading status, and restores records afterward (T7, T14).                                               |
| `loadingIcon`               | signal | Renders the requested icon classes as decorative content (T7).                                                                                      |
| `loadingMessage`            | signal | Renders a custom loading message and uses “Loading” for whitespace-only values (T7, T14).                                                           |
| `filterBy`                  | signal | Enables the search control and filters the named item field (T1, T5, T9, T13).                                                                      |
| `filterAriaLabel`           | signal | Trims a custom filter name and falls back to “Filter items” for blank input (T9).                                                                   |
| `paginatorAriaLabel`        | signal | Trims a custom navigation name and falls back to “Pagination” for blank input (T10).                                                                |
| `filterLocale`              | signal | Applies locale-aware case normalization, verified with Turkish dotted/dotless-I data (T1).                                                          |
| `filterValue`               | model  | Drives rendered filtering and writes user-entered changes to the bound host (T1, T5, T13).                                                          |
| `dataKey`                   | signal | Supplies stable item identity when no `trackBy` callback is set (T12).                                                                              |
| `sortField`                 | model  | Selects local sort field and synchronizes programmatic changes to the host (T8, T13).                                                               |
| `sortOrder`                 | model  | Controls ascending/descending local sort and synchronizes programmatic changes to the host (T8, T13).                                               |

## Outputs and generated model events

All five declared outputs have consumer-facing assertions: `onPage` carries normalized page/size changes (T4, T11, T13); `onLazyLoad` carries initial, filter, and page ranges (T5, T11); `onSort` carries normalized field/order values (T8, T13); and both `onLayoutChange` and `onChangeLayout` fire once for a layout transition (T13). The `layout`, `first`, `filterValue`, `sortField`, and `sortOrder` models each update a host-bound value in T13; their Angular-generated `*Change` events therefore have an exercised binding path.

## Remaining limits

The suite runs in Chrome Headless; it does not provide cross-engine, assistive-technology, hydration, or visual regression evidence. Lazy network behavior is consumer-owned and is not end-to-end tested. The item template contract exposes only `$implicit` (the row) and does not expose an index. Invalid values outside the declared TypeScript types, such as a null `value` or unsupported paginator position, are not part of this audit.

## Validation

- `PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH npx ng test orc-ds --watch=false --include='projects/orc-ds/data-view-pagination-contract.spec.ts'` — **14/14 passed** in Chrome Headless after the final source change.
- `PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH npx ng build orc-ds` — **passed**, Angular package built after the final source change.
- Prettier check — **passed** for the DataView source, focused suite, audit report, and Changeset.
- Whitespace validation — **passed** for all four milestone files.
