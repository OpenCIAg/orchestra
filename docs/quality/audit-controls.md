# Controls and form primitives audit

Read-only audit completed 2026-09-08 in `projects/orc-ds`. The review covered every implementation, template, stylesheet, declaration, index, package manifest, and test file under the requested directories, plus `p0-foundations.spec.ts` and `p1-core.spec.ts`. No implementation files were changed during this audit. `ng build orc-ds` completes successfully on the baseline.

## Coverage

### Current-source status (2026-09-24)

The source-freeze-31 checkpoint is historical. The latest integrated suite passes **1464/1464** under Jasmine seeds 4321 and 20260923, with **36/36** Chromium/Firefox/WebKit Playwright checks, docs tests (**82/82**), library/docs/template builds, current/minimum package consumers, compatibility, SSR (**147/147**), themes (**6/6** each), inventory, and documentation integrity; see the [latest enterprise component gate](verification/enterprise-component-followup-20260924/gate-summary.md). The latest public-input audit wave covers Calendar, Tree, Input, Button, Dropdown, DataView, Galleria, PickList, ProgressBar, ProgressCircle, Inplace, and Image. Inplace also moved to a focused P2 module with the old export preserved. ProgressCircle's static indeterminate state, complete animation controls, numeric size attributes, and accessible text now have direct contracts. Image's full 27-input contract and cross-browser modal focus restoration now have direct coverage. Findings below retain the original audit snapshot; an unannotated baseline finding is not necessarily a current defect.

### Cross-family reconciliation — 2026-09-23

The current source batch also closes the DatePicker dismissal gap: an open popup listens for capture-phase outside `mousedown`, popup `Escape`, and focus leaving the widget, then restores the trigger without reopening. The DatePicker behavior suite and `date-picker-overlay.spec.ts` are the evidence references; this note records source/spec scope and does not replace the final release-gate report.

The P2 Panel, Fieldset, and FloatLabel primitives now have explicit toggle, native label/legend, ARIA, variant, and focused/filled-state paths in source. Six focused DOM/ARIA/variant contracts in `p2-primeng-gap-layout-contract.spec.ts` cover those paths, including FloatLabel inline positioning and Fieldset toggle-spacing mirroring in RTL/LTR; the separate expansion/runtime evidence records 119/119 specs. Panel's `legend` and `transitionOptions` are documented deprecated compatibility no-ops; FloatLabel label association remains owned by projected consumer markup.

The latest ColorPicker source/spec update adds fallback accessible names for the clear action and unlabeled swatch trigger while preserving explicit labels. `color-picker-behavior.spec.ts` covers the focused contract at 5/5; `appendTo`, `showTransitionOptions`, and `hideTransitionOptions` are documented deprecated compatibility no-ops. This source/spec state is included in the 989/989 source-freeze-3 result.

Select filtering now keeps the query intact until applying the configured locale. Previously, both data-backed and projected options lowercased the query using the host default locale first, so Turkish `I` queries could fail even when `filterLocale="tr-TR"` was set. The data/projected-option filtering and default/overridden clear/removal action names, announced loading, and data/projected empty states now pass in the 16/16 Select verification: verification/select-filter-locale-batch/gate-summary.md (archived, see release CI artifacts).

The reviewed public components/directives are:

- `SelectComponent` and `OptionComponent` (`select`), including `SelectOption` and select types.
- `AutocompleteComponent` (`autocomplete`) and `AutocompleteOption`.
- `CheckboxComponent` (`checkbox`), `CheckboxChangeEvent`, and `CheckboxAriaChecked`.
- `RadioButtonComponent` and `RadioGroupComponent` (`radio`), including the group injection context and radio types.
- `SwitchComponent` (`switch`), exposed through the `orc-switch`, `orc-toggle-switch`, and `orc-toggle` selectors and switch types; `ToggleComponent` is the export alias in `toggle`.
- `SliderComponent` (`slider`), `SliderValue`, marks, and slider types.
- `RatingComponent` (`rating`).
- `OtpInputComponent`, `OtpGroupComponent`, `OtpSlotComponent`, and `OtpSeparatorComponent` (`otp-input`), including OTP context/types.
- `ChipInputComponent` (`chip-input`).
- `FileUploaderComponent` and `FileItemComponent` (`file-uploader`), including `FileItemData`/`FileStatus` and checked-in declaration files.
- `InputComponent` and `TextareaComponent` (`input`), their mask utility and input types; `TextInputComponent` is the `text-input` export alias.
- `NumberInputComponent` (`number-input`).
- `ColorPickerComponent` and `ColorPicker` alias (`color-picker`).
- `FormComponent` (`form`) and `FormFieldComponent` (`form-field`).
- `DraggableDirective` and `DroppableDirective` (`drag-drop`).
- `DeferDirective` (`defer`).

