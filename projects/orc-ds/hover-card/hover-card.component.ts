import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  model,
  Renderer2,
} from '@angular/core';
import { P2_SHARED_STYLES } from '@ciag/orchestra/internal';
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

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  constructor() {
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
