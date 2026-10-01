import { CommonModule } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  computed,
  effect,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { P2_SHARED_STYLES } from './p2-shared';
import { PaginatorComponent } from '@ciag/orchestra/paginator';

@Component({
  selector: 'orc-data-view',
  standalone: true,
  template: `<section
      class="orc-data-view"
      [class]="'orc-data-view ' + styleClass()"
      [style]="style()"
      [attr.aria-label]="resolvedAriaLabel()"
      [attr.aria-busy]="loading() ? 'true' : null"
    >
      @if (header().trim()) {
        <header>{{ header() }}</header>
      }
      @if (filterBy()) {
        <input
          type="search"
          [value]="filterValue()"
          (input)="onFilterInput($event)"
          [attr.aria-label]="resolvedFilterAriaLabel()"
        />
      }
      @if (
        shouldRenderPaginator() &&
        (paginatorPosition() === 'top' || paginatorPosition() === 'both')
      ) {
        <ng-container *ngTemplateOutlet="pagination" />
      }
      <div
        class="content"
        [class.list]="layout() === 'list'"
        [class]="layout() === 'list' ? listStyleClass() : gridStyleClass()"
      >
        @if (loading()) {
          <p class="loading-state" role="status" aria-live="polite">
            @if (loadingIcon()) {
              <i
                class="loading-icon"
                [class]="'loading-icon ' + loadingIcon()"
                aria-hidden="true"
              ></i>
            }
            <span>{{ resolvedLoadingMessage() }}</span>
          </p>
        } @else {
          @for (item of pageItems(); track getItemKey(item, $index)) {
            <article>
              @if (itemTemplate()) {
                <ng-container
                  [ngTemplateOutlet]="itemTemplate()"
                  [ngTemplateOutletContext]="{ $implicit: item }"
                />
              } @else {
                {{ itemLabel(item) }}
              }
            </article>
          } @empty {
            @if (resolvedEmptyMessage()) {
              <p role="status" aria-live="polite">
                {{ resolvedEmptyMessage() }}
              </p>
            }
          }
        }
      </div>
      @if (
        shouldRenderPaginator() &&
        (paginatorPosition() === 'bottom' || paginatorPosition() === 'both')
      ) {
        <ng-container *ngTemplateOutlet="pagination" />
      }
    </section>
    <ng-template #pagination
      ><orc-paginator
        [totalRecords]="effectiveTotalRecords()"
        [rows]="effectivePageSize()"
        [first]="first()"
        [rowsPerPageOptions]="effectiveRowsPerPageOptions()"
        [showPageSizeSelector]="effectiveRowsPerPageOptions().length > 0"
        [alwaysShow]="alwaysShowPaginator()"
        [pageLinkSize]="normalizedPageLinks()"
        [styleClass]="paginatorStyleClass()"
        [showCurrentPageReport]="showCurrentPageReport()"
        [currentPageReportTemplate]="currentPageReportTemplate()"
        [showJumpToPageDropdown]="showJumpToPageDropdown()"
        [showFirstLastIcon]="showFirstLastIcon()"
        [showPageLinks]="showPageLinks()"
        [ariaLabel]="resolvedPaginatorAriaLabel()"
        (pageChange)="onPaginatorPageChange($event)"
    /></ng-template>`,
  imports: [CommonModule, PaginatorComponent],
  styles: [
    P2_SHARED_STYLES +
      `.orc-data-view{display:block}.orc-data-view header{padding:.7rem;border-bottom:1px solid var(--orc-component-border);font-weight:700}.content{display:grid;grid-template-columns:repeat(auto-fill,minmax(12rem,1fr));gap:1rem}.content.list{display:grid;grid-template-columns:1fr}.content article{padding:.8rem;border:1px solid var(--orc-component-border);border-radius:.5rem}.content>p{color:var(--orc-component-text-muted)}.loading-state{display:flex;align-items:center;justify-content:center;gap:.5rem;min-height:4rem;margin:0;color:var(--orc-component-text-secondary)}.loading-icon{display:inline-block;min-width:1em;min-height:1em}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataViewComponent<T = Record<string, unknown>> implements OnInit {
  readonly value = input<T[]>([]);
  readonly layout = model<'list' | 'grid'>('grid');
  readonly header = input('');
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly itemTemplate = input<TemplateRef<{ $implicit: T }> | null>(null);
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly styleClass = input('');
  readonly gridStyleClass = input('');
  readonly listStyleClass = input('');
  readonly trackBy = input<((index: number, item: T) => unknown) | undefined>(
    undefined,
  );
  readonly paginator = input(false, { transform: booleanAttribute });
  readonly rows = input(10);
  readonly first = model(0);
  readonly totalRecords = input<number | undefined>(undefined);
  readonly pageLinks = input(5);
  readonly rowsPerPageOptions = input<number[] | undefined>(undefined);
  readonly paginatorPosition = input<'top' | 'bottom' | 'both'>('bottom');
  readonly paginatorStyleClass = input('');
  readonly alwaysShowPaginator = input(true, { transform: booleanAttribute });
  readonly currentPageReportTemplate = input<string | undefined>(undefined);
  readonly showCurrentPageReport = input(false, {
    transform: booleanAttribute,
  });
  readonly showJumpToPageDropdown = input(false, {
    transform: booleanAttribute,
  });
  readonly showFirstLastIcon = input(false, { transform: booleanAttribute });
  readonly showPageLinks = input(true, { transform: booleanAttribute });
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly lazyLoadOnInit = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly loadingIcon = input<string | undefined>(undefined);
  readonly loadingMessage = input<string | undefined>(undefined);
  readonly filterBy = input<string | undefined>(undefined);
  readonly filterAriaLabel = input<string | undefined>(undefined);
  readonly paginatorAriaLabel = input<string | undefined>(undefined);
  readonly filterLocale = input<string | undefined>(undefined);
  readonly filterValue = model('');
  readonly dataKey = input<string | undefined>(undefined);
  readonly sortField = model<string | undefined>(undefined);
  readonly sortOrder = model<1 | -1>(1);
  readonly resolvedAriaLabel = computed(
    () => this.ariaLabel()?.trim() || this.header().trim() || 'Data view',
  );
  readonly resolvedFilterAriaLabel = computed(
    () => this.filterAriaLabel()?.trim() || 'Filter items',
  );
  readonly resolvedPaginatorAriaLabel = computed(
    () => this.paginatorAriaLabel()?.trim() || 'Pagination',
  );
  readonly resolvedLoadingMessage = computed(
    () => this.loadingMessage()?.trim() || 'Loading',
  );
  readonly resolvedEmptyMessage = computed(
    () => this.emptyMessage()?.trim() || '',
  );
  readonly onPage = output<{ first: number; rows: number }>();
  readonly onLazyLoad = output<{ first: number; rows: number }>();
  readonly onSort = output<{ sortField: string; sortOrder: 1 | -1 }>();
  readonly onLayoutChange = output<'list' | 'grid'>();
  readonly onChangeLayout = output<'list' | 'grid'>();
  private readonly pageSizeOverride = signal<number | undefined>(undefined);
  private previousRowsInput: number | undefined;

  constructor() {
    effect(() => {
      const rows = this.rows();
      if (
        this.previousRowsInput !== undefined &&
        rows !== this.previousRowsInput
      ) {
        this.pageSizeOverride.set(undefined);
      }
      this.previousRowsInput = rows;

      const pageSize = this.effectivePageSize();
      const requestedFirst = normalizeDataViewFirst(this.first());
      const maxFirst = Math.max(0, (this.pageCount() - 1) * pageSize);
      const boundedFirst = Math.min(
        maxFirst,
        Math.floor(requestedFirst / pageSize) * pageSize,
      );
      if (this.first() !== boundedFirst) this.first.set(boundedFirst);
    });
  }

  readonly sortedItems = computed(() => {
    const field = this.sortField();
    const items = [...this.value()];
    if (!field) return items;
    const direction = this.sortOrder();
    return items.sort((a, b) => {
      const left = (a as any)?.[field];
      const right = (b as any)?.[field];
      return (
        String(left ?? '').localeCompare(String(right ?? ''), undefined, {
          numeric: true,
          sensitivity: 'base',
        }) * direction
      );
    });
  });
  readonly filteredItems = computed(() => {
    const query = normalizeDataViewText(
      this.filterValue(),
      this.filterLocale(),
    );
    if (!query) return this.sortedItems();
    const field = this.filterBy();
    return this.sortedItems().filter((item) =>
      normalizeDataViewText(
        field ? ((item as any)?.[field] ?? '') : item,
        this.filterLocale(),
      ).includes(query),
    );
  });
  readonly effectivePageSize = computed(() => {
    return normalizeDataViewPageSize(this.pageSizeOverride() ?? this.rows());
  });
  readonly effectiveRowsPerPageOptions = computed(() => {
    const options = this.rowsPerPageOptions();
    if (!Array.isArray(options)) return [];
    const normalized = options
      .map((value) => normalizeDataViewPageSize(value))
      .filter((value, index, all) => all.indexOf(value) === index);
    const current = this.effectivePageSize();
    return normalized.includes(current) ? normalized : [current, ...normalized];
  });
  readonly shouldRenderPaginator = computed(
    () =>
      this.paginator() && (this.alwaysShowPaginator() || this.pageCount() > 1),
  );
  readonly pageCount = computed(() =>
    Math.max(
      1,
      Math.ceil(this.effectiveTotalRecords() / this.effectivePageSize()),
    ),
  );
  readonly pageItems = computed(() => {
    const items = this.filteredItems();
    if (!this.paginator() || this.lazy()) return items;
    return items.slice(this.first(), this.first() + this.effectivePageSize());
  });
  pageSize(): number {
    return this.effectivePageSize();
  }
  normalizedPageLinks(): number {
    const normalized = Number(this.pageLinks());
    return Number.isFinite(normalized)
      ? Math.max(1, Math.floor(normalized))
      : 1;
  }
  effectiveTotalRecords(): number {
    const total = this.lazy()
      ? (this.totalRecords() ?? this.filteredItems().length)
      : this.filteredItems().length;
    return normalizeDataViewTotal(total, this.filteredItems().length);
  }
  getItemKey(item: T, index: number): unknown {
    const trackBy = this.trackBy();
    if (trackBy) return trackBy(index, item);
    const key = this.dataKey();
    return key ? ((item as any)?.[key] ?? index) : index;
  }
  itemLabel(item: T): string {
    if (typeof item !== 'object' || item === null) return String(item ?? '');
    try {
      return JSON.stringify(item) ?? String(item);
    } catch {
      return '[object Object]';
    }
  }
  ngOnInit(): void {
    if (this.lazy() && this.lazyLoadOnInit()) {
      const rows = this.effectivePageSize();
      const first = this.clampFirst(this.first(), rows);
      this.first.set(first);
      this.onLazyLoad.emit({ first, rows });
    }
  }
  onFilterInput(event: Event): void {
    this.filterValue.set((event.target as HTMLInputElement).value);
    this.first.set(0);
    if (this.lazy())
      this.onLazyLoad.emit({ first: 0, rows: this.effectivePageSize() });
  }
  sortBy(field: string | undefined, order: 1 | -1 = 1): void {
    const normalizedField =
      typeof field === 'string' && field.trim() ? field.trim() : undefined;
    const normalizedOrder: 1 | -1 = order === -1 ? -1 : 1;
    this.sortField.set(normalizedField);
    this.sortOrder.set(normalizedOrder);
    this.onSort.emit({
      sortField: normalizedField ?? '',
      sortOrder: normalizedOrder,
    });
  }
  setLayout(layout: 'list' | 'grid'): void {
    if (layout === this.layout()) return;
    this.layout.set(layout);
    this.onLayoutChange.emit(layout);
    this.onChangeLayout.emit(layout);
  }
  onPaginatorFirstChange(first: number): void {
    this.first.set(this.clampFirst(first, this.effectivePageSize()));
  }
  onPaginatorPageChange(event: { first: number; rows: number }): void {
    this.goToPage(event.first, event.rows);
  }
  goToPage(first: number, rows = this.effectivePageSize()): void {
    const normalizedRows = normalizeDataViewPageSize(rows);
    if (normalizedRows !== this.effectivePageSize())
      this.pageSizeOverride.set(normalizedRows);
    const next = this.clampFirst(first, normalizedRows);
    this.first.set(next);
    const payload = { first: next, rows: normalizedRows };
    this.onPage.emit(payload);
    if (this.lazy()) this.onLazyLoad.emit(payload);
  }

  private clampFirst(first: number, rows: number): number {
    const normalizedFirst = normalizeDataViewFirst(first);
    const maxFirst = Math.max(0, (this.pageCountForSize(rows) - 1) * rows);
    return Math.min(maxFirst, Math.floor(normalizedFirst / rows) * rows);
  }

  private pageCountForSize(rows: number): number {
    return Math.max(1, Math.ceil(this.effectiveTotalRecords() / rows));
  }
}

function normalizeDataViewPageSize(value: unknown): number {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) return 10;
  return Math.max(1, Math.floor(normalized));
}

function normalizeDataViewFirst(value: unknown): number {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? Math.max(0, Math.floor(normalized)) : 0;
}

function normalizeDataViewTotal(value: unknown, fallback: number): number {
  const normalized = Number(value);
  if (Number.isFinite(normalized)) return Math.max(0, Math.floor(normalized));
  return Math.max(0, Math.floor(fallback));
}

function normalizeDataViewText(value: unknown, locale?: string): string {
  try {
    return String(value ?? '')
      .toLocaleLowerCase(locale || undefined)
      .trim();
  } catch {
    return String(value ?? '')
      .toLowerCase()
      .trim();
  }
}
