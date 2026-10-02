import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CalendarComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-calendar-example',
  standalone: true,
  imports: [CalendarComponent],
  template: `
    <div class="example-grid example-grid--two">
      <div class="example">
        <span class="example__label">Seleção controlada</span>
        <orc-calendar
          ariaLabel="Calendário de entrega"
          [(value)]="value"
          (dateSelected)="onDateSelected($event)"
        />
        <code>value = {{ value() }}</code>
      </div>
      <div class="example example--muted">
        <span class="example__label">Limites</span>
        <p>
          Datas fora do intervalo <code>2026-01-01</code> a
          <code>2026-12-31</code> ficam desabilitadas.
        </p>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly value = signal('2026-08-17');

  ngOnInit(): void {
    this.emit();
  }

  onDateSelected(value: string): void {
    this.stateChange.emit({ state: `Data: ${value}` });
  }

  private emit(): void {
    this.stateChange.emit({
      value: this.value(),
      state: 'controlled calendar',
    });
  }
}
