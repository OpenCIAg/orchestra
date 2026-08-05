import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  TooltipDirective,
  TooltipPosition,
  TooltipTheme,
} from '../../../shared/tooltip';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-tooltip-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TooltipDirective,
    FooterComponent,
  ],
  templateUrl: './tooltip-page.component.html',
  styleUrl: './tooltip-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipPageComponent {
  // ── Playground Signals ────────────────────────────────────
  readonly playgroundTooltipText = signal<string>('Tooltip interativo');
  readonly playgroundPosition = signal<TooltipPosition>('top');
  readonly playgroundTheme = signal<TooltipTheme>('dark');
  readonly playgroundShowDelay = signal<number>(150);
  readonly playgroundHideDelay = signal<number>(100);
  readonly playgroundDisabled = signal<boolean>(false);
}
