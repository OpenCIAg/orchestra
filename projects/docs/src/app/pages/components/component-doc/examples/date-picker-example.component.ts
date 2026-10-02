import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { DatePickerComponent } from '@ciag/orchestra/date-picker';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-date-picker-example',
  standalone: true,
  imports: [DatePickerComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Popover · controlado</span>
        <orc-date-picker
          label="Data de entrega"
          [(value)]="dateValue"
          [showIcon]="true"
          [showButtonBar]="true"
          [showClear]="true"
        />
        <code>value = {{ dateValue() }}</code>
      </div>
      <div class="example">
        <span class="example__label">Required + helper</span>
        <orc-date-picker
          label="Data de publicação"
          helperText="Escolha uma data útil para a equipe."
          [required]="true"
        />
      </div>
      <div class="example">
        <span class="example__label">Data e hora</span>
        <orc-date-picker
          label="Agendamento"
          [(value)]="dateTimeValue"
          [showIcon]="true"
          [showTime]="true"
          [showSeconds]="true"
          [hideOnDateTimeSelect]="false"
        />
        <code>value = {{ dateTimeValue() }}</code>
      </div>
      <div class="example">
        <span class="example__label">Somente horário</span>
        <orc-date-picker
          label="Horário de início"
          [(value)]="timeValue"
          [showIcon]="true"
          [timeOnly]="true"
        />
        <code>value = {{ timeValue() }}</code>
      </div>
      <div class="example-grid example-grid--two">
        <div class="example">
          <span class="example__label">Error</span>
          <orc-date-picker
            label="Data inválida"
            error="Informe uma data futura."
            value="2026-01-01"
          />
        </div>
        <div class="example">
          <span class="example__label">Disabled</span>
          <orc-date-picker
            label="Data bloqueada"
            value="2026-08-17"
            [disabled]="true"
          />
        </div>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly dateValue = signal('2026-08-17');
  readonly dateTimeValue = signal('2026-08-17T13:20:00');
  readonly timeValue = signal('13:20');

  ngOnInit(): void {
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({ value: this.dateValue(), state: 'controlled' });
  }
}
