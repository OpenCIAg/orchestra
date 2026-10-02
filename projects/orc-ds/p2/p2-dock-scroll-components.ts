import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { P2_SHARED_STYLES } from './p2-shared';

export { DockComponent } from '@ciag/orchestra/dock';
export type { DockItem } from '@ciag/orchestra/dock';

@Component({
  selector: 'orc-scroll-panel',
  standalone: true,
  template: `
    <div
      #panel
      class="orc-scroll-panel {{ styleClass() }}"
      [style]="style()"
      [style.height]="height()"
      [style.max-height]="maxHeight()"
      [attr.id]="contentId()"
      [attr.aria-label]="label() || 'Scrollable content'"
      role="region"
      tabindex="0"
      (keydown)="onKeydown($event)"
      (scroll)="onScroll.emit($event)"
    >
      <ng-content />
    </div>
  `,
  styles: [
    P2_SHARED_STYLES +
      `.orc-scroll-panel{display:block;width:100%;overflow:auto;scrollbar-color:var(--orc-component-text-muted) var(--orc-component-surface-muted);scroll-behavior:smooth}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollPanelComponent {
  readonly panel = viewChild<ElementRef<HTMLDivElement>>('panel');
  readonly height = input('auto');
  readonly maxHeight = input('20rem');
  readonly step = input(5);
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly contentId = input<string | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);
  readonly onScroll = output<Event>();

  scrollTop(value: number): void {
    const element = this.panel()?.nativeElement;
    if (element && Number.isFinite(value))
      element.scrollTo({ top: Math.max(0, value) });
  }

  onKeydown(event: KeyboardEvent): void {
    const element = this.panel()?.nativeElement;
    // Leave keys alone when focus is in projected controls such as inputs and buttons.
    if (
      !element ||
      event.target !== element ||
      element.scrollHeight <= element.clientHeight ||
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return;
    }

    const pageAmount = Math.max(1, element.clientHeight);
    const configuredStep = this.step();
    const lineAmount =
      Number.isFinite(configuredStep) && configuredStep > 0
        ? configuredStep
        : 5;
    const amount =
      event.key === 'PageDown' || event.key === 'PageUp'
        ? pageAmount
        : lineAmount;

    if (event.key === 'ArrowDown' || event.key === 'PageDown') {
      event.preventDefault();
      element.scrollBy({ top: amount });
    } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
      event.preventDefault();
      element.scrollBy({ top: -amount });
    } else if (event.key === 'Home') {
      event.preventDefault();
      element.scrollTo({ top: 0 });
    } else if (event.key === 'End') {
      event.preventDefault();
      element.scrollTo({ top: element.scrollHeight });
    }
  }

  refresh(): void {
    const element = this.panel()?.nativeElement;
    const EventConstructor = element?.ownerDocument.defaultView?.Event;
    if (element && EventConstructor)
      element.dispatchEvent(new EventConstructor('scroll'));
  }
}