Historical baseline tests reviewed during the 2026-09-08 source pass: `projects/orc-ds/p0-foundations.spec.ts`, `projects/orc-ds/p1-core.spec.ts`, `input/input.component.spec.ts`, `input/textarea.component.spec.ts`, and `checkbox/checkbox.component.spec.ts`. Additional focused specs and repairs are linked in the current-source notes below.

## Findings and bounded repair batches

### Resolved 2026-09-22: Select active option IDs and invalid state

Data and projected options now expose stable IDs that match the rendered DOM. Keyboard navigation and active descendants use the same visible/enabled option set, including dynamic projected disable changes and duplicate data-object references. The trigger's generated accessible name and helper/error relationships use stable IDs; an error message alone sets invalid state. `select-repair.spec.ts` passes 8/8 focused browser cases for keyboard/Enter behavior, disabled alignment, IDs and relationships.

### Slider — source contract repaired; broader visual review remains

`SliderComponent` now finite-checks and normalizes CVA writes, preserves legitimate zero endpoints, clamps values, sorts reversed ranges, validates nonfinite/invalid min-max and step inputs, and exposes `hasInvalidRange()` while using a one-unit geometry fallback. Vertical styles position fill, ticks, and thumbs on the vertical axis. Global pointer move/up/cancel handlers reject unrelated pointer IDs and use the owning document window; autofocus now focuses the primary thumb once and skips work after disable/destroy. The focused suite passes **7/7** (`verification/slider-contract-batch/focused-runtime.log`). Real-device visual review, RTL geometry, and exact narrow-width behavior remain.

### Resolved 2026-09-22: ColorPicker black parsing and HSV/HSB ranges

`update()` now distinguishes parse failure from a valid RGB black value. `#000`, `#000000`, three-channel `rgb(0, 0, 0)`, and supported `hsv(0, 0%, 0%)`/`hsb(0, 0%, 0%)` inputs preserve black; HSV/HSB hue, saturation and brightness are bounded to 0–360 and 0–100. `color-picker-behavior.spec.ts` covers black formats, rejected out-of-range values and inclusive upper boundaries. Alpha-channel `rgba()` parsing is not part of this component's format contract.

### Resolved 2026-09-22; iframe observer follow-up 2026-09-23: structural Defer and Autocomplete contracts

`DeferDirective` now observes a real structural sentinel and has focused coverage for structural instantiation, one-shot loading, fallback behavior, observer callbacks, destroy cleanup, and owner-window observer selection for same-origin iframe targets (`defer.directive.spec.ts`, 5/5).

Autocomplete renders empty/loading states correctly, preserves programmatic CVA values under `forceSelection`, and routes outside, Escape and selection dismissal through a single close path that emits `onHide`. Its direct tests also cover external value/suggestion updates, empty-message policy, active-descendant naming, keyboard boundaries and IME composition/cancel behavior (`autocomplete.component.spec.ts`, `input-repair.spec.ts`).

### P1: uploader lifecycle and file limits

Current-source status (2026-09-23): immutable status/progress updates, HTTP error retry behavior, custom upload delegation, cancellation, queued auto-upload, and boolean coercion of `forceDragover` (including string `"false"`) are covered by `file-uploader-behavior.spec.ts` in an 18/18 focused suite. Basic/advanced modes, choose/upload/cancel icons, visibility, labels/styles, and limits are supported paths; no no-op input was identified. This source/spec state is included in the 989/989 source-freeze-3 result.

Current-source status (2026-09-22): owned preview URLs are tracked and revoked on failed decode, remove, clear, replacement, and destroy; caller-owned URLs are preserved. File-limit overflow keeps accepted files, emits rejected files through `onError`, and uses the configured `{0}` message placeholders. Direct coverage is in `file-uploader-behavior.spec.ts`.

The dropzone now leaves the tab order when disabled/full, and keyboard activation is guarded; direct tests cover both states. Basic/advanced modes, choose/upload/cancel icons, style classes, and button labels are bound in the template. Theme-level dropzone/error announcement review and finer mode-specific parity remain bounded visual/API follow-ups.

### P1: form control and keyboard/CVA behavior

