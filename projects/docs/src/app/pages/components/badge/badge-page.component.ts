import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  BadgeComponent,
  BadgeSize,
  BadgeStatus,
  BadgeVariant,
} from '@ciag/orchestra/badge';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-badge-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    BadgeComponent,
    FooterComponent,
  ],
  templateUrl: './badge-page.component.html',
  styleUrl: './badge-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgePageComponent {
  // ── Playground Signals ────────────────────────────────────
  readonly playgroundText = signal<string>('Badge');
  readonly playgroundVariant = signal<BadgeVariant>('soft');
  readonly playgroundStatus = signal<BadgeStatus>('success');
  readonly playgroundSize = signal<BadgeSize>('md');
  readonly playgroundPill = signal<boolean>(false);
  readonly playgroundDot = signal<boolean>(false);
  readonly playgroundIcon = signal<boolean>(true);
  readonly playgroundDismissible = signal<boolean>(false);
  readonly playgroundCount = signal<number | undefined>(undefined);

  // ── Dismissible items demo list ───────────────────────────
  readonly tags = signal<string[]>([
    'Design System',
    'Angular 18',
    'Signals API',
    'WCAG 2.1 AA',
  ]);

  removeTag(tagToRemove: string): void {
    this.tags.update(list => list.filter(t => t !== tagToRemove));
  }

  resetTags(): void {
    this.tags.set([
      'Design System',
      'Angular 18',
      'Signals API',
      'WCAG 2.1 AA',
    ]);
  }
}
