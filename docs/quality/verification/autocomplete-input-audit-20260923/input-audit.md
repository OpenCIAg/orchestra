# AutocompleteComponent input audit — 2026-09-23

## Result

The public binding surface contains **34 entries**: 33 signal inputs plus the `value` model. The audit found **34 behavior-tested supported bindings, 0 explicitly deprecated no-op bindings, and 0 unverified bindings**. Compatibility names remain live inputs with defined precedence; none are silently ignored. Existing composition handling and form, disabled/read-only, and keyboard behavior remain covered by the component spec.

One accessibility defect was repaired: when both `label` and `ariaLabel` were empty, the combobox had no accessible name. The input now gets the fallback name “Autocomplete” only in that case; a visible label keeps its native label association and explicit `ariaLabel` still takes precedence.

## Input-by-input evidence

| Binding             | Classification | Behavior evidence                                                                                                                                                                     |
| ------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                | Supported      | `honors option and threshold aliases…`: used as the fallback ID.                                                                                                                      |
| `inputId`           | Supported      | `applies identity, native text…`: overrides `id` and is reflected by the label association and helper/error IDs.                                                                      |
| `name`              | Supported      | `applies identity, native text…`: reaches the native input.                                                                                                                           |
| `label`             | Supported      | `applies identity, native text…`: renders a label associated with the input.                                                                                                          |
| `placeholder`       | Supported      | `applies identity, native text…`: reaches the native placeholder.                                                                                                                     |
| `helperText`        | Supported      | `applies identity, native text…`: renders and connects helper text using `aria-describedby`.                                                                                          |
| `errorMessage`      | Supported      | `applies identity, native text…`: marks invalid, replaces helper description, and renders error text.                                                                                 |
| `options`           | Supported      | `filters from the native input…`; `honors option and threshold aliases…`: filters the fallback option source.                                                                         |
| `suggestions`       | Supported      | `reflects external value changes…`; `honors option and threshold aliases…`: overrides `options`, including when explicitly empty.                                                     |
| `minChars`          | Supported      | `debounces opening…`; `applies the minimum length…`: controls the default minimum length.                                                                                             |
| `minLength`         | Supported      | `honors option and threshold aliases…`; `applies the minimum length…`: overrides `minChars`.                                                                                          |
| `clearable`         | Supported      | `supports clear controls…`: controls the clear button when `showClear` is unset.                                                                                                      |
| `showClear`         | Supported      | `supports clear controls…`: explicit false hides and true shows the clear button.                                                                                                     |
| `loading`           | Supported      | `renders empty and loading states…`; `binds loading status…`: shows loading status and sets listbox `aria-busy`.                                                                      |
| `dropdown`          | Supported      | `starts ArrowUp…`; `supports clear controls…`; `applies the minimum length…`: shows and operates the dropdown button and allows focus/open interactions.                              |
| `emptyMessage`      | Supported      | `renders empty and loading states…`; `honors option and threshold aliases…`: custom empty-result status text is rendered.                                                             |
| `loadingMessage`    | Supported      | `renders empty and loading states…`; `binds loading status…`: custom loading status text is rendered.                                                                                 |
| `clearAriaLabel`    | Supported      | `supports clear controls…`: custom accessible name reaches the clear button.                                                                                                          |
| `dropdownAriaLabel` | Supported      | `starts ArrowUp…`; `supports clear controls…`: default and custom dropdown names are rendered.                                                                                        |
| `disabled`          | Supported      | `honors disabled and readonly states…`: native disabled state blocks programmatic toggles and clearing.                                                                               |
| `readonly`          | Supported      | `honors disabled and readonly states…`; `supports clear controls…`: native readonly/ARIA state and non-actionable controls are verified.                                              |
| `required`          | Supported      | `applies identity, native text…`: native required state and required label marker are enabled.                                                                                        |
| `ariaLabel`         | Supported      | `applies identity, native text…`; `honors option and threshold aliases…`: sets the input/listbox name; fallback name is tested when no label is supplied.                             |
| `style`             | Supported      | `honors option and threshold aliases…`: host style reaches the root element.                                                                                                          |
| `styleClass`        | Supported      | `honors option and threshold aliases…`: consumer class is applied to the root element.                                                                                                |
| `panelStyle`        | Supported      | `honors option and threshold aliases…`: panel style reaches the listbox.                                                                                                              |
| `panelStyleClass`   | Supported      | `honors option and threshold aliases…`: consumer class is applied to the listbox.                                                                                                     |
| `appendTo`          | Supported      | `attaches the panel…`; `attaches to body…`; `positions body and static custom panels…`: body/custom attachment, click containment, positioning, and teardown are exercised.           |
| `delay`             | Supported      | `debounces opening…`; `defers IME input commits…`; `applies the minimum length…`: delayed, canceled, immediate, and composition-aware opening are covered.                            |
| `forceSelection`    | Supported      | `clears a selected CVA value…`; `commits free text…`; `defers IME input commits…`: invalid query clearing, typed option resolution, and post-composition blur resolution are covered. |
| `autoHighlight`     | Supported      | `applies the minimum length…`: opens on the first enabled filtered option and exposes `aria-activedescendant`.                                                                        |
| `showEmptyMessage`  | Supported      | `renders empty and loading states…`: hiding the empty message suppresses the otherwise empty panel.                                                                                   |
| `closeOnEscape`     | Supported      | `applies the minimum length…`; existing show/hide test: Escape both closes by default and remains available to the host when disabled.                                                |
| `value` (model)     | Supported      | `reflects external value changes…`; `binds loading status…`; reactive-form tests: programmatic model updates, selected display, CVA reads/writes, and user changes are covered.       |

## Compatibility and interaction contracts

There are no deprecated no-op inputs in these 34 bindings. The compatibility-style names intentionally remain active: `inputId` takes precedence over `id`; `suggestions` takes precedence over `options` while `undefined` falls back and `[]` means no suggestions; `minLength` takes precedence over `minChars`; and `showClear` takes precedence over `clearable`. These precedence rules preserve older and newer template bindings without making either name inert.

The existing IME contract is directly behavior-tested: interim composition input stays visible without committing the model or replacing the current filter set; `compositionend` applies the committed text; and composing keydown (including `keyCode=229`) does not trigger option movement, selection, or Escape dismissal. Disabled and read-only paths remain guarded. The same spec covers disabled option skipping, Home/End, Escape, Enter, CVA touch/update, force selection, deferred blur, and detached overlay behavior.

## Evidence and remaining risks

Focused validation command:

```text
PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH NG_BUILD_MAX_WORKERS=2 ORC_KARMA_PORT=9893 ./node_modules/.bin/ng test orc-ds --watch=false --browsers=ChromeHeadlessCI --include=projects/orc-ds/autocomplete/autocomplete.component.spec.ts
```

Result: **25/25 focused Autocomplete specs passed**. Full output is in [focused-tests.log](focused-tests.log).

Remaining risks are outside this focused input audit: native screen-reader/browser combinations were not exercised, and browser-native IME implementations vary beyond the synthetic composition event sequences in the unit suite. Runtime option data is typed but malformed external values are not separately validated at the component boundary.
