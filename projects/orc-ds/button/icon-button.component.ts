import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly icon = input<string | undefined>(undefined);
  readonly ariaLabel = input.required<string>(); // Require ariaLabel for accessibility

  private readonly sanitizer = inject(DomSanitizer);

  // ── Outputs (Signals API) ─────────────────────────────────────────
  /** Keep the public property while avoiding a native/output `click` collision. */
  readonly click = output<MouseEvent>({ alias: 'clicked' });

  // ── Computed Signals ──────────────────────────────────────────────
  readonly isDisabled = computed(() => this.disabled() || this.loading());

  readonly safeIcon = computed(() => {
    const icon = this.icon();
    if (!icon) return null;
    if (icon.trim().startsWith('<svg')) {
      return { isSvg: true, content: this.sanitizer.bypassSecurityTrustHtml(icon) };
    }
    return { isSvg: false, content: icon };
  });

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
