import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RadioButtonComponent, RadioGroupComponent } from '../../../shared/radio';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-radio-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    RadioButtonComponent,
    RadioGroupComponent,
    FooterComponent,
  ],
  templateUrl: './radio-page.component.html',
  styleUrl: './radio-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioPageComponent {
  // ── Playground Signals ────────────────────────────────────
  readonly selectedOption = signal<string>('opt1');
  readonly layout = signal<'vertical' | 'horizontal'>('vertical');
  readonly isDisabled = signal<boolean>(false);
  readonly isError = signal<boolean>(false);
  readonly errorMessage = signal<string>('Selecione uma opção válida para continuar');
  readonly groupLabel = signal<string>('Selecione sua preferência');
  readonly groupHint = signal<string>('Escolha apenas uma das opções disponíveis');

  // ── Reactive Forms Demo ───────────────────────────────────
  readonly form: FormGroup;
  readonly formSubmitted = signal<boolean>(false);
  readonly formResult = signal<any>(null);

  // ── Standalone / Static States Demos ──────────────────────
  readonly verticalDemo = signal<string>('opt1');
  readonly horizontalDemo = signal<string>('credit');
  readonly planDemo = signal<string>('pro');

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      selectedPlan: ['', [Validators.required]],
    });
  }

  onPlaygroundChange(value: string): void {
    this.selectedOption.set(value);
  }

  selectPlaygroundValue(val: string): void {
    this.selectedOption.set(val);
  }

  resetPlayground(): void {
    this.selectedOption.set('opt1');
    this.layout.set('vertical');
    this.isDisabled.set(false);
    this.isError.set(false);
  }

  onSubmitForm(): void {
    this.formSubmitted.set(true);
    if (this.form.valid) {
      this.formResult.set(this.form.value);
    } else {
      this.formResult.set(null);
    }
  }

  resetForm(): void {
    this.formSubmitted.set(false);
    this.formResult.set(null);
    this.form.reset({ selectedPlan: '' });
  }
}
