import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  TemplateRef,
  ViewContainerRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef, PositionStrategy, ConnectedPosition } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DropdownItem } from './dropdown.types';

@Component({
  selector: 'orc-dropdown',
  standalone: true,
  imports: [],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent implements AfterViewInit {
  readonly items = input<DropdownItem[]>([]);
  readonly placement = input<string>('bottom-start');

  readonly itemSelect = output<DropdownItem>();

  private overlayRef: OverlayRef | null = null;
  private portal!: TemplatePortal<unknown>;
  private hostEl = inject(ElementRef);
  private viewContainerRef = inject(ViewContainerRef);
  private overlay = inject(Overlay);

  readonly dropdownPanel = viewChild.required<TemplateRef<unknown>>('dropdownPanel');
  readonly isOpen = signal(false);

  ngAfterViewInit(): void {
    this.portal = new TemplatePortal(this.dropdownPanel(), this.viewContainerRef);
  }

  open(): void {
    if (this.isOpen()) return;
    const positionStrategy = this.createPositionStrategy();
    const overlayConfig = new OverlayConfig({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
    this.overlayRef = this.overlay.create(overlayConfig);
    this.overlayRef.backdropClick().subscribe(() => this.close());
    this.overlayRef.keydownEvents().subscribe((event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.close();
        event.stopPropagation();
      }
    });
    this.overlayRef.attach(this.portal);
    this.isOpen.set(true);
    setTimeout(() => this.overlayRef?.overlayElement.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')?.focus());
  }

  close(): void {
    if (!this.isOpen()) return;
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen() ? this.close() : this.open();
  }

  onItemClick(item: DropdownItem, $event: MouseEvent): void {
    if (item.disabled) {
      $event.stopPropagation();
      return;
    }
    if (item.children?.length) {
      return;
    }
    this.itemSelect.emit(item);
    item.action?.();
    this.close();
  }

  onItemKeydown(event: KeyboardEvent): void {
    const current = event.currentTarget as HTMLButtonElement;
    const menu = current.closest<HTMLElement>('[role="menu"]');
    const buttons = Array.from(menu?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])') ?? []);
    const index = buttons.indexOf(current);
    if (!buttons.length || index < 0) return;
    const target = event.key === 'ArrowDown' ? buttons[(index + 1) % buttons.length]
      : event.key === 'ArrowUp' ? buttons[(index - 1 + buttons.length) % buttons.length]
      : event.key === 'Home' ? buttons[0]
      : event.key === 'End' ? buttons[buttons.length - 1]
      : undefined;
    if (target) { event.preventDefault(); target.focus(); }
  }

  private createPositionStrategy(): PositionStrategy {
    const positions = this.getConnectedPositions();
    return this.overlay
      .position()
      .flexibleConnectedTo(this.hostEl)
      .withPositions(positions)
      .withFlexibleDimensions(false)
      .withPush(true);
  }

  private getConnectedPositions(): ConnectedPosition[] {
    switch (this.placement()) {
      case 'bottom-end':
        return [{ originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' }];
      case 'top-start':
        return [{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }];
      case 'top-end':
        return [{ originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' }];
      default:
        return [{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }];
    }
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (!this.isOpen()) return;
    const inside = target instanceof Node && this.hostEl.nativeElement.contains(target);
    if (!inside) this.close();
  }
}