`CheckboxComponent`'s indeterminate contract has since been implemented and verified by `checkbox.component.spec.ts` and `controls-repair.spec.ts`. The visual pass now consumes the public `variant` (`filled`/`outlined`) and `size` (`small`/`large`) inputs, uses the established subtle surface for filled controls, and keeps an unlabeled wrapped host at a 24×24 pointer target while the visible box receives the keyboard focus ring. Regressions are covered in `checkbox.component.spec.ts` (8 tests) and the combined checkbox/control run (15 tests).

Historical baseline: `RadioGroupComponent.isError()` ignored `errorMessage()` (`radio-group.component.ts:62-64`), leaving message-only errors without invalid state. The 2026-09-22 radio batch now includes the message in derived invalid state and tests group ARIA. Standalone `RadioButtonComponent` remains intentionally display-only without an individual CVA or checked model; no separate form contract was inferred.

**Resolved 2026-09-23:** `SwitchComponent` exposes `aria-required`, accepts configured `trueValue`/`falseValue` through the CVA callback, and keeps readonly switches focusable/announced while guarding activation. `controls-repair.spec.ts` covers required state, custom values, readonly behavior, and fallback from whitespace-only naming overrides to the visible label. The compatibility aliases `ariaLabelledby`/`ariaLabelledBy` remain to avoid a breaking input removal.

**Resolved 2026-09-22:** Rating CVA writes and user changes now clamp to a finite range, Home uses the advertised minimum, readonly state is explicit in ARIA, and initial autofocus moves focus to the actual slider. `rating-behavior.spec.ts` covers those paths. A late change to the autofocus input after view initialization does not trigger refocus.

`OtpInputComponent` now clamps non-positive/invalid lengths to at least one, tracks length changes, supplies a group label and generated slot names, hides its visual separator from assistive technology, normalizes numeric paste, filters numeric entry, and tests forward/arrow focus movement and deletion boundaries. Existing CVA tests cover touched/blur behavior. Nonnumeric configuration and physical-device keyboard behavior remain broader checks. `ChipInputComponent` now has an explicit eight-case contract for IME Enter, Backspace boundaries, duplicate paste, removal bounds, disabled guards, and CVA blur ordering; `TagsInputComponent` additionally covers suggestions, configured paste separators, duplicate/max filtering, and one CVA update per paste. Cross-browser IME/paste behavior and broader event interleavings remain open.

**Resolved 2026-09-22:** Input clear/password actions are keyboard reachable, have default accessible names with localized overrides, and clear calls the CVA touched callback. `input-repair.spec.ts` covers action naming/focus order, touched state, and initial textarea auto-resize after a form write. Masked input `maxlength` intentionally follows the formatted mask width (including literals), matching the native value the user edits rather than the count of data tokens.

**Resolved 2026-09-22:** `NumberInputComponent` uses a safe positive step when the configured step is nonfinite or nonpositive, and `clear()` marks the control touched. `input-repair.spec.ts` covers invalid-step increment and CVA touch; broader locale/currency and keyboard boundary combinations remain.

### P1: form wrappers and drag/drop

`FormFieldComponent` now uses a reset-styled `<fieldset>/<legend>` group, boolean-coerces its visual required marker, and connects helper/error text to the group. Each projected control still needs its own accessible name and owns its native validation; the group label does not replace a control label. Its optional `id` input provides a stable base for the fieldset, legend, helper, and error IDs; those references update when `id` changes, and generated fallback IDs remain unique within the rendered page. `FormComponent` has a default accessible name (`Formulário`) matching its docs and now falls back to that name when an override is blank. Its stacked/inline layout uses the shared spacing token. The focused `form-shell-contract.spec.ts` suite passes 16/16 across all public inputs, native and programmatic submission/reset, actual submitter identity, disabled fieldsets and Enter handling, projected radio groups, stable ID changes, and axe validation. **Resolved 2026-09-23:** all valid and invalid submit attempts that reach the form submit event emit `formSubmit` with the current validity result. The default `novalidate=true` keeps native UI closed; setting it false calls `reportValidity()` for invalid controls, while a submitter with `formnovalidate` bypasses that UI.

**Resolved 2026-09-23:** `DraggableDirective` writes the private `application/x-orc-drag-scope` marker and `DroppableDirective` validates the configured scope on drop. Protected dragenter/dragover payloads use the MIME marker in `DataTransfer.types`; the actual scope payload is checked when the browser exposes it during drop. Draggable `disabled` changes now reactively update the native `draggable` property. Droppable active/disabled state is exposed through `orc-droppable--active`, `orc-droppable--disabled`, and `aria-disabled`, while the existing `aria-dropeffect` compatibility attribute remains. `drag-drop.directive.spec.ts` covers matching and mismatching scopes, protected dragover behavior, strict drop rejection, dynamic disabled transitions, and state cleanup (4/4). Native browser drag data restrictions still mean exact scope matching is finalized at drop time.

