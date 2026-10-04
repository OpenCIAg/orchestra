import { TestBed } from '@angular/core/testing';
import { VirtualScrollerComponent as ReExportedVirtualScrollerComponent } from './p2/p2-data-components';
import { VirtualScrollerComponent } from './p2/p2-virtual-scroller-component';

describe('VirtualScrollerComponent contract', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('preserves the data-components re-export and sanitizes invalid geometry inputs', () => {
    expect(ReExportedVirtualScrollerComponent).toBe(VirtualScrollerComponent);
    const fixture = TestBed.createComponent(VirtualScrollerComponent);
    fixture.componentRef.setInput(
      'items',
      Array.from({ length: 100 }, (_, index) => `Item ${index}`),
    );
    fixture.componentRef.setInput('itemHeight', -20);
    fixture.componentRef.setInput('overscan', -3);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    expect(component.effectiveItemHeight()).toBe(1);
    expect(component.effectiveOverscan()).toBe(0);
    component.onScroll({
      target: { scrollTop: Number.NaN },
    } as unknown as Event);
    fixture.detectChanges();
    expect(component.scrollTop()).toBe(0);
    expect(Number.isFinite(component.topSpacer())).toBeTrue();
    expect(Number.isFinite(component.bottomSpacer())).toBeTrue();
    expect(component.topSpacer()).toBeGreaterThanOrEqual(0);
    expect(component.bottomSpacer()).toBeGreaterThanOrEqual(0);

    fixture.componentRef.setInput('itemHeight', Number.NaN);
    component.onScroll({ target: { scrollTop: -50 } } as unknown as Event);
    fixture.detectChanges();
    expect(component.effectiveItemHeight()).toBe(40);
    expect(component.scrollTop()).toBe(0);
    expect(
      Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
          '[role="listitem"]',
        ),
      ).every((item) => item.style.height === '40px'),
    ).toBeTrue();
  });

  it('keeps range, spacer, and virtualized position metadata aligned', () => {
    const fixture = TestBed.createComponent(VirtualScrollerComponent);
    fixture.componentRef.setInput(
      'items',
      Array.from({ length: 100 }, (_, index) => ({ label: `Item ${index}` })),
    );
    fixture.componentRef.setInput('itemHeight', 20);
    fixture.componentRef.setInput('viewportHeight', '40px');
    fixture.componentRef.setInput('overscan', 1);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.scrollTop.set(100);
    fixture.detectChanges();
    expect(component.startIndex()).toBe(4);
    expect(component.endIndex()).toBe(8);
    expect(component.topSpacer()).toBe(80);
    expect(component.bottomSpacer()).toBe(1840);
    const rows = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '[role="listitem"]',
      ),
    );
    expect(rows).toHaveSize(4);
    expect(rows[0].getAttribute('aria-setsize')).toBe('100');
    expect(rows[0].getAttribute('aria-posinset')).toBe('5');
    expect(rows[3].getAttribute('aria-posinset')).toBe('8');
    expect(rows.every((row) => row.style.height === '20px')).toBeTrue();
    expect(rows.every((row) => row.offsetHeight === 20)).toBeTrue();
  });

  it('keeps loading status outside the list and supplies a default accessible name', () => {
    const fixture = TestBed.createComponent(VirtualScrollerComponent);
    fixture.componentRef.setInput('items', ['A', 'B']);
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('loadingMessage', 'Loading records');
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const list = root.querySelector('[role="list"]') as HTMLElement;
    const status = root.querySelector('[role="status"]') as HTMLElement;
    expect(list.getAttribute('aria-label')).toBe('Scrollable list');
    expect(status.textContent).toContain('Loading records');
    expect(list.contains(status)).toBeFalse();
    expect(list.querySelectorAll('[role="listitem"]')).toHaveSize(2);
  });

  it('emits exclusive rangeChange end and inclusive lazy last', () => {
    const fixture = TestBed.createComponent(VirtualScrollerComponent);
    fixture.componentRef.setInput(
      'items',
      Array.from({ length: 10 }, (_, index) => `Item ${index}`),
    );
    fixture.componentRef.setInput('itemHeight', 20);
    fixture.componentRef.setInput('viewportHeight', '40px');
    fixture.componentRef.setInput('overscan', 0);
    fixture.componentRef.setInput('lazy', true);
    fixture.detectChanges();
    const ranges: Array<{ start: number; end: number }> = [];
    const lazy: Array<{ first: number; last: number }> = [];
    fixture.componentInstance.rangeChange.subscribe((range) =>
      ranges.push(range),
    );
    fixture.componentInstance.onLazyLoad.subscribe((range) => lazy.push(range));
    fixture.componentInstance.onScroll({
      target: { scrollTop: 40 },
    } as unknown as Event);
    expect(ranges).toEqual([{ start: 2, end: 4 }]);
    expect(lazy).toEqual([{ first: 2, last: 3 }]);
  });
});
