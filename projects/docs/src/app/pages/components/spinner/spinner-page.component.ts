import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LoadingSpinnerComponent,
  SpinnerSize,
  SpinnerVariant,
  SpinnerType,
  SpinnerTextPosition,
} from '@ciag/orchestra/spinner';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-spinner-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LoadingSpinnerComponent,
    FooterComponent,
  ],
  templateUrl: './spinner-page.component.html',
  styleUrl: './spinner-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerPageComponent {
  // ── Playground Signals ────────────────────────────────────
  readonly playgroundSize = signal<SpinnerSize>('md');
  readonly playgroundVariant = signal<SpinnerVariant>('primary');
  readonly playgroundType = signal<SpinnerType>('ring');
  readonly playgroundText = signal<string>('Carregando...');
  readonly playgroundTextPosition = signal<SpinnerTextPosition>('right');
  readonly playgroundFullScreen = signal<boolean>(false);
}
