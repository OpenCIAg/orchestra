import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, Input, model, OnInit, output, signal } from '@angular/core';
import { P2Option, P2_SHARED_STYLES, P2Orientation } from './p2-shared';

@Component({
  selector: 'orc-code',
  standalone: true,
  template: `<div class="orc-p2-code"><div class="toolbar">@if (language()) { <span>{{ language() }}</span> }@if (copied() ? copiedLabel() : copyLabel()) { <button type="button" (click)="copy()">{{ copied() ? copiedLabel() : copyLabel() }}</button> }</div><pre><code>{{ code() }}</code></pre></div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-code { overflow: hidden; border: 1px solid var(--orc-component-code-border); border-radius: .75rem; background: var(--orc-component-code-surface); color: var(--orc-component-code-text); } .toolbar { display: flex; justify-content: space-between; padding: .45rem .7rem; border-bottom: 1px solid var(--orc-component-code-border); color: var(--orc-component-code-muted); font-size: .75rem; } .toolbar button { border: 0; border-radius: .35rem; background: var(--orc-component-code-surface-raised); color: var(--orc-component-code-text); padding: .25rem .5rem; } pre { margin: 0; overflow: auto; padding: 1rem; } code { font: .82rem/1.6 ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeComponent {
  readonly code = input('');
  readonly language = input<string | undefined>(undefined);
  readonly copyLabel = input<string | undefined>(undefined);
  readonly copiedLabel = input<string | undefined>(undefined);
  readonly copied = signal(false);
  readonly copiedEvent = output<string>();
  async copy(): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.clipboard) await navigator.clipboard.writeText(this.code());
    this.copied.set(true);
    this.copiedEvent.emit(this.code());
    setTimeout(() => this.copied.set(false), 1200);
  }
}

export interface MenubarItem extends P2Option<string> {
  shortcut?: string;
  children?: MenubarItem[];
  visible?: boolean;
  badge?: string;
}

@Component({
  selector: 'orc-menubar',
  standalone: true,
  template: `<nav class="p-menubar p-component orc-p2-menubar" [id]="id()" [class]="'p-menubar p-component orc-p2-menubar ' + styleClass()" [style]="style()" [style.z-index]="autoZIndex() ? baseZIndex() + 1 : null" role="menubar" [attr.aria-label]="label() || null" [attr.aria-labelledby]="ariaLabelledBy()" [attr.tabindex]="tabindex()" [attr.data-pc-name]="'menubar'" (keydown)="onKeydown($event)" (focus)="onFocus.emit($event)" (blur)="onBlur.emit($event)">@for (item of effectiveItems(); track item.value || $index) { @if (item.visible !== false) { <div class="menu-item"> <button type="button" role="menuitem" [attr.aria-expanded]="item.children?.length ? openItem() === item : null" [disabled]="item.disabled || disabled()" [class.is-active]="$index === activeIndex()" (click)="activate(item)">{{ item.icon }} {{ item.label }} @if (item.badge) { <span>{{ item.badge }}</span> } @if (item.shortcut) { <small>{{ item.shortcut }}</small> }</button> @if (openItem() === item && item.children?.length) { <div class="submenu" role="menu">@for (child of item.children; track child.value || $index) { @if (child.visible !== false) { <button type="button" role="menuitem" [disabled]="child.disabled || disabled()" (click)="activate(child)">{{ child.icon }} {{ child.label }}</button> } }</div> } </div> } }</nav>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-menubar { display: flex; gap: .2rem; align-items: center; padding: .25rem; border: 1px solid var(--orc-component-border); border-radius: .6rem; background: var(--orc-component-surface); } .menu-item{position:relative}.orc-p2-menubar button { display: inline-flex; gap: .5rem; align-items: center; border: 0; border-radius: .4rem; background: transparent; color: var(--orc-component-text); padding: .5rem .7rem; } .orc-p2-menubar button:hover, .orc-p2-menubar button.is-active { background: var(--orc-component-interactive-soft); color: var(--orc-component-interactive-hover); } .orc-p2-menubar small { margin-left: .5rem; color: var(--orc-component-text-muted); }.submenu{position:absolute;z-index:2;top:100%;left:0;display:grid;min-width:10rem;padding:.3rem;border:1px solid var(--orc-component-border);border-radius:.4rem;background:var(--orc-component-surface);box-shadow:0 10px 24px var(--orc-component-shadow-color)}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenubarComponent {
  readonly items = input<MenubarItem[]>([]);
  readonly model = input<MenubarItem[] | undefined>(undefined); readonly label = input<string | undefined>(undefined);
  readonly style = input<Record<string, any> | null | undefined>(undefined); readonly id = input<string | undefined>(undefined); readonly ariaLabelledBy = input<string | undefined>(undefined); readonly styleClass = input(''); readonly tabindex = input(0); readonly disabled = input(false, { transform: booleanAttribute }); readonly autoZIndex = input(true, { transform: booleanAttribute }); readonly baseZIndex = input(0);
  readonly loop = input(true, { transform: booleanAttribute });
  readonly activeIndex = signal(0); readonly openItem = signal<MenubarItem | null>(null);
  readonly itemSelect = output<MenubarItem>(); readonly onFocus = output<Event>(); readonly onBlur = output<Event>(); readonly menuKeydown = output<KeyboardEvent>();
  effectiveItems(): MenubarItem[] { return this.model() ?? this.items(); }
  activate(item: MenubarItem): void { if (item.disabled || this.disabled()) return; if (item.children?.length) { this.openItem.set(this.openItem() === item ? null : item); return; } this.itemSelect.emit(item); }
  onKeydown(event: KeyboardEvent): void {
    this.menuKeydown.emit(event);
    const count = this.effectiveItems().length;
    if (!count) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      this.activeIndex.update(index => this.loop() ? (index + delta + count) % count : Math.max(0, Math.min(count - 1, index + delta)));
    } else if (event.key === 'Home') { event.preventDefault(); this.activeIndex.set(0); }
    else if (event.key === 'End') { event.preventDefault(); this.activeIndex.set(count - 1); }
    else if (event.key === 'Enter' || event.key === ' ') { const item = this.effectiveItems()[this.activeIndex()]; if (item) this.activate(item); }
  }
}

export type TagVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'contrast';

@Component({
  selector: 'orc-tag',
  standalone: true,
  template: `<span class="orc-p2-tag" [class]="'orc-p2-tag orc-p2-tag--' + effectiveVariant() + ' ' + styleClass()" [class.rounded]="rounded()" [class.disabled]="disabled()" [attr.aria-disabled]="disabled()"><span aria-hidden="true">{{ icon() }}</span><span>{{ effectiveLabel() }}</span>@if (removable()) { <button type="button" [disabled]="disabled()" [attr.aria-label]="removeAriaLabel() || null" (click)="remove($event)">×</button> }</span>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-tag { display: inline-flex; gap: .3rem; align-items: center; min-height: 1.6rem; padding: .2rem .55rem; border-radius: .35rem; font-size: .8rem; font-weight: 600; } .orc-p2-tag--neutral { background: var(--orc-component-surface-muted); color: var(--orc-component-text-secondary); } .orc-p2-tag--primary { background: var(--orc-component-interactive-soft); color: var(--orc-component-interactive-hover); } .orc-p2-tag--success { background: var(--orc-component-status-success-bg); color: var(--orc-component-status-success-fg); } .orc-p2-tag--warning { background: var(--orc-component-status-warning-bg); color: var(--orc-component-status-warning-fg); } .orc-p2-tag--danger { background: var(--orc-component-status-danger-bg); color: var(--orc-component-status-danger-fg); } .orc-p2-tag button { border: 0; padding: 0; background: transparent; color: inherit; font-size: 1rem; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagComponent {
  readonly label = input<string | undefined>(undefined);
  readonly value = input<string | undefined>(undefined);
  readonly variant = input<TagVariant>('neutral');
  readonly severity = input<TagVariant | undefined>(undefined);
  readonly icon = input(''); readonly rounded = input(false, { transform: booleanAttribute }); readonly styleClass = input(''); readonly removeAriaLabel = input<string | undefined>(undefined);
  readonly removable = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly removed = output<string>();
  readonly onRemove = output<{ value: string }>();
  effectiveLabel(): string { return this.value() ?? this.label() ?? ''; }
  effectiveVariant(): TagVariant { return this.severity() ?? this.variant(); }
  remove(event: Event): void { event.stopPropagation(); if (!this.disabled()) { const value = this.effectiveLabel(); this.removed.emit(value); this.onRemove.emit({ value }); } }
}

@Component({
  selector: 'orc-hover-card',
  standalone: true,
  template: `<div class="orc-p2-hover-card" (mouseenter)="openCard()" (mouseleave)="closeCard()" (focusin)="openCard()" (focusout)="closeCard()"><span class="trigger"><ng-content select="[hover-card-trigger]" /></span>@if (open()) { <div class="content" role="dialog" [attr.aria-label]="label() || null"><ng-content /></div> }</div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-hover-card { position: relative; display: inline-block; } .trigger { display: inline-block; } .content { position: absolute; z-index: 3; top: calc(100% + .5rem); left: 0; width: min(20rem, 80vw); padding: .75rem; border: 1px solid var(--orc-component-border-strong); border-radius: .65rem; background: var(--orc-component-surface); box-shadow: 0 12px 28px var(--orc-component-shadow-color); color: var(--orc-component-text); }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoverCardComponent {
  readonly open = model(false);
  readonly label = input<string | undefined>(undefined);
  openCard(): void { this.open.set(true); }
  closeCard(): void { this.open.set(false); }
}

export interface DataTableColumn {
  key: string;
  header: string;
  sortable?: boolean;
}

@Component({
  selector: 'orc-data-table',
  standalone: true,
  template: `
    <div class="orc-p2-data-table {{ styleClass() }}" [attr.aria-busy]="loading()">
      @if (filterable()) { <input class="global-filter" [value]="filter()" [attr.placeholder]="filterPlaceholder() || null" (input)="setFilter(($any($event.target)).value)" [attr.aria-label]="filterAriaLabel() || null" /> }
      <table class="{{ tableStyleClass() }}">
        <caption class="sr-only">{{ label() }}</caption>
        <thead><tr>@if (selectionEnabled()) { <th scope="col"><input type="checkbox" [checked]="allSelected()" [indeterminate]="someSelected()" [attr.aria-label]="selectAllAriaLabel() || null" (change)="toggleAll(($any($event.target)).checked)" /></th> } @for (column of columns(); track column.key) { <th scope="col" [attr.aria-sort]="(sortField() || sortKey()) === column.key ? sortDirection() : null" [class.sortable]="column.sortable" (click)="sortBy(column)">{{ column.header }}</th> }</tr></thead>
        <tbody>
          @if (loading() && loadingMessage()) { <tr><td class="empty" [attr.colspan]="columns().length + (selectionEnabled() ? 1 : 0)">{{ loadingMessage() }}</td></tr> }
          @else if (!loading() && !rows().length && emptyText()) { <tr><td class="empty" [attr.colspan]="columns().length + (selectionEnabled() ? 1 : 0)">{{ emptyText() }}</td></tr> }
          @else if (!loading()) { @for (row of pageRows(); track getRowId(row)) { <tr [class.selected]="isSelected(row)" (click)="rowClick.emit(row)">@if (selectionEnabled()) { <td (click)="$event.stopPropagation()"><input type="checkbox" [checked]="isSelected(row)" [attr.aria-label]="rowAriaLabel() ? rowAriaLabel() + ' ' + getRowId(row) : null" (change)="toggleRow(row, ($any($event.target)).checked)" /></td> } @for (column of columns(); track column.key) { <td>{{ getCell(row, column.key) }}</td> }</tr> } }
        </tbody>
      </table>
      @if (paginator() && pageCount() > 1) { <nav class="paginator" [attr.aria-label]="paginatorAriaLabel() || null"><button type="button" [disabled]="page() === 0" (click)="goToPage(page() - 1)">‹</button><span>{{ page() + 1 }} / {{ pageCount() }}</span><button type="button" [disabled]="page() + 1 >= pageCount()" (click)="goToPage(page() + 1)">›</button></nav> }
    </div>
  `,
  styles: [P2_SHARED_STYLES + `.orc-p2-data-table { width: 100%; overflow: auto; border: 1px solid var(--orc-component-border); border-radius: .75rem; background: var(--orc-component-surface); } .global-filter { width: min(20rem, 100%); margin: .6rem; padding: .5rem .7rem; border: 1px solid var(--orc-component-border-strong); border-radius: .4rem; } table { width: 100%; border-collapse: collapse; color: var(--orc-component-text); } th, td { padding: .7rem .8rem; border-bottom: 1px solid var(--orc-component-border); text-align: left; } th { background: var(--orc-component-surface-subtle); font-size: .8rem; } th.sortable { cursor: pointer; } tr.selected { background: var(--orc-component-interactive-soft); } .empty { padding: 2rem; text-align: center; color: var(--orc-component-text-muted); } .paginator { display:flex; align-items:center; justify-content:flex-end; gap:.6rem; padding:.5rem .7rem; } .paginator button { min-width:2rem; border:1px solid var(--orc-component-border-strong); border-radius:.35rem; background:var(--orc-component-surface); } .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent implements OnInit {
  readonly data = input<Record<string, unknown>[]>([]);
  readonly value = input<Record<string, unknown>[] | undefined>(undefined);
  readonly columns = input<DataTableColumn[]>([]);
  readonly rowKey = input('id');
  readonly dataKey = input<string | undefined>(undefined); readonly first = model(0); readonly rowsInput = input<number | undefined>(undefined, { alias: 'rows' }); readonly totalRecords = input<number | undefined>(undefined); readonly lazy = input(false, { transform: booleanAttribute }); readonly lazyLoadOnInit = input(false, { transform: booleanAttribute }); readonly rowHover = input(false, { transform: booleanAttribute }); readonly stripedRows = input(false, { transform: booleanAttribute }); readonly showGridlines = input(false, { transform: booleanAttribute }); readonly size = input<'small' | 'large' | undefined>(undefined); readonly sortMode = input<'single' | 'multiple'>('single'); readonly selectionMode = input<'single' | 'multiple' | undefined>(undefined); readonly metaKeySelection = input(false, { transform: booleanAttribute }); readonly sortField = model<string>(''); readonly sortOrder = model<number>(0); readonly styleClass = input(''); readonly tableStyleClass = input('');
  readonly label = input<string | undefined>(undefined);
  readonly emptyText = input<string | undefined>(undefined);
  readonly loading = input(false, { transform: booleanAttribute });
  readonly selectable = input(false, { transform: booleanAttribute });
  readonly filterable = input(false, { transform: booleanAttribute });
  readonly filterPlaceholder = input<string | undefined>(undefined);
  readonly filterAriaLabel = input<string | undefined>(undefined);
  readonly selectAllAriaLabel = input<string | undefined>(undefined);
  readonly rowAriaLabel = input<string | undefined>(undefined);
  readonly loadingMessage = input<string | undefined>(undefined);
  readonly paginatorAriaLabel = input<string | undefined>(undefined);
  readonly filter = model('');
  readonly paginator = input(false, { transform: booleanAttribute });
  readonly pageSize = input(10);
  readonly page = model(0);
  readonly selected = model<Record<string, unknown>[]>([]);
  @Input('selection') set selectionAlias(value: Record<string, unknown>[]) { this.selected.set(value ?? []); }
  readonly sortKey = signal('');
  readonly sortDirection = signal<'ascending' | 'descending'>('ascending');
  readonly selectionEnabled = computed(() => this.selectable() || !!this.selectionMode());
  readonly rowClick = output<Record<string, unknown>>();
  readonly sortChange = output<{ key: string; direction: 'ascending' | 'descending' }>(); readonly onSort = output<{ key: string; direction: 'ascending' | 'descending' }>();
  readonly onPage = output<{ first: number; rows: number }>(); readonly onLazyLoad = output<{ first: number; rows: number }>(); readonly rowSelect = output<Record<string, unknown>>(); readonly rowUnselect = output<Record<string, unknown>>(); readonly onRowHover = output<Record<string, unknown>>(); readonly onFilter = output<{ value: string }>();
  readonly onHeaderCheckboxToggle = output<{ checked: boolean }>();

  ngOnInit(): void { if (this.lazy() && this.lazyLoadOnInit()) this.onLazyLoad.emit({ first: this.first(), rows: this.effectivePageSize() }); }

  readonly rows = computed(() => {
    const key = this.sortField() || this.sortKey();
    const direction = this.sortOrder() < 0 ? 'descending' : this.sortDirection();
    const result = [...(this.value() ?? this.data())];
    if (!key) return result;
    return result.sort((a, b) => {
      const left = a[key]; const right = b[key];
      const compare = String(left ?? '').localeCompare(String(right ?? ''), undefined, { numeric: true, sensitivity: 'base' });
      return direction === 'ascending' ? compare : -compare;
    });
  });
  readonly filteredRows = computed(() => {
    const query = this.filter().trim().toLocaleLowerCase();
    if (!query) return this.rows();
    return this.rows().filter(row => Object.values(row).some(value => String(value ?? '').toLocaleLowerCase().includes(query)));
  });
  readonly effectivePageSize = computed(() => this.rowsInput() ?? this.pageSize());
  readonly pageCount = computed(() => Math.max(1, Math.ceil((this.totalRecords() ?? this.filteredRows().length) / Math.max(1, this.effectivePageSize()))));
  readonly pageRows = computed(() => this.paginator() ? this.filteredRows().slice(this.page() * this.effectivePageSize(), (this.page() + 1) * this.effectivePageSize()) : this.filteredRows());
  readonly allSelected = computed(() => !!this.pageRows().length && this.pageRows().every(row => this.isSelected(row)));
  readonly someSelected = computed(() => this.pageRows().some(row => this.isSelected(row)) && !this.allSelected());

  getRowId(row: Record<string, unknown>): string { const key = this.dataKey() || this.rowKey(); return String(row[key] ?? JSON.stringify(row)); }
  getCell(row: Record<string, unknown>, key: string): unknown { return row[key] ?? ''; }
  isSelected(row: Record<string, unknown>): boolean { return this.selected().some(item => this.getRowId(item) === this.getRowId(row)); }
  setFilter(value: string): void { this.filter.set(value); this.page.set(0); this.first.set(0); this.onFilter.emit({ value }); }
  toggleRow(row: Record<string, unknown>, checked: boolean): void {
    const next = this.selectionMode() === 'single' ? [] : this.selected().filter(item => this.getRowId(item) !== this.getRowId(row));
    if (checked) next.push(row);
    this.selected.set(next); (checked ? this.rowSelect : this.rowUnselect).emit(row);
  }
  toggleAll(checked: boolean): void { const current = this.selected().filter(row => !this.pageRows().some(pageRow => this.getRowId(pageRow) === this.getRowId(row))); const next = checked ? [...current, ...this.pageRows()] : current; this.selected.set(next); this.onHeaderCheckboxToggle.emit({ checked }); }
  sortBy(column: DataTableColumn): void {
    if (!column.sortable) return;
    const direction = this.sortKey() === column.key && this.sortDirection() === 'ascending' ? 'descending' : 'ascending';
    this.sortKey.set(column.key); this.sortField.set(column.key); this.sortOrder.set(direction === 'ascending' ? 1 : -1); this.sortDirection.set(direction); if (this.paginator()) { this.page.set(0); this.first.set(0); } const event: { key: string; direction: 'ascending' | 'descending' } = { key: column.key, direction }; this.sortChange.emit(event); this.onSort.emit(event);
  }
  goToPage(page: number): void { const size = this.effectivePageSize(); const next = Math.max(0, Math.min(Math.max(0, this.pageCount() - 1), page)); this.page.set(next); this.first.set(next * size); this.onPage.emit({ first: this.first(), rows: size }); if (this.lazy()) this.onLazyLoad.emit({ first: this.first(), rows: size }); }
}

@Component({
  selector: 'orc-empty-state',
  standalone: true,
  template: `<section class="orc-p2-empty-state" [attr.aria-label]="title() || null"><div class="icon" aria-hidden="true">{{ icon() }}</div>@if (title()) { <h2>{{ title() }}</h2> }@if (description()) { <p>{{ description() }}</p> } @if (actionLabel()) { <button type="button" (click)="action.emit()">{{ actionLabel() }}</button> }<ng-content /></section>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-empty-state { display: grid; justify-items: center; gap: .6rem; padding: 3rem 1.5rem; border: 1px dashed var(--orc-component-border-strong); border-radius: .75rem; text-align: center; color: var(--orc-component-text); } .icon { font-size: 2rem; } h2, p { margin: 0; } p { max-width: 36rem; color: var(--orc-component-text-muted); } button { border: 0; border-radius: .5rem; background: var(--orc-component-interactive); color: var(--orc-component-on-interactive); padding: .55rem .85rem; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly title = input<string | undefined>(undefined);
  readonly description = input<string | undefined>(undefined);
  readonly icon = input('∅');
  readonly actionLabel = input('');
  readonly action = output<void>();
}

@Component({
  selector: 'orc-virtual-scroller, orc-scroller',
  standalone: true,
  template: `<div class="orc-p2-virtual-scroller" role="list" [attr.aria-label]="label() || null" [attr.aria-busy]="loading()" [style.height]="viewportHeight()" (scroll)="onScroll($event)"><div [style.height.px]="topSpacer()"></div>@if (loading() && loadingMessage()) { <div class="item">{{ loadingMessage() }}</div> } @for (item of visibleItems(); track $index) { <div role="listitem" class="item" [style.height.px]="itemHeight()">{{ itemLabel(item) }}</div> }<div [style.height.px]="bottomSpacer()"></div></div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-virtual-scroller { overflow: auto; border: 1px solid var(--orc-component-border-strong); border-radius: .6rem; background: var(--orc-component-surface); color: var(--orc-component-text); } .item { display: flex; align-items: center; padding: 0 .75rem; border-bottom: 1px solid var(--orc-component-border); }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VirtualScrollerComponent {
  readonly items = input<unknown[]>([]);
  readonly itemHeight = input(40);
  readonly itemSize = this.itemHeight;
  readonly viewportHeight = input('240px');
  readonly overscan = input(4);
  readonly label = input<string | undefined>(undefined);
  readonly loadingMessage = input<string | undefined>(undefined);
  readonly itemLabelKey = input('label');
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly scrollTop = signal(0);
  readonly rangeChange = output<{ start: number; end: number }>();
  readonly onLazyLoad = output<{ first: number; last: number }>();
  readonly startIndex = computed(() => Math.max(0, Math.floor(this.scrollTop() / Math.max(1, this.itemHeight())) - this.overscan()));
  readonly endIndex = computed(() => Math.min(this.items().length, Math.ceil((this.scrollTop() + this.viewportPixels()) / Math.max(1, this.itemHeight())) + this.overscan()));
  readonly viewportPixels = computed(() => Number.parseInt(this.viewportHeight(), 10) || 240);
  readonly visibleItems = computed(() => this.items().slice(this.startIndex(), this.endIndex()));
  readonly topSpacer = computed(() => this.startIndex() * this.itemHeight());
  readonly bottomSpacer = computed(() => Math.max(0, (this.items().length - this.endIndex()) * this.itemHeight()));
  onScroll(event: Event): void { const top = (event.target as HTMLElement).scrollTop; this.scrollTop.set(top); const range = { start: this.startIndex(), end: this.endIndex() }; this.rangeChange.emit(range); if (this.lazy()) this.onLazyLoad.emit({ first: range.start, last: Math.max(range.start, range.end - 1) }); }
  itemLabel(item: unknown): string { if (item && typeof item === 'object') return String((item as Record<string, unknown>)[this.itemLabelKey()] ?? ''); return String(item ?? ''); }
}
