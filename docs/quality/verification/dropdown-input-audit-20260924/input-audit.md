# Dropdown input audit — 2026-09-24

This audit traces every public input declared by `DropdownComponent` through its
implementation and rendered template, then records focused browser-test
evidence. Public names and kinds come from the 2026-09-24
`docs/quality/inventory.json` snapshot. The declaration has 26 inputs: 24
signal inputs and the `value` and `visible` models.

`DropdownComponent` has two distinct modes. It is a flat action menu when
`options` is omitted, and a select-style form control whenever `options` is
provided (including an empty array). The projected element in menu mode is
owned by the caller; form mode renders its own trigger.

## Public input matrix

| Public input        | Kind   | Mode                          | Observable contract and verification                                                                                                                                                                                                                                                                                                                                                     |
| ------------------- | ------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`             | signal | Action menu                   | Renders flat action buttons and dividers. Item label, icon, shortcut, danger, disabled, action, and `id`-based tracking are used. The focused test verifies presentation, enabled and disabled actions, divider rendering, emitted `itemSelect`, and action invocation. `DropdownItem.children` is deprecated and ignored; see below.                                                    |
| `inputId`           | signal | Form                          | Sets the trigger `id` and the rendered label's `for`. Verified with an explicit id in “maps form options, accessible labels, ids, and styles through selection.” When omitted, the component generates an instance-unique id; the fallback is source-traced but not separately asserted.                                                                                                 |
| `styleClass`        | signal | Form                          | Appends classes to the field wrapper. Verified by the mapped-options test. It does not style the caller-projected menu trigger.                                                                                                                                                                                                                                                          |
| `style`             | signal | Form                          | Applies the supplied style object to the field wrapper. Verified with `minWidth`. It is not a menu-panel style input.                                                                                                                                                                                                                                                                    |
| `placement`         | signal | Both                          | Selects `bottom-start`, `bottom-end`, `top-start`, or `top-end`. The browser test checks actual overlay bounds against the anchor for all four values. Other strings currently use `bottom-start` by the implementation's default branch; that fallback is not a documented alias.                                                                                                       |
| `options`           | signal | Form when defined             | Activates select mode and supplies the flat option collection; an empty array still activates form mode. Selection and empty filtering are exercised by focused tests. Hierarchical/grouped options are not implemented.                                                                                                                                                                 |
| `optionLabel`       | signal | Form                          | Reads the display label from a dotted object path. Verified with `title.text`, including selected trigger text and listbox option text. Without it, the component uses an option's `label` field or stringifies the option.                                                                                                                                                              |
| `optionValue`       | signal | Form                          | Reads the selected form value from a dotted object path. Verified with `key`; the test checks model, CVA, and public `onChange` values after selection. Without it, the component uses an option's `value` field when non-null, otherwise the option itself.                                                                                                                             |
| `optionDisabled`    | signal | Form                          | Accepts a dotted property path or predicate. The focused tests verify the string-path and callback forms, rendered disabled state, and blocked selection.                                                                                                                                                                                                                                |
| `placeholder`       | signal | Form                          | Supplies trigger text while no option is selected. Verified by the mapped-options test before selection.                                                                                                                                                                                                                                                                                 |
| `loading`           | signal | Form                          | Sets listbox `aria-busy`, disables rendered options and the clear button, suppresses the empty state, and blocks selection/clear mutations. The focused tests verify busy/status/empty rendering, disabled options, and that a programmatic selection during loading does not update value or CVA.                                                                                       |
| `showClear`         | signal | Form                          | Shows a separate clear button only when a non-null value exists. Verified by the clear/CVA test.                                                                                                                                                                                                                                                                                         |
| `disabled`          | signal | Both                          | Form mode disables its rendered trigger and guards open/select/clear; an external change also closes an open panel. Menu mode has no owned trigger to disable, but `open()` guards the action; callers must reflect disabled state on their projected control. Form trigger/open behavior is verified in the focused tests; the existing browser lifecycle test verifies external close. |
| `filter`            | signal | Form                          | Adds a local search input; matching is case-insensitive substring search. Verified through rendered filtering and selection flow. No remote filtering or debounce is implemented.                                                                                                                                                                                                        |
| `filterPlaceholder` | signal | Form when `filter` is enabled | Sets the search input placeholder. Verified in “renders filter, loading, empty-state, and scroll inputs in the options popup.”                                                                                                                                                                                                                                                           |
| `emptyMessage`      | signal | Form                          | Displays a status message when filtering leaves no results and loading is false. Verified; loading suppresses the empty message.                                                                                                                                                                                                                                                         |
| `clearAriaLabel`    | signal | Form when clear is visible    | Supplies the clear button's accessible name. Verified with “Clear package.” The default is “Clear selection.”                                                                                                                                                                                                                                                                            |
| `filterAriaLabel`   | signal | Form when `filter` is enabled | Supplies the search input's accessible name. Verified in the filter rendering test; default is “Filter options.”                                                                                                                                                                                                                                                                         |
| `optionsAriaLabel`  | signal | Form                          | Supplies the listbox accessible name. Verified in both the mapped-options and filter tests. Defaults to `label`, then “Options.”                                                                                                                                                                                                                                                         |
| `loadingMessage`    | signal | Form while loading            | Adds a `role="status"` message only when both `loading` and this input are truthy. Verified in the filter/loading test.                                                                                                                                                                                                                                                                  |
| `filterBy`          | signal | Form when `filter` is enabled | Comma-separated dotted field paths are searched using case-insensitive substring matching; when omitted, option display text is searched. The focused filter test verifies both `label` and nested `metadata.group` matching.                                                                                                                                                            |
| `scrollHeight`      | signal | Both                          | Sets the overlay panel's CSS `max-height`; default is `200px`. Verified with an explicit `96px` value.                                                                                                                                                                                                                                                                                   |
| `resetFilterOnHide` | signal | Form when `filter` is enabled | Defaults to true and clears filter text on close; false preserves it across close/reopen. Both reset and persistence are verified.                                                                                                                                                                                                                                                       |
| `label`             | signal | Form and action menu          | In form mode, renders a label associated to the trigger and serves as fallback listbox name. In action-menu mode, names the menu, falling back to “Actions.” Form label association and listbox naming are verified; menu fallback is source-traced.                                                                                                                                     |
| `value`             | model  | Form                          | Holds the selected value and participates in Angular's `value`/`valueChange` model binding and CVA. Tests verify `writeValue`, selection updates, `valueChange`, CVA change callback, clear-to-null, and blocked updates.                                                                                                                                                                |
| `visible`           | model  | Both                          | Exposes `visible`/`visibleChange` for controlled open state. External true opens; close writes false; the focused test checks `onShow`, `onHide`, and the model output.                                                                                                                                                                                                                  |

## Outputs and lifecycle

The component also declares `itemSelect`, `onChange`, `onShow`, `onHide`,
`onClear`, `onFocus`, `onBlur`, and `filterChange`. The focused suite observes
all eight: selected menu item, selected value plus original event, open/close,
clear, trigger focus/blur, and filter text. The two model inputs additionally
produce `valueChange` and `visibleChange`, which are verified through model
subscriptions. Existing lifecycle coverage checks capture-phase outside
dismissal when another listener stops bubbling, Escape/focus return, disabled
state changes, and disposal of the detached overlay on destroy.

## Deprecated or apparently redundant surface

No declared Angular input is dead or a no-op in its applicable mode. Several
inputs are mode-specific, so they intentionally have no effect in the other
mode: `items` is for action-menu mode, while `options` and form presentation
inputs are for select mode. `style` and `styleClass` style the form wrapper;
the caller owns the projected menu trigger.

`DropdownItem.children` is the one explicitly deprecated/no-op data property:
`projects/orc-ds/dropdown/dropdown.types.ts` documents that dropdowns render a
flat menu and ignore child collections, and the focused test confirms the root
item remains actionable while children do not render. Hierarchical menus are
available through `TieredMenuComponent`; this is not an Angular component
input and is therefore not counted among the 26.

The public API does not currently expose a narrowed placement union, a panel
style/style-class input, virtual scrolling, grouped options, or remote filter
callbacks. Those are capability gaps rather than dead inputs. In particular,
`placement` is typed as `string`; consumers should use one of the four tested
values.

## Focused evidence and limits

The source/template review covered
`projects/orc-ds/dropdown/dropdown.component.ts`,
`projects/orc-ds/dropdown/dropdown.component.html`,
`projects/orc-ds/dropdown/dropdown.types.ts`, and the inventory declaration.
The focused browser coverage is
`projects/orc-ds/dropdown/dropdown-behavior.spec.ts`; its 13 tests verify the
observable behaviors summarized above. It is not a full accessibility audit
with a screen reader, nor a cross-browser positioning matrix. Browser geometry
is checked in the repository's Chrome Headless test environment.
