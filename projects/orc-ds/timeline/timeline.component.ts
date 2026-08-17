import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TimelineItem, TimelineOrientation } from './timeline.types';

@Component({
  selector: 'orc-timeline',
  standalone: true,
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
  readonly items = input<TimelineItem[]>([]);
  readonly orientation = input<TimelineOrientation>('vertical');
  readonly ariaLabel = input('Timeline');
  readonly itemSelect = output<{ item: TimelineItem; index: number }>();

  trackItem(index: number, item: TimelineItem): string | number { return item.id ?? index; }
  selectItem(item: TimelineItem, index: number): void { this.itemSelect.emit({ item, index }); }
  onItemKeydown(event: KeyboardEvent, item: TimelineItem, index: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectItem(item, index);
    }
  }
}
