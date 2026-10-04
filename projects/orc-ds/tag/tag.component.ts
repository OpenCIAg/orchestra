import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  output,
} from '@angular/core';

export type TagVariant =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'secondary'
  | 'contrast';

@Component({
  selector: 'orc-tag',
  standalone: true,
  styleUrl: './tag.component.scss',
  template: `<span
    class="orc-tag"
    [class]="
      'orc-tag orc-p2-tag orc-tag--' +
      effectiveVariant() +
      ' orc-p2-tag--' +
      effectiveVariant() +
      ' ' +
      styleClass()
    "
    [class.orc-tag--rounded]="rounded()"
    [class.rounded]="rounded()"
    [class.disabled]="disabled()"
    [attr.aria-disabled]="disabled() || null"
  >
    @if (icon()) {
      <span aria-hidden="true">{{ icon() }}</span>
    }
    <span>{{ value() ?? label() }}</span>
    @if (removable()) {
      <button
        type="button"
        [disabled]="disabled()"
        [attr.aria-label]="
          removeAriaLabel() || 'Remove ' + (effectiveLabel() || 'tag')
        "
        (click)="remove($event)"
      >
        ×
      </button>
    }
  </span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagComponent {
  readonly label = input<string | undefined>(undefined);
  readonly value = input<string | undefined>(undefined);
  readonly variant = input<TagVariant>('neutral');
  readonly severity = input<TagVariant | undefined>(undefined);
  readonly icon = input('');
  readonly rounded = input(false, { transform: booleanAttribute });
  readonly removable = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly styleClass = input('');
  readonly removeAriaLabel = input<string | undefined>(undefined);
  readonly removed = output<string>();
  readonly onRemove = output<{ value: string }>();
  effectiveLabel(): string {
    return this.value() ?? this.label() ?? '';
  }
  effectiveVariant(): TagVariant {
    return this.severity() ?? this.variant();
  }
  remove(event: Event): void {
    event.stopPropagation();
    if (!this.disabled()) {
      const value = this.value() ?? this.label() ?? '';
      this.removed.emit(value);
      this.onRemove.emit({ value });
    }
  }
}
