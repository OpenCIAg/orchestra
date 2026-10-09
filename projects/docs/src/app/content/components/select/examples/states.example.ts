import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OptionComponent, SelectComponent } from '@ciag/orchestra/select';

@Component({
  selector: 'doc-select-states-example',
  imports: [SelectComponent, OptionComponent],
  template: `
    <orc-select
      label="Estado"
      placeholder="Selecione"
      status="error"
      errorMessage="Este campo é obrigatório."
    >
      <orc-option value="sp" label="São Paulo" />
      <orc-option value="pr" label="Paraná" />
    </orc-select>
    <orc-select label="Filial" placeholder="Matriz" disabled>
      <orc-option value="matriz" label="Matriz" />
    </orc-select>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
      gap: 1.25rem;
      width: min(100%, 32rem);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectStatesExampleComponent {}
