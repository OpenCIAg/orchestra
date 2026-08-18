import { ChangeDetectionStrategy, Component, HostListener, booleanAttribute, input, model, output } from '@angular/core';

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
  readonly visible = this.open;
  readonly placement = input<DrawerPlacement>('right');
  readonly label = input('Painel lateral');
  readonly closeOnBackdrop = input(true, { transform: booleanAttribute });
  readonly dismissible = input(true, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  readonly modal = input(true, { transform: booleanAttribute });
  readonly id = input('');
  readonly ariaLabel = input('');
  readonly ariaLabelledBy = input('');
  readonly closable = input(true, { transform: booleanAttribute });
  readonly showCloseIcon = input(true, { transform: booleanAttribute });
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | null>(null);
  readonly baseZIndex = input(1000);
  readonly closed = output<void>();
  readonly onShow = output<void>();
  readonly onHide = output<void>();

  show(): void { if (!this.open()) { this.open.set(true); this.onShow.emit(); } }

  close(): void {
    this.open.set(false);
    this.closed.emit();
    this.onHide.emit();
  }

  onBackdrop(): void {
    if (this.dismissible() && this.closeOnBackdrop()) this.close();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open() && this.closeOnEscape()) this.close();
  }
}
