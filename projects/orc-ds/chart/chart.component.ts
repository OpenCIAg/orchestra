import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ORC_SHARED_STYLES } from '@ciag/orchestra/internal';

export type ChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'doughnut'
  | 'scatter'
  | 'bubble'
  | 'polarArea'
  | 'radar';

export interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

@Component({
  selector: 'orc-chart',
  standalone: true,
  template: `<div
    class="orc-chart"
    [class]="styleClass()"
    [style.width]="width()"
    [style.height]="height()"
  >
    @if (isSupportedType()) {
      <svg
        #chartSvg
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        role="group"
        [attr.aria-label]="ariaLabel() || (!ariaLabelledBy() ? 'Chart' : null)"
        [attr.aria-labelledby]="ariaLabelledBy()"
      >
        <g class="grid">
          <line x1="5" y1="5" x2="5" y2="55" />
          <line
            x1="5"
            [attr.y1]="type() === 'bar' || type() === 'line' ? zeroLineY() : 55"
            x2="98"
            [attr.y2]="type() === 'bar' || type() === 'line' ? zeroLineY() : 55"
          />
        </g>
        @if (type() === 'bar') {
          @for (bar of bars(); track $index) {
            <rect
              role="button"
              [attr.tabindex]="pointTabIndex(bar.index, bar.datasetIndex)"
              [attr.data-chart-point-order]="
                pointOrderIndex(bar.index, bar.datasetIndex)
              "
              [attr.aria-label]="bar.ariaLabel"
              [attr.x]="bar.x"
              [attr.y]="bar.y"
              [attr.width]="bar.width"
              [attr.height]="bar.height"
              [attr.fill]="bar.color"
              (click)="onPointClick(bar.index, bar.datasetIndex, $event)"
              (focus)="onPointFocus(bar.index, bar.datasetIndex)"
              (keydown)="onPointKeydown(bar.index, bar.datasetIndex, $event)"
            />
          }
        } @else if (type() === 'line') {
          @for (line of lines(); track $index) {
            <polyline [attr.points]="line.points" [attr.stroke]="line.color" />
            @for (point of line.pointList; track $index) {
              <circle
                role="button"
                [attr.tabindex]="pointTabIndex(point.index, point.datasetIndex)"
                [attr.data-chart-point-order]="
                  pointOrderIndex(point.index, point.datasetIndex)
                "
                [attr.aria-label]="point.ariaLabel"
                [attr.cx]="point.x"
                [attr.cy]="point.y"
                r=".8"
                [attr.fill]="line.color"
                (click)="onPointClick(point.index, point.datasetIndex, $event)"
                (focus)="onPointFocus(point.index, point.datasetIndex)"
                (keydown)="
                  onPointKeydown(point.index, point.datasetIndex, $event)
                "
              />
            }
          }
        } @else if (type() === 'pie') {
          @for (slice of pieSlices(); track $index) {
            <path
              role="button"
              [attr.tabindex]="pointTabIndex(slice.index, slice.datasetIndex)"
              [attr.data-chart-point-order]="
                pointOrderIndex(slice.index, slice.datasetIndex)
              "
              [attr.aria-label]="slice.ariaLabel"
              [attr.d]="slice.path"
              [attr.fill]="slice.color"
              fill-rule="evenodd"
              (click)="onPointClick(slice.index, slice.datasetIndex, $event)"
              (focus)="onPointFocus(slice.index, slice.datasetIndex)"
              (keydown)="
                onPointKeydown(slice.index, slice.datasetIndex, $event)
              "
            />
          }
        } @else {
          @for (slice of doughnutSlices(); track $index) {
            <path
              role="button"
              [attr.tabindex]="pointTabIndex(slice.index, slice.datasetIndex)"
              [attr.data-chart-point-order]="
                pointOrderIndex(slice.index, slice.datasetIndex)
              "
              [attr.aria-label]="slice.ariaLabel"
              [attr.d]="slice.path"
              [attr.fill]="slice.color"
              fill-rule="evenodd"
              (click)="onPointClick(slice.index, slice.datasetIndex, $event)"
              (focus)="onPointFocus(slice.index, slice.datasetIndex)"
              (keydown)="
                onPointKeydown(slice.index, slice.datasetIndex, $event)
              "
            />
          }
        }
      </svg>
      <div class="legend">
        @for (item of legend(); track $index) {
          <span><i [style.background]="item.color"></i>{{ item.label }}</span>
        }
      </div>
    } @else {
      <div class="unsupported" role="status">
        Unsupported chart type: {{ type() }}
      </div>
    }
  </div>`,
  styles: [
    ORC_SHARED_STYLES +
      `.orc-chart{display:block;width:100%;min-height:12rem}.orc-chart svg{display:block;width:100%;height:calc(100% - 1.5rem);overflow:visible}.grid line{stroke:var(--orc-component-border);stroke-width:.25}.orc-chart rect,.orc-chart circle,.orc-chart path{cursor:pointer}.orc-chart [role=button]:focus-visible{stroke:var(--orc-component-interactive);stroke-width:1.2}.orc-chart polyline{fill:none;stroke-width:1.2;stroke-linejoin:round;stroke-linecap:round}.legend{display:flex;flex-wrap:wrap;gap:.7rem;font-size:.75rem;color:var(--orc-component-text-secondary)}.legend span{display:inline-flex;gap:.3rem;align-items:center}.legend i{display:inline-block;width:.65rem;height:.65rem;border-radius:.15rem}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent {
  readonly type = input<ChartType>('bar');
  readonly data = input<ChartData>({ labels: [], datasets: [] });
  /** @deprecated Compatibility-only input; this implementation does not execute chart plugins. */
  readonly plugins = input<any[]>([]);
  readonly width = input<string | undefined>(undefined);
  readonly height = input('260px');
  /** @deprecated Compatibility-only input; sizing is controlled by the rendered host styles. */
  readonly responsive = input(true, { transform: booleanAttribute });
  readonly styleClass = input('');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly pointClick = output<number>();
  readonly onDataSelect = output<{
    index: number;
    originalEvent?: Event;
    datasetIndex?: number;
  }>();
  readonly chartSvg = viewChild<ElementRef<SVGSVGElement>>('chartSvg');
  readonly renderVersion = signal(0);
  readonly activePointIndex = signal(0);
  readonly renderedPointCount = computed(() => {
    this.renderTick();
    const datasets = this.data().datasets;
    if (this.type() === 'pie' || this.type() === 'doughnut')
      return datasets[0]?.data.length ?? 0;
    if (this.type() === 'bar' || this.type() === 'line')
      return datasets.reduce(
        (count, dataset) => count + dataset.data.length,
        0,
      );
    return 0;
  });
  readonly resolvedActivePointIndex = computed(() => {
    const count = this.renderedPointCount();
    return count === 0
      ? -1
      : Math.min(Math.max(0, this.activePointIndex()), count - 1);
  });
  constructor() {
    effect(() => {
      const count = this.renderedPointCount();
      const active = this.activePointIndex();
      const next = count === 0 ? 0 : Math.min(Math.max(active, 0), count - 1);
      if (active !== next) this.activePointIndex.set(next);
    });
  }
  refresh(): void {
    this.renderVersion.update((value) => value + 1);
  }
  reinit(): void {
    this.refresh();
  }
  getBase64Image(): string | undefined {
    const svg = this.chartSvg()?.nativeElement;
    if (!svg || typeof XMLSerializer === 'undefined') return undefined;
    const encoded = btoa(
      unescape(encodeURIComponent(new XMLSerializer().serializeToString(svg))),
    );
    return `data:image/svg+xml;base64,${encoded}`;
  }
  generateLegend(): string {
    return this.legend()
      .map((item) => item.label)
      .join(', ');
  }
  isSupportedType(): boolean {
    const kind = this.type();
    return (
      kind === 'bar' || kind === 'line' || kind === 'pie' || kind === 'doughnut'
    );
  }
  pointOrderIndex(index: number, datasetIndex: number): number {
    if (this.type() === 'pie' || this.type() === 'doughnut') return index;
    return (
      this.data()
        .datasets.slice(0, datasetIndex)
        .reduce((count, dataset) => count + dataset.data.length, 0) + index
    );
  }
  pointTabIndex(index: number, datasetIndex: number): 0 | -1 {
    return this.pointOrderIndex(index, datasetIndex) ===
      this.resolvedActivePointIndex()
      ? 0
      : -1;
  }
  onPointFocus(index: number, datasetIndex: number): void {
    this.activePointIndex.set(this.pointOrderIndex(index, datasetIndex));
  }
  onPointClick(index: number, datasetIndex: number, event: MouseEvent): void {
    this.onPointFocus(index, datasetIndex);
    (event.currentTarget as SVGElement).focus({ preventScroll: true });
    this.selectPoint(index, event, datasetIndex);
  }
  onPointKeydown(
    index: number,
    datasetIndex: number,
    event: KeyboardEvent,
  ): void {
    const count = this.renderedPointCount();
    if (!count) return;

    const current = this.pointOrderIndex(index, datasetIndex);
    let next: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = Math.min(count - 1, current + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = Math.max(0, current - 1);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = count - 1;
        break;
      default:
        this.activatePoint(index, datasetIndex, event);
        return;
    }

    event.preventDefault();
    this.activePointIndex.set(next);
    if (next === current) return;
    const svg = (event.currentTarget as SVGElement).ownerSVGElement;
    svg
      ?.querySelector<SVGElement>(`[data-chart-point-order="${next}"]`)
      ?.focus({ preventScroll: true });
  }
  activatePoint(
    index: number,
    datasetIndex: number,
    event: KeyboardEvent,
  ): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (event.repeat) return;
    this.selectPoint(index, event, datasetIndex);
  }
  selectPoint(index: number, event?: Event, datasetIndex?: number): void {
    this.pointClick.emit(index);
    this.onDataSelect.emit({ index, originalEvent: event, datasetIndex });
  }
  private color(index: number, dataset: ChartDataset): string {
    const value = dataset.backgroundColor;
    return Array.isArray(value)
      ? value[index] || '#3b82f6'
      : value || '#3b82f6';
  }
  private renderTick(): number {
    return this.renderVersion();
  }
  private finiteValue(value: unknown): number {
    const numeric = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }
  private nonnegativeValue(value: unknown): number {
    return Math.max(0, this.finiteValue(value));
  }
  private signedDomain(): { min: number; max: number } {
    this.renderTick();
    let min = 0;
    let max = 0;
    for (const dataset of this.data().datasets) {
      for (const value of dataset.data) {
        const finite = this.finiteValue(value);
        min = Math.min(min, finite);
        max = Math.max(max, finite);
      }
    }
    return { min, max };
  }
  private categoryCount(): number {
    return Math.max(
      1,
      this.data().labels.length,
      ...this.data().datasets.map((dataset) => dataset.data.length),
    );
  }
  private pointLabel(
    index: number,
    datasetIndex: number,
    dataset: ChartDataset | undefined,
    value: unknown,
    clampNegative = false,
  ): string {
    const label = this.data().labels[index] || `Point ${index + 1}`;
    const raw = this.finiteValue(value);
    const valueText =
      clampNegative && raw < 0
        ? `0 (negative ${raw} rendered as 0)`
        : Number.isFinite(Number(value))
          ? String(raw)
          : '0 (non-finite rendered as 0)';
    const series =
      dataset?.label ||
      (this.data().datasets.length > 1 ? `Dataset ${datasetIndex + 1}` : '');
    return `${series ? `${series}, ` : ''}${label}, value ${valueText}`;
  }
  private coordinate(
    value: unknown,
    domain: { min: number; max: number },
  ): number {
    const scale = Math.max(1, Math.abs(domain.min), Math.abs(domain.max));
    const min = domain.min / scale;
    const max = domain.max / scale;
    const span = max - min || 1;
    const ratio = (this.finiteValue(value) / scale - min) / span;
    return Math.max(6, Math.min(54, 54 - ratio * 48));
  }

  zeroLineY(): number {
    return this.coordinate(0, this.signedDomain());
  }

  bars(): Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    index: number;
    datasetIndex: number;
    ariaLabel: string;
  }> {
    const datasets = this.data().datasets;
    const count = this.categoryCount();
    const domain = this.signedDomain();
    const zero = this.coordinate(0, domain);
    const slot = 88 / count;
    const width = Math.max(0, slot / Math.max(1, datasets.length) - 0.8);
    const result: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
      index: number;
      datasetIndex: number;
      ariaLabel: string;
    }> = [];
    datasets.forEach((dataset, datasetIndex) =>
      dataset.data.forEach((value, index) => {
        const valueY = this.coordinate(value, domain);
        const height = Math.max(0, Math.min(48, Math.abs(valueY - zero)));
        result.push({
          x: 6 + index * slot + datasetIndex * (width + 0.4),
          y: Math.min(valueY, zero),
          width,
          height,
          color: this.color(index, dataset),
          index,
          datasetIndex,
          ariaLabel: this.pointLabel(index, datasetIndex, dataset, value),
        });
      }),
    );
    return result;
  }
  lines(): Array<{
    points: string;
    color: string;
    pointList: Array<{
      x: number;
      y: number;
      index: number;
      datasetIndex: number;
      ariaLabel: string;
    }>;
  }> {
    const count = this.categoryCount();
    const domain = this.signedDomain();
    return this.data().datasets.map((dataset, datasetIndex) => {
      const pointList = dataset.data.map((value, index) => ({
        x: 6 + (index * 88) / Math.max(1, count - 1),
        y: this.coordinate(value, domain),
        index,
        datasetIndex,
        ariaLabel: this.pointLabel(index, datasetIndex, dataset, value),
      }));
      return {
        points: pointList.map((point) => `${point.x},${point.y}`).join(' '),
        color: dataset.borderColor || this.color(0, dataset),
        pointList,
      };
    });
  }
  private sectorPath(start: number, end: number, innerRadius = 0): string {
    const outerRadius = 20;
    const sweep = end - start;
    const point = (radius: number, angle: number): string =>
      `${(50 + radius * Math.cos(angle)).toFixed(4)} ${(30 + radius * Math.sin(angle)).toFixed(4)}`;
    if (sweep >= Math.PI * 2 - 0.0001) {
      const outerStart = point(outerRadius, start);
      const outerOpposite = point(outerRadius, start + Math.PI);
      if (innerRadius > 0) {
        const innerStart = point(innerRadius, start);
        const innerOpposite = point(innerRadius, start + Math.PI);
        return `M ${outerStart} A ${outerRadius} ${outerRadius} 0 1 1 ${outerOpposite} A ${outerRadius} ${outerRadius} 0 1 1 ${outerStart} M ${innerStart} A ${innerRadius} ${innerRadius} 0 1 0 ${innerOpposite} A ${innerRadius} ${innerRadius} 0 1 0 ${innerStart} Z`;
      }
      return `M ${outerStart} A ${outerRadius} ${outerRadius} 0 1 1 ${outerOpposite} A ${outerRadius} ${outerRadius} 0 1 1 ${outerStart} Z`;
    }
    const outerStart = point(outerRadius, start);
    const outerEnd = point(outerRadius, end);
    const innerEnd = point(innerRadius, end);
    const innerStart = point(innerRadius, start);
    const large = sweep > Math.PI ? 1 : 0;
    return innerRadius > 0
      ? `M ${outerStart} A ${outerRadius} ${outerRadius} 0 ${large} 1 ${outerEnd} L ${innerEnd} A ${innerRadius} ${innerRadius} 0 ${large} 0 ${innerStart} Z`
      : `M 50 30 L ${outerStart} A ${outerRadius} ${outerRadius} 0 ${large} 1 ${outerEnd} Z`;
  }
  private slices(innerRadius = 0): Array<{
    path: string;
    color: string;
    index: number;
    datasetIndex: number;
    ariaLabel: string;
  }> {
    this.renderTick();
    const dataset = this.data().datasets[0] || { data: [] };
    const values = dataset.data.map((value) => this.nonnegativeValue(value));
    const largest = values.reduce((max, value) => Math.max(max, value), 0);
    const total =
      largest > 0 ? values.reduce((sum, value) => sum + value / largest, 0) : 0;
    let start = -Math.PI / 2;
    return values.map((value, index) => {
      const fraction = largest > 0 ? value / largest / total : 0;
      const end = start + fraction * Math.PI * 2;
      const result = {
        path: this.sectorPath(start, end, innerRadius),
        color: this.color(index, dataset),
        index,
        datasetIndex: 0,
        ariaLabel: this.pointLabel(
          index,
          0,
          dataset,
          dataset.data[index],
          true,
        ),
      };
      start = end;
      return result;
    });
  }
  pieSlices(): Array<{
    path: string;
    color: string;
    index: number;
    datasetIndex: number;
    ariaLabel: string;
  }> {
    return this.slices();
  }
  doughnutSlices(): Array<{
    path: string;
    color: string;
    index: number;
    datasetIndex: number;
    ariaLabel: string;
  }> {
    return this.slices(10);
  }
  legend(): Array<{ label: string; color: string }> {
    const datasets = this.data().datasets;
    if (this.type() === 'line')
      return datasets.map((dataset, index) => ({
        label: dataset.label || `Dataset ${index + 1}`,
        color: dataset.borderColor || this.color(0, dataset),
      }));
    const dataset = datasets[0];
    return this.data().labels.map((label, index) => ({
      label,
      color: this.color(index, dataset || { data: [] }),
    }));
  }
}
