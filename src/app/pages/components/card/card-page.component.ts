import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/card/card.component';
import { CardHeaderComponent } from '../../../shared/card/card-header.component';
import { CardBodyComponent } from '../../../shared/card/card-body.component';
import { CardFooterComponent } from '../../../shared/card/card-footer.component';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { AvatarComponent } from '../../../shared/avatar/avatar.component';
import { BadgeComponent } from '../../../shared/badge/badge.component';

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
