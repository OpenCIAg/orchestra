# MultiSelectComponent input audit

Audited `MultiSelectComponent` in `projects/orc-ds/p2/p2-multi-select-component.ts` on 2026-09-23. The legacy `p2-form-components.ts` module re-exports the identical class. The inventory covers all 71 `input()`/`model()` members in the class, through the rendered template and their runtime use. Output members and private state are outside this input audit.

## Totals

| Classification              |  Count | Meaning                                                                                                                                                      |
| --------------------------- | -----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Behavior-tested supported   |     43 | The input/model affects template or runtime behavior, and focused or existing component assertions cover that behavior.                                      |
| Explicitly deprecated no-op |     28 | The input remains declared for binding compatibility; its deprecation comment identifies the omitted feature and, where relevant, the supported replacement. |
| Unverified                  |      0 | No active input/model was left without behavior evidence.                                                                                                    |
| **Total**                   | **71** |                                                                                                                                                              |

## Input-by-input inventory

|   # | Input/model             | Classification              | Runtime/template behavior or compatibility rationale                                                               |
| --: | ----------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------ |
|   1 | `options`               | Behavior-tested supported   | Supplies selectable, filterable, and rendered options.                                                             |
|   2 | `value`                 | Behavior-tested supported   | Selection model; CVA writes and user changes are asserted.                                                         |
|   3 | `label`                 | Behavior-tested supported   | Renders a label associated with the trigger.                                                                       |
|   4 | `placeholder`           | Behavior-tested supported   | Trigger fallback when no selected labels are available.                                                            |
|   5 | `emptyText`             | Explicitly deprecated no-op | Retained for binding compatibility; use `emptyMessage` for the empty-state text.                                   |
|   6 | `disabled`              | Behavior-tested supported   | Disables the trigger and blocks selection and opening.                                                             |
|   7 | `readonly`              | Behavior-tested supported   | Announces read-only state and blocks selection, clear, and opening.                                                |
|   8 | `fluid`                 | Behavior-tested supported   | Adds a full-width class; a matching width rule now gives the input visible effect.                                 |
|   9 | `inputId`               | Behavior-tested supported   | Sets the effective trigger id and label association.                                                               |
|  10 | `ariaLabel`             | Behavior-tested supported   | Sets the trigger's accessible name.                                                                                |
|  11 | `ariaLabelledBy`        | Behavior-tested supported   | Sets the trigger's accessible label reference.                                                                     |
|  12 | `tabindex`              | Behavior-tested supported   | Sets the trigger tab order.                                                                                        |
|  13 | `name`                  | Explicitly deprecated no-op | Retained for binding compatibility; the trigger is a button without a `name` attribute.                            |
|  14 | `variant`               | Explicitly deprecated no-op | Retained for binding compatibility; this component does not implement variant styling.                             |
|  15 | `styleClass`            | Behavior-tested supported   | Adds caller classes to the root element.                                                                           |
|  16 | `style`                 | Behavior-tested supported   | Applies inline styles to the root element.                                                                         |
|  17 | `panelStyle`            | Behavior-tested supported   | Applies inline styles to the listbox panel.                                                                        |
|  18 | `panelStyleClass`       | Behavior-tested supported   | Adds caller classes to the listbox panel.                                                                          |
|  19 | `appendTo`              | Explicitly deprecated no-op | Retained for binding compatibility; the panel stays rendered in place.                                             |
|  20 | `overlayOptions`        | Explicitly deprecated no-op | Retained for binding compatibility; overlay configuration is not interpreted.                                      |
|  21 | `optionLabel`           | Behavior-tested supported   | Chooses the option field shown in the trigger and list.                                                            |
|  22 | `optionValue`           | Behavior-tested supported   | Chooses the value stored in the selection model.                                                                   |
|  23 | `optionDisabled`        | Behavior-tested supported   | Marks options disabled and blocks their selection.                                                                 |
|  24 | `optionGroupLabel`      | Explicitly deprecated no-op | Retained for binding compatibility; grouped options are not rendered.                                              |
|  25 | `optionGroupChildren`   | Explicitly deprecated no-op | Retained for binding compatibility; grouped options are not rendered.                                              |
|  26 | `dataKey`               | Behavior-tested supported   | Compares object selections by the configured identity field.                                                       |
|  27 | `group`                 | Explicitly deprecated no-op | Retained for binding compatibility; option groups are not rendered.                                                |
|  28 | `filter`                | Behavior-tested supported   | Shows the filter input and activates filtering.                                                                    |
|  29 | `filterPlaceholder`     | Behavior-tested supported   | Sets the filter input placeholder.                                                                                 |
|  30 | `filterValue`           | Behavior-tested supported   | Filter text model; drives filtering and can be changed by filter input events.                                     |
|  31 | `filterBy`              | Behavior-tested supported   | Comma-separated option fields used for search.                                                                     |
|  32 | `filterFields`          | Behavior-tested supported   | Explicit list of option fields used for search; takes precedence over `filterBy`.                                  |
|  33 | `filterLocale`          | Behavior-tested supported   | Applies locale-aware lowercasing during text filtering.                                                            |
|  34 | `filterMatchMode`       | Behavior-tested supported   | Supports the declared text, membership, and numeric comparison modes.                                              |
|  35 | `ariaFilterLabel`       | Behavior-tested supported   | Sets the filter input accessible name.                                                                             |
|  36 | `clearAriaLabel`        | Behavior-tested supported   | Sets the clear button accessible name, with a fallback when omitted.                                               |
|  37 | `selectAllLabel`        | Behavior-tested supported   | Supplies the select-all button label.                                                                              |
|  38 | `clearAllLabel`         | Behavior-tested supported   | Supplies the clear-all label after all selectable options are selected.                                            |
|  39 | `showClear`             | Behavior-tested supported   | Conditionally renders a clear control for nonempty selection.                                                      |
|  40 | `showToggleAll`         | Behavior-tested supported   | Controls whether the select-all/clear-all control is rendered.                                                     |
|  41 | `showHeader`            | Behavior-tested supported   | Hides the select-all/clear-all header control.                                                                     |
|  42 | `maxSelectedLabels`     | Behavior-tested supported   | Summarizes labels after the configured threshold; defaults to `{count} items selected`.                            |
|  43 | `selectedItemsLabel`    | Behavior-tested supported   | Replaces `{0}` in the selected-count summary.                                                                      |
|  44 | `selectionLimit`        | Behavior-tested supported   | Blocks adding selections above the limit and constrains select-all.                                                |
|  45 | `emptyFilterMessage`    | Behavior-tested supported   | Supplies the empty state when a filter has no matches.                                                             |
|  46 | `emptyMessage`          | Behavior-tested supported   | Supplies the empty state when no options are available.                                                            |
|  47 | `resetFilterOnHide`     | Behavior-tested supported   | Resets filter text when the panel closes if enabled.                                                               |
|  48 | `loading`               | Behavior-tested supported   | Shows a loading message and suppresses the option list; defaults to “Loading…” when no custom message is supplied. |
|  49 | `loadingIcon`           | Explicitly deprecated no-op | Retained for binding compatibility; loading uses text only.                                                        |
|  50 | `loadingMessage`        | Behavior-tested supported   | Renders the loading text when loading is active.                                                                   |
|  51 | `lazy`                  | Explicitly deprecated no-op | Retained for binding compatibility; lazy loading is not implemented.                                               |
|  52 | `virtualScroll`         | Explicitly deprecated no-op | Retained for binding compatibility; virtual scrolling is not implemented.                                          |
|  53 | `virtualScrollItemSize` | Explicitly deprecated no-op | Retained for binding compatibility; virtual scrolling is not implemented.                                          |
|  54 | `virtualScrollOptions`  | Explicitly deprecated no-op | Retained for binding compatibility; virtual scrolling is not implemented.                                          |
|  55 | `autofocus`             | Explicitly deprecated no-op | Retained for binding compatibility; the trigger is not autofocus-enabled.                                          |
|  56 | `autofocusFilter`       | Behavior-tested supported   | Applies the native autofocus setting to the filter input.                                                          |
|  57 | `focusOnHover`          | Explicitly deprecated no-op | Retained for binding compatibility; hover does not change selection focus.                                         |
|  58 | `selectOnFocus`         | Explicitly deprecated no-op | Retained for binding compatibility; focus does not select an option.                                               |
|  59 | `autoOptionFocus`       | Explicitly deprecated no-op | Retained for binding compatibility; opening does not automatically focus an option.                                |
|  60 | `dropdownIcon`          | Explicitly deprecated no-op | Retained for binding compatibility; the dropdown icon is fixed.                                                    |
|  61 | `chipIcon`              | Explicitly deprecated no-op | Retained for binding compatibility; comma display has no chip icon slot.                                           |
|  62 | `display`               | Explicitly deprecated no-op | Retained for binding compatibility; selected values render comma-separated.                                        |
|  63 | `autocomplete`          | Explicitly deprecated no-op | Retained for binding compatibility; no native autocomplete input is rendered.                                      |
|  64 | `size`                  | Explicitly deprecated no-op | Retained for binding compatibility; this component has no size variants.                                           |
|  65 | `tooltip`               | Explicitly deprecated no-op | Retained for binding compatibility; tooltip rendering is not provided.                                             |
|  66 | `tooltipPosition`       | Explicitly deprecated no-op | Retained for binding compatibility; tooltip rendering is not provided.                                             |
|  67 | `tooltipPositionStyle`  | Explicitly deprecated no-op | Retained for binding compatibility; tooltip rendering is not provided.                                             |
|  68 | `tooltipStyleClass`     | Explicitly deprecated no-op | Retained for binding compatibility; tooltip rendering is not provided.                                             |
|  69 | `autoZIndex`            | Explicitly deprecated no-op | Retained for binding compatibility; in-place panels do not use z-index management.                                 |
|  70 | `baseZIndex`            | Explicitly deprecated no-op | Retained for binding compatibility; in-place panels do not use z-index management.                                 |
|  71 | `open`                  | Behavior-tested supported   | Model controls panel visibility; opening/closing emits lifecycle outputs and resets state as configured.           |

## Changes and verification

Four runtime defects were fixed within `MultiSelectComponent`: a configured `dataKey` previously made distinct primitive values compare equal because both lacked that property, and `maxSelectedLabels` had no effect unless a custom summary template was supplied. The default summary is now `{0} items selected`. The `fluid` class also now sets the root width to 100%, and loading now has a visible default message when no custom text is supplied.

Focused assertions are in `projects/orc-ds/multi-select-contract.spec.ts`, alongside existing contract checks. The focused Angular/Karma run passed **15/15** tests using Node 24.16.0. The captured output is in [focused-tests.log](focused-tests.log).

No active input/model remains unverified in this audit. Deprecated no-op inputs remain API-compatible and are individually marked `@deprecated` in the component source; callers should not rely on them to activate omitted features.
