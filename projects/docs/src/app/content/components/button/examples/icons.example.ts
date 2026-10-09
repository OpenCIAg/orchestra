import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent } from '@ciag/orchestra/button';
import { IconComponent } from '@ciag/orchestra/icon';

@Component({
  selector: 'doc-button-icons-example',
  imports: [ButtonComponent, IconComponent],
  template: `
    <orc-button>
      <orc-icon iconLeft name="add" size="sm" />
      Novo projeto
    </orc-button>
    <orc-button variant="outline">
      Continuar
      <orc-icon iconRight name="arrow_forward" size="sm" />
    </orc-button>
    <orc-button variant="ghost" iconOnly ariaLabel="Excluir projeto">
      <orc-icon iconLeft name="delete" size="sm" />
    </orc-button>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonIconsExampleComponent {}
