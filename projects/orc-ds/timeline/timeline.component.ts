import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { TimelineItem, TimelineOrientation } from './timeline.types';

@Component({
  selector: 'orc-timeline',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
  readonly items = input<TimelineItem[] | undefined>(undefined);
  readonly value = input<TimelineItem[] | undefined>(undefined);
  readonly align = input<'left' | 'alternate' | 'right'>('alternate');
  readonly layout = input<TimelineOrientation | undefined>(undefined);
  readonly style = input<Record<string, string> | null>(null);
  readonly styleClass = input('');
  readonly orientation = input<TimelineOrientation | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly itemSelect = output<{ item: TimelineItem; index: number }>();
  readonly onItemClick = output<{ item: TimelineItem; index: number }>();
  readonly renderedItems = computed(() => this.items() ?? this.value() ?? []);
  readonly renderedOrientation = computed(
    () => this.orientation() ?? this.layout() ?? 'vertical',
  );
  readonly renderedAlign = computed(() => this.align());

  trackItem(index: number, item: TimelineItem): string | number {
    return item.id ?? index;
  }
  selectItem(item: TimelineItem, index: number): void {
    const event = { item, index };
    this.itemSelect.emit(event);
    this.onItemClick.emit(event);
  }
}
