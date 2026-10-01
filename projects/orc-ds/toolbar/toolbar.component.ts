import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Directive,
  DestroyRef,
  ElementRef,
  HostListener,
  OnChanges,
  QueryList,
  SimpleChanges,
  booleanAttribute,
  inject,
  input,
  output,
} from '@angular/core';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[orcToolbarItem]',
  standalone: true,
  host: {
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.disabled]': 'disabled() ? true : null',
  },
})
export class ToolbarItemDirective implements OnChanges {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly stateChange = output<void>();

  constructor(readonly elementRef: ElementRef<HTMLElement>) {}

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.disabled()) {
      this.elementRef.nativeElement.setAttribute('tabindex', '-1');
    } else {
      this.elementRef.nativeElement.removeAttribute('tabindex');
    }
    this.stateChange.emit();
  }

  @HostListener('click', ['$event'])
  preventDisabledActivation(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}

export type ToolbarOrientation = 'horizontal' | 'vertical';

@Component({
  selector: 'orc-toolbar',
  standalone: true,
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent implements AfterContentInit {
  @ContentChildren(ToolbarItemDirective, { descendants: true })
  readonly items!: QueryList<ToolbarItemDirective>;
  readonly orientation = input<ToolbarOrientation>('horizontal');
  readonly label = input<string | undefined>(undefined);
  readonly styleClass = input('');
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly loop = input(true, { transform: booleanAttribute });
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private itemSubscriptions = new Subscription();
  private readonly lifetime = new Subscription();

  ngAfterContentInit(): void {
    this.syncItemSubscriptions();
    this.updateTabStops(
      this.currentEnabledIndex() < 0 ? 0 : this.currentEnabledIndex(),
    );
    this.lifetime.add(
      this.items.changes.subscribe(() => {
        this.syncItemSubscriptions();
        const activeIndex = this.currentEnabledIndex();
        this.updateTabStops(activeIndex < 0 ? 0 : activeIndex);
      }),
    );
    this.destroyRef.onDestroy(() => {
      this.lifetime.unsubscribe();
      this.itemSubscriptions.unsubscribe();
    });
  }

  private enabledItems(): ToolbarItemDirective[] {
    return this.items?.toArray().filter((item) => !item.disabled()) ?? [];
  }

  private currentEnabledIndex(): number {
    const activeElement = this.host.nativeElement.ownerDocument.activeElement;
    return this.enabledItems().findIndex(
      (item) => item.elementRef.nativeElement === activeElement,
    );
  }

  private isRtl(): boolean {
    const host = this.host.nativeElement as HTMLElement;
    const toolbarElement =
      (host.querySelector('[role="toolbar"]') as HTMLElement | null) ?? host;
    return (
      this.host.nativeElement.ownerDocument.defaultView?.getComputedStyle(
        toolbarElement,
      ).direction === 'rtl'
    );
  }

  private syncItemSubscriptions(): void {
    this.itemSubscriptions.unsubscribe();
    this.itemSubscriptions = new Subscription();
    for (const item of this.items.toArray()) {
      this.itemSubscriptions.add(
        item.stateChange.subscribe(() => {
          const activeIndex = this.currentEnabledIndex();
          this.updateTabStops(activeIndex < 0 ? 0 : activeIndex);
        }),
      );
    }
  }

  private updateTabStops(activeIndex: number): void {
    const enabled = this.enabledItems();
    enabled.forEach((item, index) =>
      item.elementRef.nativeElement.setAttribute(
        'tabindex',
        index === activeIndex ? '0' : '-1',
      ),
    );
  }

  onFocusIn(): void {
    const index = this.currentEnabledIndex();
    if (index >= 0) this.updateTabStops(index);
  }

  onKeydown(event: KeyboardEvent): void {
    const rtl = this.isRtl();
    const forward =
      this.orientation() === 'horizontal'
        ? event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')
        : event.key === 'ArrowDown';
    const backward =
      this.orientation() === 'horizontal'
        ? event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')
        : event.key === 'ArrowUp';
    if (!forward && !backward && event.key !== 'Home' && event.key !== 'End')
      return;
    const items = this.enabledItems();
    if (!items.length) return;
    const active = this.host.nativeElement.ownerDocument.activeElement;
    let index = items.findIndex(
      (item) => item.elementRef.nativeElement === active,
    );
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
    this.updateTabStops(index);
    items[index].elementRef.nativeElement.focus();
  }

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    this.onKeydown(event);
  }
  @HostListener('focusin')
  handleFocusIn(): void {
    this.onFocusIn();
  }
}
