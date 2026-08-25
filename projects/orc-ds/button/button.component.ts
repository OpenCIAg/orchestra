import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  output,
  inject,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ButtonVariant, ButtonSize } from './button.types';

@Component({
  selector: 'orc-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  // ── Inputs (Signals API) ──────────────────────────────────────────
  readonly variant = input<ButtonVariant>('primary');
  readonly severity = input<ButtonVariant | undefined>(undefined);
  readonly size = input<ButtonSize>('md');
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly fullWidth = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly text = input(false, { transform: booleanAttribute });
  readonly outlined = input(false, { transform: booleanAttribute });
  readonly raised = input(false, { transform: booleanAttribute });
  readonly rounded = input(false, { transform: booleanAttribute });
  readonly plain = input(false, { transform: booleanAttribute });
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly link = input(false, { transform: booleanAttribute });
  readonly icon = input<string | undefined>(undefined);
  readonly iconPos = input<'left' | 'right' | 'top' | 'bottom'>('left');
  readonly loadingIcon = input<string | undefined>(undefined);
  readonly id = input<string | undefined>(undefined);
  readonly tabindex = input<number | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly ariaExpanded = input<boolean | undefined>(undefined);
  readonly ariaControls = input<string | undefined>(undefined);
  readonly form = input<string | undefined>(undefined);
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(undefined);
  readonly badge = input<string | number | undefined>(undefined);
  readonly badgeClass = input('');
  readonly iconLeft = input<string | undefined>(undefined);
  readonly iconRight = input<string | undefined>(undefined);
  readonly iconOnly = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly ariaLabel = input<string>('');

  private readonly sanitizer = inject(DomSanitizer);

  // ── Outputs (Signals API) ─────────────────────────────────────────
  readonly click = output<MouseEvent>();
  readonly onFocus = output<FocusEvent>();
  readonly onBlur = output<FocusEvent>();

  // ── Computed Signals ──────────────────────────────────────────────
  readonly isDisabled = computed(() => this.disabled() || this.loading());
  readonly effectiveIconLeft = computed(() => this.iconLeft() || (this.iconPos() === 'left' ? this.icon() : undefined));
  readonly effectiveIconRight = computed(() => this.iconRight() || (this.iconPos() === 'right' ? this.icon() : undefined));

  readonly safeIconLeft = computed(() => {
    const icon = this.effectiveIconLeft();
    if (!icon) return null;
    if (icon.trim().startsWith('<svg')) {
      return { isSvg: true, content: this.sanitizer.bypassSecurityTrustHtml(icon) };
    }
    return { isSvg: false, content: icon };
  });

  readonly safeIconRight = computed(() => {
    const icon = this.effectiveIconRight();
    if (!icon) return null;
    if (icon.trim().startsWith('<svg')) {
      return { isSvg: true, content: this.sanitizer.bypassSecurityTrustHtml(icon) };
    }
    return { isSvg: false, content: icon };
  });

  readonly buttonClasses = computed(() => {
    return {
      'orc-button': true,
      [`orc-button--variant-${this.severity() || this.variant()}`]: true,
      [`orc-button--size-${this.size()}`]: true,
      'orc-button--disabled': this.isDisabled(),
      'orc-button--loading': this.loading(),
      'orc-button--full-width': this.fullWidth() || this.fluid(),
      'orc-button--icon-only': this.iconOnly(),
      'orc-button--text': this.text(),
      'orc-button--outlined': this.outlined(),
      'orc-button--raised': this.raised(),
      'orc-button--rounded': this.rounded(),
      'orc-button--plain': this.plain(),
      'orc-button--fluid': this.fluid(),
    };
  });
  readonly buttonClassString = computed(() => `${Object.entries(this.buttonClasses()).filter(([, enabled]) => enabled).map(([name]) => name).join(' ')} ${this.styleClass()}`.trim());

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
