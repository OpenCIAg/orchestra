import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressMode, ProgressVariant, ProgressSize } from './progress.types';

@Component({
  selector: 'orc-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {
  // ── Inputs (Signals API) ──────────────────────────────────
  /** Valor percentual atual do progresso (0 a 100) */
  readonly value = input<number>(0);

  /** Modo de operação: 'determinate' (valor numérico) ou 'indeterminate' (animação contínua) */
  readonly mode = input<ProgressMode>('determinate');

  /** Status semântico / cor: 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'danger' */
  readonly variant = input<ProgressVariant>('primary');

  /** Espessura / tamanho da barra: 'sm' (4px) | 'md' (8px - padrão Figma) | 'lg' (12px) */
  readonly size = input<ProgressSize>('md');

  /** Rótulo textual opcional exibido no topo à esquerda (ex: 'Progresso', 'Upload') */
  readonly label = input<string>('');

  /** Exibe a porcentagem numérica no topo à direita */
  readonly showValue = input<boolean>(false);

  /** Prefixo opcional para exibição de valor (ex: '$') */
  readonly valuePrefix = input<string>('');

  /** Sufixo para exibição de valor (padrão: '%') */
  readonly valueSuffix = input<string>('%');

  /** Cantos arredondados tipo pílula (padrão Figma: true) */
  readonly rounded = input<boolean>(true);

  /** Suporte a etapas segmentadas (ex: 3 barras discretas) */
  readonly segments = input<number>(0);

  /** Etapa ativa atual no modo segmentado (1-indexed ou 0-indexed) */
  readonly currentSegment = input<number>(0);

  /** Altura customizada (ex: '6px' ou número 6) */
  readonly customHeight = input<string | number>('');

  /** Cor customizada de preenchimento (sobrescreve o variant) */
  readonly customColor = input<string>('');

  /** Cor customizada da trilha / fundo da barra */
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

  readonly formattedValue = computed<string>(() => {
    return `${this.valuePrefix()}${Math.round(this.normalizedValue())}${this.valueSuffix()}`;
  });

  readonly hasHeader = computed<boolean>(() => {
    return Boolean(this.label() || this.showValue());
  });

  readonly segmentArray = computed<number[]>(() => {
    const total = this.segments();
    if (total <= 0) return [];
    return Array.from({ length: total }, (_, i) => i + 1);
  });
}
