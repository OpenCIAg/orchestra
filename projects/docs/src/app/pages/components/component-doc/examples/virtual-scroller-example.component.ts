import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { VirtualScrollerComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-virtual-scroller-example',
  standalone: true,
  imports: [VirtualScrollerComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Lista longa + overscan</span>
        <orc-virtual-scroller
          [items]="items"
          itemLabelKey="label"
          [itemHeight]="40"
          viewportHeight="220px"
          label="Componentes virtuais"
          (rangeChange)="onRangeChange($event)"
        />
        <code
          >range = {{ range().start }}–{{ range().end }} /
          {{ items.length }}</code
        >
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VirtualScrollerExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly range = signal({ start: 0, end: 0 });
  readonly items = Array.from({ length: 80 }, (_, index) => ({
    id: index + 1,
    label: `Virtual item ${String(index + 1).padStart(2, '0')}`,
    status: index % 3 === 0 ? 'review' : 'ready',
  }));

  ngOnInit(): void {
    this.emit();
  }

  onRangeChange(range: { start: number; end: number }): void {
    this.range.set(range);
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({ range: this.range(), total: this.items.length });
  }
}
