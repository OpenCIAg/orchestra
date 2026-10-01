import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  model,
  output,
  Renderer2,
  signal,
} from '@angular/core';
import { P2_SHARED_STYLES } from './p2-shared';

@Component({
  selector: 'orc-code',
  standalone: true,
  template: `
    <div class="orc-p2-code">
      <div class="toolbar">
        @if (language()) {
          <span
            class="language"
            [attr.aria-label]="'Language: ' + language()"
            >{{ language() }}</span
          >
        }
        <button type="button" (click)="copy()">
          {{ copied() ? copiedLabel() : copyLabel() }}
        </button>
      </div>
      <pre><code [attr.data-language]="language() || null">{{ code() }}</code></pre>
      <span class="sr-only" aria-live="polite" aria-atomic="true">{{
        copyStatus()
      }}</span>
    </div>
  `,
  styles: [
    P2_SHARED_STYLES +
      `
    :host { display: block; }
    .orc-p2-code { overflow: hidden; border: 1px solid var(--orc-component-code-border); border-radius: .75rem; background: var(--orc-component-code-surface); color: var(--orc-component-code-text); }
    .toolbar { display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding: .45rem .7rem; border-bottom: 1px solid var(--orc-component-code-border); color: var(--orc-component-code-muted); font-size: .75rem; }
    .toolbar button { flex: none; border: 0; border-radius: .35rem; background: var(--orc-component-code-surface-raised); color: var(--orc-component-code-text); padding: .35rem .6rem; font: inherit; cursor: pointer; }
    .toolbar button:focus-visible { outline: 2px solid var(--orc-component-interactive); outline-offset: 2px; }
    pre { max-width: 100%; max-height: 32rem; margin: 0; overflow: auto; padding: 1rem; tab-size: 2; }
    code { font: .82rem/1.6 ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
  `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeComponent {
  readonly code = input('');
  readonly language = input<string | undefined>(undefined);
  readonly copyLabel = input('Copy');
  readonly copiedLabel = input('Copied');
  readonly copyFailedLabel = input('Copy failed');
  readonly copied = signal(false);
  readonly copyStatus = signal('');
  readonly copiedEvent = output<string>();
  readonly copyFailed = output<unknown>();
  private readonly destroyRef = inject(DestroyRef);
  private resetTimer: ReturnType<typeof setTimeout> | undefined;
  private copyAttempt = 0;

  constructor() {
    this.destroyRef.onDestroy(() => this.clearResetTimer());
  }

  async copy(): Promise<void> {
    const attempt = ++this.copyAttempt;
    this.clearResetTimer();
    const value = this.code();
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        throw new Error(
          'Clipboard API is unavailable in this browser context.',
        );
      }
      await navigator.clipboard.writeText(value);
      if (this.destroyRef.destroyed || attempt !== this.copyAttempt) return;
      this.copied.set(true);
      this.copyStatus.set(this.copiedLabel());
      this.copiedEvent.emit(value);
      this.resetTimer = setTimeout(() => {
        this.resetTimer = undefined;
        if (!this.destroyRef.destroyed) {
          this.copied.set(false);
          this.copyStatus.set('');
        }
      }, 1200);
    } catch (error) {
      if (this.destroyRef.destroyed || attempt !== this.copyAttempt) return;
      this.copied.set(false);
      this.copyStatus.set(this.copyFailedLabel());
      this.copyFailed.emit(error);
    }
  }

  private clearResetTimer(): void {
    if (this.resetTimer !== undefined) {
      clearTimeout(this.resetTimer);
      this.resetTimer = undefined;
    }
  }
}

export { MenubarComponent } from './p2-menubar-component';
export type { MenubarItem } from './p2-menubar-component';

export { TagComponent } from '@ciag/orchestra/tag';
export type { TagVariant } from '@ciag/orchestra/tag';

@Component({
  selector: 'orc-hover-card',
  standalone: true,
  template: `<div
    class="orc-p2-hover-card"
    (mouseenter)="openCard()"
    (mouseleave)="onMouseLeave()"
    (focusin)="onFocusIn($event)"
    (focusout)="onFocusOut($event)"
    (keydown)="onKeydown($event)"
  >
    <span class="trigger"><ng-content select="[hover-card-trigger]" /></span>
    @if (open()) {
      <div
        class="content"
        role="dialog"
        [attr.id]="id() || null"
        [attr.aria-label]="label() || null"
      >
        <ng-content />
      </div>
    }
  </div>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-p2-hover-card { position: relative; display: inline-block; } .trigger { display: inline-block; } .content { position: absolute; z-index: 3; top: calc(100% + .5rem); left: 0; width: min(20rem, 80vw); padding: .75rem; border: 1px solid var(--orc-component-border-strong); border-radius: .65rem; background: var(--orc-component-surface); box-shadow: 0 12px 28px var(--orc-component-shadow-color); color: var(--orc-component-text); }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoverCardComponent implements AfterViewInit {
  readonly open = model(false);
  readonly label = input<string | undefined>(undefined);
  readonly id = input<string | undefined>(undefined);

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
  ) {
    effect(() => {
      this.open();
      this.id();
      this.syncTriggerAttributes();
    });
  }

  ngAfterViewInit(): void {
    this.syncTriggerAttributes();
  }

  private syncTriggerAttributes(): void {
    const trigger = this.host.nativeElement.querySelector<HTMLElement>(
      '[hover-card-trigger]',
    );
    if (!trigger) return;
    this.renderer.setAttribute(trigger, 'aria-haspopup', 'dialog');
    this.renderer.setAttribute(trigger, 'aria-expanded', String(this.open()));
    const panelId = this.id();
    if (panelId) this.renderer.setAttribute(trigger, 'aria-controls', panelId);
    else this.renderer.removeAttribute(trigger, 'aria-controls');
  }

  openCard(): void {
    this.open.set(true);
    this.syncTriggerAttributes();
  }
  closeCard(): void {
    this.open.set(false);
    this.syncTriggerAttributes();
  }

  onFocusIn(event: FocusEvent): void {
    const host = event.currentTarget as HTMLElement;
    const previousTarget = event.relatedTarget as Node | null;
    if (
      !this.suppressFocusOpen &&
      (!previousTarget || !host.contains(previousTarget))
    )
      this.openCard();
  }

  onMouseLeave(): void {
    if (
      !this.host.nativeElement.contains(
        this.host.nativeElement.ownerDocument.activeElement,
      )
    )
      this.closeCard();
  }

  onFocusOut(event: FocusEvent): void {
    const host = event.currentTarget as HTMLElement;
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && host.contains(nextTarget)) return;
    queueMicrotask(() => {
      if (!host.contains(host.ownerDocument.activeElement)) this.closeCard();
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.open()) return;
    event.preventDefault();
    const host = event.currentTarget as HTMLElement;
    const panel = host.querySelector('.content');
    const focusWasInPanel = !!panel?.contains(host.ownerDocument.activeElement);
    this.closeCard();
    if (focusWasInPanel) {
      const trigger = host.querySelector<HTMLElement>('[hover-card-trigger]');
      if (trigger) {
        // Refocusing the trigger stays inside this component and must not reopen the card.
        this.suppressFocusOpen = true;
        trigger.focus();
        this.suppressFocusOpen = false;
      }
    }
  }

  private suppressFocusOpen = false;
}

export { DataTableComponent } from './p2-data-table-component';
export type { DataTableColumn } from './p2-data-table-component';

export { EmptyStateComponent } from '@ciag/orchestra/empty-state';
export { VirtualScrollerComponent } from './p2-virtual-scroller-component';
