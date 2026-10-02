import { TestBed } from '@angular/core/testing';
import { VirtualScrollerComponent } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the virtual scroller family. The specs import
 * the component through the public `@ciag/orchestra/p2` surface and must
 * pass unchanged while the family moves to its canonical directory.
 */
describe('VirtualScroller behavior parity', () => {
  const setup = (inputs: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent<VirtualScrollerComponent>(
      VirtualScrollerComponent,
    );
    for (const [key, value] of Object.entries(inputs))
      fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return fixture;
  };

  const renderedItems = (fixture: ReturnType<typeof setup>) =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '[role="listitem"]',
      ),
    );

  beforeEach(() => TestBed.configureTestingModule({}));

  it('renders only the visible window of a large list with spacer heights', () => {
    const items = Array.from({ length: 1000 }, (_, index) => ({
      label: `Item ${index + 1}`,
    }));
    const fixture = setup({
      items,
      itemHeight: 40,
      overscan: 0,
      viewportHeight: '240px',
    });

    const rendered = renderedItems(fixture);
    expect(rendered.length).toBe(6);
    expect(rendered[0].textContent?.trim()).toBe('Item 1');
    expect(rendered[0].getAttribute('aria-posinset')).toBe('1');
    expect(rendered[0].getAttribute('aria-setsize')).toBe('1000');
    expect(rendered[0].style.height).toBe('40px');

    const spacers = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.orc-p2-virtual-scroller > div:not([role])',
    );
    expect((spacers[0] as HTMLElement).style.height).toBe('0px');
    expect((spacers[1] as HTMLElement).style.height).toBe('39760px');
  });

  it('advances the window on scroll and reports the rendered range', () => {
    const items = Array.from({ length: 500 }, (_, index) => `Item ${index}`);
    const fixture = setup({ items, itemHeight: 40, overscan: 0 });
    const ranges: { start: number; end: number }[] = [];
    fixture.componentInstance.rangeChange.subscribe((range) =>
      ranges.push({ ...range }),
    );

    const viewport = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLElement>('.orc-p2-virtual-scroller')!;
    viewport.scrollTop = 400;
    viewport.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(ranges.at(-1)).toEqual({ start: 10, end: 16 });
    const rendered = renderedItems(fixture);
    expect(rendered[0].textContent?.trim()).toBe('Item 10');
  });

  it('labels items through the configured key and plain strings', () => {
    const fixture = setup({
      items: [{ title: 'First' }, { title: 'Second' }, 'plain'],
      itemLabelKey: 'title',
    });
    expect(
      renderedItems(fixture).map((item) => item.textContent?.trim()),
    ).toEqual(['First', 'Second', 'plain']);
  });

  it('reports a lazy load event for the rendered range when lazy is on', () => {
    const items = Array.from({ length: 200 }, () => 'x');
    const fixture = setup({ items, lazy: true, overscan: 0 });
    const loads: { first: number; last: number }[] = [];
    fixture.componentInstance.onLazyLoad.subscribe((load) =>
      loads.push({ ...load }),
    );

    const viewport = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLElement>('.orc-p2-virtual-scroller')!;
    viewport.scrollTop = 80;
    viewport.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(loads).toEqual([{ first: 2, last: 7 }]);
  });

  it('renders the loading status instead of items while loading with a message', () => {
    const fixture = setup({
      items: [1, 2, 3],
      loading: true,
      loadingMessage: 'Fetching',
    });
    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('[role="status"]')
        ?.textContent?.trim(),
    ).toBe('Fetching');
    expect(renderedItems(fixture).length).toBe(3);
  });
});
