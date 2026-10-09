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
import { ORC_SHARED_VARS } from '@ciag/orchestra/internal';
@Component({
  selector: 'orc-hover-card',
  standalone: true,
  templateUrl: './hover-card.component.html',
  styles: [ORC_SHARED_VARS],
  styleUrl: './hover-card.component.scss',
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
