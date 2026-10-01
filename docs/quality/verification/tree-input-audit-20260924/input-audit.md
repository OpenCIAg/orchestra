# Tree input audit — 2026-09-24

This audit traces `TreeComponent`'s public Angular bindings through its
declaration, template, and implementation. The inventory lists 39 inputs, all
with the same source and public binding name. Two are model inputs:
`filterValue` and `selected`. The canonical implementation is
`projects/orc-ds/p2/p2-tree-component.ts`; the P2 hierarchical barrel and the
`@ciag/orchestra/tree` entrypoint re-export that implementation.

## Input status matrix

| Public input             | Kind   | Status and observable behavior                                                                                                                                         | Focused evidence                                                                                                        |
| ------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `id`                     | signal | Sets the host id and prefixes the internal tree and item ids. When omitted or blank, the internal ids use a generated per-instance id.                                 | “Uses value over nodes…” checks explicit host and tree ids. Generated fallback is source-traced.                        |
| `nodes`                  | signal | Provides the hierarchy when `value` is undefined. Rows reflect expanded and filtered branches.                                                                         | “Uses configured names and styles…”; selection and keyboard tests.                                                      |
| `value`                  | signal | Overrides `nodes` when defined; it is data input, not selection state.                                                                                                 | “Uses value over nodes…” verifies the fallback node is replaced.                                                        |
| `label`                  | signal | Fallback accessible name for the tree; it is not rendered as a visible caption.                                                                                        | “Uses the visible label when the explicit accessible name is blank.”                                                    |
| `ariaLabel`              | signal | Explicit nonblank accessible name; whitespace-only values fall through to `label` or “Tree.”                                                                           | Accessible-name and configured-name tests.                                                                              |
| `ariaLabelledBy`         | signal | Sets `aria-labelledby`; when nonblank it takes precedence over `aria-label`.                                                                                           | Accessible-name and configured-name tests.                                                                              |
| `selectionMode`          | signal | `single` toggles a key to/from null; `multiple` toggles a key in an array; `checkbox` also renders checked/mixed states and honors propagation flags.                  | Checkbox-state, empty-key, keyboard-selection, and P2 expansion tests.                                                  |
| `metaKeySelection`       | signal | Deprecated compatibility input. Selection does not inspect modifier keys; no implementation reads this input outside its declaration.                                  | Source scan confirms declaration-only use.                                                                              |
| `propagateSelectionUp`   | signal | In multiple/checkbox selection, normalizes selected descendants into enabled parents and removes incomplete parents. Disabled parents are not selected.                | “Does not select a disabled parent during upward checkbox propagation”; P2 selection tests.                             |
| `propagateSelectionDown` | signal | In multiple/checkbox selection, selects enabled descendants. A disabled node now blocks propagation into its entire subtree.                                           | “Propagates checkbox selection to enabled descendants only” and the new disabled-branch regression.                     |
| `filter`                 | signal | Shows the local search input and reveals matching branches, even when they were collapsed.                                                                             | Nested-field and collapsed-branch filtering tests.                                                                      |
| `filterPlaceholder`      | signal | Sets the filter input placeholder.                                                                                                                                     | “Uses value over nodes…” checks “Search assets.”                                                                        |
| `filterAriaLabel`        | signal | Sets the filter input's accessible name.                                                                                                                               | “Uses value over nodes…” checks “Filter assets.”                                                                        |
| `filterValue`            | model  | Controls filter text and emits `filterValueChange`; input typing also emits `onFilter` with the original event and string.                                             | New controlled filter-model test and “uses value over nodes…” payload assertion.                                        |
| `filterBy`               | signal | Comma-separated dotted paths searched across string/number fields; defaults to `label`.                                                                                | “Uses configured names and styles…” searches `data.location,label`.                                                     |
| `filterMode`             | signal | `lenient` includes matching subtrees; `strict` includes matching nodes and their ancestor path. Other strings currently follow lenient behavior.                       | Strict nested-field test; default-lenient P2 Tree test.                                                                 |
| `filterInputAutoFocus`   | signal | Deprecated compatibility input. The template has no autofocus binding and the component does not focus the input automatically.                                        | Source/template scan confirms no read or autofocus attribute.                                                           |
| `filterLocale`           | signal | Uses locale-sensitive lowercasing for query and field values; falls back to ordinary lowercase if the locale is invalid or unsupported.                                | New Turkish `İSTANBUL` filtering regression.                                                                            |
| `emptyText`              | signal | Displays a status message when no rows match, but is suppressed while `loading` is true.                                                                               | Updated empty/loading status test checks both states.                                                                   |
| `loading`                | signal | Sets `aria-busy` on the tree and controls loading/empty presentation.                                                                                                  | Updated empty/loading status test.                                                                                      |
| `loadingMessage`         | signal | Displays the configured loading status only while loading.                                                                                                             | Updated empty/loading status test.                                                                                      |
| `loadingMode`            | signal | Deprecated compatibility input; neither `mask` nor `icon` changes rendering.                                                                                           | Existing loading test supplies `icon` and verifies only its message is rendered; source/template do not read the input. |
| `loadingIcon`            | signal | Deprecated compatibility input; no icon is rendered or read from this input.                                                                                           | Existing loading test supplies `spinner` and verifies it is absent; source/template scan confirms declaration-only use. |
| `expandAriaLabel`        | signal | Prefixes the node label in the expand button's accessible name; default is “Expand.”                                                                                   | New configured expansion-label test and default Collapse assertion.                                                     |
| `collapseAriaLabel`      | signal | Prefixes the node label in the collapse button's accessible name; default is “Collapse.”                                                                               | New configured expansion-label test and default Collapse assertion.                                                     |
| `style`                  | signal | Applies the style object to the scroll viewport.                                                                                                                       | “Uses configured names and styles…” checks a custom CSS property.                                                       |
| `styleClass`             | signal | Adds classes to the scroll viewport.                                                                                                                                   | “Uses value over nodes…” checks `compact-tree`.                                                                         |
| `contextMenu`            | signal | Deprecated compatibility input; it does not connect a menu. Right-click still prevents the browser context menu and emits `onNodeContextMenuSelect` for enabled nodes. | Context-menu output test; declaration-only input source scan.                                                           |
| `draggableScope`         | signal | Deprecated compatibility input; no drag/drop scope is registered.                                                                                                      | Source/template scan confirms declaration-only use.                                                                     |
| `droppableScope`         | signal | Deprecated compatibility input; no drag/drop scope is registered.                                                                                                      | Source/template scan confirms declaration-only use.                                                                     |
| `draggableNodes`         | signal | Deprecated compatibility input; nodes have no draggable behavior.                                                                                                      | Source/template scan confirms declaration-only use.                                                                     |
| `droppableNodes`         | signal | Deprecated compatibility input; nodes have no droppable behavior.                                                                                                      | Source/template scan confirms declaration-only use.                                                                     |
| `scrollHeight`           | signal | Sets the viewport's CSS `max-height`; scrolling emits `onScroll`.                                                                                                      | “Uses configured names and styles…” checks `9rem` and the scroll event.                                                 |
| `lazy`                   | signal | Deprecated compatibility input; the complete input data is rendered locally and `onLazyLoad` is never emitted.                                                         | Source/template scan confirms no lazy branch or output emission.                                                        |
| `virtualScroll`          | signal | Deprecated compatibility input; all visible rows are rendered.                                                                                                         | Source/template scan confirms no virtual viewport or conditional rendering.                                             |
| `virtualScrollItemSize`  | signal | Deprecated compatibility input; it has no effect without a virtual viewport.                                                                                           | Source/template scan confirms declaration-only use.                                                                     |
| `indentation`            | signal | Sets each row's left padding to `0.5rem + level × indentation`.                                                                                                        | “Uses value over nodes…” checks `2.5rem` for a root row at level one and indentation two.                               |
| `highlightOnSelect`      | signal | Deprecated compatibility input; selected-row styling is always derived from selected state, regardless of this flag.                                                   | Source/template scan confirms the selected class is bound directly to `isSelected`.                                     |
| `selected`               | model  | Controls selected key(s) and emits `selectedChange`; internal selection also emits `selectionChange` and node select/unselect outputs.                                 | Controlled selection host plus keyboard and checkbox selection tests.                                                   |

