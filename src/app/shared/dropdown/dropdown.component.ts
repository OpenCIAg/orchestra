// src/app/shared/dropdown/dropdown.component.ts

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
import { DropdownItem } from '../models/dropdown-item.model';

/**
 * DropdownComponent – a simple action menu that supports icons, shortcuts, danger styling and nested sub‑menus.
 */
@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent implements AfterViewInit {
  // ---------- Inputs ----------
  items = input<DropdownItem[]>([]);
  placement = input<string>('bottom-start'); // placement for overlay

  // ---------- Outputs ----------
  itemSelect = output<DropdownItem>();

  // ---------- Internal state ----------
  private overlayRef: OverlayRef | null = null;
  private portal!: TemplatePortal<unknown>;
  private hostEl = inject(ElementRef);
  private viewContainerRef = inject(ViewContainerRef);
  private overlay = inject(Overlay);

  /** Signal for the template portal reference */
  dropdownPanel = viewChild.required<TemplateRef<unknown>>('dropdownPanel');

  /** Signal that indicates whether the panel is opened */
  isOpen = signal(false);

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
      // sub‑menu logic could be added later
    } else {
      this.itemSelect.emit(item);
      item.action?.();
      this.close();
    }
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