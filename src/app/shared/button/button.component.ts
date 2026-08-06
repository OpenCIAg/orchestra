import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonVariant, ButtonSize } from './button.types';

@Component({
  selector: 'app-button, orc-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  // ── Inputs (Signals API) ──────────────────────────────────────────
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly fullWidth = input<boolean>(false);
  readonly iconLeft = input<string | undefined>(undefined);
  readonly iconRight = input<string | undefined>(undefined);
  readonly iconOnly = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly ariaLabel = input<string>('');

  // ── Outputs (Signals API) ─────────────────────────────────────────
  readonly click = output<MouseEvent>();

  // ── Computed Signals ──────────────────────────────────────────────
  readonly isDisabled = computed(() => this.disabled() || this.loading());

  readonly buttonClasses = computed(() => {
    return {
      'orc-button': true,
      [`orc-button--variant-${this.variant()}`]: true,
      [`orc-button--size-${this.size()}`]: true,
      'orc-button--disabled': this.isDisabled(),
      'orc-button--loading': this.loading(),
      'orc-button--full-width': this.fullWidth(),
      'orc-button--icon-only': this.iconOnly(),
    };
  });

  // ── Event Handlers ────────────────────────────────────────────────
  handleClick(event: MouseEvent): void {
    if (this.isDisabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.click.emit(event);
  }
}
