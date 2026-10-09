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
import { safeIcon } from './safe-icon';
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
  readonly disabled = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });
  readonly loading = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });
  readonly fullWidth = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });
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
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly badge = input<string | number | undefined>(undefined);
  readonly badgeClass = input('');
  readonly iconLeft = input<string | undefined>(undefined);
  readonly iconRight = input<string | undefined>(undefined);
  readonly iconOnly = input(false, { transform: booleanAttribute });
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly ariaLabel = input<string | undefined>(undefined);

  private readonly document = inject(DOCUMENT);
  private readonly sanitizer = inject(DomSanitizer);

  // ── Outputs (Signals API) ─────────────────────────────────────────
  /**
   * The native button already bubbles a `click` event through the host.
   * Keep the TypeScript property for consumers, but expose the component
   * output under a distinct alias so `(click)` is not delivered twice.
   */
  readonly click = output<MouseEvent>({ alias: 'clicked' });
  readonly onFocus = output<FocusEvent>();
  readonly onBlur = output<FocusEvent>();

  // ── Computed Signals ──────────────────────────────────────────────
  readonly isDisabled = computed(() => this.disabled() || this.loading());
  readonly effectiveIconLeft = computed(
    () =>
      this.iconLeft() || (this.iconPos() !== 'right' ? this.icon() : undefined),
  );
  readonly effectiveIconRight = computed(
    () =>
      this.iconRight() ||
      (this.iconPos() === 'right' ? this.icon() : undefined),
  );

  /** `variant="close"` draws the close glyph unless an explicit icon is supplied. */
  readonly showCloseGlyph = computed(
    () =>
      this.variant() === 'close' &&
      !this.safeIconLeft() &&
      !this.safeIconRight(),
  );
  readonly safeIconLeft = computed(() =>
    safeIcon(this.effectiveIconLeft(), this.document, this.sanitizer),
  );
  readonly safeIconRight = computed(() =>
    safeIcon(this.effectiveIconRight(), this.document, this.sanitizer),
  );
  readonly safeLoadingIcon = computed(() =>
    safeIcon(this.loadingIcon(), this.document, this.sanitizer),
  );

  readonly buttonClasses = computed(() => {
    return {
      'orc-button': true,
      [`orc-button--variant-${this.link() ? 'link' : this.severity() || this.variant()}`]: true,
      [`orc-button--size-${this.size()}`]: true,
      'orc-button--disabled': this.isDisabled(),
      'orc-button--loading': this.loading(),
      'orc-button--full-width': this.fullWidth() || this.fluid(),
      'orc-button--icon-only': this.iconOnly(),
      'orc-button--text': this.text(),
      ['orc-button--icon-' + this.iconPos()]: Boolean(this.icon()),
      'orc-button--outlined': this.outlined(),
      'orc-button--raised': this.raised(),
      'orc-button--rounded': this.rounded(),
      'orc-button--plain': this.plain(),
      'orc-button--fluid': this.fluid(),
    };
  });
  readonly buttonClassString = computed(() =>
    `${Object.entries(this.buttonClasses())
      .filter(([, enabled]) => enabled)
      .map(([name]) => name)
      .join(' ')} ${this.styleClass()}`.trim(),
  );

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
