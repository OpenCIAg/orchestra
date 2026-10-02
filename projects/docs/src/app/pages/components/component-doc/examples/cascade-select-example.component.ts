import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  CascadeSelectComponent,
  CascadeOption,
} from '@ciag/orchestra/cascade-select';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-cascade-select-example',
  standalone: true,
  imports: [CascadeSelectComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Controlled hierarchy</span>
        <orc-cascade-select
          [options]="options"
          [(value)]="value"
          label="Destino"
          placeholder="Escolha um destino"
          [filter]="true"
        />
        <code data-testid="cascade-selection-state"
          >value = {{ value() || 'null' }}</code
        >
      </div>
      <p class="example__caption">
        Abra o acionador; use <code>ArrowRight</code> para avançar,
        <code>ArrowLeft</code> para voltar, <code>Home</code>/<code>End</code>
        para navegar e <code>Escape</code> para fechar.
      </p>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CascadeSelectExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly value = signal<string | null>(null);
  readonly options: CascadeOption[] = [
    {
      value: 'platform',
      label: 'Platform',
      children: [
        { value: 'web', label: 'Web' },
        { value: 'mobile', label: 'Mobile' },
      ],
    },
    {
      value: 'design',
      label: 'Design',
      children: [
        { value: 'tokens', label: 'Tokens' },
        { value: 'components', label: 'Components' },
      ],
    },
  ];

  ngOnInit(): void {
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({
      value: this.value(),
      state: 'hierarchical selection',
    });
  }
}
