import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '@ciag/orchestra/card';
import { CardHeaderComponent } from '@ciag/orchestra/card';
import { CardBodyComponent } from '@ciag/orchestra/card';
import { CardFooterComponent } from '@ciag/orchestra/card';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { AvatarComponent } from '@ciag/orchestra/avatar';
import { BadgeComponent } from '@ciag/orchestra/badge';

@Component({
  selector: 'app-card-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    CardFooterComponent,
    FooterComponent,
    AvatarComponent,
    BadgeComponent
  ],
  templateUrl: './card-page.component.html',
  styleUrl: './card-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardPageComponent {
  readonly isClickable = signal<boolean>(true);
  readonly isSelected = signal<boolean>(false);
  readonly clickCount = signal<number>(0);

  onCardClick(): void {
    this.clickCount.update(c => c + 1);
  }
}
