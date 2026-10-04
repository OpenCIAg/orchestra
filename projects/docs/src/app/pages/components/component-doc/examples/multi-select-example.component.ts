import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  MultiSelectComponent,
  P2Option,
} from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-multi-select-example',
  standalone: true,
  imports: [MultiSelectComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Seleção múltipla</span>
        <orc-multi-select
          label="Tecnologias"
          placeholder="Selecione tecnologias"
          [options]="options"
          [(value)]="value"
        />
        <code>values = {{ value().join(', ') || 'none' }}</code>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelectExampleComponent implements OnInit {
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
  readonly value = signal<string[]>(['angular']);

  ngOnInit(): void {
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({
      values: this.value(),
      state: 'multiple selection',
    });
  }
}
