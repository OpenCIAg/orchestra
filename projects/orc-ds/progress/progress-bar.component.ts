import {
  Component,
  ChangeDetectionStrategy,
  ContentChild,
  input,
  computed,
  TemplateRef,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ProgressMarker,
  ProgressMode,
  ProgressVariant,
  ProgressSize,
} from './progress.types';

const MAX_SEGMENTS = 100;

@Component({
  selector: 'orc-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {
  /** PrimeNG-compatible projected content template (`#content`, implicit value). */
  @ContentChild('content', { read: TemplateRef })
  readonly contentTemplate?: TemplateRef<unknown>;

  // ── Inputs (Signals API) ──────────────────────────────────
  /** Valor percentual atual do progresso (0 a 100) */
  readonly value = input<number>(0);

  /** Modo de operação: 'determinate' (valor numérico) ou 'indeterminate' (animação contínua) */
  readonly mode = input<ProgressMode>('determinate');

  /** Status semântico / cor: 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'danger' */
  readonly variant = input<ProgressVariant>('primary');

  /** Espessura da barra: sm (4px), md (8px), lg (12px) ou xl (16px). */
  readonly size = input<ProgressSize>('md');

  /** Rótulo textual opcional exibido no topo à esquerda (ex: 'Progresso', 'Upload') */
  readonly label = input<string>('');

  /** Exibe a porcentagem numérica no topo à direita */
  readonly showValue = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });
  /** Unidade usada quando valueSuffix mantém o padrão percentual. */
  readonly unit = input('%');
  /** Cor legada de preenchimento; customColor tem precedência. */
  readonly color = input<string | undefined>(undefined);
  readonly styleClass = input('');
  readonly valueStyleClass = input('');
  readonly style = input<Record<string, any> | undefined>(undefined);

  /** Prefixo opcional para exibição de valor (ex: '$') */
  readonly valuePrefix = input<string>('');

  /** Sufixo para exibição de valor (padrão: '%') */
  readonly valueSuffix = input<string>('%');

  /** Cantos arredondados tipo pílula (padrão Figma: true) */
  readonly rounded = input<boolean, unknown>(true, {
    transform: booleanAttribute,
  });

  /** Número de etapas renderizadas, limitado a 100. */
  readonly segments = input<number>(0);

  /** Número de etapas concluídas, de zero ao total. */
  readonly currentSegment = input<number>(0);

  /** Altura customizada (ex: '6px' ou número 6) */
  readonly customHeight = input<string | number>('');

  /** Cor customizada de preenchimento (sobrescreve o variant) */
  readonly customColor = input<string>('');

  /** Cor customizada da trilha / fundo da barra */
  readonly customTrackColor = input<string>('');
  /** Marcas percentuais da barra contínua; posições inválidas são ignoradas. */
  readonly markers = input<ProgressMarker[]>([]);

  /** Sobrescreve o rótulo de acessibilidade aria-label */
  readonly ariaLabel = input<string | undefined>(undefined);

  /** Sobrescreve a descrição audível aria-valuetext */
  readonly ariaValueText = input<string | undefined>(undefined);

  // ── Computeds Reativos ────────────────────────────────────
  readonly isIndeterminate = computed<boolean>(
    () => this.mode() === 'indeterminate',
  );
  readonly normalizedValue = computed<number>(() => {
    const val = Number(this.value());
    if (!Number.isFinite(val)) return 0;
    return Math.min(100, Math.max(0, val));
  });

  readonly formattedValue = computed<string>(() => {
    const suffix =
      this.valueSuffix() === '%' && this.unit() !== '%'
        ? this.unit()
        : this.valueSuffix();
    return `${this.valuePrefix()}${Math.round(this.normalizedValue())}${suffix}`;
  });
  readonly effectiveColor = computed(
    () => this.customColor().trim() || this.color()?.trim() || '',
  );
  readonly effectiveTrackColor = computed(
    () => this.customTrackColor().trim() || '',
  );
  readonly customHeightStyle = computed(() => {
    const height = this.customHeight();
    if (typeof height === 'number')
      return Number.isFinite(height) && height >= 0 ? `${height}px` : null;
    return height.trim() || null;
  });

  readonly labelText = computed(() => this.label().trim());
  readonly accessibleValueText = computed(
    () => this.ariaValueText()?.trim() || null,
  );

  readonly hasHeader = computed<boolean>(() => {
    return (
      Boolean(this.labelText()) || (this.showValue() && !this.isIndeterminate())
    );
  });

  /**
   * Progress bars must have a name even when the visual label is omitted. Keep
   * the fallback here so determinate and segmented variants expose the same
   * accessible contract.
   */
  readonly accessibleLabel = computed<string>(
    () => this.ariaLabel()?.trim() || this.labelText() || 'Progress',
  );

  readonly normalizedSegmentCount = computed(() => {
    const total = Number(this.segments());
    if (!Number.isFinite(total) || total <= 0) return 0;
    return Math.min(MAX_SEGMENTS, Math.floor(total));
  });
  readonly isSegmented = computed(
    () => !this.isIndeterminate() && this.normalizedSegmentCount() > 0,
  );

  readonly normalizedCurrentSegment = computed(() => {
    const current = Number(this.currentSegment());
    if (!Number.isFinite(current)) return 0;
    return Math.min(
      this.normalizedSegmentCount(),
      Math.max(0, Math.floor(current)),
    );
  });

  readonly segmentArray = computed<number[]>(() => {
    const total = this.normalizedSegmentCount();
    if (total === 0) return [];
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  readonly normalizedMarkers = computed(() =>
    this.markers().flatMap((marker) => {
      const value = marker?.value;
      if (typeof value !== 'number' || !Number.isFinite(value)) return [];
      return [
        {
          ...marker,
          value: Math.min(100, Math.max(0, value)),
          label: marker.label?.trim() || undefined,
        },
      ];
    }),
  );
}
