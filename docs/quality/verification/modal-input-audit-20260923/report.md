# ModalComponent public input audit

Date: 2026-09-23

Scope: `ModalComponent` in `projects/orc-ds/modal/modal.component.ts`, its template, component styles, and modal specs. The class declares no base class, so all 49 public `input()` / `model()` properties are own inputs; no inherited inputs were found. The inventory below was counted from those declarations.

## Inventory and classification

“Supported, tested” means the input has observable behavior exercised by a Modal spec. “Deprecated no-op” means the property is explicitly marked deprecated in source and the docs explain its compatibility-only status. “Supported, tested” means observable source wiring exists, but no passing behavior assertion was found.

| Input                  | Classification    | Runtime behavior / compatibility basis                                                                                      |
| ---------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `isOpen`               | Supported, tested | Visibility model; opened/closed lifecycle specs.                                                                            |
| `visible`              | Supported, tested | PrimeNG visibility model; new assertion checks native dialog opens.                                                         |
| `header`               | Supported, tested | Header text supplies dialog title; the title relationship assertion passed.                                                 |
| `modal`                | Supported, tested | Chooses modal `showModal()` vs nonmodal `show()`; scroll-lock and modality transition spec.                                 |
| `closeOnEscape`        | Supported, tested | Native cancel event respects the flag.                                                                                      |
| `dismissableMask`      | Supported, tested | Gates backdrop close; disabled-state assertion passed.                                                                      |
| `closable`             | Supported, tested | Close control requires both `closable` and `showCloseButton`.                                                               |
| `draggable`            | Deprecated no-op  | Dragging is not implemented; retained for source compatibility and listed as deprecated in the modal API docs.              |
| `resizable`            | Deprecated no-op  | Resizing is not implemented; retained for source compatibility and listed as deprecated in the modal API docs.              |
| `maximizable`          | Supported, tested | Enables maximize control and state/class updates.                                                                           |
| `focusOnShow`          | Supported, tested | Focuses an eligible control when the dialog opens.                                                                          |
| `focusTrap`            | Supported, tested | Tab key wraps within an open modal.                                                                                         |
| `blockScroll`          | Supported, tested | Acquires/releases document scroll lock as value and modal state change.                                                     |
| `autoZIndex`           | Supported, tested | Controls whether `effectiveZIndex` uses `baseZIndex`; style assertion added.                                                |
| `baseZIndex`           | Supported, tested | Participates in effective z-index calculation.                                                                              |
| `position`             | Supported, tested | Adds the matching position class; new assertion checks `bottomright`.                                                       |
| `style`                | Supported, tested | Applies styles to native dialog; object-style assertion passed in the first focused execution.                              |
| `styleClass`           | Supported, tested | Appends consumer classes to dialog.                                                                                         |
| `maskStyle`            | Deprecated no-op  | Native dialog backdrop does not consume this input; compatibility rationale is documented in source and modal API docs.     |
| `maskStyleClass`       | Deprecated no-op  | Native dialog backdrop does not consume this input; compatibility rationale is documented in source and modal API docs.     |
| `contentStyle`         | Supported, tested | Applies style object to modal body; assertion passed in the first focused execution.                                        |
| `contentStyleClass`    | Supported, tested | Adds consumer class to modal body; assertion passed in the first focused execution.                                         |
| `appendTo`             | Deprecated no-op  | Native dialog relocation is unsupported; retained for compatibility and documented as deprecated.                           |
| `role`                 | Supported, tested | Sets native dialog role; new assertion checks `alertdialog`.                                                                |
| `showHeader`           | Supported, tested | Toggles visible header and affects accessible-name fallback; lifecycle spec covers hidden header.                           |
| `closeIcon`            | Supported, tested | Renders configured close glyph.                                                                                             |
| `closeAriaLabel`       | Supported, tested | Sets close button accessible label; configured-label assertion passed.                                                      |
| `minimizeIcon`         | Supported, tested | Renders when maximized; glyph assertion passed.                                                                             |
| `maximizeIcon`         | Supported, tested | Renders when not maximized; glyph assertion passed.                                                                         |
| `restoreAriaLabel`     | Supported, tested | Labels restore action; configured-label assertion passed.                                                                   |
| `maximizeAriaLabel`    | Supported, tested | Labels maximize action; configured-label assertion passed.                                                                  |
| `closeTabindex`        | Supported, tested | Normalizes integer tabindex and falls back to zero.                                                                         |
| `breakpoints`          | Deprecated no-op  | Breakpoint-driven sizing is unsupported; source and modal API docs direct consumers to `size` and caller CSS.               |
| `size`                 | Supported, tested | Adds size class for every supported size.                                                                                   |
| `id`                   | Supported, tested | Sets dialog id; new assertion checks `preferences-dialog`.                                                                  |
| `ariaLabel`            | Supported, tested | Sets explicit dialog name when no labelled-by target is provided; the explicit and labelled-by precedence assertion passed. |
| `status`               | Supported, tested | `danger` adds status class.                                                                                                 |
| `inline`               | Supported, tested | Uses inline native dialog presentation and releases modal resources.                                                        |
| `closeOnBackdropClick` | Supported, tested | Gates backdrop close alongside `dismissableMask`; disabled-state assertion passed.                                          |
| `showCloseButton`      | Supported, tested | Hides the close control; new test also checks `closable` independently.                                                     |
| `ariaLabelledBy`       | Supported, tested | Sets external accessible-name target; the test exposed and verified the fix for simultaneous `aria-label`.                  |
| `ariaDescribedBy`      | Supported, tested | Sets `aria-describedby`; new assertion checks configured id.                                                                |
| `zIndex`               | Supported, tested | Supplies effective z-index and is reflected on native dialog.                                                               |
| `keepInViewport`       | Deprecated no-op  | Native dialog placement does not consume this input; source and modal API docs retain it only for compatibility.            |
| `minX`                 | Deprecated no-op  | Native dialog placement does not consume this input; source and modal API docs retain it only for compatibility.            |
| `minY`                 | Deprecated no-op  | Native dialog placement does not consume this input; source and modal API docs retain it only for compatibility.            |
| `transitionOptions`    | Deprecated no-op  | Transition timing is fixed in component CSS; source and modal API docs retain it only for compatibility.                    |
| `rtl`                  | Deprecated no-op  | Logical CSS properties handle direction; source and modal API docs retain it only for compatibility.                        |
| `maximized`            | Supported, tested | Model changes via maximize action and updates rendered class/control state.                                                 |

Totals: **49 inputs/models: 38 supported and tested, 11 deprecated no-ops, 0 still unverified.**

## Change and validation

The focused spec now checks accessible naming, configured action labels and glyphs, presentation attributes, object styles, z-index application, and backdrop dismissal gates. The template now suppresses `aria-label` whenever `aria-labelledby` is configured, so the explicit naming inputs do not conflict.

The focused suite passed **21/21** specs in Chrome Headless on 2026-09-23 using the bundled Node runtime. An initial run exposed the accessible-name precedence defect; after changing the template to remove `aria-label` whenever `aria-labelledby` is present and splitting backdrop-gate assertions into isolated cases, the complete focused suite passed. Object styles, content styling, title and control labels, visibility, backdrop flags, and z-index are covered by passing assertions.

No deprecated property was removed or changed. The deprecated inputs remain declared with their compatibility rationale in source, and the modal API docs explicitly identify them as deprecated no-ops.
