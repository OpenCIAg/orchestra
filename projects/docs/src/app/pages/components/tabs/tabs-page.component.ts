import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  TabGroupComponent,
  TabComponent,
  TabSize,
  TabVariant,
} from '@ciag/orchestra/tabs';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-tabs-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TabGroupComponent,
    TabComponent,
    FooterComponent,
  ],
  templateUrl: './tabs-page.component.html',
  styleUrl: './tabs-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsPageComponent {
  // ── Playground Signals ────────────────────────────────────
  readonly playgroundIndex = signal<number>(0);
  readonly playgroundVariant = signal<TabVariant>('line');
  readonly playgroundSize = signal<TabSize>('md');
  readonly playgroundFullWidth = signal<boolean>(false);
  readonly playgroundHasIcons = signal<boolean>(true);
  readonly playgroundDisabledTab = signal<boolean>(false);

  // ── Demos ─────────────────────────────────────────────────
  readonly demoIndexDefault = signal<number>(0);
  readonly demoIndexIcons = signal<number>(0);
  readonly demoIndexDisabled = signal<number>(0);
  readonly demoIndexFilled = signal<number>(0);
}
