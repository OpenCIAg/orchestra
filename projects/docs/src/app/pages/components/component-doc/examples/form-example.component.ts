import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormComponent, FormSubmitEvent } from '@ciag/orchestra/form';
import { ButtonComponent } from '@ciag/orchestra/button';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-form-example',
  standalone: true,
  imports: [FormComponent, ButtonComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Empilhado + validação nativa</span>
        <orc-form
          ariaLabel="Cadastro de projeto"
          (formSubmit)="onFormSubmit($event)"
          (formReset)="onFormReset()"
        >
          <label class="native-label" for="doc-form-project-name"
            >Nome do projeto</label
          >
          <input
            id="doc-form-project-name"
            class="native-control"
            name="project"
            required
            placeholder="Orchestra"
          />
          <label class="native-label" for="doc-form-project-owner"
            >Responsável</label
          >
          <input
            id="doc-form-project-owner"
            class="native-control"
            name="owner"
            placeholder="Equipe de produto"
          />
          <div class="form-actions">
            <orc-button type="submit">Validar</orc-button
            ><orc-button variant="secondary" type="reset"> Resetar </orc-button>
          </div>
        </orc-form>
        @if (message(); as message) {
          <p class="feedback-line">{{ message }}</p>
        }
      </div>
      <div class="example example--muted">
        <span class="example__label">Inline</span>
        <p>
          Use <code>layout="inline"</code> para filtros curtos e ações na mesma
          linha.
        </p>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly message = signal('');

  ngOnInit(): void {
    this.emit();
  }

  onFormSubmit(result: FormSubmitEvent): void {
    this.message.set(
      result.valid ? 'Formulário válido.' : 'Revise os campos obrigatórios.',
    );
    this.emit();
  }

  onFormReset(): void {
    this.message.set('Formulário resetado.');
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({ submit: this.message() || 'not submitted' });
  }
}
