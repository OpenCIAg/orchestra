import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OrderListPageComponent } from './order-list-page.component';

describe('OrderList documentation', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [OrderListPageComponent],
      providers: [provideRouter([])],
    }),
  );

  it('renders a discoverable example with filtering, named controls, and a disabled item', () => {
    const fixture = TestBed.createComponent(OrderListPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h1')?.textContent).toContain('OrderList');
    expect(root.querySelector('orc-order-list')).not.toBeNull();
    expect(
      root.querySelector('input[placeholder="Filtrar componentes"]'),
    ).not.toBeNull();
    expect(
      root.querySelector('button[aria-label="Mover para cima"]'),
    ).not.toBeNull();
    expect(
      root.querySelector('button[aria-label="Mover para baixo"]'),
    ).not.toBeNull();
    expect(
      root.querySelector('[role="option"]')?.parentElement?.textContent,
    ).toContain('Experimental (disabled)');
  });

  it('filters, selects, and persists a reorder from the live DOM example', () => {
    const fixture = TestBed.createComponent(OrderListPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const filter = root.querySelector(
      'input[placeholder="Filtrar componentes"]',
    ) as HTMLInputElement;

    filter.value = 'Data';
    filter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(root.querySelectorAll('[role="option"]')).toHaveSize(1);
    expect(root.querySelector('[role="option"]')?.textContent).toContain(
      'Data Table',
    );

    (root.querySelector('[role="option"]') as HTMLElement).click();
    fixture.detectChanges();
    expect(
      root.querySelector('[data-testid="order-status"]')?.textContent,
    ).toContain('Data Table');

    filter.value = '';
    filter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    const calendar = Array.from(
      root.querySelectorAll<HTMLElement>('[role="option"]'),
    ).find((option) => option.textContent?.includes('Calendar'));
    calendar?.click();
    fixture.detectChanges();
    (
      root.querySelector(
        'button[aria-label="Mover para baixo"]',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.items().map((item) => item.value)).toEqual(
      ['data-table', 'calendar', 'experimental', 'tree'],
    );
    expect(
      root.querySelector('[data-testid="order-status"]')?.textContent,
    ).toContain('Calendar');
  });

  it('exposes the keyboard path and keeps whole-widget disabled interaction quiet', () => {
    const fixture = TestBed.createComponent(OrderListPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const orderList = root.querySelector(
      'orc-order-list section',
    ) as HTMLElement;
    expect(orderList.getAttribute('tabindex')).toBe('0');
    orderList.focus();
    orderList.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(orderList);

    (root.querySelector('[role="option"]') as HTMLElement).click();
    fixture.detectChanges();
    const selectedBeforeDisable = fixture.componentInstance
      .selection()
      .map((item) => item.value);

    const disabledToggle = root.querySelector(
      '.toggle-label input',
    ) as HTMLInputElement;
    disabledToggle.click();
    fixture.detectChanges();
    expect(orderList?.getAttribute('aria-disabled')).toBe('true');
    expect(
      root
        .querySelector('button[aria-label="Mover para cima"]')
        ?.hasAttribute('disabled'),
    ).toBeTrue();
    expect(
      root
        .querySelector('button[aria-label="Mover para baixo"]')
        ?.hasAttribute('disabled'),
    ).toBeTrue();
    (root.querySelectorAll('[role="option"]')[1] as HTMLElement).click();
    fixture.detectChanges();
    expect(
      fixture.componentInstance.selection().map((item) => item.value),
    ).toEqual(selectedBeforeDisable);
  });
});
