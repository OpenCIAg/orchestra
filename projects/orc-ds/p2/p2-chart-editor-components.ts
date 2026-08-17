import { booleanAttribute, ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { P2_SHARED_STYLES } from './p2-shared';

export type ChartType = 'bar' | 'line' | 'doughnut';
export interface ChartDataset { label?: string; data: number[]; backgroundColor?: string | string[]; borderColor?: string; }
export interface ChartData { labels: string[]; datasets: ChartDataset[]; }

@Component({
  selector: 'orc-chart', standalone: true,
  template: `<div class="orc-chart" [style.height]="height()" [attr.aria-label]="ariaLabel()"><svg viewBox="0 0 100 60" preserveAspectRatio="none" role="img"><g class="grid"><line x1="5" y1="5" x2="5" y2="55" /><line x1="5" y1="55" x2="98" y2="55" /></g>@if (type() === 'bar') { @for (bar of bars(); track $index) { <rect [attr.x]="bar.x" [attr.y]="bar.y" [attr.width]="bar.width" [attr.height]="bar.height" [attr.fill]="bar.color" (click)="pointClick.emit(bar.index)" /> } } @else if (type() === 'line') { @for (line of lines(); track $index) { <polyline [attr.points]="line.points" [attr.stroke]="line.color" /> @for (point of line.pointList; track $index) { <circle [attr.cx]="point.x" [attr.cy]="point.y" r=".8" [attr.fill]="line.color" (click)="pointClick.emit(point.index)" /> } } } @else { @for (slice of doughnutSlices(); track $index) { <path [attr.d]="slice.path" [attr.fill]="slice.color" (click)="pointClick.emit(slice.index)" /> } } </svg><div class="legend">@for (item of legend(); track $index) { <span><i [style.background]="item.color"></i>{{ item.label }}</span> }</div></div>`,
  styles: [P2_SHARED_STYLES + `.orc-chart{display:block;width:100%;min-height:12rem}.orc-chart svg{display:block;width:100%;height:calc(100% - 1.5rem);overflow:visible}.grid line{stroke:#e2e8f0;stroke-width:.25}.orc-chart rect{cursor:pointer}.orc-chart polyline{fill:none;stroke-width:1.2;stroke-linejoin:round;stroke-linecap:round}.orc-chart circle{cursor:pointer}.legend{display:flex;flex-wrap:wrap;gap:.7rem;font-size:.75rem;color:#475569}.legend span{display:inline-flex;gap:.3rem;align-items:center}.legend i{display:inline-block;width:.65rem;height:.65rem;border-radius:.15rem}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent {
  readonly type = input<ChartType>('bar'); readonly data = input<ChartData>({ labels: [], datasets: [] }); readonly height = input('260px'); readonly ariaLabel = input('Chart'); readonly pointClick = output<number>();
  private color(index: number, dataset: ChartDataset): string { const value = dataset.backgroundColor; return Array.isArray(value) ? (value[index] || '#3b82f6') : (value || '#3b82f6'); }
  private maxValue(): number { return Math.max(1, ...this.data().datasets.flatMap(dataset => dataset.data)); }
  bars(): Array<{ x: number; y: number; width: number; height: number; color: string; index: number }> { const datasets = this.data().datasets; const count = this.data().labels.length; const max = this.maxValue(); const slot = 88 / Math.max(1, count); const width = Math.max(1, slot / Math.max(1, datasets.length) - .8); const result: Array<{ x: number; y: number; width: number; height: number; color: string; index: number }> = []; datasets.forEach((dataset, datasetIndex) => dataset.data.forEach((value, index) => { const height = value / max * 48; result.push({ x: 6 + index * slot + datasetIndex * (width + .4), y: 54 - height, width, height, color: this.color(index, dataset), index }); })); return result; }
  lines(): Array<{ points: string; color: string; pointList: Array<{ x: number; y: number; index: number }> }> { const count = this.data().labels.length; const max = this.maxValue(); return this.data().datasets.map(dataset => { const pointList = dataset.data.map((value, index) => ({ x: 6 + (index * 88 / Math.max(1, count - 1)), y: 54 - value / max * 48, index })); return { points: pointList.map(point => `${point.x},${point.y}`).join(' '), color: dataset.borderColor || this.color(0, dataset), pointList }; }); }
  doughnutSlices(): Array<{ path: string; color: string; index: number }> { const values = this.data().datasets[0]?.data || []; const total = values.reduce((sum, value) => sum + Math.max(0, value), 0) || 1; let start = -Math.PI / 2; return values.map((value, index) => { const end = start + Math.max(0, value) / total * Math.PI * 2; const large = end - start > Math.PI ? 1 : 0; const x1 = 50 + 20 * Math.cos(start); const y1 = 30 + 20 * Math.sin(start); const x2 = 50 + 20 * Math.cos(end); const y2 = 30 + 20 * Math.sin(end); const path = `M 50 30 L ${x1} ${y1} A 20 20 0 ${large} 1 ${x2} ${y2} Z`; start = end; return { path, color: this.color(index, this.data().datasets[0] || { data: [] }), index }; }); }
  legend(): Array<{ label: string; color: string }> { const dataset = this.data().datasets[0]; return this.data().labels.map((label, index) => ({ label, color: this.color(index, dataset || { data: [] }) })); }
}

@Component({
  selector: 'orc-editor', standalone: true,
  template: `<section class="orc-editor" [class.readonly]="readonly()" [attr.aria-label]="ariaLabel()"><div class="toolbar" role="toolbar">@for (action of actions; track action.command) { <button type="button" [disabled]="readonly()" (click)="exec(action.command)" [attr.aria-label]="action.label">{{ action.icon }}</button> }</div><div class="surface" contenteditable="true" [attr.contenteditable]="readonly() ? 'false' : 'true'" [attr.data-placeholder]="placeholder()" [innerHTML]="value()" (input)="onInput($event)" (blur)="blur.emit(value())"></div></section>`,
  styles: [P2_SHARED_STYLES + `.orc-editor{width:100%;border:1px solid #cbd5e1;border-radius:.5rem;overflow:hidden;background:#fff}.toolbar{display:flex;gap:.2rem;padding:.35rem;border-bottom:1px solid #e2e8f0;background:#f8fafc}.toolbar button{width:2rem;height:2rem;border:0;border-radius:.3rem;background:transparent}.toolbar button:hover:not(:disabled){background:#e2e8f0}.surface{min-height:10rem;padding:.75rem;outline:0;color:#0f172a}.surface:empty:before{content:attr(data-placeholder);color:#94a3b8}.readonly .toolbar{display:none}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent {
  readonly value = model(''); readonly placeholder = input('Write something…'); readonly readonly = input(false, { transform: booleanAttribute }); readonly ariaLabel = input('Editor'); readonly blur = output<string>();
  readonly actions = [{ command: 'bold', icon: 'B', label: 'Bold' }, { command: 'italic', icon: 'I', label: 'Italic' }, { command: 'underline', icon: 'U', label: 'Underline' }];
  onInput(event: Event): void { this.value.set((event.target as HTMLElement).innerHTML); }
  exec(command: string): void { if (this.readonly()) return; if (typeof document !== 'undefined') document.execCommand(command); }
}
