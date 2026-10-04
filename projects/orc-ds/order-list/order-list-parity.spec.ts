import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { OrderListComponent } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the order list family. The specs import the
 * component through the public `@ciag/orchestra/p2` surface and must pass
 * unchanged while the family moves to its canonical directory.
 */
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, OrderListComponent],
  template: `<orc-order-list
    [formControl]="control"
    header="Fruits"
    moveUpLabel="Move up"
    moveDownLabel="Move down"
  />`,
})
class OrderListHost {
  readonly control = new FormControl<string[]>(['Apple', 'Banana']);
}

describe('OrderList behavior parity', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  const setup = (inputs: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(OrderListComponent);
    fixture.componentRef.setInput(
      'value',
      (inputs['value'] as unknown[]) ?? ['Apple', 'Banana', 'Cherry'],
    );
    fixture.componentRef.setInput('moveUpLabel', 'Move up');
    fixture.componentRef.setInput('moveDownLabel', 'Move down');
    for (const [key, setting] of Object.entries(inputs)) {
      if (key !== 'value') fixture.componentRef.setInput(key, setting);
    }
    fixture.detectChanges();
    return fixture;
  };

  it('renders visible and disabled items with listbox semantics', () => {
    const fixture = setup({
      value: ['Apple', { label: 'Blocked', disabled: true }, 'Cherry'],
    });
    const rows = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '[role="option"]',
      ),
    );
    expect(rows.map((row) => row.textContent?.trim())).toEqual([
      'Apple',
      'Blocked',
      'Cherry',
    ]);
    expect(rows[1].getAttribute('aria-disabled')).toBe('true');
    expect(rows[1].getAttribute('tabindex')).toBe('-1');
  });

  it('selects items, moves the selected row up, and emits both reorder output names', () => {
    const fixture = setup();
    const aliased: unknown[] = [];
    const canonical: unknown[] = [];
    fixture.componentInstance.onReorder.subscribe(aliased.push.bind(aliased));
    fixture.componentInstance.reorder.subscribe(canonical.push.bind(canonical));

    const rows = (
      fixture.nativeElement as HTMLElement
    ).querySelectorAll<HTMLElement>('[role="option"]');
    rows[1].click();
    fixture.detectChanges();
    expect([...fixture.componentInstance.selectedItems()]).toEqual(['Banana']);

    fixture.componentInstance.move(-1);
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toEqual([
      'Banana',
      'Apple',
      'Cherry',
    ]);
    expect(aliased.length).toBe(1);
    expect(canonical.length).toBe(1);
  });

  it('roves DOM focus with arrows and honors Home/End', async () => {
    const fixture = setup();
    const rows = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '[role="option"]',
      ),
    );
    rows[1].focus();
    rows[1].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(
      (document.activeElement as HTMLElement | null)?.textContent?.trim(),
    ).toBe('Cherry');

    (document.activeElement as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(
      (document.activeElement as HTMLElement | null)?.textContent?.trim(),
    ).toBe('Apple');
  });

  it('registers with the forms API, pushes reordered values, and keeps the host model in sync', async () => {
    const host = TestBed.createComponent(OrderListHost);
    host.detectChanges();
    await host.whenStable();

    const list = (host.nativeElement as HTMLElement).querySelector(
      'orc-order-list',
    )!;
    const rows = list.querySelectorAll<HTMLElement>('[role="option"]');
    expect(rows.length).toBe(2);
    rows[1].click();
    host.detectChanges();
    list.querySelector<HTMLElement>('[aria-label="Move up"]')!.click();
    host.detectChanges();
    await host.whenStable();

    expect(host.componentInstance.control.value).toEqual(['Banana', 'Apple']);
  });

  it('marks the control touched after a reorder while focus is outside the host', async () => {
    const fixture = setup();
    let touched = 0;
    fixture.componentInstance.registerOnTouched(() => touched++);

    fixture.componentInstance.select(1);
    fixture.componentInstance.move(-1);
    expect(touched).toBe(0);
    await Promise.resolve();
    expect(touched).toBe(1);
  });

  it('pushes the forms value on reorder and honors the disabled state', async () => {
    const fixture = setup();
    let modelValue: unknown;
    fixture.componentInstance.registerOnChange((value) => (modelValue = value));

    fixture.componentInstance.select(1);
    fixture.componentInstance.move(1);
    await Promise.resolve();
    expect(modelValue).toEqual(['Apple', 'Cherry', 'Banana']);

    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    fixture.componentInstance.move(-1);
    expect(modelValue).toEqual(['Apple', 'Cherry', 'Banana']);
    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('[aria-label="Move up"]')
        ?.hasAttribute('disabled'),
    ).toBeTrue();
  });

  it('filters entries and reports filter events', () => {
    const fixture = setup();
    const events: unknown[] = [];
    fixture.componentInstance.onFilterEvent.subscribe(events.push.bind(events));
    fixture.componentInstance.setFilter('ban');
    fixture.detectChanges();
    expect(fixture.componentInstance.filteredValue()).toEqual(['Banana']);
    expect(events).toEqual([{ filter: 'ban' }]);
  });
});
