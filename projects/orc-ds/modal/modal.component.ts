import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  model,
  ViewChild,
  ElementRef,
  effect,
  computed,
  PLATFORM_ID,
  inject,
  OnDestroy,
  AfterViewInit,
  booleanAttribute,
  signal,
  afterEveryRender,
} from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ButtonComponent } from '@ciag/orchestra/button';
import {
  lockDocumentScroll,
  registerOverlay,
  isTopOverlay,
  focusInitialElement,
  trapTabKey,
} from '@ciag/orchestra/internal';

let nextModalId = 0;

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullScreen' | 'custom';
export type ModalStatus = 'neutral' | 'danger';

@Component({
  selector: 'orc-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  readonly titleId = `orc-modal-title-${++nextModalId}`;
  readonly hasTitle = signal(false);
  @ViewChild('headerContent') headerContent?: ElementRef<HTMLElement>;
  private lastIsOpen = false;
  private lastVisible = false;
  private releaseLayer?: () => void;
  private releaseKeyboardListener?: () => void;
  private releaseScroll?: () => void;
  private managedOpen = false;
  private lastInlineMode?: boolean;
  private lastModalMode?: boolean;
  private ignoredNativeCloseEvents = 0;
  private openNotificationPending = false;
  private hasOpenNotification = false;
  private pointerOpener: HTMLElement | null = null;
  private pointerOpenerTimer: ReturnType<typeof setTimeout> | null = null;
  /**
   * Where the in-flight pointer gesture began, per the document capture
   * phase. Document-level on purpose: a sibling picker's detached backdrop
   * is portaled to the body, so a press that lands on it never crosses the
   * dialog — and the completion click it retargets onto the dialog must not
   * inherit a stale gesture record from an earlier pointer.
   */
  private backdropPointerDownTarget: EventTarget | null = null;
  private readonly captureBackdropPointerDown = (event: Event): void => {
    this.backdropPointerDownTarget = event.target;
  };
  private readonly capturePointerOpener = (event: MouseEvent): void => {
    if (event.detail === 0 || this.managedOpen) return;

    const target = event.target as Element | null;
    if (!target || typeof target.closest !== 'function') return;

    const candidate = target.closest<HTMLElement>(
      'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]',
    );
    if (!candidate || this.dialogRef?.nativeElement.contains(candidate)) return;

    this.pointerOpener = candidate;
    if (this.pointerOpenerTimer !== null) clearTimeout(this.pointerOpenerTimer);
    this.pointerOpenerTimer = setTimeout(() => {
      this.pointerOpenerTimer = null;
      this.pointerOpener = null;
    }, 250);
  };
  // ── Referência ao elemento nativo <dialog> ─────────────────
  @ViewChild('dialogRef') dialogRef!: ElementRef<HTMLDialogElement>;

  // ── Inputs e Models ─────────────────────────────────────────
  readonly isOpen = model<boolean>(false);
  /** PrimeNG Dialog-compatible visibility model; isOpen remains supported for Orchestra callers. */
  readonly visible = model<boolean>(false);
  readonly header = input<string | undefined>(undefined);
  readonly modal = input(true, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  readonly dismissableMask = input(true, { transform: booleanAttribute });
  readonly closable = input(true, { transform: booleanAttribute });
  /** @deprecated Dragging is not implemented; retained for source compatibility. */
  readonly draggable = input(false, { transform: booleanAttribute });
  /** @deprecated Resizing is not implemented; retained for source compatibility. */
  readonly resizable = input(false, { transform: booleanAttribute });
  readonly maximizable = input(false, { transform: booleanAttribute });
  readonly focusOnShow = input(true, { transform: booleanAttribute });
  readonly focusTrap = input(true, { transform: booleanAttribute });
  readonly blockScroll = input(true, { transform: booleanAttribute });
  readonly autoZIndex = input(true, { transform: booleanAttribute });
  readonly baseZIndex = input(1000);
  readonly position = input<
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'topleft'
    | 'topright'
    | 'bottomleft'
    | 'bottomright'
  >('center');
  readonly style = input<string | Record<string, string | number> | undefined>(
    undefined,
  );
  readonly styleClass = input('');
  /** @deprecated Native dialog backdrops do not consume this input. */
  readonly maskStyle = input<Record<string, string | number> | undefined>(
    undefined,
  );
  /** @deprecated Native dialog backdrops do not consume this input. */
  readonly maskStyleClass = input('');
  readonly contentStyle = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly contentStyleClass = input('');
  /** @deprecated Native dialog relocation is not supported; retained for compatibility. */
  readonly appendTo = input<unknown>(undefined);
  readonly role = input('dialog');
  readonly showHeader = input(true, { transform: booleanAttribute });
  readonly closeIcon = input('×');
  readonly closeAriaLabel = input<string | undefined>(undefined);
  readonly minimizeIcon = input('−');
  readonly maximizeIcon = input('+');
  readonly restoreAriaLabel = input<string | undefined>(undefined);
  readonly maximizeAriaLabel = input<string | undefined>(undefined);
  readonly closeTabindex = input('0');
  readonly effectiveCloseTabindex = computed(() => {
    const parsed = Number(this.closeTabindex());
    return Number.isInteger(parsed) ? parsed : 0;
  });
  /** @deprecated Breakpoint-driven sizing is not implemented; use size and caller CSS. */
  readonly breakpoints = input<Record<string, string> | undefined>(undefined);
  readonly size = input<ModalSize>('md');
  readonly id = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly status = input<ModalStatus>('neutral');
  readonly inline = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });
  readonly closeOnBackdropClick = input<boolean, unknown>(true, {
    transform: booleanAttribute,
  });
  readonly showCloseButton = input<boolean, unknown>(true, {
    transform: booleanAttribute,
  });
  readonly ariaLabelledBy = input<string>('');
  readonly ariaDescribedBy = input<string>('');
  readonly zIndex = input<number>(1000);
  readonly effectiveZIndex = computed(() =>
    this.autoZIndex()
      ? Math.max(this.zIndex(), this.baseZIndex())
      : this.zIndex(),
  );
  /** @deprecated Native dialog placement does not consume this input. */
  readonly keepInViewport = input(true, { transform: booleanAttribute });
  /** @deprecated Native dialog placement does not consume this input. */
  readonly minX = input(0);
  /** @deprecated Native dialog placement does not consume this input. */
  readonly minY = input(0);
  /** @deprecated Transition timing is fixed by the component stylesheet. */
  readonly transitionOptions = input<string>(
    '150ms cubic-bezier(0, 0, 0.2, 1)',
  );
  /** @deprecated Dialog alignment uses logical CSS properties and does not require this input. */
  readonly rtl = input(false, { transform: booleanAttribute });

  // ── Outputs ─────────────────────────────────────────────────
  readonly closed = output<void>();
  readonly onShow = output<void>();
  readonly onHide = output<void>();
  readonly onMaximize = output<{ maximized: boolean }>();
  readonly maximized = model(false);

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private previousActiveElement: HTMLElement | null = null;

  constructor() {
    // Safari/WebKit may leave focus on an unrelated element after a pointer
    // click. Preserve the clicked control so close can return focus to the
    // actual invoker even when document.activeElement is stale.
    this.document.addEventListener('click', this.capturePointerOpener, true);
    afterEveryRender(() =>
      this.hasTitle.set(
        Boolean(this.headerContent?.nativeElement.textContent?.trim()),
      ),
    );
    effect(() => {
      this.syncDialogState();
    });
  }

  ngAfterViewInit(): void {
    // A signal may already be true before ViewChild is assigned. The
    // constructor effect cannot observe that non-signal assignment, so sync
    // once after the native dialog enters the view.
    this.syncDialogState();
    this.document.addEventListener(
      'pointerdown',
      this.captureBackdropPointerDown,
      true,
    );
  }

  private syncDialogState(): void {
    if (!this.isBrowser) return;
    const isOpen = this.isOpen();
    const visible = this.visible();
    const open =
      isOpen !== this.lastIsOpen
        ? isOpen
        : visible !== this.lastVisible
          ? visible
          : isOpen;
    const transitionedOpen = open && !this.lastIsOpen && !this.lastVisible;
    const transitionedClosed = !open && (this.lastIsOpen || this.lastVisible);
    if (transitionedOpen) this.openNotificationPending = true;
    this.lastIsOpen = open;
    this.lastVisible = open;
    this.isOpen.set(open);
    this.visible.set(open);
    const dialog = this.dialogRef?.nativeElement;
    if (!dialog) return;

    const inline = this.inline();
    const modal = this.modal();
    const modeChanged =
      this.lastInlineMode !== undefined &&
      (this.lastInlineMode !== inline || this.lastModalMode !== modal);
    this.lastInlineMode = inline;
    this.lastModalMode = modal;

    if (!open) {
      if (dialog.open) this.closeNativeDialog();
      if (this.managedOpen) this.releaseManagedResources(false);
      this.releaseScrollLock();
      if (transitionedClosed || this.openNotificationPending) {
        this.restorePreviousFocus();
        if (this.hasOpenNotification) this.onHide.emit();
        this.hasOpenNotification = false;
        this.openNotificationPending = false;
      }
      return;
    }

    if (inline) {
      if (this.managedOpen) {
        if (dialog.open) this.closeNativeDialog();
        this.releaseManagedResources(false);
      }
      if (!dialog.open) dialog.show();
      this.releaseScrollLock();
      return;
    }

    // A native dialog cannot change between `show()` and `showModal()` while
    // open. Reopen it when either presentation mode changes, retaining the
    // original opener and emitting visibility outputs only once per cycle.
    if (modeChanged && dialog.open) {
      this.closeNativeDialog();
      this.releaseManagedResources(false);
    }

    if (!dialog.open) {
      if (!this.previousActiveElement) {
        const activeElement = this.document.activeElement as HTMLElement;
        const pointerOpener = this.pointerOpener;
        this.previousActiveElement =
          pointerOpener?.isConnected && !dialog.contains(pointerOpener)
            ? pointerOpener
            : activeElement;
        this.clearPointerOpener();
      }
      if (modal) dialog.showModal();
      else dialog.show();
    }

    if (!this.managedOpen) {
      this.releaseLayer = registerOverlay(dialog, {
        onParentClose: () => this.close(),
      });
      const keydown = (event: KeyboardEvent) => this.trapFocus(event);
      this.document.addEventListener('keydown', keydown);
      this.releaseKeyboardListener = () =>
        this.document.removeEventListener('keydown', keydown);
      this.managedOpen = true;
      if (this.openNotificationPending) {
        this.onShow.emit();
        this.hasOpenNotification = true;
        this.openNotificationPending = false;
      }
      if (this.focusOnShow()) queueMicrotask(() => this.focusInitialElement());
    }
    this.syncScrollLock();
  }

  // ── Computed Classes ────────────────────────────────────────
  readonly modalClasses = computed(() => {
    return {
      'orc-modal': true,
      'orc-modal--inline': this.inline(),
      [`orc-modal--size-${this.size()}`]: true,
      'orc-modal--status-danger': this.status() === 'danger',
      'orc-modal--fullscreen': this.size() === 'fullScreen',
      'orc-modal--maximized': this.maximized(),
      [`orc-modal--position-${this.position()}`]: true,
    };
  });

  /**
   * Angular string interpolation coerces a class map to "[object Object]".
   * Convert the map explicitly so every modal selector receives its base,
   * size, status, inline, and maximized classes.
   */
  readonly modalClassNames = computed(() => {
    const classes = this.modalClasses();
    return Object.keys(classes)
      .filter((className) => classes[className as keyof typeof classes])
      .join(' ');
  });

  // ── Handlers ────────────────────────────────────────────────
  onClose(): void {
    if (this.isOpen() || this.visible()) {
      this.isOpen.set(false);
      this.visible.set(false);
      this.closed.emit();
    }
  }

  onCancel(event: Event): void {
    // Disparado nativamente ao apertar 'Escape'
    event.preventDefault();
    if (this.closeOnEscape() && isTopOverlay(this.dialogRef.nativeElement))
      this.onClose();
  }

  onBackdropClick(event: MouseEvent): void {
    if (
      !this.closeOnBackdropClick() ||
      !this.dismissableMask() ||
      !this.modal()
    )
      return;

    const dialog = this.dialogRef.nativeElement;
    // O <dialog> cobre a tela inteira com seu backdrop.
    // O click nele tem rect bounds específicos. Se clicar fora do conteúdo interno, é o backdrop.
    // Como o conteúdo real está no <div class="orc-modal__container">,
    // clicar no dialog propriamente (se o padding não cobrir a tela) é backdrop.
    // Mas a forma mais segura é checar o target.
    if (event.target !== dialog) return;
    // A pointer click dismisses the modal only when the gesture began on
    // the mask itself. A control opened from focus inside the modal (a
    // picker panel whose detached backdrop painted between press and
    // release) retargets its completion click to the dialog element, but
    // the press actually landed on an inner control — dismissing here
    // would close the modal for the gesture that merely opened the panel.
    // The same guard covers presses on another layer's backdrop (recorded
    // at the document level, outside the dialog). Keyboard- and
    // programmatic-generated clicks (detail 0) keep the plain mask
    // semantics. The record is consumed per gesture so a stale target can
    // never arm a later click.
    const gestureTarget = this.backdropPointerDownTarget;
    this.backdropPointerDownTarget = null;
    if (event.detail > 0 && gestureTarget !== null && gestureTarget !== dialog)
      return;
    this.onClose();
  }

  show(): void {
    this.visible.set(true);
    this.isOpen.set(true);
  }
  close(): void {
    this.onClose();
  }
  toggleMaximize(): void {
    if (!this.maximizable()) return;
    this.maximized.update((value) => !value);
    this.onMaximize.emit({ maximized: this.maximized() });
  }

  private acquireScrollLock(): void {
    if (
      this.isBrowser &&
      this.modal() &&
      this.blockScroll() &&
      !this.releaseScroll
    )
      this.releaseScroll = lockDocumentScroll(this.document);
  }

  private syncScrollLock(): void {
    if (this.modal() && this.blockScroll()) this.acquireScrollLock();
    else this.releaseScrollLock();
  }

  private releaseScrollLock(): void {
    this.releaseScroll?.();
    this.releaseScroll = undefined;
  }

  private closeNativeDialog(): void {
    const dialog = this.dialogRef?.nativeElement;
    if (!dialog?.open) return;
    this.ignoredNativeCloseEvents++;
    dialog.close();
  }

  private releaseManagedResources(restoreFocus: boolean): void {
    this.releaseKeyboardListener?.();
    this.releaseKeyboardListener = undefined;
    this.releaseScrollLock();
    this.releaseLayer?.();
    this.releaseLayer = undefined;
    this.managedOpen = false;
    if (restoreFocus) this.restorePreviousFocus();
  }

  private restorePreviousFocus(): void {
    if (this.previousActiveElement?.isConnected)
      this.previousActiveElement.focus({ preventScroll: true });
    this.previousActiveElement = null;
  }

  private clearPointerOpener(): void {
    if (this.pointerOpenerTimer !== null) clearTimeout(this.pointerOpenerTimer);
    this.pointerOpenerTimer = null;
    this.pointerOpener = null;
  }

  private finishClose(): void {
    this.releaseManagedResources(true);
  }

  onNativeClose(): void {
    if (this.ignoredNativeCloseEvents > 0) {
      this.ignoredNativeCloseEvents--;
      return;
    }
    if (this.dialogRef?.nativeElement.open || this.inline()) return;
    if (this.isOpen() || this.visible()) {
      // This close came from outside the signal model. Advance the remembered
      // state here so the next effect pass does not emit `onHide` a second time.
      this.lastIsOpen = false;
      this.lastVisible = false;
      this.onClose();
      this.finishClose();
      if (this.hasOpenNotification) this.onHide.emit();
      this.hasOpenNotification = false;
      this.openNotificationPending = false;
    }
  }

  private focusInitialElement(): void {
    const dialog = this.dialogRef?.nativeElement;
    if (dialog && (this.isOpen() || this.visible()))
      focusInitialElement(dialog);
  }

  trapFocus(event: KeyboardEvent): void {
    if (
      !this.focusTrap() ||
      !this.modal() ||
      !(this.isOpen() || this.visible())
    )
      return;
    const dialog = this.dialogRef?.nativeElement;
    if (dialog) trapTabKey(event, dialog);
  }

  ngOnDestroy(): void {
    this.document.removeEventListener('click', this.capturePointerOpener, true);
    this.document.removeEventListener(
      'pointerdown',
      this.captureBackdropPointerDown,
      true,
    );
    this.clearPointerOpener();
    const dialog = this.dialogRef?.nativeElement;
    if (dialog?.open) {
      this.isOpen.set(false);
      this.visible.set(false);
      this.closeNativeDialog();
    }
    this.finishClose();
  }
}
