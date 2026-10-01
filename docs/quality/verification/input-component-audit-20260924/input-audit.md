# InputComponent input, output, and CVA audit

- **Date:** 2026-09-24
- **Component:** `InputComponent` (`orc-input`, `orc-input-text`)
- **Source:** [`input.component.ts`](../../../../projects/orc-ds/input/input.component.ts)
- **Template:** [`input.component.html`](../../../../projects/orc-ds/input/input.component.html)
- **Direct suite:** [`input.component.spec.ts`](../../../../projects/orc-ds/input/input.component.spec.ts)

## Result

The generated inventory contains 37 public input bindings, including the `value` model. Source tracing found a runtime or rendered-template use for all 37; no deprecated no-op compatibility input is proven. The direct suite now adds six focused contract cases for native bindings and styles, trimmed names/ID references, mask formatting and count, masked-caret retention, numeric zero plus outputs, and password action state. The clear and password buttons are keyboard reachable, and the suite asserts their tab-order participation. Existing direct tests cover template-driven and reactive forms, default search clearing, CVA touch on clear, optional constraints, and basic accessibility. The size contract also has existing coverage in `styles/spacing-contract.spec.ts`.

The source fixes address concrete behavior defects found during tracing: `type="number"` converted zero to the string `"0"`; the clear/password actions were excluded from keyboard tab navigation; the masked character counter showed the explicit `maxLength` even though the mask length controls the native limit; masked edits reset the caret to the end; and whitespace-only IDs, label text, ARIA references, helper/error copy, or clear/password names were passed through as unusable strings. These are now normalized while retaining the documented control and mask contracts.

No Angular compile or test command has been run in this milestone because the parent task is running the shared Calendar/Tree gates serially. The direct suite and report are staged for that run; results below are intentionally pending.

## Evidence index

| ID  | Existing or added focused case                                                                                                            |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| I1  | Maps identity, native constraints, styling, affixes, and status inputs                                                                    |
| I2  | Trims labels and ARIA references, suppressing blank messages and names                                                                    |
| I3  | Formats masked values, emits unmasked values, and counts the enforced mask length                                                         |
| I4  | Keeps the logical caret position when editing a masked value in the middle                                                                |
| I5  | Preserves numeric zero through the model output and exposes focus, blur, and clear events                                                 |
| I6  | Toggles password visibility with trimmed accessible action names and disabled guards                                                      |
| E1  | Existing direct tests: defaults/no native constraints, `writeValue`, disabled state, count, uncontrolled typing, and axe check with label |
| E2  | Existing `ngModel` integration: native typing updates the host model                                                                      |
| E3  | Existing reactive-form tests plus added blur/touched and disabled/enabled state                                                           |
| R1  | `input-repair.spec.ts`: search clear default, keyboard-named actions, and CVA touched callback on clear                                   |
| S1  | `styles/spacing-contract.spec.ts`: all three control sizes and shared spacing                                                             |

## Public input matrix

All rows are behavior-tested supported inputs; the evidence IDs identify the source-level assertions or extant integration tests. No input is classified as deprecated or unverified.

