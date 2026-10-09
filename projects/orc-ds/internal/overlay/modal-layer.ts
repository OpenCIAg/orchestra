import {
  Injectable,
  InjectionToken,
  Injector,
  inject,
  StaticProvider,
  TemplateRef,
  Type,
  ViewContainerRef,
} from '@angular/core';
import {
  AutoFocusTarget,
  CdkDialogContainer,
  Dialog,
  DialogRef,
} from '@angular/cdk/dialog';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { createGlobalPositionStrategy, OverlayRef } from '@angular/cdk/overlay';
import { Observable } from 'rxjs';

/** Data passed to the component/template opened by `OrcModalLayer.open`. */
export const ORC_DIALOG_DATA = new InjectionToken<unknown>('ORC_DIALOG_DATA');

/** Edge a drawer slides from. `start`/`end` follow the text direction. */
export type OrcDrawerSide = 'start' | 'end' | 'top' | 'bottom';

/** Options of a modal surface (dialog, drawer, confirmation). */
export interface OrcModalConfig<D = unknown, R = unknown> {
  /** Injected as `ORC_DIALOG_DATA`. */
  data?: D;
  /** `'alertdialog'` for confirmations that interrupt the user. Default `'dialog'`. */
  role?: 'dialog' | 'alertdialog';
  /** Accessible name when there is no visible heading. */
  ariaLabel?: string | null;
  /** Id of the visible heading. */
  ariaLabelledBy?: string | null;
  /** Id of the descriptive text. */
  ariaDescribedBy?: string | null;
  /** Escape closes the topmost modal. Default true. */
  closeOnEscape?: boolean;
  /** Clicking the backdrop closes. Default true, false for `alertdialog`. */
  closeOnBackdropClick?: boolean;
  /** Initial focus target. Default `'first-tabbable'`. */
  autoFocus?: AutoFocusTarget | string | false;
  /** Return focus on close: true (element focused before open), a selector or an element. Default true. */
  restoreFocus?: boolean | string | HTMLElement;
  /** Show the dimming backdrop. Default true. */
  hasBackdrop?: boolean;
  /** Render as a drawer docked to this edge instead of a centered dialog. */
  drawer?: OrcDrawerSide;
  /** Extra classes on the overlay pane (`orc-modal-pane` is always added). */
  panelClass?: string | readonly string[];
  width?: string;
  height?: string;
  minWidth?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;
  /** Where the content is logically attached (DI and change detection parent). */
  viewContainerRef?: ViewContainerRef;
  /** Injector for the content. */
  injector?: Injector;
  /** Extra providers for the content. */
  providers?: StaticProvider[];
  /** Custom container (a `CdkDialogContainer` subclass styled by the modal family). */
  container?: Type<CdkDialogContainer>;
  /** Veto for every close attempt (Escape, backdrop and `close()`). */
  canClose?: (result: R | undefined) => boolean;
}

/** Handle of an open modal surface. Also injectable inside the opened content. */
export class OrcModalRef<R = unknown, C = unknown> {
  /** Resolves with the close result (undefined when dismissed). */
  readonly result: Promise<R | undefined>;

  constructor(private readonly cdkRef: DialogRef<R, C>) {
    this.result = new Promise((resolve) =>
      cdkRef.closed.subscribe((value) => resolve(value)),
    );
  }

  /** Unique id of the dialog element. */
  get id(): string {
    return this.cdkRef.id;
  }

  /** Instance of the opened component (null for templates or after close). */
  get componentInstance(): C | null {
    return this.cdkRef.componentInstance;
  }

  /** Emits once with the result, then completes. */
  get closed(): Observable<R | undefined> {
    return this.cdkRef.closed;
  }

  /** The CDK overlay hosting this modal. */
  get overlayRef(): OverlayRef {
    return this.cdkRef.overlayRef;
  }

  /** Closes with an optional result (subject to `canClose`). */
  close(result?: R): void {
    this.cdkRef.close(result);
  }

  /** Recomputes the position after a content size change. */
  updatePosition(): void {
    this.cdkRef.updatePosition();
  }
}

/**
 * Modal layer (dialog, drawer, confirmation) over `@angular/cdk/dialog`.
 *
 * Provides FocusTrap, initial focus, focus restoration, `aria-modal` with the
 * rest of the page hidden from assistive technology, scroll blocking, Escape
 * for the topmost modal only, and correct stacking of nested modals. Anchored
 * panels opened from inside a modal (`injectAnchoredOverlay`) and toasts
 * (`OrcToastLayer`) are stacked above it — no native `<dialog>`, no z-index.
 *
 * ```ts
 * const ref = inject(OrcModalLayer).open(EditProjectComponent, {
 *   data: project,
 *   ariaLabelledBy: 'edit-title',
 * });
 * const saved = await ref.result;
 * ```
 */
