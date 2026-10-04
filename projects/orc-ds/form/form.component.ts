import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  booleanAttribute,
  input,
  output,
  viewChild,
} from '@angular/core';

export interface FormSubmitEvent {
  event: SubmitEvent;
  valid: boolean;
}

export type FormLayout = 'stacked' | 'inline';

@Component({
  selector: 'orc-form',
  standalone: true,
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent {
  readonly nativeForm = viewChild<ElementRef<HTMLFormElement>>('nativeForm');
  readonly layout = input<FormLayout>('stacked');
  readonly name = input('');
  readonly ariaLabel = input<string | undefined>('Formulário');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Controls native invalid-field feedback; invalid submit attempts still emit. */
  readonly novalidate = input(true, { transform: booleanAttribute });
  readonly formSubmit = output<FormSubmitEvent>();
  readonly formReset = output<void>();

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const form = this.nativeForm()?.nativeElement;
    if (!form || this.disabled()) return;
    const valid = form.checkValidity();
    // The native form always has novalidate so invalid submit attempts reach
    // this handler. The public input controls browser feedback, while a submitter
    // can independently opt out with formnovalidate.
    const submitterSkipsValidation =
      event.submitter?.hasAttribute('formnovalidate') ?? false;
    if (!valid && !this.novalidate() && !submitterSkipsValidation) {
      form.reportValidity();
    }
    this.formSubmit.emit({ event, valid });
  }

  onReset(): void {
    this.formReset.emit();
  }

  reset(): void {
    this.nativeForm()?.nativeElement.reset();
  }
  submit(): void {
    if (this.disabled()) return;
    this.nativeForm()?.nativeElement.requestSubmit();
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled() && event.key === 'Enter') event.preventDefault();
  }
}
