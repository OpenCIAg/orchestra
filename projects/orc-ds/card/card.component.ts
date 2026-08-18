import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'orc-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  clickable = input<boolean>(false);
  selected = input<boolean>(false);
  variant = input<'simple' | 'dashboard'>('simple');
  header = input<string | undefined>(undefined);
  subheader = input<string | undefined>(undefined);
  styleClass = input('');
  style = input<Record<string, string | number> | undefined>(undefined);
  ariaLabel = input('');

  cardClick = output<void>();
  onClickEvent = output<MouseEvent>();

  onClick(): void {
    if (this.clickable()) {
      this.cardClick.emit();
    }
  }
}
