import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormFieldComponent } from '@ciag/orchestra/form-field';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-form-field-example',
  standalone: true,
  imports: [FormFieldComponent],
  template: `
    <div class="example-grid example-grid--two">
      <div class="example">
        <span class="example__label">Default</span>
        <orc-form-field id="doc-project-field" label="Identificação do projeto">
          <label for="doc-project-name">Nome do projeto</label>
          <input
            id="doc-project-name"
            class="native-control"
            type="text"
            placeholder="Orchestra"
          />
        </orc-form-field>
      </div>
      <div class="example">
        <span class="example__label">Required + helper</span>
        <orc-form-field
          id="doc-identifier-field"
          label="Identificação do projeto"
          helperText="Use letras minúsculas."
          [required]="true"
        >
          <label for="doc-project-slug">Identificador</label>
          <input
            id="doc-project-slug"
            class="native-control"
            type="text"
            placeholder="design-system"
            required
          />
        </orc-form-field>
      </div>
      <div class="example">
        <span class="example__label">Error</span>
        <orc-form-field
          id="doc-domain-field"
          label="Configuração de domínio"
          error="Informe um domínio válido."
          [required]="true"
        >
          <label for="doc-domain">Domínio</label>
          <input
            id="doc-domain"
            class="native-control native-control--error"
            type="text"
            value="orchestra"
            required
          />
        </orc-form-field>
      </div>
      <div class="example">
        <span class="example__label">Projected control</span>
        <orc-form-field id="doc-comment-field" label="Observação do projeto">
          <label for="doc-project-comment">Comentário</label>
          <textarea
            id="doc-project-comment"
            class="native-control native-control--textarea"
            rows="3"
            placeholder="Escreva uma nota"
          ></textarea>
        </orc-form-field>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldExampleComponent {}
