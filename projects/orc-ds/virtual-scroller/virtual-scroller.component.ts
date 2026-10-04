import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { P2_SHARED_VARS } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-virtual-scroller, orc-scroller',
  standalone: true,
  templateUrl: './virtual-scroller.component.html',
  styles: [P2_SHARED_VARS],
  styleUrl: './virtual-scroller.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VirtualScrollerComponent {
  readonly items = input<unknown[]>([]);
  readonly itemHeight = input(40);
  readonly itemSize = this.itemHeight;
  readonly viewportHeight = input('240px');
  readonly overscan = input(4);
  readonly label = input('Scrollable list');
  readonly loadingMessage = input<string | undefined>(undefined);
  readonly itemLabelKey = input('label');
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly scrollTop = signal(0);
  readonly rangeChange = output<{ start: number; end: number }>();
  readonly onLazyLoad = output<{ first: number; last: number }>();
  readonly effectiveItemHeight = computed(() => {
    const value = Number(this.itemHeight());
    return Number.isFinite(value) ? Math.max(1, value) : 40;
  });
  readonly effectiveOverscan = computed(() => {
    const value = Number(this.overscan());
    return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  });
  readonly startIndex = computed(() => {
    const size = this.effectiveItemHeight();
    const index =
      Math.floor(this.scrollTop() / size) - this.effectiveOverscan();
    return Math.min(this.items().length, Math.max(0, index));
  });
  readonly endIndex = computed(() => {
    const size = this.effectiveItemHeight();
    const start = this.startIndex();
    const index =
      Math.ceil((this.scrollTop() + this.viewportPixels()) / size) +
      this.effectiveOverscan();
    return Math.min(this.items().length, Math.max(start, index));
  });
  readonly viewportPixels = computed(() => {
    const value = Number.parseFloat(this.viewportHeight());
    return Number.isFinite(value) && value > 0 ? value : 240;
  });
  readonly visibleItems = computed(() =>
    this.items().slice(this.startIndex(), this.endIndex()),
  );
  readonly topSpacer = computed(
    () => this.startIndex() * this.effectiveItemHeight(),
  );
  readonly bottomSpacer = computed(() =>
    Math.max(
      0,
      (this.items().length - this.endIndex()) * this.effectiveItemHeight(),
    ),
  );

  onScroll(event: Event): void {
    const top = Number((event.target as HTMLElement | null)?.scrollTop);
    this.scrollTop.set(Number.isFinite(top) ? Math.max(0, top) : 0);
    const range = { start: this.startIndex(), end: this.endIndex() };
    this.rangeChange.emit(range);
    if (this.lazy())
      this.onLazyLoad.emit({
        first: range.start,
        last: Math.max(range.start, range.end - 1),
      });
  }

  itemLabel(item: unknown): string {
    if (item && typeof item === 'object')
      return String(
        (item as Record<string, unknown>)[this.itemLabelKey()] ?? '',
      );
    return String(item ?? '');
  }
}
