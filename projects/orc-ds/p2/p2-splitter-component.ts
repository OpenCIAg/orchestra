import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Directive,
  input,
  model,
  output,
  QueryList,
  TemplateRef,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { P2_SHARED_STYLES, P2Orientation } from './p2-shared';

@Directive({ selector: '[orcSplitterPanel]', standalone: true })
export class SplitterPanelContentDirective {
  readonly orcSplitterPanel = input<string>('');
  constructor(readonly templateRef: TemplateRef<unknown>) {}
}

export interface SplitterPanel {
  id: string;
  label?: string;
  size?: number;
  minSize?: number;
}

@Component({
  selector: 'orc-splitter',
  standalone: true,
  imports: [CommonModule],
  template: `<div
    class="orc-p2-splitter"
    [class.vertical]="orientation() === 'vertical'"
    role="group"
    [attr.aria-label]="label() || null"
  >
    @if (panels().length) {
      @for (panel of panels(); track panel.id; let index = $index) {
        <section
          class="panel"
          [style.flex-basis.%]="panelSize(index)"
          role="region"
          [attr.aria-label]="panel.label || panel.id"
        >
          <header>{{ panel.label || panel.id }}</header>
          <div class="panel-body">
            @if (contentFor(panel.id); as content) {
              <ng-container [ngTemplateOutlet]="content.templateRef" />
            }
          </div>
        </section>
        @if (index < panels().length - 1) {
          <button
            type="button"
            class="gutter"
            role="separator"
            [attr.aria-label]="gutterAriaLabel(index)"
            [attr.aria-orientation]="
              orientation() === 'vertical' ? 'vertical' : 'horizontal'
            "
            [attr.aria-valuemin]="panelMinimum(index)"
            [attr.aria-valuemax]="100 - panelMinimum(index + 1)"
            [attr.aria-valuenow]="panelSize(index)"
            tabindex="0"
            (pointerdown)="onGutterPointerDown($event, index)"
            (pointermove)="onGutterPointerMove($event, index)"
            (pointerup)="onGutterPointerEnd($event)"
            (pointercancel)="onGutterPointerEnd($event)"
            (keydown)="onGutterKeydown($event, index)"
            (keyup)="onGutterKeyup($event)"
          ></button>
        }
      }
    } @else {
      <ng-content />
    }
  </div>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-p2-splitter { display: flex; min-height: 8rem; width: 100%; gap: 1px; background: var(--orc-component-surface-subtle); } .orc-p2-splitter.vertical { flex-direction: column; } .panel { min-width: 0; min-height: 0; flex: 1 1 0; background: var(--orc-component-surface); color: var(--orc-component-text); } .panel header { padding: .45rem .65rem; border-bottom: 1px solid var(--orc-component-border); font-size: .8rem; font-weight: 700; } .panel-body { min-height: 4rem; padding: .5rem; } .gutter{flex:0 0 .45rem;border:0;background:var(--orc-component-surface-subtle);cursor:col-resize;touch-action:none;user-select:none}.vertical .gutter{cursor:row-resize}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitterComponent {
  readonly panels = input<SplitterPanel[]>([]);
  readonly orientation = input<P2Orientation>('horizontal');
  readonly label = input<string | undefined>(undefined);
  readonly resizeLabel = input<string | undefined>(undefined);
  readonly sizes = model<number[]>([]);
  readonly onResizeStart = output<{ index: number }>();
  readonly onResizeEnd = output<KeyboardEvent>();
  /** Emits when pointer-driven resizing ends or is canceled. */
  readonly onPointerResizeEnd = output<PointerEvent>();
  readonly onResize = output<{ index: number; sizes: number[] }>();
  private pointerDrag:
    | {
        pointerId: number;
        index: number;
        startCoordinate: number;
        startSizes: number[];
        extent: number;
        target: HTMLButtonElement;
      }
    | undefined;
  @ContentChildren(SplitterPanelContentDirective)
  private readonly panelContents!: QueryList<SplitterPanelContentDirective>;
  contentFor(id: string): SplitterPanelContentDirective | undefined {
    return this.panelContents?.find(
      (content) => content.orcSplitterPanel() === id,
    );
  }
  readonly normalizedSizes = computed(() => {
    const count = this.panels().length;
    if (!count) return [];
    const supplied = this.sizes();
    const panelSizes = this.panels().map((panel) => panel.size ?? 0);
    return this.normalize(supplied.length === count ? supplied : panelSizes);
  });
  panelMinimum(index: number): number {
    const panels = this.panels();
    const value = Number(panels[index]?.minSize ?? 0);
    if (!Number.isFinite(value)) return 0;
    const raw = Math.max(0, Math.min(100, value));
    const total = panels.reduce((sum, panel) => {
      const minimum = Number(panel.minSize ?? 0);
      return sum + (Number.isFinite(minimum) ? Math.max(0, minimum) : 0);
    }, 0);
    return total > 100 ? (raw / total) * 100 : raw;
  }
  gutterAriaLabel(index: number): string {
    return (
      this.resizeLabel() ||
      `Resize ${this.panels()[index]?.label || this.panels()[index]?.id || 'panel'} and ${this.panels()[index + 1]?.label || this.panels()[index + 1]?.id || 'panel'}`
    );
  }
  panelSize(index: number): number {
    return this.normalizedSizes()[index] ?? 0;
  }
  setSizes(sizes: number[]): void {
    const next = this.normalize(sizes);
    this.sizes.set(next);
  }
  resize(index: number, delta: number): void {
    const next = [...this.normalizedSizes()];
    if (index < 0 || index >= next.length - 1) return;
    if (!Number.isFinite(delta) || delta === 0) return;
    const amount =
      delta > 0
        ? Math.min(delta, next[index + 1] - this.panelMinimum(index + 1))
        : -Math.min(-delta, next[index] - this.panelMinimum(index));
    if (amount === 0) return;
    next[index] += amount;
    next[index + 1] -= amount;
    this.onResizeStart.emit({ index });
    this.setSizes(next);
    this.onResize.emit({ index, sizes: next });
  }
  onGutterPointerDown(event: PointerEvent, index: number): void {
    if (event.button !== 0 || !event.isPrimary) return;
    const target = event.currentTarget as HTMLButtonElement;
    const root = target.closest<HTMLElement>('.orc-p2-splitter');
    const rectangle = root?.getBoundingClientRect();
    const vertical = this.orientation() === 'vertical';
    const extent = vertical ? rectangle?.height : rectangle?.width;
    const startSizes = this.normalizedSizes();
    if (
      !rectangle ||
      !Number.isFinite(extent) ||
      extent! <= 0 ||
      index < 0 ||
      index >= startSizes.length - 1
    )
      return;

    event.preventDefault();
    this.pointerDrag = {
      pointerId: event.pointerId,
      index,
      startCoordinate: vertical ? event.clientY : event.clientX,
      startSizes,
      extent: extent!,
      target,
    };
    this.onResizeStart.emit({ index });
    try {
      target.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointer events and detached test hosts cannot capture pointers.
    }
  }
  onGutterPointerMove(event: PointerEvent, index: number): void {
    const drag = this.pointerDrag;
    if (!drag || drag.pointerId !== event.pointerId || drag.index !== index)
      return;

    const vertical = this.orientation() === 'vertical';
    const coordinate = vertical ? event.clientY : event.clientX;
    const delta = ((coordinate - drag.startCoordinate) / drag.extent) * 100;
    const pairTotal = drag.startSizes[index] + drag.startSizes[index + 1];
    const nextSize = Math.max(
      this.panelMinimum(index),
      Math.min(
        pairTotal - this.panelMinimum(index + 1),
        drag.startSizes[index] + delta,
      ),
    );
    const next = [...drag.startSizes];
    next[index] = nextSize;
    next[index + 1] = pairTotal - nextSize;
    if (next.every((size, position) => size === this.panelSize(position)))
      return;

    this.setSizes(next);
    this.onResize.emit({ index, sizes: this.normalizedSizes() });
  }
  onGutterPointerEnd(event: PointerEvent): void {
    const drag = this.pointerDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    this.pointerDrag = undefined;
    try {
      if (drag.target.hasPointerCapture(event.pointerId))
        drag.target.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already have been released by the browser.
    }
    this.onPointerResizeEnd.emit(event);
  }
  onGutterKeydown(event: KeyboardEvent, index: number): void {
    const key = event.key;
    const vertical = this.orientation() === 'vertical';
    if (key === (vertical ? 'ArrowDown' : 'ArrowRight')) {
      event.preventDefault();
      this.resize(index, 5);
      return;
    }
    if (key === (vertical ? 'ArrowUp' : 'ArrowLeft')) {
      event.preventDefault();
      this.resize(index, -5);
    }
  }
  onGutterKeyup(event: KeyboardEvent): void {
    if (event.key.startsWith('Arrow')) this.onResizeEnd.emit(event);
  }
  private normalize(sizes: number[]): number[] {
    const count = this.panels().length;
    if (!count) return [];
    const minimums = this.panels().map((_, index) => this.panelMinimum(index));
    const minimumTotal = minimums.reduce((sum, size) => sum + size, 0);
    if (minimumTotal >= 100)
      return minimums.map((size) => (size / minimumTotal) * 100);
    const positive = sizes.map((size) =>
      Number.isFinite(size) ? Math.max(0, size) : 0,
    );
    const total = positive.reduce((sum, size) => sum + size, 0);
    const next = total
      ? positive.map((size) => (size / total) * 100)
      : Array.from({ length: count }, () => 100 / count);
    for (let index = 0; index < count; index += 1)
      next[index] = Math.max(minimums[index], next[index]);
    let excess = next.reduce((sum, size) => sum + size, 0) - 100;
    while (excess > 0.0001) {
      const adjustable = next
        .map((size, index) => ({ index, room: size - minimums[index] }))
        .filter((entry) => entry.room > 0.0001);
      if (!adjustable.length) break;
      const reduction = Math.min(
        excess / adjustable.length,
        ...adjustable.map((entry) => entry.room),
      );
      for (const entry of adjustable) next[entry.index] -= reduction;
      excess -= reduction * adjustable.length;
    }
    const remainder = 100 - next.reduce((sum, size) => sum + size, 0);
    if (remainder > 0) next[count - 1] += remainder;
    return next;
  }
}
