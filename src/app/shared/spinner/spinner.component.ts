import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SpinnerSize,
  SpinnerVariant,
  SpinnerType,
  SpinnerTextPosition,
} from './spinner.types';

@Component({
  selector: 'app-loading-spinner, app-spinner, orc-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {
  // ── Inputs (Signals API) ──────────────────────────────────
  readonly size = input<SpinnerSize>('md');
  readonly customSize = input<string | number>('');
  readonly variant = input<SpinnerVariant>('primary');
  readonly type = input<SpinnerType>('ring');
  readonly text = input<string>('');
  readonly textPosition = input<SpinnerTextPosition>('right');
  readonly fullScreen = input<boolean>(false);
  readonly backdrop = input<boolean>(true);
  readonly ariaLabel = input<string>('Carregando...');

  @HostBinding('class.orc-spinner--fullscreen-host')
  get isFullScreen(): boolean {
    return this.fullScreen();
  }

  readonly customSizeCss = computed(() => {
    const s = this.customSize();
    if (!s) return null;
    return typeof s === 'number' ? `${s}px` : s;
  });
}
