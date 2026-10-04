# @ciag/orchestra

## 21.2.0

### Minor Changes

- Backport the post-overhaul interaction and quality wave to the Angular 21 line: every option panel (select, dropdown, combobox, multi-select, listbox, list, autocomplete, date-picker) renders through the shared detached-overlay machinery, so panels float above modals and are never clipped by ancestor `overflow`; overlays participate in the layer registry (topmost-aware Escape, parent-overlay close cascades); pointer gestures that open a panel mid-press can no longer dismiss themselves or close a host modal; TreeSelect trigger text shares the Select family typography; date limits are enforced end to end (embedded calendar disables constrained days, DateInput surfaces out-of-range typed values); dark theme remaps status colors and overlay surfaces (chip/tooltip contrast fixes); the picker trigger chevrons render via `orc-icon`.

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

## 21.2.0 (tagged, never published)

- A local `v21.2.0` tag points at a release-preparation commit ("chore(release): prepare orchestra 21.2.0") that a history rewrite orphaned. The version was never published to npm; the tag is a deletion candidate (see RELEASE.md).

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

## 20.2.0 (tagged, never published)

- A local `v20.2.0` tag points at a release-preparation commit ("chore(release): prepare orchestra 20.2.0") that a history rewrite orphaned. The version was never published to npm; the tag is a deletion candidate (see RELEASE.md).

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
