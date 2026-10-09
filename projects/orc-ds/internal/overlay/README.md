# `@ciag/orchestra/internal` — overlay layers

Private infrastructure for the overlay families (popover, tooltip, menu,
select/autocomplete panels, date-picker, modal, drawer, toast). Everything is
built on `@angular/cdk/overlay`, `@angular/cdk/dialog` and `@angular/cdk/a11y`:
no native `<dialog showModal()>`, no manual `position: fixed`, no z-index
numbers, no document listeners while closed.

## Stacking model

All three layers use the CDK default `usePopover: true` (browser top layer)
consistently. The top layer stacks in show order, so:

- a panel anchored inside a modal is opened after it and paints above it
  (and stays out of the modal's `aria-hidden`, which only hits siblings of
  the overlay container);
- nested modals stack naturally; Escape reaches only the topmost overlay
  (CDK `OverlayKeyboardDispatcher`);
- the toast region re-raises itself whenever another overlay is added, so it
  is always above modals and panels.

If an anchor lives inside a legacy native `<dialog>` opened with
`showModal()`, the anchored panel is inserted inline next to the anchor
(`withPopoverLocation('inline')`) so it is not inert.

## 1. Anchored panels — `injectAnchoredOverlay()`

```ts
@Component({
  selector: 'orc-popover',
  template: `
    <button #trigger type="button" aria-haspopup="dialog" (click)="toggle()">
      <ng-content select="[orcPopoverTrigger]" />
    </button>
    <ng-template #panel><ng-content /></ng-template>
  `,
})
export class PopoverComponent {
  readonly open = model(false);
  private readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private readonly panel = viewChild.required<TemplateRef<unknown>>('panel');
  private readonly overlay = injectAnchoredOverlay({
    anchor: () => this.trigger(), // default: host element
    placement: 'bottom-start', // flips to top-start, then other alignments
    role: 'dialog', // pane gets role + overlay.panelId
    autoFocus: 'first-tabbable',
    trapFocus: true,
  });

  constructor() {
    this.overlay.closed.subscribe(() => this.open.set(false)); // escape | outside | …
  }

  toggle() {
    this.overlay.toggle(this.panel());
    this.open.set(this.overlay.isOpen());
  }
}
```

- `aria-expanded`/`aria-controls` are kept on the anchor (`manageAria: false`
  to opt out). Without `role`, render your own root with
  `[id]="overlay.panelId"` (e.g. the `role="listbox"` element).
- List-type panels (select, menu with active descendant) keep focus on the
  trigger: leave `autoFocus` off and use `createOptionKeyManager()`.
- `matchAnchorWidth: true` for select/autocomplete; `scroll: 'close'` for
  tooltips.
- Focus returns to the previously focused element (or the anchor) when focus
  was inside the panel, or on Escape.

## 2. Modal layer — `OrcModalLayer`

```ts
const ref = inject(OrcModalLayer).open<boolean, Project>(EditProjectComponent, {
  data: project, // inject(ORC_DIALOG_DATA)
  ariaLabelledBy: 'edit-project-title',
  closeOnBackdropClick: false,
});
const saved = await ref.result; // or ref.closed (Observable)

// inside EditProjectComponent
private readonly ref = inject(OrcModalRef<boolean>);
save() { this.ref.close(true); }

// drawer
inject(OrcModalLayer).open(FiltersComponent, { drawer: 'end', ariaLabel: labels().drawer.label });
```

The CDK provides FocusTrap, initial focus (`autoFocus`, default
`'first-tabbable'`), focus restoration, `aria-modal` + `aria-hidden` on the
rest of the page, scroll blocking and nested stacking. Escape and backdrop
closing are separate switches (`closeOnEscape`, `closeOnBackdropClick`;
`role: 'alertdialog'` disables backdrop closing by default) and `canClose`
vetoes any close. Panes get `orc-modal-pane` (+ `--drawer`, `--drawer-<side>`),
the backdrop `orc-modal-backdrop`; styles belong to the modal/drawer families.
A styled container can be passed with `container` (subclass of
`CdkDialogContainer`).

## 3. Toast region — `OrcToastLayer`

```ts
const layer = inject(OrcToastLayer);
const region = layer.attach(ToastRegionComponent, { position: 'top-end' });
region.setInput('toasts', toasts); // the region owns aria-live and the list
layer.setPosition('bottom-center');
layer.detach();
```

One region at a time; attaching again replaces the content. It is not hidden
by open modals and is re-raised above any overlay added later (a
`MutationObserver` on the overlay container, active only while attached).
