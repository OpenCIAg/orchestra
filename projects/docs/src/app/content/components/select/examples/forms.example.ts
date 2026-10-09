import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonComponent } from '@ciag/orchestra/button';
import { SelectComponent, type SelectOption } from '@ciag/orchestra/select';

@Component({
  selector: 'doc-select-forms-example',
  imports: [ReactiveFormsModule, SelectComponent, ButtonComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <orc-select
        formControlName="category"
        label="Categoria"
        placeholder="Selecione uma categoria"
        required
        [options]="categories"
        [status]="showError() ? 'error' : 'default'"
        [errorMessage]="
          showError() ? 'Selecione uma categoria para continuar.' : ''
        "
      />
      <orc-button type="submit">Salvar</orc-button>
      @if (saved()) {
        <p class="hint" role="status">Salvo: {{ form.value.category }}</p>
      }
    </form>
  `,
  styles: `
    form {
      display: grid;
      gap: 1rem;
      justify-items: start;
      width: min(100%, 22rem);
    }
    orc-select {
      width: 100%;
    }
    .hint {
      margin: 0;
      font-size: 0.875rem;
      color: var(--orc-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectFormsExampleComponent {
  readonly form = new FormGroup({
    category: new FormControl<string | null>(null, Validators.required),
  });
  readonly submitted = signal(false);
  readonly saved = signal(false);

  readonly categories: SelectOption<string>[] = [
    { value: 'bug', label: 'Defeito' },
    { value: 'feature', label: 'Nova funcionalidade' },
    { value: 'docs', label: 'Documentação' },
  ];

  showError(): boolean {
    return this.submitted() && this.form.controls.category.invalid;
  }

  submit(): void {
    this.submitted.set(true);
    this.saved.set(this.form.valid);
  }
}
