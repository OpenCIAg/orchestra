import {
  Component,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  SliderComponent,
  SliderSize,
  SliderTooltipMode,
  SliderValue,
} from '@ciag/orchestra/slider';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-slider-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SliderComponent,
    FooterComponent,
  ],
  templateUrl: './slider-page.component.html',
  styleUrl: './slider-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderPageComponent {
  // ── Controles Interativos do Playground ───────────────────
  readonly sliderValue = signal<SliderValue>(45);
  readonly sliderRangeValue = signal<[number, number]>([20, 80]);
  readonly isRange = signal<boolean>(false);
  readonly sliderMin = signal<number>(0);
  readonly sliderMax = signal<number>(100);
  readonly sliderStep = signal<number>(1);
  readonly sliderSize = signal<SliderSize>('md');
  readonly sliderDisabled = signal<boolean>(false);
  readonly sliderShowTicks = signal<boolean>(false);
  readonly sliderShowLabels = signal<boolean>(true);
  readonly sliderShowTooltip = signal<SliderTooltipMode>('auto');
  readonly sliderLabel = signal<string>('Controle de Volume');
  readonly sliderHelperText = signal<string>('Ajuste o nível desejado arrastando o indicador.');

  // ── Variantes Demonstrativas ──────────────────────────────
  readonly basicValue = signal<number>(65);
  readonly volumeValue = signal<number>(75);
  readonly rangePriceValue = signal<[number, number]>([150, 850]);
  readonly steppedValue = signal<number>(50);
  readonly customMarksValue = signal<number>(50);

  // ── Marcas Customizadas para Demonstração ─────────────────
  readonly priceMarks = {
    0: 'R$ 0',
    250: 'R$ 250',
    500: 'R$ 500',
    750: 'R$ 750',
    1000: 'R$ 1.000',
  };

  readonly temperatureMarks = {
    0: '0°C',
    25: '25°C',
    50: '50°C',
    75: '75°C',
    100: '100°C',
  };

  // ── Formulário Reativo (Reactive Forms Integration) ──────
  readonly demoForm = new FormGroup({
    brightness: new FormControl(70, [Validators.required, Validators.min(10)]),
    budgetRange: new FormControl<[number, number]>([200, 800], [Validators.required]),
  });

  // Formatador de Moeda
  readonly currencyFormatter = (val: number) => `R$ ${val.toLocaleString('pt-BR')}`;
  readonly percentFormatter = (val: number) => `${val}%`;

  toggleRangeMode(range: boolean): void {
    this.isRange.set(range);
    if (range) {
      this.sliderValue.set([25, 75]);
      this.sliderLabel.set('Faixa de Valores (Range)');
    } else {
      this.sliderValue.set(45);
      this.sliderLabel.set('Controle de Volume');
    }
  }

  resetForm(): void {
    this.demoForm.reset({
      brightness: 50,
      budgetRange: [100, 900],
    });
  }
}
