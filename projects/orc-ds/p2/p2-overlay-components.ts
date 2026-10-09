import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
  effect,
} from '@angular/core';
import { P2_SHARED_STYLES } from './p2-shared';

@Component({
  selector: 'orc-floating-action-button',
  standalone: true,
  template: `<button
    type="button"
    class="orc-p2-fab"
    [class.extended]="extended()"
    [class.loading]="loading()"
    [disabled]="disabled() || loading()"
    [attr.aria-label]="ariaLabel() || label() || 'Create'"
    [attr.aria-busy]="loading() ? 'true' : null"
    (click)="clicked.emit($event)"
  >
    @if (loading()) {
      <span aria-hidden="true">…</span>
    } @else {
      <span aria-hidden="true">{{ icon() }}</span>
    }
    @if (extended() && label()) {
      <span>{{ label() }}</span>
    }
  </button>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-p2-fab { display: inline-flex; gap: .5rem; align-items: center; justify-content: center; min-width: 3rem; min-height: 3rem; border: 0; border-radius: 999px; background: var(--orc-component-interactive); color: var(--orc-component-on-interactive); box-shadow: 0 8px 18px var(--orc-component-interactive-shadow); font-weight: 700; } .orc-p2-fab.extended { padding-inline: 1rem; } .orc-p2-fab:focus-visible { outline: 2px solid var(--orc-component-interactive); outline-offset: 3px; }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatingActionButtonComponent {
  readonly label = input('');
  readonly icon = input('+');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly extended = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly clicked = output<MouseEvent>();
}

/**
 * @deprecated Use `ButtonComponent` (`orc-button` from `@ciag/orchestra/button`) with
 * `variant="close"`. Removed at the 23.0.0 gate.
 */
@Component({
  selector: 'orc-close-button',
  standalone: true,
  template: `<button
    type="button"
    class="orc-p2-close-button"
    [class]="'orc-p2-close-button orc-p2-close-button--' + size()"
    [disabled]="disabled()"
    [attr.aria-label]="ariaLabel() || 'Close'"
    (click)="close.emit()"
  >
    <span aria-hidden="true">{{ icon() }}</span>
  </button>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-p2-close-button { display: inline-grid; place-items: center; border: 0; border-radius: .4rem; background: transparent; color: var(--orc-component-text-secondary); line-height: 1; } .orc-p2-close-button:hover:not(:disabled) { background: var(--orc-component-surface-muted); color: var(--orc-component-text); } .orc-p2-close-button:focus-visible { outline: 2px solid var(--orc-component-interactive); outline-offset: 2px; } .orc-p2-close-button--sm { width: 1.5rem; height: 1.5rem; } .orc-p2-close-button--md { width: 2rem; height: 2rem; } .orc-p2-close-button--lg { width: 2.5rem; height: 2.5rem; font-size: 1.3rem; }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseButtonComponent {
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly icon = input('×');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly close = output<void>();
}

export { ContextMenuComponent } from '@ciag/orchestra/context-menu';
export type { ContextMenuItem } from '@ciag/orchestra/context-menu';

export {
  SplitterComponent,
  SplitterPanelContentDirective,
} from './p2-splitter-component';
export type { SplitterPanel } from './p2-splitter-component';
export { OverlayPanelComponent } from '@ciag/orchestra/overlay-panel';

@Component({
  selector: 'orc-overlay',
  standalone: true,
  template: `<section
    class="orc-p2-overlay"
    [class]="styleClass()"
    [style]="style()"
    [hidden]="!visible()"
    role="presentation"
    (keydown.escape)="onEscape()"
  >
    <ng-content />
  </section>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-p2-overlay{position:absolute;z-index:1000}.orc-p2-overlay[hidden]{display:none}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlayComponent {
  readonly visible = model(false);
  private lastVisible = false;
  private hasObservedVisibility = false;
  /** @deprecated Compatibility-only input; it does not affect this lightweight overlay shell. */
  readonly mode = input<string>('overlay');
  readonly style = input<Record<string, string> | null>(null);
  readonly styleClass = input('');
  /** @deprecated Compatibility-only input; projected content remains in its original container. Use OverlayPanelComponent when target attachment is needed. */
  readonly contentStyle = input<Record<string, string> | null>(null);
  /** @deprecated Compatibility-only input; projected content remains in its original container. Use OverlayPanelComponent when target attachment is needed. */
  readonly contentStyleClass = input('');
  /** @deprecated Compatibility-only input; this shell is not positioned relative to a target. Use OverlayPanelComponent for target positioning. */
  readonly target = input<string | HTMLElement | null>(null);
  /** @deprecated Compatibility-only input; this shell does not move or append projected nodes. Use OverlayPanelComponent for portal attachment. */
  readonly appendTo = input<'body' | HTMLElement | undefined>(undefined);
  /** @deprecated Compatibility-only input; this shell uses its stylesheet z-index. */
  readonly autoZIndex = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility-only input; this shell uses its stylesheet z-index. */
  readonly baseZIndex = input(0);
  /** @deprecated Compatibility-only input; this shell does not animate visibility transitions. */
  readonly showTransitionOptions = input('');
  /** @deprecated Compatibility-only input; this shell does not animate visibility transitions. */
  readonly hideTransitionOptions = input('');
  readonly onShow = output<void>();
  readonly onHide = output<void>();

  constructor() {
    effect(() => {
      const next = this.visible();
      if (!this.hasObservedVisibility) {
        this.hasObservedVisibility = true;
        this.lastVisible = next;
        return;
      }
      if (next === this.lastVisible) return;
      this.lastVisible = next;
      if (next) this.onShow.emit();
      else this.onHide.emit();
    });
  }

  show(): void {
    if (!this.visible()) {
      this.lastVisible = true;
      this.visible.set(true);
      this.onShow.emit();
    }
  }
  hide(): void {
    if (this.visible()) {
      this.lastVisible = false;
      this.visible.set(false);
      this.onHide.emit();
    }
  }
  toggle(): void {
    if (this.visible()) this.hide();
    else this.show();
  }
  onEscape(): void {
    this.hide();
  }
}

export { PopoverComponent } from '@ciag/orchestra/popover';

export { SpeedDialComponent } from '@ciag/orchestra/speed-dial';
export type { SpeedDialAction } from '@ciag/orchestra/speed-dial';
export { PortalComponent } from './p2-portal-component';
