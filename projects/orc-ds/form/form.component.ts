import { ChangeDetectionStrategy, Component, ElementRef, HostListener, booleanAttribute, input, output, viewChild } from '@angular/core';

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
  readonly ariaLabel = input('Formulário');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly novalidate = input(true, { transform: booleanAttribute });
  readonly formSubmit = output<FormSubmitEvent>();
  readonly formReset = output<void>();

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const form = this.nativeForm()?.nativeElement;
    if (!form || this.disabled()) return;
    const valid = form.checkValidity();
    if (!valid) { form.reportValidity(); }
    this.formSubmit.emit({ event, valid });
  }

  onReset(): void { this.formReset.emit(); }

  reset(): void { this.nativeForm()?.nativeElement.reset(); this.onReset(); }
  submit(): void { this.nativeForm()?.nativeElement.requestSubmit(); }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void { if (this.disabled() && event.key === 'Enter') event.preventDefault(); }
}
