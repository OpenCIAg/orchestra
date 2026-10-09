import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ListboxComponent } from '@ciag/orchestra/listbox';
import { OrcOption } from '@ciag/orchestra/internal';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-listbox-example',
  standalone: true,
  imports: [ListboxComponent],
  template: `
    <div class="example-grid example-grid--two">
      <div class="example">
        <span class="example__label">Seleção única</span
        ><orc-listbox
          label="Projetos"
          ariaLabel="Projetos disponíveis"
          [options]="options"
          [(value)]="value"
        /><code>value = {{ value() || 'null' }}</code>
      </div>
      <div class="example">
        <span class="example__label">Estado vazio</span
        ><orc-listbox
          label="Sem resultados"
          [options]="[]"
          emptyText="Nenhum projeto encontrado."
        />
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListboxExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly options: OrcOption<string>[] = [
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
  readonly value = signal<string | null>('design');

  ngOnInit(): void {
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({
      value: this.value(),
      state: 'keyboard-ready listbox',
    });
  }
}
