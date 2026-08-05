import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  SkeletonComponent,
  SkeletonVariant,
  SkeletonAnimation,
} from '../../../shared/skeleton';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-skeleton-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SkeletonComponent,
    FooterComponent,
  ],
  templateUrl: './skeleton-page.component.html',
  styleUrl: './skeleton-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonPageComponent {
  // ── Playground Signals ────────────────────────────────────
  readonly playgroundVariant = signal<SkeletonVariant>('rectangular');
  readonly playgroundAnimation = signal<SkeletonAnimation>('shimmer');
  readonly playgroundWidth = signal<string>('100%');
  readonly playgroundHeight = signal<string>('120px');
  readonly playgroundBorderRadius = signal<string>('8px');

  setVariant(variant: SkeletonVariant): void {
    this.playgroundVariant.set(variant);
    switch (variant) {
      case 'text':
        this.playgroundWidth.set('100%');
        this.playgroundHeight.set('16px');
        this.playgroundBorderRadius.set('8px');
        break;
      case 'circular':
        this.playgroundWidth.set('64px');
        this.playgroundHeight.set('64px');
        this.playgroundBorderRadius.set('50%');
        break;
      case 'rectangular':
        this.playgroundWidth.set('100%');
        this.playgroundHeight.set('120px');
        this.playgroundBorderRadius.set('8px');
        break;
    }
  }
}
