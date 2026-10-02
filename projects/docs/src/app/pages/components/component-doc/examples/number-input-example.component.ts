import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { NumberInputComponent } from '@ciag/orchestra/number-input';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-number-input-example',
  standalone: true,
  imports: [NumberInputComponent],
  template: `
    <div class="example-grid example-grid--two">
      <div class="example">
        <span class="example__label">Default · bounded</span>
        <orc-number-input
          label="Itens por página"
          [(value)]="quantity"
          [min]="1"
          [max]="10"
          suffix="itens"
        />
        <code>value = {{ quantity() }}</code>
      </div>
      <div class="example">
        <span class="example__label">Success + prefix</span>
        <orc-number-input
          label="Orçamento"
          [value]="1250"
          prefix="R$"
          status="success"
          [precision]="2"
        />
      </div>
      <div class="example">
        <span class="example__label">Error</span>
        <orc-number-input
          label="Quantidade inválida"
          [value]="0"
          status="error"
          errorMessage="Escolha pelo menos 1 item."
          [min]="1"
        />
      </div>
      <div class="example">
        <span class="example__label">Readonly + no controls</span>
        <orc-number-input
          label="Somente leitura"
          [value]="42"
          [readonly]="true"
          [showControls]="false"
        />
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberInputExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly quantity = signal<number | null>(4);

  ngOnInit(): void {
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({ value: this.quantity(), state: 'bounded 1–10' });
  }
}
