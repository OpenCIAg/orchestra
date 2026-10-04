# @ciag/orchestra

## 22.3.0

### Minor Changes

- 2026a43: Consolidated the three date implementations onto one shared internal calendar engine (rollover-safe ISO date parsing and key building, the fixed six-week month-grid generator with per-contract disable policies, the locale week-start derivation with its regional fallback, weekday and month labels, the roving-day keyboard state machine, the single/multiple/range selection algebra, and the PrimeNG-era `dateFormat` pattern formatter/parser) behind all three surviving public entry points: the popup `orc-date-picker` (input formatting/parsing, time editor, multi-month grids, month/year navigator views), the inline `orc-calendar`, and the native `orc-date-input`. Both date-picker selection quirks are preserved deliberately and pinned: the picker restarts a range when its bound day is clicked again while the inline calendar extends the pair (engine option `restartRangeOnSameDay`), and the date-input keeps rejecting time-suffixed strings. Public selectors, inputs, outputs, models, and event payloads are unchanged, and the date-picker's private date-value helpers dissolved into the engine. The canonical components no longer render the tier-era compatibility names (`p-datepicker`, `p-datepicker-panel`, `p-datepicker-calendar`, `p-datepicker-day`, `p-datepicker-calendar-container`, `p-datepicker-buttonbar`, `p-datepicker-fluid`, `p-inputtext`, `p-component`, `data-pc-name`): the date-input fluid hook moved from `p-datepicker-fluid` to `orc-p2-date-input--fluid`, its native field now carries an `orc-p2-date-input__native` hook, and the calendar's `orc-p2-calendar__*` state hooks are unchanged. Applications overriding the removed names on these components should target the `orc-date-picker`, `orc-date-picker__panel`, and `orc-p2-calendar`/`orc-p2-date-input` families instead. The production-used PrimeNG-era names keep working through the compatibility window and are recorded for the 23.0.0 removal manifest with their canonical replacements: `dateFormat` → the canonical ISO `yyyy-MM-dd` model with locale-driven input presentation (already a documented no-op on `orc-calendar`), `readonlyInput` → `readonly`, `dataType` → bind the model type you want (Date objects or ISO strings; no other input name exists on this component, removal-or-rename stays with the gate manifest), `selectionMode` → no other name on this component, removal-or-rename stays with the gate manifest, and `onSelect` → the `value` model (`valueChange`) plus `dateSelected` on `orc-calendar` (the picker's selection output has no other spelling on the same component, decision stays with the gate manifest).
- 00ba66b: Fixed the dark-theme status contrast and made the date family render and enforce constraints consistently. The dark theme now remaps the brand status tokens (`--color-success` #34d399, `--color-warning` #fbbf24, `--color-error` #f87171, `--color-info` #70a9ff) to dark-appropriate values instead of leaving the light palette on dark surfaces — chip warning text rises from 1.98:1 to 7.4:1, success from 2.47:1 to 7.2:1, and danger from 3.99:1 to 5.2:1 against the alpha-blended dark background; the light values are now also re-pinned in the light theme layer so a `[data-theme='light']` subtree keeps the light status palette even when the OS prefers dark and no root theme attribute is set. The chip's warning text literal (`#8b4c00`) moved onto a new themed `--color-warning-text` token (light value unchanged). Overlay surfaces no longer derive from the `--bg-inverse`/`--text-inverse` alias pair: tooltip and slider tooltip consume new explicit paired tokens `--orc-overlay-surface`/`--orc-overlay-text` (light `#141414`/`#ffffff`, dark `#333333`/`#ffffff`), so the dark tooltip renders as a dark surface instead of a white popover and brand-only hosts without the alias bridge can no longer hit the white-on-white fallback path (both fallback chains stay token→token). In the date family, both calendars now share one day-cell constraint policy — min/max/disabledDates/disabledDays-constrained and other-month days are real DOM-disabled buttons removed from the tab order (the embedded date-picker calendar previously rendered them focusable and clickable with `aria-disabled` and opacity only), and the embedded calendar's roving day always lands on an enabled day like the inline calendar. `orc-date-input` gains validity surfacing for typed out-of-range values: a value outside `[min]`/`[max]` marks the field invalid (`aria-invalid`, the error slot with `role="alert"`, default message overridable via the new `invalidRangeMessage` input) and is not written to the model, matching the date picker's rejection behavior; its `min`/`max` inputs now also accept `Date` objects beside ISO strings, normalized for both the native attribute and the validity check. The docs calendar example's missing min/max bindings are intentionally not part of this change.
- 34eef02: Extract the p2 data and display families to canonical source directories — pick list, order list, tree, tree select, tree table, organization chart, data view, galleria, meter group, terminal, image compare, code, hover card, and virtual scroller — behind unchanged public entry points, with behavior-parity specs guarding each family. The order-list and tree-select controls now share the library's common forms base, and tier-era compatibility class names (`p-picklist`, `p-orderlist`, `p-tree`, `p-treetable`, `p-treeselect`, `p-metergroup`, `p-component`, `data-pc-name`) are gone from the extracted families' templates; tree select's fluid-width hook moved from `p-treeselect-fluid` to `orc-p2-tree-select--fluid`. Applications overriding those internal classes, or the shared-styles global selectors, on these components should re-check their styles.
- 0d6bbb8: Extract the p2 form and input families (combobox, multi-select, listbox, calendar, date-input, date picker companions, knob, editor, input-group and companions, icon-field, ifta-label, input-mask, input-otp, password, float-label, select-button, toggle-button, key-filter, tags-input and companions, input-color, organization chart) into canonical per-component directories with separate templates and styles. Import paths, selectors, and exports are unchanged; the p2 entry keeps re-exporting every symbol. PrimeNG host-class mimicry (`p-*`, `p-component`, `data-pc-name`) is removed from the extracted components; state hooks keep their `orc-p2-*` names except where noted in the parity specs.
- d0c68c0: The 23.0.0 gate (compatibility window end) becomes machine-checked and self-documenting. A generated gate manifest now scans the library source and enumerates everything scheduled for removal at the next Angular-major release — every `@deprecated` input/output/model/type (247), the legacy size values (`small | large` → `sm | md | lg`) on every widened control, the functional dual names (table `value`/`dataKey`/`rowsPerPageOptions`/`globalFilterFields`/`tableStyle`/`filterable`/`scrollable`, modal `visible`, select `searchable`, the duplicated `blur`/`onBlur`-style output pairs), the PrimeNG-era `onXxx` outputs without a canonical pair, the alias entry-point fan-out with its renamed classes (`DialogComponent`, `DialogRef`, `ChipsComponent`, …), the `@ciag/orchestra/p2` tier entry point, and the tier `orc-p2-*` class hooks — each entry paired with its canonical replacement or flagged replacement-TBD for the human gate review. Entries the sole known consumer still binds (table `[value]`, the onXxx outputs, the PrimeNG-era input names) are flagged in production use from the committed consumer scan, so the rendered migration guide (docs/quality/gate-23-migration.md, regenerated with `npm run generate:gate-manifest`) is the migration contract. A new deprecation guard (`npm run verify:deprecation-guard`, on CI with full fetch depth) fails any commit that grows the deprecated surface or the alias fan-out without a changeset mentioning the symbol; manifest drift fails CI through `verify:docs`.
- 34eef02: Collapse the generation-based versioning scheme. Orchestra versions now follow strict semver with the Angular major as the semver major (`22.y.z`), and breaking changes land only at Angular-major boundaries (next: `23.0.0`). The retired `Angular major.Orchestra major.Orchestra minor` scheme placed breaking Orchestra generations in the semver minor slot, so caret ranges received them automatically; from this release onward a minor bump is backward-compatible by contract. Old release lines (v19–v22) continue as Angular-locked backport streams publishing under their `angularNN` dist-tags.
- abbe503: Consolidated the parallel list-picker implementations (select, dropdown, combobox, multi-select, listbox, and list) onto one shared internal interaction core — option-model field/value/label/disabled readers, the value-level and row-level filter machines with the shared match modes and locales, the per-family dataKey equality strategies, enabled-index keyboard roving, the limited selection toggle, active-option validation and aria ids, and the detached-overlay open/close lifecycle — behind every surviving public entry point. All public contracts are unchanged. The recorded deliberate divergences are preserved, not unified away: select keeps its dual projected/data modes, its empty-value filter drop, the single initial lazy range, and every onChange-shape output; dropdown remains a flat action menu with focus roving; listbox keeps its row-wise filter semantics; combobox keeps its clamp roving. No compatibility inputs, outputs, selectors, or entry points changed, and no deprecated surface was implemented or removed.
- 34eef02: Extract the overlay and menu families to canonical source directories — context menu, speed dial, split button, dock, confirm popup, tiered menu, panel menu, mega menu, and menubar — behind unchanged public entry points, with behavior-parity specs guarding each family. Tier-era compatibility class names and shared-styles global selectors are gone from the extracted families' templates; applications overriding internal `.orc-*` classes on those components should re-check their styles (the public class contracts are unchanged).
- 644fccc: Fixed the multi-select panel being covered by any parent with `overflow: hidden`/`auto`, and moved the whole anchored list-picker class onto detached rendering so no option panel can be clipped by ancestor overflow again. `orc-multi-select`, `orc-combobox` and `orc-tree-select` now render their panels through the same detached overlay machinery as `orc-select` and `orc-dropdown` (`attachListPickerOverlay`: CDK portal anchored under the trigger, 4px offset with flip-above fallback, transparent backdrop, reposition scroll strategy, overlay-layer registry participation, topmost-aware document-level Escape with owner-document realm binding). Dismissal, focus-restore, roving keyboard, filter, toggle-all/checkbox selection, forms and aria contracts are unchanged. `orc-multi-select` and `orc-tree-select` `appendTo` are now interpreted like `orc-select`'s (body by default, native-modal aware so the pane never escapes a native dialog's inertness), and `orc-multi-select` `autoZIndex`/`baseZIndex` now manage the panel layer. Production-visible rendering notes for consumers: the panels mount under the CDK overlay container in `document.body` instead of inside the component host, so page-level CSS that targeted the panel through page structure (for example `.my-form orc-multi-select ul.options` or sibling/descendant selectors that crossed the host boundary) no longer matches — target the panel classes (`.p-multiselect-panel`/`.options`, `.p-autocomplete-panel`/`.orc-p2-options`, `.tree`) directly or use `panelStyleClass`/`panelStyle` instead. The multi-select's toggle-all action and filter input now render inside the floating panel box (previously between trigger and list), the tree-select panel chrome moved from `.tree` to the new `.orc-p2-tree-select-panel` root and the multi-select's to the new `.orc-p2-multi-select-panel` root, and the pickers' trigger chevrons render as `orc-icon` Material Symbols (`keyboard_arrow_down`) instead of unicode glyphs. Emulated-encapsulation scoping survives portaling, and because `:host` custom properties do not inherit into the overlay, the panel roots carry the `orc-p2-portal-panel` token bridge so the portaled subtree keeps its theming. `orc-autocomplete` now completes this migration: its option panel renders detached by default (the in-place list was the last one that ancestor overflow could clip and that stretched modal layouts), with the same 4px-offset machinery, registry participation, owner-document realm binding and `orc-p2-portal-panel` token bridge as the other pickers; its `appendTo` is interpreted like `orc-select`'s (body by default, native-modal aware), the 1px-overlap geometry below the control and the flip-above fallback keep their pinned contract, and the input keeps single authority over Escape (`closeOnEscape`, IME guard, topmost awareness) — the shared overlay machinery no longer claims Escape for pickers that declare no escape callbacks. As with the other pickers, page-level CSS that targeted the autocomplete list through page structure (`.my-form orc-autocomplete ul.orc-autocomplete__list`) no longer matches: target `.p-autocomplete-panel`/`.orc-autocomplete__list` directly or use `panelStyleClass`/`panelStyle`. The remaining in-place panels (color-picker, hover-card) are unchanged and flagged for the same migration.
- 36572b7: Unified the size vocabulary across the library as an expand–contract change. Every sized control now accepts the canonical `sm | md | lg` scale (`md` renders as the default middle size), and the PrimeNG-era `small | large` values keep rendering identically as deprecated aliases — `small` → `sm`, `large` → `lg` — normalized internally, documented on each input, and scheduled for removal at the 23.0.0 gate. No public API surface mixes vocabularies anymore, and the canonical controls gain no new inputs.
  
  Legacy-vocabulary controls widened to the canonical vocabulary (the complete old→new enumeration for the 23.0.0 gate manifest; the mapping is identical on every control — `small` → `sm`, `large` → `lg` — applied to the `size` input of each):
  
  - `orc-select` (`SelectSize` now `sm | md | lg | small | large`)
  - `orc-table`
  - `orc-data-table`
  - `orc-cascade-select`
  - `orc-checkbox`
  - `orc-radio-button`
  - `orc-otp-input` / `orc-input-otp`
  - `orcInputMask` / `pInputMask` (host-class directive)
  - `orc-multi-select` (compatibility no-op input; accepted values widened, no rendering effect)
  - `orc-date-picker`
  - `orc-tree-select`
  - `orc-password` / `orc-input-password`
  - `orc-select-button`
  - `orc-toggle-button`
  - `orc-split-button`
  
  Controls that already spoke the canonical vocabulary and are unchanged: `orc-button`, `orc-icon-button` (icon size separately `xs | sm | md | lg | xl`), `orc-input`, `orc-textarea`, tab groups (`sm | md | lg`), `orc-spinner`, `orc-switch`, `orc-slider`, `orc-progress-bar` / `orc-progress-circle` (bar adds `xl`), `orc-paginator`, `orc-chip`, `orc-badge`, `orc-chip-input`, `orc-number-input`, `orc-color-picker`, `orc-avatar` (documented `xs | sm | md | lg | xl` scale), and `orc-modal` (`sm | md | lg` plus its documented extras `xl | fullScreen | custom`). The `orc-typography` and `orc-text` `size` inputs are typography font scales, not control sizes, and keep their documented scales.
- 34eef02: Consolidated the two table implementations onto one shared internal table engine (column field resolution, the filter → sort → page pipeline, sort cycling, paging math, label trimming, and row-identity bookkeeping) behind both surviving public entry points: the generic typed `orc-table` (dot-path field resolution, projected `orc-column`/`orcCellDef` composition) and the lightweight record-based `orc-data-table` (direct property lookup, `DataTableColumn` configs). Both public contracts, their selectors, inputs, outputs, and event payloads are unchanged. The canonical table shell no longer renders the tier-era `p-datatable`, `p-component`, and `data-pc-name="datatable"` compatibility classes — applications overriding those names on `orc-table` should target the `orc-table-container` family instead. The production-used PrimeNG-era names keep working through the compatibility window and are recorded for the 23.0.0 removal manifest with their canonical replacements: `value` → `data`, `dataKey` → `rowKey`, `rowsPerPageOptions` → `pageSizeOptions`, `globalFilterFields` → declared `orc-column` keys (filtering already follows configured columns when it is unset), `tableStyle` → `tableStyleClass`/component styles, while `filterable` and `scrollable` (with `scrollHeight`) have no other name on this component and their removal-or-replacement decision stays with the gate manifest. The 36 deprecated no-op inputs/outputs (frozen columns, virtual scroll, resize/reorder, row editing, state persistence, and their outputs) remain deprecated no-ops; none were implemented or re-advertised.

### Patch Changes

- 34eef02: Rebuild the documentation app's data spine: component pages render from colocated per-component catalog entries through a slim data-driven renderer, the generated component API reference is split into lazy per-family chunks, and a documentation coverage gate closes catalog gaps for every inventoried family.
- 34eef02: Add the shared internal building blocks of the component extraction program: a signal-idiomatic control-value-accessor base adopted by the first form-control batch, shared roving-focus and overlay helpers for the menu family, and extraction infrastructure with generated alias-identity and behavior-parity sweeps that keep component refactors observable.
- 34eef02: Purge generated process exhaust and archived verification evidence from the repository — evidence is now cited as plain text and produced by CI — and replace push-triggered npm publishing with governed releases: a publish guard checks the version change, registry collisions, and the single-owner stream topology encoded in `compatibility/versions.json`, so publishes happen only from Version-PR merges on main (under `latest`) or from backport tags on the v19–v22 lines (under `angularNN`).
- 34eef02: Ship a README in the published package: the npm tarball now carries a concise overview (install, the styles import, the `data-theme` theming attribute) with pointers to the documentation site and the full repository README.
- 048ce72: Fixed the modal closing when a picker panel opened inside it. A control that opens its panel from focus (`orc-combobox`, `orc-autocomplete`) arms the outside-dismissal listeners in the middle of a pointer gesture; once the detached backdrop paints, the release lands on it and the closing click retargets to the nearest common ancestor of press and release targets — the native modal `<dialog>` element itself. Both dismissal layers misread that completion click as an outside interaction: the panel closed and `orc-modal`'s backdrop handling (`event.target === dialog`) closed the whole modal. The click is now triaged by the pointer press that started its gesture, mirroring the CDK overlay dispatcher: a click whose press predates the listener is ignored, a press inside the picker keeps the interaction even when the click retargets, and keyboard- or programmatic-generated clicks (detail 0) keep the plain semantics. `orc-modal` correspondingly treats a pointer click as a backdrop dismissal only when the gesture began on the mask itself, so opening any focus-driven overlay inside a modal can no longer dismiss the modal. Human-timing clicks reproduce the original crash; fast synthetic clicks never did, which is why it surfaced only in the maintainer acceptance pass.
- 34eef02: Establish the workspace tooling baseline: an ESLint flat config with its day-one findings resolved, widened Prettier coverage with a repository-wide format sweep, Node 22 alignment across `.nvmrc`, `engines`, and CI, and the release tooling test suite wired into CI.
- d4e9d0d: TreeSelect trigger text now shares the select family's typographic contract: 14px Poppins with a muted placeholder tone and ellipsis overflow, matching Select and Combobox. The trigger height follows the shared control-height token.

## 20.2.0

### Minor Changes

- Backport the post-overhaul interaction and quality wave to the Angular 20 line: every option panel (select, dropdown, combobox, multi-select, listbox, list, autocomplete, date-picker) renders through the shared detached-overlay machinery, so panels float above modals and are never clipped by ancestor `overflow`; overlays participate in the layer registry (topmost-aware Escape, parent-overlay close cascades); pointer gestures that open a panel mid-press can no longer dismiss themselves or close a host modal; TreeSelect trigger text shares the Select family typography; date limits are enforced end to end (embedded calendar disables constrained days, DateInput surfaces out-of-range typed values); dark theme remaps status colors and overlay surfaces (chip/tooltip contrast fixes); the picker trigger chevrons render via `orc-icon`. On the Angular 20 CDK (no Popover API hook) the detached overlays parent into the owning native dialog through the shared picker machinery's insertion hook, preserving the modal containment fix.

### Patch Changes

- Tooling parity with mainline: ESLint + repo-wide Prettier gates, Node 22.22.3 alignment, package README shipped in the tarball, alias-identity sweep, inventory/generated-docs gates, and the 23.0.0 gate manifest tooling.

## 22.2.0

### Minor Changes

- a446a80: Replace the generated SVG icon catalog with a Google Material Symbols font-backed `orc-icon`. Add family and variable-axis controls, expose the complete Google metadata catalog, and document the Apache 2.0 attribution and runtime Google Fonts dependency.

### Patch Changes

- Repair Alert semantics and timer cleanup, Avatar interactive roles/status names, Badge live announcements, Carousel page and accessibility state, List selection semantics, ProgressBar defaults and reduced motion, Select option relationships, ColorPicker parsing, Rating range/autofocus behavior, and accessible input actions. Normalize Checkbox filled/outlined and size variants with a 24px minimum target, alongside form-control edge behavior for Switch, NumberInput, and Textarea.
- Improve accessible names, control styling, and loading-state semantics for Password, EmptyState, Skeleton, and Tag. Mark Password's inert attachment/transition inputs and SplitButton's inert `appendTo` input as deprecated compatibility fields.
- Honor TreeSelect `updateOn: 'blur'` across the composite focus boundary, improve MultiSelect combobox/filter/select-all behavior, and preserve the Tooltip component export while deprecating direct configuration.
- Support pointer dragging for Splitter gutters while preserving keyboard resizing, and expose pointer resize completion.
- Honor Button's custom loading icon, icon-only label, and badge styling inputs.
- Complete Calendar grid keyboard navigation, preserve accessibility layout for hidden adjacent-month days, honor disabled controls and other-month selection, and synchronize CVA touch/value behavior.
- Add fallback accessible names for ColorPicker clear and swatch controls, and boolean-coerce FileUploader forceDragover input values.
- Improve accordion heading and collapsed-panel accessibility, wire the declared styling/icon/transition inputs, and verify static motion on every spinner style. Give message-only confirmations named accessible actions with Escape and focus restoration. Replace serialized DataTable row identity with stable object identity when a key is absent.
- Honor DataTable presentation and selection modes, correct local/lazy pagination contracts, and support keyboard row activation with visible focus and pointer affordances.
- Correct DataView local filtering and lazy server pagination boundaries. Omit blank headings/statuses, preserve paginator label fallbacks, and safely render cyclic records.
- cc50ea6: Omit undefined optional attributes from the Date Picker input so empty filters do not display the literal `undefined` placeholder.
- 1928240: Render Date Picker as a single custom calendar popover, move Today and Clear into its footer, and prevent the browser's native date picker from opening alongside it.
- Keep Dropdown items actionable when they carry the deprecated `children` field. Dropdown remains a flat action menu; use TieredMenu for hierarchical actions.
- Complete DataView pagination, loading, and sort-event contracts using the shared Paginator, and bound page-jump options for large collections. Preserve Editor selections across nested rich text and rendered line breaks; normalize MeterGroup values and vertical geometry; implement SpeedDial layouts, mask behavior, and keyboard navigation. Reconcile Modal presentation and scroll-lock inputs while open without duplicate lifecycle events, implement its close glyph and tab order, and mark unsupported compatibility props deprecated. Forward native ScrollPanel scroll events through its output. Give ImageCompare a named group and slider, decorative image defaults, percentage value text, and finite clamped user updates.
- Repair control and overlay interactions across the library. Date/time inputs dismiss correctly and validate calendar values; modal, drawer and popup lifecycles coordinate focus, background isolation, nested dismissal and cleanup. Buttons consistently size and space icons and sanitize supplied SVGs. Tooltips and toasts own their timers and rendered containers.

  Keep date-picker popups inside viewport boundaries and above clipping containers, honor custom attachment without losing native-dialog interaction, and clean up moved panels. Group time controls to fit narrow screens and provide default Today/Clear labels when those actions are enabled. Buffer Autocomplete filtering and form changes during IME composition, preserve native keyboard behavior when no option can be reached, and reset filtering after external model changes.

  Correct selection, autocomplete and upload behavior, including readonly/disabled actions, form synchronization, empty feedback, detached popup cleanup, upload validation, retries and cancellation. Unconfigured uploaders report an error instead of reporting a successful upload; customUpload handlers continue to own their transport and completion.

  Consolidate duplicate Tag, EmptyState, SegmentedControl and Popover implementations while retaining compatibility imports. Fix nested theme aliases, status contrast and component box sizing. Declare the Angular router and platform-browser peers required by public entry points, remove stale generated declarations, and verify packed imports, types and Sass on current and minimum supported Angular versions.

  Add the sealed interaction batch repairs for Table bulk selection and control/query synchronization, Checkbox native change and readonly handling, Paginator aliases, finite page clamping, accessible naming and reports, TabMenu keyboard/selection behavior, and TreeView nested ARIA ownership, roving focus, keyboard navigation, disabled guards and dynamic updates. The sealed batch passed 559 library tests, 38 docs tests, all library/docs/template production builds, compatibility verification, and current/minimum isolated consumers covering 224 JavaScript and 5 Sass entry points; durable logs are recorded under `docs/quality/verification/`.

  Add the frozen Image/Card/Slider repairs for source-reset and preview accessibility, native Card primary-action semantics with nested-control isolation, icon/button geometry and naming, Breadcrumb projection and separators, static Divider semantics, and SSR-safe Slider pointer listener teardown. The coordinated frozen gate passed the current library/runtime, docs, theme, build, compatibility, packed-consumer, and 147-component current-package SSR checks; the SSR gate explicitly leaves hydration and interactive/open-state coverage outside its scope. Evidence is retained under `docs/quality/verification/image-card-slider-batch/`.
- Use native fieldset and legend semantics for FormField groups, normalize fieldset spacing, coerce required markers as booleans, and emit form reset events once.
- Repair Galleria side-thumbnail overlap and scrolling, preserve autoplay until a configured user click, separate thumbnail-navigation names from image-navigation labels, trim accessible names, and ignore invalid autoplay intervals. Fullscreen now has dialog semantics, initial focus, Tab containment, Escape dismissal, and focus restoration. Add focused coverage for the complete 31-input surface; four unsupported compatibility options remain deprecated.
- Make Image preview focus recovery and accessible label fallbacks reliable, document and test the complete 27-input contract, and mark unsupported placement/transition inputs as deprecated no-ops.
- Move Inplace into its own reviewable P2 module while preserving the existing barrel export and class identity. Normalize its visible and accessible labels, keep focus in the edit surface when disabled/closable controls become unavailable, and cover the seven-input contract.
- Keep Inplace in edit mode when Escape is used to confirm or dismiss an active IME composition, so candidate text is not discarded.
- Correct Listbox filter comparisons and primitive option identity, give unnamed Autocomplete controls a default accessible name, and align NumberInput precision and presentation inputs with their rendered behavior.
- Keep numeric zero intact, align masked character counts and caret position with formatting, normalize blank labels and ARIA names, and make input action buttons keyboard reachable.
- Add accessible CVA behavior and normalized hex text handling to InputColorComponent.
- 00a9474: Expose PrimeNG-compatible InputOtp and RadioButton package entry points.
- Repair KeyFilter composition handling and InputMask custom-token formatting, CVA unmasking, caret preservation, composition behavior, native state, and core accessibility reflection.
- Improve layout and navigation component contracts, provide native navigation item semantics and controlled mobile dismissal, and make ScrollArea overflow state, accessible naming, and focused paging work on both axes.
- Give Listbox instances unique generated IDs and accessible default names, name its filter field, and keep active-descendant references valid when options are disabled or filtered. Mark the unimplemented grouping, select-all, lazy/virtual-scroll, checkbox, and drag/drop compatibility surface as deprecated no-ops.
- Restore focus to the invoking control after a modal closes in WebKit when pointer activation leaves focus on the document body.
- Restore modal focus to the captured pointer opener when WebKit reports a stale active element.
- Repair `ModalService` dynamic modal ownership: injected document attachment, destroyable per-open injectors, application/service teardown, failure cleanup, and observable close ordering now have direct browser coverage.
- Add MultiSelect clear and selection-limit contracts, and improve TieredMenu child focus, keyboard activation, and submenu accessibility behavior.
- Honor the Form component's `novalidate` input when deciding whether to open browser-native invalid-field UI, while continuing to emit the computed validity state.
- Fix ContextMenu target listener lifecycle and Portal projected-node movement, including direct element targets from same-origin iframe documents.
- Support editable date-time values in the P2 Calendar and enforce a strict native date-only contract in DateInput. Keep the time editor synchronized when its parent-bound value changes so selecting a day preserves the latest time. Mark Calendar's inert `inline` and `dateFormat` compatibility inputs as deprecated.
- Honor Menu items and nested active state, add level-aware nested Menu keyboard focus, and support safe leaf links across Menu, TieredMenu, and PanelMenu; URLs apply to leaves while parents with children remain disclosure buttons. Menubar keyboard navigation and focus outputs follow visible, enabled items.
- Implement PickList's declared filter modes, locale-safe field filtering, meta-key selection, responsive breakpoint layout, striped rows, and drag/drop transfer/reordering. Normalize accessible names and empty content, preserve focus and transfer events, and document/test the responsive interaction contract.
- Implement ProgressBar's documented extra-large size, bound segmented rendering and marker positions, normalize custom sizing and accessible names, and apply semantic marker tones. Document and test the 22-input contract.
- Make ProgressCircle's indeterminate, animation, sizing, styling, and accessible-text inputs match their documented behavior. Document and test its 19-input contract.
- Register the supported compatibility event bindings for navigation, selection, layout, visibility, terminal, timeline, breadcrumb, and split-button components while preserving their canonical outputs. Give PickList's move-all events real enabled-item transfer behavior with default named controls, roving keyboard selection, aggregate selection snapshots, stable ordering, disabled/empty safeguards, owner-document focus recovery that preserves explicit/external focus and detached-item neighbor recovery, and whole-widget disabled semantics.
- Repair radio group keyboard order, disabled roving focus, blur-based CVA touching, standalone same-name checked state, and radio variant sizing.
- Refresh ScrollTop visibility and parent scroll-listener ownership when its target or threshold changes after initialization. Give its icon-only action a useful default accessible name and deprecate its unsupported visibility-transition options.
- Respect the configured locale when filtering Select data and projected options; supply accessible clear/chip-removal names, announced loading, and useful default/custom empty states.
- Correct SelectButton and ToggleButton `updateOn: 'blur'` behavior, avoid value-change emissions for no-op selections, preserve click-event outputs, and apply declared size/fluid styling inputs.
- Normalize Slider CVA values and invalid bounds, repair vertical axis geometry, scope drag listeners to the active pointer, and focus the primary thumb safely for autofocus.
- Repair controlled alias synchronization and keyboard behavior for Tabs and Stepper. Tab groups now resolve simultaneous `selectedIndex`/`value` updates deterministically, avoid duplicate select-on-focus events, keep close controls independently keyboard accessible, recover focus and active identity after closing tabs, and prune closed lazy content. Stepper keeps `currentStep` and `activeIndex` synchronized, skips disabled steps during keyboard navigation, and exposes one active step with a default navigation name.
- Make Table CSV exports escape generated headers and values using the configured delimiter, preserve empty rows, clean up download URLs, and retain the existing custom export header contract. Define deterministic deep selection behavior for nested values, Dates, numeric edge cases, cycles, shared subobjects, and unsupported identity fallbacks. Preserve row and bulk selection output contracts while preventing projected focusable widgets from activating their containing row.
- Add accessible TagsInput suggestion keyboard navigation and active-descendant state, honor case-sensitive duplicate filtering, and preserve disabled/CVA behavior.
- Keep native Tab focus navigation available when TagsInput commits a draft with `addOnTab`.
- Terminal now falls back to its default accessible names when a custom label contains only whitespace.
- Improve DataView accessible fallback labels and safely render cyclic record values.
- Honor Tooltip's `fitContent` input by wrapping longer labels within a viewport-bounded width. Mark the unsupported `tooltipOptions` input as deprecated and direct consumers to the individual supported inputs.
- Emit Tree expansion and collapse events after state updates, and prevent disabled branches from expanding.
- Align Tree and TreeTable filtering, accessibility, layout inputs, and selection mode behavior.
- Honor TreeSelect filter fields, locale and strict/lenient traversal; report mixed checkbox state and propagate selection without selecting disabled descendants.
- Do not propagate checkbox selection through disabled Tree branches, and hide the empty state while the tree is loading.
- Restore consumer styles during utility directive cleanup, make ripple feedback visible while respecting reduced motion, constrain outside-click handling to open StyleClass instances, reject stale animation callbacks, and expose the expected `[orcUseStyle]` input binding.

<!--
  Sections below this comment were backfilled (ticket #8, 2026-10) from git and
  npm archaeology; see RELEASE.md "Historical notes" for the irregularities this
  history carries. New releases are prepended above by the changesets flow.
-->

## 22.2.1

- Version-only re-release of the 22.2.0 content from the frozen Angular 22 backport line, so the `angular22` dist-tag points at the line's own publication after 22.2.0 claimed `latest` on main (4b9d289).

## 22.1.1

- Published to the `angular22` dist-tag nineteen seconds after 22.1.0 on the same day. No commit recording this bump survives in any branch or tag (the v22 line's history was rewritten around this release), so its content cannot be reconstructed from git.

## 22.1.0

- Replaced the generated SVG icon catalog with a Google Material Symbols font-backed `orc-icon` on the current line (a446a80; the version bump was folded into the feature commit).

## 22.0.2

- Closed Orchestra public API gaps across the library — exported entry-point surface, type declarations, and alias parity (8e2c71a, 116 files). Ported to the old lines as 19.1.1 and 20.0.1.

## 22.0.1

- Version-only bump publishing the Angular 22 mainline under the `latest` dist-tag (614e485).

## 22.0.0

- First release of the Angular 22 mainline: established the library layout, the per-Angular-major compatibility release tracks, and the shared component foundation (395357b).

## 21.2.0

### Minor Changes

- Backport the post-overhaul interaction and quality wave to the Angular 21 line: every option panel (select, dropdown, combobox, multi-select, listbox, list, autocomplete, date-picker) renders through the shared detached-overlay machinery, so panels float above modals and are never clipped by ancestor `overflow`; overlays participate in the layer registry (topmost-aware Escape, parent-overlay close cascades); pointer gestures that open a panel mid-press can no longer dismiss themselves or close a host modal; TreeSelect trigger text shares the Select family typography; date limits are enforced end to end (embedded calendar disables constrained days, DateInput surfaces out-of-range typed values); dark theme remaps status colors and overlay surfaces (chip/tooltip contrast fixes); the picker trigger chevrons render via `orc-icon`.

### Patch Changes

- Tooling parity with mainline: ESLint + repo-wide Prettier gates, Node 22.22.3 alignment, package README shipped in the tarball, alias-identity sweep, inventory/generated-docs gates, and the 23.0.0 gate manifest tooling.

## 21.1.1

- Kept the MultiSelect filter inside its popup panel (02f5f79).

## 21.1.0

- Replaced the generated SVG icon catalog with a Google Material Symbols font-backed `orc-icon` on the Angular 21 line (b7dc0e8).

## 21.0.13

- Made ChipInput accessibility announcements opt-in (f5442b1; release bump 1189b71).

## 21.0.12

- Removed implicit component copy behavior and aligned button content (637e923; release bump f207294).

## 21.0.11

- Omitted undefined optional Date Picker input attributes so empty filters no longer display an `undefined` placeholder (f60c9c5).

## 21.0.10

- Rendered the Date Picker as a single custom calendar popover instead of the browser's native picker (84e2a6a).

## 21.0.9

- Restored Modal size and state classes (c7d97ab).

## 21.0.8

- Reserved Date Picker control width (8210779).

## 21.0.7

- Preserved Date Picker input width (f8113aa).

## 21.0.6

- Styled Date Picker control actions (f36c374).

## 21.0.5

- Rendered configured DataTable columns (dabbc21).

## 21.0.4

- Supported projected icon content safely (1523d56).

## 21.0.3

- Rendered projected icons and table filters (2e3c30a).

## 21.0.2

- Stabilized input, option, and button events (ae74a79).

## 21.0.1

- First patch of the Angular 21 line after the initial port (ea59361).

## 21.0.0

- Ported the validated library to Angular 21 to open the Angular 21 release line (d5f7921).

## 20.1.0

- Replaced the generated SVG icon catalog with a Google Material Symbols font-backed `orc-icon` on the Angular 20 line (db802df).

## 20.0.1

- Closed Orchestra public API gaps and preserved the modal close-result API on the Angular 20 line (de048f4, 32719be; release bump 97435e8).

## 20.0.0

- Established the Angular 20 release line: set the package version and aligned the Angular peer range for Angular 20 (c4d2dbb, f9ac52b).

## 19.3.0

- Replaced the generated SVG icon catalog with a Google Material Symbols font-backed `orc-icon` on the Angular 19 line (fc0a31d; release bump ef39f38).

## 19.2.0

### Minor Changes

- 395357b: Add the P0 foundation components Drawer, Popover, Date Picker, Form Field, List, and Tree View. Add canonical Menu, Dialog, and Pagination entry-point aliases, document the complete P0 coverage, and ensure every new component uses semantic light/dark theme tokens.

### Patch Changes

- 030cdb3: Add PrimeNG-aligned menu, confirmation (dialog and popup), data-view, tree/tree-table, chart, editor, order/pick lists, gallery, select/cascade/toggle controls, organization chart, knob, ripple/style-class directives, progress aliases, color/password/number/text/tags inputs, autofocus, dock/scroll-panel/sidebar/dialog/fieldset/input-icon, command-menu, avatar-group, animate-on-scroll, focus-trap, use-style, scroller, message, label, steps, datepicker, and compare entry points, input directives, terminal, image comparison, and data-table filtering/pagination APIs.

## 19.1.1

- Closed Orchestra public API gaps and preserved the modal close-result API on the Angular 19 line, released as a patch version below 19.2.0 (503be25, e0a68ca; release bump efd4f07).

## 19.1.0

- First release of the Angular 19 compatibility line (63206e9).

## 0.1.0

- Initial publication of `@ciag/orchestra` to npm. This version predates the preserved repository layout — `projects/orc-ds` was created at 22.0.0 — so no source snapshot for it survives in git history.
