import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
} from '@angular/core';

let nextFormFieldId = 0;
@Component({
  selector: 'orc-form-field',
  standalone: true,
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent {
  /** Stable base for related IDs; provide a unique value for SSR/hydration. */
  readonly id = input<string | undefined>(undefined);
  readonly label = input('');
  readonly helperText = input('');
  readonly error = input('');
  /** Shows the visual required marker; projected controls own native required validation. */
  readonly required = input(false, { transform: booleanAttribute });
  private readonly generatedFieldId = `orc-form-field-${++nextFormFieldId}`;

  get fieldId(): string {
    return this.id()?.trim() || this.generatedFieldId;
  }

  get labelId(): string {
    return `${this.fieldId}-label`;
  }

  get helpId(): string {
    return `${this.fieldId}-help`;
  }

  get errorId(): string {
    return `${this.fieldId}-error`;
  }
}
