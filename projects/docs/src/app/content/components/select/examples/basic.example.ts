import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { OptionComponent, SelectComponent } from '@ciag/orchestra/select';

@Component({
  selector: 'doc-select-basic-example',
  imports: [SelectComponent, OptionComponent],
  template: `
    <orc-select label="Prioridade" placeholder="Selecione" [(value)]="priority">
      <orc-option value="baixa" label="Baixa" />
      <orc-option value="media" label="Média" />
      <orc-option value="alta" label="Alta" />
    </orc-select>
    <p class="hint">Valor: {{ priority() ?? 'nenhum' }}</p>
  `,
  styles: `
    :host {
      display: grid;
      gap: 0.75rem;
      width: min(100%, 20rem);
    }
    .hint {
      margin: 0;
      font-size: 0.875rem;
      color: var(--orc-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectBasicExampleComponent {
  readonly priority = signal<string | undefined>(undefined);
}
