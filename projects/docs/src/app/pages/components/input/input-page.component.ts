import {
  Component,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  InputComponent,
  TextareaComponent,
  InputSize,
  InputStatus,
  InputType,
  TextareaResize,
} from '@ciag/orchestra/input';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-input-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    InputComponent,
    TextareaComponent,
    FooterComponent,
  ],
  templateUrl: './input-page.component.html',
  styleUrl: './input-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputPageComponent {
  // ── Controles Interativos do Playground: Input ───────────
  readonly inputType = signal<InputType>('text');
  readonly inputSize = signal<InputSize>('md');
  readonly inputStatus = signal<InputStatus>('default');
  readonly inputLabel = signal<string>('Nome completo');
  readonly inputPlaceholder = signal<string>('Digite algo...');
  readonly inputHelperText = signal<string>('Informe seu nome como consta no documento.');
  readonly inputErrorMessage = signal<string>('Este campo é obrigatório.');
  readonly inputDisabled = signal<boolean>(false);
  readonly inputReadonly = signal<boolean>(false);
  readonly inputRequired = signal<boolean>(true);
  readonly inputClearable = signal<boolean>(true);
  readonly inputShowCharCount = signal<boolean>(true);
  readonly inputMaxLength = signal<number>(50);
  readonly inputMask = signal<string>('');
  readonly inputUnmask = signal<boolean>(false);
  readonly inputPrefixText = signal<string>('');
  readonly inputSuffixText = signal<string>('');
  readonly inputValue = signal<string>('Orchestra Design System');

  // ── Controles Interativos do Playground: Textarea ────────
  readonly textareaSize = signal<InputSize>('md');
  readonly textareaStatus = signal<InputStatus>('default');
  readonly textareaLabel = signal<string>('Descrição detalhada');
  readonly textareaPlaceholder = signal<string>('Digite algo...');
  readonly textareaHelperText = signal<string>('Máximo de 200 caracteres.');
  readonly textareaErrorMessage = signal<string>('A descrição não pode ficar vazia.');
  readonly textareaDisabled = signal<boolean>(false);
  readonly textareaReadonly = signal<boolean>(false);
  readonly textareaRequired = signal<boolean>(false);
  readonly textareaShowCharCount = signal<boolean>(true);
  readonly textareaMaxLength = signal<number>(200);
  readonly textareaRows = signal<number>(4);
  readonly textareaResize = signal<TextareaResize>('vertical');
  readonly textareaAutoResize = signal<boolean>(false);
  readonly textareaValue = signal<string>('Componente de texto multilinha flexível e acessível.');

  // ── Formulário Reativo (Reactive Forms Integration) ──────
  readonly demoForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    cpf: new FormControl('', [Validators.required]),
    bio: new FormControl('', [Validators.required, Validators.maxLength(150)]),
  });

  // ── Valores para Demonstrações Específicas ────────────────
  readonly searchDemoValue = signal<string>('');
  readonly passwordDemoValue = signal<string>('minhasenhasupersuave');
  readonly currencyDemoValue = signal<string>('150,00');
  readonly websiteDemoValue = signal<string>('orchestra.dev');

  // ── Demonstrações de Máscaras ────────────────────────────
  readonly cpfDemoValue = signal<string>('12345678901');
  readonly phoneDemoValue = signal<string>('11987654321');
  readonly cepDemoValue = signal<string>('01310100');
  readonly dateDemoValue = signal<string>('25122026');

  setPresetMask(mask: string, placeholder: string, label: string): void {
    this.inputMask.set(mask);
    this.inputPlaceholder.set(placeholder);
    this.inputLabel.set(label);
    this.inputValue.set('');
  }

  resetForm(): void {
    this.demoForm.reset({
      email: '',
      password: '',
      cpf: '',
      bio: '',
    });
  }
}
