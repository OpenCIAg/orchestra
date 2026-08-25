import { Component, ChangeDetectionStrategy, input, output, booleanAttribute } from '@angular/core';
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
  readonly flush = input(false, { transform: booleanAttribute });
  readonly media = input(false, { transform: booleanAttribute });
  readonly padding = input<string | number | undefined>(undefined);
  readonly clip = input(false, { transform: booleanAttribute });
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
