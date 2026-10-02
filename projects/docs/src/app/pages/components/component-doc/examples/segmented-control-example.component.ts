import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  SegmentedControlComponent,
  P2Option,
} from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-segmented-control-example',
  standalone: true,
  imports: [SegmentedControlComponent],
  template: `
    <div class="example-stack">
      <div class="example example--centered">
        <span class="example__label">View filter</span>
        <orc-segmented-control
          [options]="options"
          label="Filtro de visualização"
          [(value)]="value"
        />
        <code>value = {{ value() }}</code>
      </div>
      <p class="example__caption">
        As setas alteram o item ativo; Enter ou Space confirmam a escolha.
      </p>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentedControlExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly options: P2Option<string>[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativos' },
    { value: 'archived', label: 'Arquivados' },
  ];
  readonly value = signal<string | null>('all');

  ngOnInit(): void {
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({
      value: this.value(),
      state: 'exclusive selection',
    });
  }
}
