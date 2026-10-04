import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  DestroyRef,
  inject,
  effect,
  viewChild,
  booleanAttribute,
  input,
  model,
  output,
} from '@angular/core';

import { DOCUMENT } from '@angular/common';
import {
  focusInitialElement,
  isolateModalBackground,
  isTopOverlay,
  lockDocumentScroll,
  registerOverlay,
  trapTabKey,
} from '@ciag/orchestra/internal';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';

@Component({
  selector: 'orc-drawer, orc-sidebar',
  standalone: true,
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerComponent {
  readonly open = model(false);
  /** PrimeNG-compatible visibility alias. */
  readonly visible = model(false);
  readonly placement = input<DrawerPlacement>('right');
  readonly label = input<string | undefined>(undefined);
  readonly closeOnBackdrop = input(true, { transform: booleanAttribute });
  readonly dismissible = input(true, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  readonly modal = input(true, { transform: booleanAttribute });
  readonly id = input('');
  readonly ariaLabel = input('');
  readonly ariaLabelledBy = input('');
  readonly closable = input(true, { transform: booleanAttribute });
  readonly showCloseIcon = input(true, { transform: booleanAttribute });
  readonly closeAriaLabel = input<string | undefined>(undefined);
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | null>(null);
  readonly baseZIndex = input(1000);
  readonly closed = output<void>();
  readonly onShow = output<void>();
  readonly onHide = output<void>();

  readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  readonly backdrop = viewChild<ElementRef<HTMLElement>>('backdrop');
  private releaseIsolation?: () => void;
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private previousOpen = false;
  private previousVisible = false;

  constructor() {
    effect(() => {
      const open = this.open();
      const visible = this.visible();
      const next =
        open !== this.previousOpen
          ? open
          : visible !== this.previousVisible
            ? visible
            : open;
      this.previousOpen = next;
      this.previousVisible = next;
      if (open !== next) this.open.set(next);
      if (visible !== next) this.visible.set(next);
    });
    effect((onCleanup) => {
      const panel = this.panel()?.nativeElement;
      if (!this.open() || !panel) return;
      const previousFocus = this.document.activeElement as HTMLElement | null;
      const releaseLayer = registerOverlay(panel, {
        onParentClose: () => {
          this.close();
          this.releaseIsolation?.();
          this.releaseIsolation = undefined;
        },
      });
      const keydown = (event: KeyboardEvent) => this.onKeydown(event);
      this.document.addEventListener('keydown', keydown);
      focusInitialElement(panel);
      this.onShow.emit();
      onCleanup(() => {
        this.document.removeEventListener('keydown', keydown);
        releaseLayer();
        this.releaseIsolation?.();
        this.releaseIsolation = undefined;
        if (previousFocus?.isConnected)
          previousFocus.focus({ preventScroll: true });
        if (!this.destroyRef.destroyed) this.onHide.emit();
      });
    });
    effect((onCleanup) => {
      const panel = this.panel()?.nativeElement;
      const backdrop = this.backdrop()?.nativeElement;
      if (this.open() && this.modal() && panel) {
        const release = isolateModalBackground(
          panel,
          backdrop ? [backdrop] : [],
        );
        this.releaseIsolation = release;
        onCleanup(() => {
          release();
          if (this.releaseIsolation === release)
            this.releaseIsolation = undefined;
        });
      }
    });
    effect((onCleanup) => {
      if (this.open() && this.modal())
        onCleanup(lockDocumentScroll(this.document));
    });
  }

  show(): void {
    this.open.set(true);
    this.visible.set(true);
  }

  close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.visible.set(false);
    this.closed.emit();
  }

  onBackdrop(): void {
    const panel = this.panel()?.nativeElement;
    if (
      panel &&
      isTopOverlay(panel) &&
      this.dismissible() &&
      this.closeOnBackdrop()
    )
      this.close();
  }

  onKeydown(event: KeyboardEvent): void {
    const panel = this.panel()?.nativeElement;
    if (
      !this.open() ||
      !panel ||
      !isTopOverlay(panel) ||
      event.defaultPrevented
    )
      return;
    if (event.key === 'Escape' && this.closeOnEscape()) {
      event.preventDefault();
      this.close();
    } else if (this.modal()) trapTabKey(event, panel);
  }

  onEscape(): void {
    this.onKeydown(
      new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }),
    );
  }
}
