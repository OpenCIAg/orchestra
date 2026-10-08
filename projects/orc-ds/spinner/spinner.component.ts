import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  HostBinding,
  HostListener,
  booleanAttribute,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SpinnerSize,
  SpinnerVariant,
  SpinnerType,
  SpinnerTextPosition,
} from './spinner.types';

@Component({
  selector: 'orc-spinner',
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
  readonly fullScreen = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });
  @Output() fullScreenChange = new EventEmitter<boolean>();
  readonly backdrop = input<boolean, unknown>(true, {
    transform: booleanAttribute,
  });
  readonly strokeWidth = input(3);
  readonly fill = input('none');
  readonly animation = input<'spin' | 'none'>('spin');
  readonly styleClass = input('');
  readonly id = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);

  @HostBinding('class.orc-spinner--fullscreen-host')
  get isFullScreen(): boolean {
    return this.fullScreen();
  }

  readonly customSizeCss = computed(() => {
    const s = this.customSize();
    if (!s) return null;
    return typeof s === 'number' ? `${s}px` : s;
  });
  readonly accessibleLabel = computed(
    () => this.ariaLabel()?.trim() || this.text().trim() || 'Loading',
  );

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: Event) {
    if (this.fullScreen()) {
      this.fullScreenChange.emit(false);
    }
  }
}
