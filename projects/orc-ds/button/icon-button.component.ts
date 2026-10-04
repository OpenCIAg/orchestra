import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  output,
  inject,
  booleanAttribute,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { safeIcon as sanitizeIcon } from './safe-icon';
import { ButtonVariant, ButtonSize } from './button.types';

@Component({
  selector: 'orc-icon-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButtonComponent {
  // ── Inputs (Signals API) ──────────────────────────────────────────
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly icon = input<string | undefined>(undefined);
  readonly ariaLabel = input.required<string>();

  private readonly document = inject(DOCUMENT);
  private readonly sanitizer = inject(DomSanitizer);

  // ── Outputs (Signals API) ─────────────────────────────────────────
  /** Keep the public property while avoiding a native/output `click` collision. */
  readonly click = output<MouseEvent>({ alias: 'clicked' });

  // ── Computed Signals ──────────────────────────────────────────────
  readonly isDisabled = computed(() => this.disabled() || this.loading());

  readonly safeIcon = computed(() =>
    sanitizeIcon(this.icon(), this.document, this.sanitizer),
  );

  readonly buttonClasses = computed(() => {
    return {
      'orc-icon-button': true,
      [`orc-icon-button--variant-${this.variant()}`]: true,
      [`orc-icon-button--size-${this.size()}`]: true,
      'orc-icon-button--disabled': this.isDisabled(),
      'orc-icon-button--loading': this.loading(),
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
