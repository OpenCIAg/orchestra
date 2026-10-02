import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  AutocompleteComponent,
  AutocompleteOption,
} from '@ciag/orchestra/autocomplete';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-autocomplete-example',
  standalone: true,
  imports: [AutocompleteComponent],
  template: `
    <div class="example-grid example-grid--two">
      <div class="example">
        <span class="example__label">Default</span>
        <orc-autocomplete
          label="Cidade"
          placeholder="Digite uma cidade"
          [options]="cities"
          [(value)]="selectedCity"
          helperText="Use ↑ ↓ e Enter para selecionar."
        />
        <code>value = {{ selectedCity() || 'null' }}</code>
      </div>
      <div class="example">
        <span class="example__label">minChars + clearable</span>
        <orc-autocomplete
          label="Buscar projeto"
          [options]="cities"
          [minChars]="2"
          [clearable]="true"
        />
      </div>
      <div class="example">
        <span class="example__label">Error</span>
        <orc-autocomplete
          label="Responsável"
          [options]="cities"
          errorMessage="Selecione uma pessoa."
          [required]="true"
        />
      </div>
      <div class="example">
        <span class="example__label">Disabled</span>
        <orc-autocomplete
          label="Campo bloqueado"
          [options]="cities"
          value="sp"
          [disabled]="true"
        />
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly selectedCity = signal<string | null>(null);
  readonly cities: AutocompleteOption[] = [
    { value: 'sp', label: 'São Paulo', description: 'Brasil' },
    { value: 'rj', label: 'Rio de Janeiro', description: 'Brasil' },
    { value: 'lisbon', label: 'Lisboa', description: 'Portugal' },
    {
      value: 'madrid',
      label: 'Madrid',
      description: 'Espanha',
      disabled: true,
    },
  ];

  ngOnInit(): void {
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({
      value: this.selectedCity(),
      state: 'selected value',
    });
  }
}