## Outputs and no-op compatibility surface

The component declares 16 explicit outputs and two model outputs. Selection
outputs are `nodeSelect`, `nodeUnselect`, `onNodeSelect`, `onNodeUnselect`, and
`selectionChange`; expansion outputs are `nodeExpand`, `nodeCollapse`,
`onNodeExpand`, and `onNodeCollapse`. Tests verify the primary and compatibility
aliases carry the same node, selection changes follow updated state, and
expansion/collapse listeners observe committed state. `selectedChange` is
tested through a real controlled Angular consumer.

Other active outputs are `onNodeContextMenuSelect`, `onNodeDoubleClick`,
`onScroll`, `onFilter`, and model output `filterValueChange`; focused tests
verify their payloads and disabled-node guards. Three outputs are deprecated
no-ops: `onNodeDrop`, `onLazyLoad`, and `onScrollIndexChange`. The source has no
emission paths for them. Their paired drag/drop, lazy-load, and virtual-scroll
inputs are also marked deprecated in the component declaration.

The 13 compatibility inputs are intentionally not treated as working features:
`metaKeySelection`, `filterInputAutoFocus`, `loadingMode`, `loadingIcon`,
`contextMenu`, `draggableScope`, `droppableScope`, `draggableNodes`,
`droppableNodes`, `lazy`, `virtualScroll`, `virtualScrollItemSize`, and
`highlightOnSelect`. Their declarations explicitly say compatibility/deprecated
or the implementation contains no reads; template and source traces confirm no
behavior is attached. Removing them would be an API-breaking compatibility
decision and is outside this fix.

`HierarchyNode.leaf` is a separate data property, not one of the 39 Angular
inputs. It is also currently unused: expansion requires a nonempty `children`
array, while lazy loading is unsupported. The type now marks `leaf` deprecated
with that reason. The existing Tree docs metadata still mentions `leaf`; that
docs route was outside this bounded edit scope and should be aligned in a
follow-up.

## Fixes and validation

Checkbox downward propagation previously descended through a disabled node and
selected enabled grandchildren that the user could not reach through the
disabled branch. The propagation now stops at the disabled node, and the
focused test verifies the visible selection model omits that hidden subtree.

An empty tree previously announced both “Loading …” and its empty-state message
while a load was in progress. The empty status now appears once loading ends;
the focused regression verifies both states.

The focused test file is
`projects/orc-ds/tree-component-contract.spec.ts`. It covers the input and
output contracts above and includes the two new regression cases, the
controlled `filterValue` model binding, locale-sensitive search, and custom
expansion names. The Node 24.16 Chrome Headless run passed **21/21** using:

```sh
PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH ng test orc-ds --watch=false --browsers=ChromeHeadless --include='projects/orc-ds/tree-component-contract.spec.ts'
```

The test environment does not replace cross-browser or screen-reader testing.
