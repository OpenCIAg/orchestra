import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DataViewComponent } from './p2/p2-advanced-components';

interface DataViewRow {
  id: string;
  name: string;
}

@Component({
  standalone: true,
  imports: [DataViewComponent],
  template: `
    <ng-template #item let-row>
      <strong class="record-template">{{ row.name }}</strong>
    </ng-template>
    <orc-data-view
      [value]="value"
      [itemTemplate]="item"
      [trackBy]="trackBy"
      [dataKey]="'id'"
      [filterBy]="'name'"
      [paginator]="true"
      [rows]="2"
      [(layout)]="layout"
      [(first)]="first"
      [(filterValue)]="filterValue"
      [(sortField)]="sortField"
      [(sortOrder)]="sortOrder"
      (onPage)="pageEvents.push($event)"
      (onSort)="sortEvents.push($event)"
      (onLayoutChange)="layoutEvents.push($event)"
      (onChangeLayout)="changeLayoutEvents.push($event)"
    />
  `,
})
class DataViewContractHost {
  value: DataViewRow[] = [
    { id: 'a', name: 'Alpha' },
    { id: 'b', name: 'Beta' },
  ];
  layout: 'list' | 'grid' = 'grid';
  first = 0;
  filterValue = '';
  sortField: string | undefined;
  sortOrder: 1 | -1 = 1;
  readonly trackByCalls: Array<{ index: number; row: DataViewRow }> = [];
  trackBy: ((index: number, row: DataViewRow) => unknown) | undefined = (
    index,
    row,
  ) => {
    this.trackByCalls.push({ index, row });
    return row.id;
  };
  pageEvents: Array<{ first: number; rows: number }> = [];
  sortEvents: Array<{ sortField: string; sortOrder: 1 | -1 }> = [];
  layoutEvents: Array<'list' | 'grid'> = [];
  changeLayoutEvents: Array<'list' | 'grid'> = [];
  @ViewChild(DataViewComponent) component!: DataViewComponent<DataViewRow>;
}

