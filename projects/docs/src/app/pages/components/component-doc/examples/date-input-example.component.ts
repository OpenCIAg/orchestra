import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { DateInputComponent } from '@ciag/orchestra/date-input';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-date-input-example',
  standalone: true,
  imports: [DateInputComponent],
  template: `
    <div class="example-grid example-grid--two">
      <div class="example">
        <span class="example__label">Data nativa</span
        ><orc-date-input
          label="Data de entrega"
          [(value)]="value"
          required
          helperText="Use o formato de data do navegador."
        /><code>value = {{ value() }}</code>
      </div>
      <div class="example">
        <span class="example__label">Estado de erro</span
        ><orc-date-input
          label="Data inválida"
          value="2026-01-01"
          error="Escolha uma data futura."
        />
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateInputExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly value = signal('2026-08-17');

  ngOnInit(): void {
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({ value: this.value(), state: 'native date input' });
  }
}
