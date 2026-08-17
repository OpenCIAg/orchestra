import { ChangeDetectionStrategy, Component, HostListener, booleanAttribute, input, model, output } from '@angular/core';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';

@Component({
  selector: 'orc-drawer',
  standalone: true,
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerComponent {
  readonly open = model(false);
  readonly placement = input<DrawerPlacement>('right');
  readonly label = input('Painel lateral');
  readonly closeOnBackdrop = input(true, { transform: booleanAttribute });
  readonly dismissible = input(true, { transform: booleanAttribute });
  readonly closed = output<void>();

  close(): void {
    if (!this.dismissible()) return;
    this.open.set(false);
    this.closed.emit();
  }

  onBackdrop(): void {
    if (this.closeOnBackdrop()) this.close();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.close();
  }
}