describe('DataView local and lazy pagination contracts', () => {
  it('resets local paging when filtering and counts the filtered results instead of server totals', () => {
    const fixture = TestBed.createComponent(
      DataViewComponent<{ name: string }>,
    );
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('value', [
      { name: 'Alpha' },
      { name: 'Beta' },
      { name: 'İzmir warehouse' },
      { name: 'İzmir office' },
      { name: 'Gamma' },
    ]);
    fixture.componentRef.setInput('paginator', true);
    fixture.componentRef.setInput('rows', 2);
    fixture.componentRef.setInput('totalRecords', 100);
    fixture.componentRef.setInput('filterBy', 'name');
    fixture.componentRef.setInput('filterLocale', 'tr');
    component.first.set(4);
    fixture.detectChanges();

    const filter = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    filter.value = 'izmir';
    filter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(component.first()).toBe(0);
    expect(component.effectiveTotalRecords()).toBe(2);
    expect(component.pageCount()).toBe(1);
    expect(component.pageItems().map((item) => item.name)).toEqual([
      'İzmir warehouse',
      'İzmir office',
    ]);
    expect(fixture.nativeElement.querySelectorAll('.paginator')).toHaveSize(0);
  });

  it('renders a lazy server page without applying its global offset a second time', () => {
    const fixture = TestBed.createComponent(DataViewComponent<{ id: number }>);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('value', [{ id: 11 }, { id: 12 }]);
    fixture.componentRef.setInput('paginator', true);
    fixture.componentRef.setInput('lazy', true);
    fixture.componentRef.setInput('rows', 10);
    fixture.componentRef.setInput('totalRecords', 25);
    component.first.set(10);
    fixture.detectChanges();

    expect(component.pageCount()).toBe(3);
    expect(component.effectiveTotalRecords()).toBe(25);
    expect(fixture.nativeElement.querySelectorAll('article')).toHaveSize(2);
    expect(component.pageItems().map((item) => item.id)).toEqual([11, 12]);

    const lazyRequests: Array<{ first: number; rows: number }> = [];
    component.onLazyLoad.subscribe((request) => lazyRequests.push(request));
    component.goToPage(20);
    expect(lazyRequests).toEqual([{ first: 20, rows: 10 }]);
  });

  it('renders the configured paginator at both positions with accessible controls', () => {
    const fixture = TestBed.createComponent(DataViewComponent<{ id: number }>);
    fixture.componentRef.setInput(
      'value',
      Array.from({ length: 12 }, (_, id) => ({ id })),
    );
    fixture.componentRef.setInput('paginator', true);
    fixture.componentRef.setInput('rows', 5);
    fixture.componentRef.setInput('rowsPerPageOptions', [5, 10]);
    fixture.componentRef.setInput('pageLinks', 3);
    fixture.componentRef.setInput('paginatorPosition', 'both');
    fixture.componentRef.setInput('showCurrentPageReport', true);
    fixture.componentRef.setInput(
      'currentPageReportTemplate',
      '{first}-{last} / {totalRecords} ({currentPage}/{totalPages})',
    );
    fixture.componentRef.setInput('showJumpToPageDropdown', true);
    fixture.componentRef.setInput('showFirstLastIcon', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('orc-paginator')).toHaveSize(
      2,
    );
    expect(
      fixture.nativeElement.querySelectorAll('.orc-paginator__select'),
    ).toHaveSize(2);
    expect(
      fixture.nativeElement.querySelectorAll('.orc-paginator__jump select'),
    ).toHaveSize(2);
    expect(
      fixture.nativeElement.querySelectorAll('.orc-paginator__btn--first'),
    ).toHaveSize(2);
    expect(
      fixture.nativeElement.querySelectorAll('.orc-paginator__info'),
    ).toHaveSize(2);
    expect(
      fixture.nativeElement
        .querySelector('.orc-paginator__info')
        .textContent?.trim(),
    ).toBe('1-5 / 12 (1/3)');
    expect(
      (
        fixture.nativeElement.querySelector(
          '.orc-paginator__btn--page.orc-paginator__btn--active',
        ) as HTMLButtonElement
      ).disabled,
    ).toBeFalse();

    const controls = fixture.nativeElement.querySelectorAll(
      'orc-paginator button, orc-paginator select, orc-paginator input',
    ) as NodeListOf<HTMLButtonElement | HTMLSelectElement>;
    expect(
      Array.from(controls).every(
        (control) => !!control.getAttribute('aria-label'),
      ),
    ).toBeTrue();
  });

  it('emits normalized local page and page-size changes while honoring page bounds', () => {
    const fixture = TestBed.createComponent(DataViewComponent<{ id: number }>);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'value',
      Array.from({ length: 23 }, (_, id) => ({ id })),
    );
    fixture.componentRef.setInput('paginator', true);
    fixture.componentRef.setInput('rows', 10);
    fixture.componentRef.setInput('rowsPerPageOptions', [5, 20]);
    fixture.componentRef.setInput('alwaysShowPaginator', false);
    const pages: Array<{ first: number; rows: number }> = [];
    component.onPage.subscribe((event) => pages.push(event));
    fixture.detectChanges();

    const pageTwo = Array.from(
      fixture.nativeElement.querySelectorAll(
        '.orc-paginator__btn--page',
      ) as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.trim() === '2');
    expect(pageTwo).toBeDefined();
    pageTwo!.click();
    fixture.detectChanges();
    expect(component.first()).toBe(10);
    expect(component.pageItems().map((item) => item.id)).toEqual(
      Array.from({ length: 10 }, (_, index) => index + 10),
    );

    const pageSize = fixture.nativeElement.querySelector(
      '.orc-paginator__select',
    ) as HTMLSelectElement;
    pageSize.value = '20';
    pageSize.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    expect(component.effectivePageSize()).toBe(20);
    expect(component.first()).toBe(20);
    expect(component.pageItems().map((item) => item.id)).toEqual([20, 21, 22]);
    expect(pages).toEqual([
      { first: 10, rows: 10 },
      { first: 20, rows: 20 },
    ]);

    fixture.componentRef.setInput('value', [{ id: 0 }, { id: 1 }]);
    fixture.detectChanges();
    expect(component.first()).toBe(0);
    expect(component.pageCount()).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('orc-paginator')).toHaveSize(
      0,
    );
  });

  it('renders an empty always-visible paginator and requests a fresh lazy page after filtering', () => {
    const fixture = TestBed.createComponent(
      DataViewComponent<{ id: number; name: string }>,
    );
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('value', [
      { id: 11, name: 'Eleven' },
      { id: 12, name: 'Twelve' },
    ]);
    fixture.componentRef.setInput('paginator', true);
    fixture.componentRef.setInput('lazy', true);
    fixture.componentRef.setInput('totalRecords', 25);
    fixture.componentRef.setInput('rows', 10);
    fixture.componentRef.setInput('filterBy', 'name');
    fixture.componentRef.setInput('emptyMessage', 'No matches');
    component.first.set(10);
    const lazyRequests: Array<{ first: number; rows: number }> = [];
    component.onLazyLoad.subscribe((request) => lazyRequests.push(request));
    fixture.detectChanges();

    expect(component.pageItems().map((item) => item.id)).toEqual([11, 12]);
    const filter = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    filter.value = 'missing';
    filter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(component.first()).toBe(0);
    expect(lazyRequests).toEqual([{ first: 0, rows: 10 }]);
    expect(fixture.nativeElement.textContent).toContain('No matches');

    fixture.componentRef.setInput('totalRecords', 0);
    fixture.componentRef.setInput('value', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('orc-paginator')).toHaveSize(
      1,
    );
    expect(
      fixture.nativeElement.querySelector('.orc-paginator__info'),
    ).toBeNull();
  });

  it('switches large page counts to a bounded numeric jump control and keeps page links bounded', () => {
    const fixture = TestBed.createComponent(DataViewComponent<{ id: number }>);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('value', [{ id: 1 }]);
    fixture.componentRef.setInput('paginator', true);
    fixture.componentRef.setInput('lazy', true);
    fixture.componentRef.setInput('totalRecords', 1_000_000);
    fixture.componentRef.setInput('rows', 10);
    fixture.componentRef.setInput('pageLinks', 3);
    fixture.componentRef.setInput('showJumpToPageDropdown', true);
    const pages: Array<{ first: number; rows: number }> = [];
    component.onPage.subscribe((event) => pages.push(event));
    fixture.detectChanges();

    const jump = fixture.nativeElement.querySelector(
      '.orc-paginator__jump select',
    ) as HTMLSelectElement;
    expect(jump.tagName).toBe('SELECT');
    expect(jump.options.length).toBeLessThanOrEqual(7);
    const jumpInput = fixture.nativeElement.querySelector(
      '.orc-paginator__jump-input',
    ) as HTMLInputElement;
    expect(jumpInput.max).toBe('100000');
    expect(
      fixture.nativeElement.querySelectorAll('.orc-paginator__btn--page'),
    ).toHaveSize(3);

    jumpInput.value = '99999';
    jumpInput.dispatchEvent(new Event('input', { bubbles: true }));
    jumpInput.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    expect(pages).toEqual([{ first: 999_980, rows: 10 }]);
    expect(component.first()).toBe(999_980);
  });

  it('renders a named loading state and honors a custom loading icon', () => {
    const fixture = TestBed.createComponent(DataViewComponent<{ id: number }>);
    fixture.componentRef.setInput('value', [{ id: 1 }]);
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('loadingIcon', 'pi pi-spinner');
    fixture.componentRef.setInput('loadingMessage', 'Loading records');
    fixture.detectChanges();

    const section = fixture.nativeElement.querySelector(
      'section',
    ) as HTMLElement;
    const status = fixture.nativeElement.querySelector(
      '[role="status"]',
    ) as HTMLElement;
    const icon = fixture.nativeElement.querySelector(
      '.loading-icon',
    ) as HTMLElement;
    expect(section.getAttribute('aria-busy')).toBe('true');
    expect(status.textContent?.trim()).toBe('Loading records');
    expect(icon.classList.contains('pi')).toBeTrue();
    expect(icon.classList.contains('pi-spinner')).toBeTrue();
    expect(fixture.nativeElement.querySelectorAll('article')).toHaveSize(0);

    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('article')).toHaveSize(1);
    expect(section.getAttribute('aria-busy')).toBeNull();
  });

  it('sorts through controlled sort inputs and emits onSort for programmatic sort changes', () => {
    const fixture = TestBed.createComponent(
      DataViewComponent<{ name: string }>,
    );
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('value', [
      { name: 'Beta' },
      { name: 'Alpha' },
    ]);
    fixture.componentRef.setInput('sortField', 'name');
    fixture.componentRef.setInput('sortOrder', -1);
    fixture.detectChanges();
    expect(component.pageItems().map((item) => item.name)).toEqual([
      'Beta',
      'Alpha',
    ]);

    const sorts: Array<{ sortField: string; sortOrder: 1 | -1 }> = [];
    component.onSort.subscribe((event) => sorts.push(event));
    component.sortBy('name', 1);
    expect(component.pageItems().map((item) => item.name)).toEqual([
      'Alpha',
      'Beta',
    ]);
    component.sortBy(undefined, -1);
    expect(component.pageItems().map((item) => item.name)).toEqual([
      'Beta',
      'Alpha',
    ]);
    expect(sorts).toEqual([
      { sortField: 'name', sortOrder: 1 },
      { sortField: '', sortOrder: -1 },
    ]);
  });

  it('renders named presentation, styling and empty-state inputs', () => {
    const fixture = TestBed.createComponent(
      DataViewComponent<{ name: string }>,
    );
    fixture.componentRef.setInput('value', []);
    fixture.componentRef.setInput('header', 'Projects');
    fixture.componentRef.setInput('ariaLabel', '   ');
    fixture.componentRef.setInput('emptyMessage', 'No projects');
    fixture.componentRef.setInput('style', { width: '24rem', color: 'navy' });
    fixture.componentRef.setInput('styleClass', 'inventory-view');
    fixture.componentRef.setInput('listStyleClass', 'list-cards');
    fixture.componentRef.setInput('layout', 'list');
    fixture.componentRef.setInput('filterBy', 'name');
    fixture.componentRef.setInput('filterAriaLabel', '   ');
    fixture.detectChanges();

    const section = fixture.nativeElement.querySelector(
      'section',
    ) as HTMLElement;
    const content = fixture.nativeElement.querySelector(
      '.content',
    ) as HTMLElement;
    const status = fixture.nativeElement.querySelector(
      '[role="status"]',
    ) as HTMLElement;
    const filter = fixture.nativeElement.querySelector(
      'input[type="search"]',
    ) as HTMLInputElement;

    expect(section.getAttribute('aria-label')).toBe('Projects');
    expect(section.classList).toContain('orc-data-view');
    expect(section.classList).toContain('inventory-view');
    expect(section.style.width).toBe('24rem');
    expect(section.style.color).toBe('navy');
    expect(fixture.nativeElement.querySelector('header').textContent).toBe(
      'Projects',
    );
    expect(content.classList).toContain('content');
    expect(content.classList).toContain('list');
    expect(content.classList).toContain('list-cards');
    expect(status.textContent?.trim()).toBe('No projects');
    expect(filter.getAttribute('aria-label')).toBe('Filter items');

    fixture.componentRef.setInput('emptyMessage', '   ');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
    fixture.componentRef.setInput('emptyMessage', 'No projects');
    fixture.detectChanges();

    fixture.componentRef.setInput('ariaLabel', '  Project inventory  ');
    fixture.componentRef.setInput('filterAriaLabel', '  Filter projects  ');
    fixture.componentRef.setInput('layout', 'grid');
    fixture.componentRef.setInput('gridStyleClass', 'grid-cards');
    fixture.detectChanges();
    expect(section.getAttribute('aria-label')).toBe('Project inventory');
    expect(filter.getAttribute('aria-label')).toBe('Filter projects');
    expect(content.classList).toContain('grid-cards');
    expect(content.classList).not.toContain('list-cards');

    fixture.componentRef.setInput('header', '   ');
    fixture.componentRef.setInput('ariaLabel', '   ');
    fixture.detectChanges();
    expect(section.getAttribute('aria-label')).toBe('Data view');
    expect(fixture.nativeElement.querySelector('header')).toBeNull();
    fixture.destroy();
  });

  it('bounds paginator inputs and applies them at the configured positions', () => {
    const fixture = TestBed.createComponent(DataViewComponent<{ id: number }>);
    fixture.componentRef.setInput(
      'value',
      Array.from({ length: 12 }, (_, id) => ({ id })),
    );
    fixture.componentRef.setInput('paginator', true);
    fixture.componentRef.setInput('rows', 5);
    fixture.componentRef.setInput('rowsPerPageOptions', [5, 10]);
    fixture.componentRef.setInput('pageLinks', 3);
    fixture.componentRef.setInput('paginatorPosition', 'both');
    fixture.componentRef.setInput('paginatorStyleClass', 'records-pager');
    fixture.componentRef.setInput('paginatorAriaLabel', '  Project pages  ');
    fixture.componentRef.setInput('showCurrentPageReport', true);
    fixture.componentRef.setInput(
      'currentPageReportTemplate',
      '{first}-{last} / {totalRecords} ({currentPage}/{totalPages})',
    );
    fixture.componentRef.setInput('showJumpToPageDropdown', true);
    fixture.componentRef.setInput('showFirstLastIcon', true);
    fixture.componentRef.setInput('showPageLinks', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('orc-paginator')).toHaveSize(
      2,
    );
    const navigations = fixture.nativeElement.querySelectorAll(
      '.orc-paginator',
    ) as NodeListOf<HTMLElement>;
    for (const navigation of Array.from(navigations)) {
      expect(navigation.getAttribute('aria-label')).toBe('Project pages');
      expect(navigation.classList).toContain('records-pager');
      expect(
        navigation.querySelectorAll('.orc-paginator__btn--page'),
      ).toHaveSize(3);
      expect(
        navigation.querySelector('.orc-paginator__btn--first'),
      ).not.toBeNull();
      expect(
        navigation.querySelector('.orc-paginator__jump select'),
      ).not.toBeNull();
      expect(navigation.querySelector('.orc-paginator__select')).not.toBeNull();
      expect(
        navigation.querySelector('.orc-paginator__info')?.textContent,
      ).toContain('1-5 / 12 (1/3)');
    }

    fixture.componentRef.setInput('paginatorAriaLabel', '   ');
    fixture.detectChanges();
    expect(
      Array.from(navigations).every(
        (navigation) => navigation.getAttribute('aria-label') === 'Pagination',
      ),
    ).toBeTrue();

    fixture.componentRef.setInput('showPageLinks', false);
    fixture.componentRef.setInput('paginatorPosition', 'top');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('orc-paginator')).toHaveSize(
      1,
    );
    expect(
      fixture.nativeElement.querySelectorAll('.orc-paginator__btn--page'),
    ).toHaveSize(0);

    fixture.componentRef.setInput('paginatorPosition', 'bottom');
    fixture.componentRef.setInput('alwaysShowPaginator', false);
    fixture.componentRef.setInput('value', [{ id: 1 }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('orc-paginator')).toHaveSize(
      0,
    );

    fixture.componentRef.setInput('alwaysShowPaginator', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('orc-paginator')).toHaveSize(
      1,
    );
    fixture.componentRef.setInput('paginator', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('orc-paginator')).toHaveSize(
      0,
    );
    fixture.destroy();
  });

  it('requests and normalizes the initial lazy page, then emits page and load ranges', () => {
    const fixture = TestBed.createComponent(DataViewComponent<{ id: number }>);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('value', [{ id: 11 }, { id: 12 }]);
    fixture.componentRef.setInput('paginator', true);
    fixture.componentRef.setInput('lazy', true);
    fixture.componentRef.setInput('lazyLoadOnInit', true);
    fixture.componentRef.setInput('rows', 5);
    fixture.componentRef.setInput('totalRecords', 23);
    component.first.set(7);
    const lazyRequests: Array<{ first: number; rows: number }> = [];
    const pages: Array<{ first: number; rows: number }> = [];
    component.onLazyLoad.subscribe((request) => lazyRequests.push(request));
    component.onPage.subscribe((request) => pages.push(request));
    fixture.detectChanges();

    expect(lazyRequests).toEqual([{ first: 5, rows: 5 }]);
    expect(component.first()).toBe(5);
    expect(fixture.nativeElement.querySelectorAll('article')).toHaveSize(2);

    component.goToPage(21, 10);
    expect(pages).toEqual([{ first: 20, rows: 10 }]);
    expect(lazyRequests).toEqual([
      { first: 5, rows: 5 },
      { first: 20, rows: 10 },
    ]);
    expect(component.first()).toBe(20);
    expect(component.effectivePageSize()).toBe(10);
    fixture.destroy();
  });

  it('keeps the item template context and identity stable across live updates', () => {
    const fixture = TestBed.createComponent(DataViewContractHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();
    const findArticle = (name: string): HTMLElement | undefined =>
      Array.from(
        fixture.nativeElement.querySelectorAll(
          'article',
        ) as NodeListOf<HTMLElement>,
      ).find((article) => article.textContent?.includes(name));

    const alphaBefore = findArticle('Alpha')!;
    expect(alphaBefore.querySelector('.record-template')?.textContent).toBe(
      'Alpha',
    );
    expect(host.trackByCalls).toContain(
      jasmine.objectContaining({
        index: 0,
        row: jasmine.objectContaining({ id: 'a', name: 'Alpha' }),
      }),
    );

    host.value = [...host.value].reverse();
    fixture.detectChanges();
    const alphaWithTrackBy = findArticle('Alpha')!;
    expect(alphaWithTrackBy).toBe(alphaBefore);

    host.trackBy = undefined;
    fixture.detectChanges();
    const alphaWithDataKey = findArticle('Alpha')!;
    host.value = [...host.value].reverse();
    fixture.detectChanges();
    const alphaAfterDataKeyUpdate = findArticle('Alpha')!;
    expect(alphaAfterDataKeyUpdate).toBe(alphaWithDataKey);
    fixture.destroy();
  });

  it('keeps public models and transition outputs synchronized with the rendered view', () => {
    const fixture = TestBed.createComponent(DataViewContractHost);
    const host = fixture.componentInstance;
    host.layout = 'list';
    fixture.detectChanges();
    const component = host.component;
    const content = fixture.nativeElement.querySelector(
      '.content',
    ) as HTMLElement;

    expect(component.layout()).toBe('list');
    expect(content.classList).toContain('list');

    const filter = fixture.nativeElement.querySelector(
      'input[type="search"]',
    ) as HTMLInputElement;
    filter.value = 'a';
    filter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(host.filterValue).toBe('a');
    expect(fixture.nativeElement.querySelectorAll('article')).toHaveSize(2);

    component.goToPage(1, 1);
    fixture.detectChanges();
    expect(host.first).toBe(1);
    expect(host.pageEvents).toEqual([{ first: 1, rows: 1 }]);

    component.sortBy('name', -1);
    fixture.detectChanges();
    expect(host.sortField).toBe('name');
    expect(host.sortOrder).toBe(-1);
    expect(host.sortEvents).toEqual([{ sortField: 'name', sortOrder: -1 }]);
    expect(
      fixture.nativeElement.querySelector('article')?.textContent,
    ).toContain('Alpha');

    component.setLayout('grid');
    fixture.detectChanges();
    expect(host.layout).toBe('grid');
    expect(host.layoutEvents).toEqual(['grid']);
    expect(host.changeLayoutEvents).toEqual(['grid']);
    expect(content.classList).not.toContain('list');
    fixture.destroy();
  });

  it('renders safe fallback labels for cyclic record values and blank status text', () => {
    const fixture = TestBed.createComponent(DataViewComponent<object>);
    const cyclic: Record<string, unknown> = { name: 'cycle' };
    cyclic['self'] = cyclic;
    fixture.componentRef.setInput('value', [cyclic]);
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('loadingMessage', '   ');
    fixture.componentRef.setInput('ariaLabel', '   ');
    fixture.detectChanges();

    const section = fixture.nativeElement.querySelector(
      'section',
    ) as HTMLElement;
    expect(section.getAttribute('aria-label')).toBe('Data view');
    expect(
      fixture.nativeElement.querySelector('[role="status"]').textContent,
    ).toContain('Loading');

    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('article').textContent?.trim(),
    ).toBe('[object Object]');
    fixture.destroy();
  });
});
