import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent } from '@ciag/orchestra/button';

@Component({
  selector: 'doc-button-variants-example',
  imports: [ButtonComponent],
  template: `
    <orc-button variant="primary">Publicar</orc-button>
    <orc-button variant="secondary">Salvar rascunho</orc-button>
    <orc-button variant="outline">Pré-visualizar</orc-button>
    <orc-button variant="ghost">Cancelar</orc-button>
    <orc-button variant="link">Ver histórico</orc-button>
    <orc-button variant="danger">Excluir</orc-button>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonVariantsExampleComponent {}
