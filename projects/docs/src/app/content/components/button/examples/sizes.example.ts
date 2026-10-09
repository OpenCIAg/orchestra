import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent } from '@ciag/orchestra/button';

@Component({
  selector: 'doc-button-sizes-example',
  imports: [ButtonComponent],
  template: `
    <orc-button size="sm">Pequeno</orc-button>
    <orc-button size="md">Médio</orc-button>
    <orc-button size="lg">Grande</orc-button>
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
export class ButtonSizesExampleComponent {}
