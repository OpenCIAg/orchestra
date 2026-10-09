import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SelectComponent, type SelectOption } from '@ciag/orchestra/select';

@Component({
  selector: 'doc-select-multiple-example',
  imports: [SelectComponent],
  template: `
    <orc-select
      label="Responsáveis"
      placeholder="Selecione pessoas"
      multiple
      clearable
      [options]="people"
      [(value)]="owners"
    />
    <p class="hint">{{ owners().length }} pessoa(s) selecionada(s).</p>
  `,
  styles: `
    :host {
      display: grid;
      gap: 0.75rem;
      width: min(100%, 24rem);
    }
    .hint {
      margin: 0;
      font-size: 0.875rem;
      color: var(--orc-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectMultipleExampleComponent {
  readonly owners = signal<string[]>(['ana', 'carla']);

  readonly people: SelectOption<string>[] = [
    { value: 'ana', label: 'Ana Silva', description: 'Design' },
    { value: 'bruno', label: 'Bruno Souza', description: 'Front-end' },
    { value: 'carla', label: 'Carla Lima', description: 'Produto' },
    { value: 'diego', label: 'Diego Alves', description: 'Back-end' },
  ];
}