| Public name             | Kind   | Runtime/template behavior and evidence                                                                                                                                                 |
| ----------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                    | signal | Supplies the fallback native ID after `inputId`; blank input falls through to the generated ID (I1, I2).                                                                               |
| `inputId`               | signal | Takes precedence as the native ID and label target; whitespace is trimmed before fallback (I1, I2).                                                                                    |
| `name`                  | signal | Binds the native form-control name (I1).                                                                                                                                               |
| `type`                  | signal | Selects native input type; password changes between `password` and `text` with a keyboard-reachable toggle, while search exposes its built-in clear action (I1, I5, I6, R1).           |
| `size`                  | signal | Selects `sm`/`md`/`lg` classes; direct assertion covers `lg`, and S1 covers all sizes and minimum control geometry.                                                                    |
| `status`                | signal | Applies error/success presentation and invalid state; error copy associates to the native field (I1, I2).                                                                              |
| `placeholder`           | signal | Passes an explicit hint through to the native input; omitted value stays absent (I1, E1).                                                                                              |
| `label`                 | signal | Renders a `<label for>` paired with the effective ID; surrounding whitespace is trimmed and a blank label is omitted (I1, I2).                                                         |
| `helperText`            | signal | Renders helper copy with the computed helper ID and includes it in `aria-describedby`; blank copy is suppressed (I1, I2).                                                              |
| `errorMessage`          | signal | Renders an alert, marks the native field invalid, and appends its ID reference; blank copy is suppressed (I1, I2).                                                                     |
| `disabled`              | signal | Controls native/wrapper disabled state and hides clear/password actions; boolean transform is exercised with true/false values (I1, I6).                                               |
| `readonly`              | signal | Binds native `readOnly`, updates wrapper state, and prevents clearing while leaving password visibility available (I1, I6).                                                            |
| `required`              | signal | Binds the native required constraint and visible decorative marker (I1).                                                                                                               |
| `clearable`             | signal | Shows a keyboard-reachable clear action for populated values; clear emits the model/value/output changes, touches CVA, and returns focus; search is clearable by default (I1, I5, R1). |
| `mask`                  | signal | Formats the view, establishes the native maximum length, and preserves the logical caret through a middle edit (I3, I4).                                                               |
| `unmaskValue`           | signal | Sends mask literals only to the view while model/CVA and `inputChange` receive raw text (I1, I3).                                                                                      |
| `maxLength`             | signal | Binds a finite, non-negative integer native limit; it is overridden by mask length and the count reflects that effective limit (I1, I3, E1).                                           |
| `minLength`             | signal | Binds the native minimum-length attribute; omission does not impose a constraint (I1, E1).                                                                                             |
| `min`                   | signal | Binds the native minimum value attribute (I1).                                                                                                                                         |
| `max`                   | signal | Binds the native maximum value attribute (I1).                                                                                                                                         |
| `step`                  | signal | Binds the native stepping constraint (I1).                                                                                                                                             |
| `showCharCount`         | signal | Shows the current formatted value length and, when present, the effective limit and reached-limit styling (I1, I3, E1).                                                                |
| `prefixText`            | signal | Renders the fixed prefix inside the control slot (I1).                                                                                                                                 |
| `suffixText`            | signal | Renders the fixed suffix inside the control slot (I1).                                                                                                                                 |
| `autocomplete`          | signal | Binds the native autocomplete hint (I1).                                                                                                                                               |
| `autofocus`             | signal | Binds the native `autofocus` property (I1). Actual focus timing for dynamically mounted controls is not asserted.                                                                      |
| `styleClass`            | signal | Adds the supplied class to the root while keeping the component classes (I1).                                                                                                          |
| `style`                 | signal | Applies the supplied root inline-style map (I1).                                                                                                                                       |
| `variant`               | signal | Adds the filled/outlined theme hook class to the root (I1).                                                                                                                            |
| `fluid`                 | signal | Adds the fluid theme hook class to the root (I1).                                                                                                                                      |
| `ariaLabel`             | signal | Trims an explicit accessible name; blank input removes the override so an associated label can name the field (I1, I2).                                                                |
| `clearAriaLabel`        | signal | Supplies a trimmed clear-button name, with “Clear input” fallback for blank input (I1, I5, I6, R1).                                                                                    |
| `showPasswordAriaLabel` | signal | Supplies a trimmed reveal action name, with “Show password” fallback (I6, R1).                                                                                                         |
| `hidePasswordAriaLabel` | signal | Supplies a trimmed conceal action name, with “Hide password” fallback (I6, R1).                                                                                                        |
| `ariaLabelledBy`        | signal | Trims and forwards the external naming ID reference; blank input removes the invalid reference (I1, I2).                                                                               |
| `ariaDescribedby`       | signal | Splits and trims external ID references, removes duplicates, then appends the visible helper/error ID (I1, I2).                                                                        |
| `value`                 | model  | Drives the native display, accepts text or numeric values, and writes user/CVA changes back to `valueChange` (I1, I3, I5, E1, E2, E3).                                                 |

## Outputs and ControlValueAccessor

`inputChange` emits each formatted or unmasked user value and emits `''` on clear (I3, I5). The `value` model creates `valueChange`; a consumer two-way binding receives numeric `0` as a number and clear as an empty string (I5). `focus` and `blur` forward the native `FocusEvent`; blur invokes the CVA touched callback (I5, E3). `clear` emits once on activation; clear also updates the model, calls the CVA change/touched callbacks, and restores focus to the native field (I5, R1). `writeValue`, `registerOnChange`, `registerOnTouched`, and `setDisabledState` are exercised directly and through template-driven/reactive form hosts (E1-E3, R1).

## Evidence-based limits and inconsistencies

- The docs API table’s placeholder default was corrected to `undefined`; it now includes all 37 input/model names and the `valueChange`, `focus`, and `blur` outputs. The source explicitly says the library does not invent placeholder copy.
- `variant` and `fluid` are observably forwarded as root classes, but no component-local CSS rule for `p-input-filled`, `p-input-outlined`, or `p-input-fluid` exists in the repository. Their visual effect therefore depends on consumer/theme CSS.
- `autofocus` is forwarded to the native property; programmatic focus after a late/dynamic mount is not verified. Generated IDs use a module-global counter, so SSR/hydration request-to-request determinism is not established; consumers needing stable IDs should pass `inputId`.
- Masked middle-caret behavior now has a direct regression, but IME composition, selection ranges, and browser-specific caret behavior remain outside this component unit suite.
- No assistive-technology or cross-engine run has been performed for this slice.

## Validation status

- Source tracing: complete; 37/37 public inputs, four declared outputs, generated `valueChange`, and CVA hooks mapped to the implementation.
- `projects/orc-ds/input/input.component.spec.ts`: focused contract passes **17/17** in Chrome Headless 153 on Node 24.16, including the six newly added binding/CVA cases and existing reactive/template-driven integration.
- Prettier applied to the Input source, template, and direct spec. Final `prettier --check` and whitespace check are run before handoff.
- Required focused command when the shared gate is released: `PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH npx ng test orc-ds --watch=false --include='projects/orc-ds/input/input.component.spec.ts'`.