## Radio contract milestone (2026-09-22)

The focused radio batch reproduced and repaired source-backed defects: a disabled selected value no longer suppresses the first enabled roving tab stop; group arrow navigation follows physical DOM order after projection reorder/removal; arrow selection invokes the target child once with the original keyboard event; group CVA touching occurs only when focus leaves the group; and standalone same-name radios synchronize their visual checked signals within the same native form owner/tree root, including runtime name changes. The group error state also includes a supplied error message, and radio size/filled variants now have bounded visual rules.

Coverage is in `projects/orc-ds/radio/radio-contract.spec.ts`: 15 focused DOM/CVA tests cover disabled-selected and all-disabled keyboard entry, group-boundary `updateOn: 'blur'`, external writes/reset and disabled propagation without child output, native click event cardinality, keyboard event fidelity, dynamic order/removal, disconnected-node fallback, form/tree-scoped standalone exclusivity, runtime names, projected content, and size/variant classes plus programmatic focus. The baseline and final runner evidence is under `docs/quality/verification/radio-contract-batch/`.

The standalone radio surface remains intentionally display-only and has no individual CVA; no new per-radio form contract was invented. Group native form integration, projection, and keyboard behavior are covered. Initial focused radio-only and normal library-target runs passed 11/11; the root-reviewed follow-up passed **15/15** with Karma port 9876. See workspace-run.log: verification/radio-contract-batch/workspace-run.log (archived, see release CI artifacts) and follow-up-radio-contract.txt: verification/radio-contract-batch/follow-up-radio-contract.txt (archived, see release CI artifacts). Configured SSR, physical keyboard use, and narrow-width visual review remain separate gates.

## Low-value or misleading wrappers

`text-input/text-input.component.ts` and `toggle/toggle.component.ts` are export aliases only; they add no component behavior. Keep them as documented compatibility aliases or remove separate package entry points. The revised `FormFieldComponent` provides fieldset/legend grouping and descriptive state, but intentionally does not infer or mutate validation on projected controls. `SelectComponent` currently marks these compatibility inputs `@deprecated`: `overlayOptions`, `autofocusFilter`, `editable`, `checkmark`, `optionGroupLabel`, `optionGroupChildren`, `autoDisplayFirst`, `group`, `virtualScrollItemSize`, `virtualScrollOptions`, `itemSize`, `selectOnFocus`, `showTransitionOptions`, `hideTransitionOptions`, `tooltip`, `tooltipPosition`, `tooltipPositionStyle`, and `tooltipStyleClass`. `lazy` and `virtualScroll` only emit an initial `onLazyLoad` range when the panel opens; there is no virtual viewport rendering or incremental lazy loading. `appendTo`, `autoOptionFocus`, filtering, selection and CVA remain separate supported/covered paths. Calendar's inert `inline` and `dateFormat` compatibility inputs are now formally deprecated; its date/time, constraints, locale, selection-mode and disabled-date/day contracts are covered in the 119/119 expansion evidence. `BlockUi.target` is a supported target contract: element, selector, ElementRef and `getBlockableElement()` targets receive a scoped scrim plus busy/inert semantics; without a target, BlockUi confines the scrim to its projected host. Unresolved selectors and targets containing the BlockUI host are rejected without falling back to the projected host or inerting the containing area. `ConfirmationRequest.key` remains a compatibility-only field because ConfirmDialog does not bind keyboard shortcuts from request keys. ColorPicker `appendTo`, `showTransitionOptions`, and `hideTransitionOptions` are formally deprecated compatibility no-ops, while its clear and unlabeled-trigger names are covered. The same bounded approach applies to uploader mode/icons and other compatibility inputs.

## Recommended regression order

1. **Resolved:** Select active-descendant IDs and message-only invalid state; ColorPicker black parsing/ranges; structural Defer observation; and FileUploader upload state, cancellation, object-URL ownership, limit reporting and disabled/full keyboard state.
2. Continue shared CVA boundary coverage for NumberInput locale/currency/precision and async external writes interleaved with disabled/read-only/touched transitions across the remaining controls.
3. Expand browser accessibility checks for remaining name/description and nested-interaction cases, including button groups, listboxes, image/range controls, and decorative versus live status semantics.
4. Continue performance/lifecycle coverage for remaining overlay teardown policies, native drag/drop scope behavior, observers/timers, and dynamically changing composite-control inputs.
