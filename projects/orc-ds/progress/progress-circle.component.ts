import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressMode, ProgressVariant, ProgressSize } from './progress.types';

@Component({
  selector: 'orc-progress-circle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-circle.component.html',
  styleUrl: './progress-circle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressCircleComponent {
  // ── Inputs (Signals API) ──────────────────────────────────
  /** Valor percentual atual do progresso circular (0 a 100) */
  readonly value = input<number>(0);

  /** Modo de operação: 'determinate' (valor exato) ou 'indeterminate' (spinner contínuo) */
  readonly mode = input<ProgressMode>('determinate');

  /** Status semântico / cor: 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'danger' */
  readonly variant = input<ProgressVariant>('primary');

  /** Dimensão do círculo: 'sm' (32px) | 'md' (48px) | 'lg' (64px) | 'xl' (96px) ou número em px */
  readonly size = input<ProgressSize | number>('md');

  /** Espessura do traço (em px). Se omitido, é calculado proporcionalmente ao tamanho */
  readonly strokeWidth = input<number | undefined>(undefined);

  /** Exibe o valor numérico centralizado dentro do círculo */
  readonly showValue = input<boolean>(false);
  readonly styleClass = input(''); readonly style = input<Record<string, any> | undefined>(undefined); readonly animationDuration = input('2s'); readonly fill = input('none');

  /** Cantos arredondados na ponta do arco (stroke-linecap: round) */
  readonly rounded = input<boolean>(true);

  /** Prefixo opcional para exibição de valor (ex: '$') */
  readonly valuePrefix = input<string>('');

  /** Sufixo para exibição de valor (padrão: '%') */
  readonly valueSuffix = input<string>('%');

  /** Rótulo textual opcional */
  readonly label = input<string>('');

  /** Cor customizada de preenchimento (sobrescreve o variant) */
  readonly customColor = input<string>('');

  /** Cor customizada da trilha de fundo */
  readonly customTrackColor = input<string>('');

  /** Sobrescreve o rótulo de acessibilidade aria-label */
  readonly ariaLabel = input<string>('');

  /** Sobrescreve a descrição audível aria-valuetext */
  readonly ariaValueText = input<string>('');

  // ── Computeds Reativos ────────────────────────────────────
  readonly isIndeterminate = computed<boolean>(() => this.mode() === 'indeterminate');

  readonly normalizedValue = computed<number>(() => {
    const val = Number(this.value());
    if (isNaN(val)) return 0;
    return Math.min(100, Math.max(0, val));
  });

  readonly pixelSize = computed<number>(() => {
    const s = this.size();
    if (typeof s === 'number') return s > 0 ? s : 48;
    switch (s) {
      case 'sm': return 32;
      case 'md': return 48;
      case 'lg': return 64;
      case 'xl': return 96;
      default: return 48;
    }
  });

  readonly computedStrokeWidth = computed<number>(() => {
    const custom = this.strokeWidth();
    if (custom !== undefined && custom > 0) return custom;

    const s = this.pixelSize();
    if (s <= 32) return 3;
    if (s <= 48) return 4;
    if (s <= 64) return 5;
    return 6;
  });

  readonly center = computed<number>(() => this.pixelSize() / 2);

  readonly radius = computed<number>(() => {
    return Math.max(1, (this.pixelSize() - this.computedStrokeWidth()) / 2);
  });

  readonly circumference = computed<number>(() => {
    return 2 * Math.PI * this.radius();
  });

  readonly strokeDashOffset = computed<number>(() => {
    if (this.isIndeterminate()) return 0;
    const progress = this.normalizedValue() / 100;
    return this.circumference() * (1 - progress);
  });

  readonly formattedValue = computed<string>(() => {
    return `${this.valuePrefix()}${Math.round(this.normalizedValue())}${this.valueSuffix()}`;
  });
  readonly effectiveColor = computed(() => this.customColor() || '');
}
