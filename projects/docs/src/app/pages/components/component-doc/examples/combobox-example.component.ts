import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ComboboxComponent, P2Option } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-combobox-example',
  standalone: true,
  imports: [ComboboxComponent],
  template: `
    <div class="example-grid example-grid--two">
      <div class="example">
        <span class="example__label">Busca + teclado</span>
        <orc-combobox
          label="Framework"
          placeholder="Busque um framework"
          [options]="options"
          [(value)]="value"
          helperText="Digite, use ↑ ↓ e confirme com Enter."
        />
        <code>value = {{ value() || 'null' }}</code>
      </div>
      <div class="example">
        <span class="example__label">Estado vazio</span>
        <orc-combobox
          label="Sem resultados"
          placeholder="Digite xyz"
          [options]="options"
          emptyText="Nenhum framework encontrado."
        />
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly options: P2Option<string>[] = [
    { value: 'angular', label: 'Angular', description: 'Framework principal' },
    { value: 'react', label: 'React', description: 'Ecossistema de UI' },
    { value: 'vue', label: 'Vue', description: 'Aplicações progressivas' },
    {
      value: 'legacy',
      label: 'Legacy',
      description: 'Opção indisponível',
      disabled: true,
    },
  ];
  readonly value = signal<string | null>('angular');

  ngOnInit(): void {
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({
      value: this.value(),
      options: this.options.length,
    });
  }
}
