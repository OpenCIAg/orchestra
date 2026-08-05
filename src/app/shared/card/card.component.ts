import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
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

  cardClick = output<void>();

  onClick(): void {
    if (this.clickable()) {
      this.cardClick.emit();
    }
  }
}
