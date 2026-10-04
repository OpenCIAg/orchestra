import { TestBed } from '@angular/core/testing';
import { DataViewComponent } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the data view family. The specs import the
 * component through the public `@ciag/orchestra/p2` surface and must pass
 * unchanged while the family moves to its canonical directory.
 */
describe('DataView behavior parity', () => {
  const items = Array.from({ length: 7 }, (_, index) => ({
    id: index + 1,
    name: `Item ${index + 1}`,
  }));

  const setup = (inputs: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(DataViewComponent);
    fixture.componentRef.setInput('value', items);
    for (const [key, value] of Object.entries(inputs))
      fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return fixture;
  };

  const articles = (fixture: ReturnType<typeof setup>) =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('article'),
    );

  beforeEach(() => TestBed.configureTestingModule({}));

  it('renders every item and the empty message when the value is empty', () => {
    const fixture = setup();
    expect(articles(fixture).length).toBe(7);

    fixture.componentRef.setInput('value', []);
    fixture.componentRef.setInput('emptyMessage', 'Nothing here');
    fixture.detectChanges();
    expect(articles(fixture).length).toBe(0);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Nothing here',
    );
  });

  it('paginates locally through the paginator and reports page changes', () => {
    const fixture = setup({
      paginator: true,
      rows: 3,
      rowsPerPageOptions: [3],
    });
    expect(articles(fixture).length).toBe(3);

    const pages: unknown[] = [];
    fixture.componentInstance.onPage.subscribe(pages.push.bind(pages));
    fixture.componentInstance.goToPage(6);
    fixture.detectChanges();

    expect(articles(fixture).length).toBe(1);
    expect(articles(fixture)[0].textContent).toContain('Item 7');
    expect(pages).toEqual([{ first: 6, rows: 3 }]);
  });

  it('filters items case-insensitively through the filter input', () => {
    const fixture = setup({ filterBy: 'name' });
    const input = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLInputElement>('input[type="search"]')!;
    input.value = 'item 5';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(articles(fixture).length).toBe(1);
    expect(articles(fixture)[0].textContent).toContain('Item 5');
  });

  it('switches layouts and emits both layout output names', () => {
    const fixture = setup();
    const aliased: unknown[] = [];
    const canonical: unknown[] = [];
    fixture.componentInstance.onLayoutChange.subscribe(
      aliased.push.bind(aliased),
    );
    fixture.componentInstance.onChangeLayout.subscribe(
      canonical.push.bind(canonical),
    );

    fixture.componentInstance.setLayout('list');
    fixture.detectChanges();

    expect(fixture.componentInstance.layout()).toBe('list');
    expect(aliased).toEqual(['list']);
    expect(canonical).toEqual(['list']);
  });

  it('sorts by field and order through the sort methods', () => {
    const fixture = setup();
    const sorts: unknown[] = [];
    fixture.componentInstance.onSort.subscribe(sorts.push.bind(sorts));

    fixture.componentInstance.sortBy('name', -1);
    fixture.detectChanges();

    expect(articles(fixture)[0].textContent).toContain('Item 7');
    expect(sorts).toEqual([{ sortField: 'name', sortOrder: -1 }]);
  });

  it('renders the loading state instead of items while loading', () => {
    const fixture = setup({
      loading: true,
      loadingMessage: 'Fetching',
      loadingIcon: 'pi-spin',
    });
    expect(articles(fixture).length).toBe(0);
    const status = (fixture.nativeElement as HTMLElement).querySelector(
      '[role="status"]',
    );
    expect(status?.textContent).toContain('Fetching');
    expect(status?.querySelector('.loading-icon')).toBeTruthy();
  });
});
