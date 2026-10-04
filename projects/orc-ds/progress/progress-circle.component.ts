import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressMode, ProgressVariant, ProgressSize } from './progress.types';

function normalizeCircleSize(
  value: ProgressSize | number | string,
): ProgressSize | number {
  if (typeof value === 'number') return value;

  const normalized = value.trim();
  if (
    normalized === 'sm' ||
    normalized === 'md' ||
    normalized === 'lg' ||
    normalized === 'xl'
  ) {
    return normalized;
  }

  const numeric = Number(normalized);
  return normalized && Number.isFinite(numeric) ? numeric : Number.NaN;
}

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
  readonly size = input<ProgressSize | number, ProgressSize | number | string>(
    'md',
    { transform: normalizeCircleSize },
  );

  /** Espessura do traço (em px). Se omitido, é calculado proporcionalmente ao tamanho */
  readonly strokeWidth = input<number | string | undefined>(undefined);
  readonly animation = input<'spin' | 'none'>('spin');

  /** Exibe o valor numérico centralizado dentro do círculo */
  readonly showValue = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });
  readonly styleClass = input('');
  readonly style = input<Record<string, any> | undefined>(undefined);
  readonly animationDuration = input('2s');
  readonly fill = input('none');

  /** Cantos arredondados na ponta do arco (stroke-linecap: round) */
  readonly rounded = input<boolean, unknown>(true, {
    transform: booleanAttribute,
  });

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
  readonly ariaLabel = input<string | undefined>(undefined);

  /** Sobrescreve a descrição audível aria-valuetext */
  readonly ariaValueText = input<string | undefined>(undefined);

  // ── Computeds Reativos ────────────────────────────────────
  readonly isIndeterminate = computed<boolean>(
    () => this.mode() === 'indeterminate',
  );

  readonly isAnimatedIndeterminate = computed<boolean>(
    () => this.isIndeterminate() && this.animation() === 'spin',
  );

  readonly accessibleName = computed<string>(
    () => this.ariaLabel()?.trim() || this.label().trim() || 'Progress',
  );

  readonly accessibleValueText = computed<string | null>(
    () =>
      this.ariaValueText()?.trim() ||
      (this.isIndeterminate() ? null : this.formattedValue()),
  );

  readonly normalizedStyleClass = computed<string>(() =>
    this.styleClass().trim(),
  );

  readonly normalizedValue = computed<number>(() => {
    const val = Number(this.value());
    if (!Number.isFinite(val)) return 0;
    return Math.min(100, Math.max(0, val));
  });

  readonly pixelSize = computed<number>(() => {
    const s = this.size();
    if (typeof s === 'number') return Number.isFinite(s) && s > 0 ? s : 48;
    switch (s) {
      case 'sm':
        return 32;
      case 'md':
        return 48;
      case 'lg':
        return 64;
      case 'xl':
        return 96;
      default:
        return 48;
    }
  });

  readonly computedStrokeWidth = computed<number>(() => {
    const custom = this.strokeWidth();
    const numeric =
      typeof custom === 'string' ? Number.parseFloat(custom) : custom;
    const s = this.pixelSize();
    const defaultWidth = s <= 32 ? 3 : s <= 48 ? 4 : s <= 64 ? 5 : 6;
    const requestedWidth =
      numeric !== undefined && Number.isFinite(numeric) && numeric > 0
        ? numeric
        : defaultWidth;
    return Math.min(requestedWidth, Math.max(0.1, s - 0.2));
  });

  readonly center = computed<number>(() => this.pixelSize() / 2);

  readonly radius = computed<number>(() => {
    return Math.max(0.1, (this.pixelSize() - this.computedStrokeWidth()) / 2);
  });

  readonly circumference = computed<number>(() => {
    return 2 * Math.PI * this.radius();
  });

  readonly strokeDashOffset = computed<number>(() => {
    if (this.isIndeterminate()) return 0;
    const progress = this.normalizedValue() / 100;
    return this.circumference() * (1 - progress);
  });

  readonly strokeDashArray = computed<string>(() => {
    const circumference = this.circumference();
    if (this.isIndeterminate() && !this.isAnimatedIndeterminate()) {
      return `${circumference * 0.25} ${circumference * 0.75}`;
    }
    return `${circumference}`;
  });

  readonly formattedValue = computed<string>(() => {
    return `${this.valuePrefix()}${Math.round(this.normalizedValue())}${this.valueSuffix()}`;
  });
  readonly effectiveColor = computed(() => this.customColor().trim() || '');
  readonly effectiveTrackColor = computed(
    () => this.customTrackColor().trim() || '',
  );
}
