import { ChangeDetectionStrategy, Component, ContentChildren, Directive, ElementRef, HostListener, QueryList, booleanAttribute, input } from '@angular/core';

@Directive({
  selector: '[orcToolbarItem]',
  standalone: true,
  host: {
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
  },
})
export class ToolbarItemDirective {
  readonly disabled = input(false, { transform: booleanAttribute });
  constructor(readonly elementRef: ElementRef<HTMLElement>) {}
}

export type ToolbarOrientation = 'horizontal' | 'vertical';

@Component({
  selector: 'orc-toolbar',
  standalone: true,
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {
  @ContentChildren(ToolbarItemDirective, { descendants: true }) readonly items!: QueryList<ToolbarItemDirective>;
  readonly orientation = input<ToolbarOrientation>('horizontal');
  readonly label = input('Toolbar');
  readonly loop = input(true, { transform: booleanAttribute });

  onKeydown(event: KeyboardEvent): void {
    const forward = this.orientation() === 'horizontal' ? event.key === 'ArrowRight' : event.key === 'ArrowDown';
    const backward = this.orientation() === 'horizontal' ? event.key === 'ArrowLeft' : event.key === 'ArrowUp';
    if (!forward && !backward && event.key !== 'Home' && event.key !== 'End') return;
    const items = this.items?.toArray().filter(item => !item.disabled()) ?? [];
    if (!items.length) return;
    const active = document.activeElement;
    let index = items.findIndex(item => item.elementRef.nativeElement === active);
    if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = items.length - 1;
    else {
      if (index < 0) index = forward ? -1 : items.length;
      const next = index + (forward ? 1 : -1);
      if (next >= 0 && next < items.length) index = next;
      else if (this.loop()) index = (next + items.length) % items.length;
      else return;
    }
    event.preventDefault();
    items[index].elementRef.nativeElement.focus();
  }

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void { this.onKeydown(event); }
}