@Injectable({ providedIn: 'root' })
export class OrcModalLayer {
  private readonly dialog = inject(Dialog);
  private readonly injector = inject(Injector);
  private readonly refs = new Map<DialogRef<unknown, unknown>, OrcModalRef>();

  /** Modals currently open, bottom to top. */
  get openModals(): readonly OrcModalRef[] {
    return this.dialog.openDialogs
      .map((ref) => this.refs.get(ref))
      .filter((ref): ref is OrcModalRef => !!ref);
  }

  /** Opens a component or template as a modal surface. */
  open<R = unknown, D = unknown, C = unknown>(
    content: Type<C> | TemplateRef<C>,
    config: OrcModalConfig<D, R> = {},
  ): OrcModalRef<R, C> {
    let modalRef: OrcModalRef<R, C> | undefined;
    const getRef = (cdkRef: DialogRef<R, C>) =>
      (modalRef ??= new OrcModalRef<R, C>(cdkRef));
    const role = config.role ?? 'dialog';
    const extra = config.panelClass ?? [];
    const drawer = config.drawer;
    const panelClass = [
      'orc-modal-pane',
      ...(drawer
        ? ['orc-modal-pane--drawer', `orc-modal-pane--drawer-${drawer}`]
        : []),
      ...(typeof extra === 'string' ? [extra] : extra),
    ];

    const cdkRef = this.dialog.open<R, D, C>(content, {
      data: config.data,
      role,
      ariaLabel: config.ariaLabel ?? null,
      ariaLabelledBy: config.ariaLabelledBy ?? null,
      ariaDescribedBy: config.ariaDescribedBy ?? null,
      ariaModal: true,
      autoFocus:
        config.autoFocus === false
          ? false
          : (config.autoFocus ?? 'first-tabbable'),
      restoreFocus: config.restoreFocus ?? true,
      hasBackdrop: config.hasBackdrop ?? true,
      backdropClass: 'orc-modal-backdrop',
      panelClass,
      // Escape/backdrop are handled below so each can be toggled separately.
      disableClose: true,
      closePredicate: config.canClose
        ? (result: unknown) => config.canClose!(result as R | undefined)
        : undefined,
      width:
        config.width ??
        (drawer === 'top' || drawer === 'bottom' ? '100%' : undefined),
      height:
        config.height ??
        (drawer === 'start' || drawer === 'end' ? '100%' : undefined),
      minWidth: config.minWidth,
      maxWidth: config.maxWidth ?? (drawer ? '100%' : undefined),
      maxHeight: config.maxHeight,
      positionStrategy: drawer ? this.drawerPosition(drawer) : undefined,
      viewContainerRef: config.viewContainerRef,
      injector: config.injector,
      container: config.container,
      providers: (ref: DialogRef<R, C>) => [
        { provide: ORC_DIALOG_DATA, useValue: config.data },
        { provide: OrcModalRef, useValue: getRef(ref) },
        ...(config.providers ?? []),
      ],
    });

    const ref = getRef(cdkRef);
    this.refs.set(cdkRef as DialogRef<unknown, unknown>, ref as OrcModalRef);
    const closeOnBackdrop =
      config.closeOnBackdropClick ?? role !== 'alertdialog';

    const keys = cdkRef.keydownEvents.subscribe((event) => {
      if (
        event.key === 'Escape' &&
        config.closeOnEscape !== false &&
        !hasModifierKey(event)
      ) {
        event.preventDefault();
        ref.close();
      }
    });
    const backdrop = cdkRef.backdropClick.subscribe(() => {
      if (closeOnBackdrop) ref.close();
    });
    cdkRef.closed.subscribe(() => {
      keys.unsubscribe();
      backdrop.unsubscribe();
      this.refs.delete(cdkRef as DialogRef<unknown, unknown>);
    });
    return ref;
  }

  /** Closes every open modal, topmost first. */
  closeAll(): void {
    this.dialog.closeAll();
  }

  private drawerPosition(side: OrcDrawerSide) {
    const strategy = createGlobalPositionStrategy(this.injector);
    switch (side) {
      case 'start':
        return strategy.start('0').top('0');
      case 'end':
        return strategy.end('0').top('0');
      case 'top':
        return strategy.top('0').left('0');
      case 'bottom':
        return strategy.bottom('0').left('0');
    }
  }
}
