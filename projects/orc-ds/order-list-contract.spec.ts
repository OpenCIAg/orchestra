import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { OrderListComponent } from './p2/p2-list-gallery-components';

type TestItem = {
  value: string;
  label: string;
  disabled?: boolean;
};

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, OrderListComponent],
  template: `<orc-order-list
      #order
      [formControl]="control"
      moveUpLabel="Move up"
      moveDownLabel="Move down"
    />
    <button #outside type="button">Outside</button>`,
})
class BlurOrderListHost {
  @ViewChild('order') order!: OrderListComponent<TestItem>;
  readonly control = new FormControl<TestItem[]>(
    [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ],
    { nonNullable: true, updateOn: 'blur' },
  );
}

describe('OrderListComponent contract', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OrderListComponent] });
  });

  function create(items: TestItem[] = []): {
    fixture: ComponentFixture<OrderListComponent<TestItem>>;
    component: OrderListComponent<TestItem>;
  } {
    const fixture = TestBed.createComponent(OrderListComponent<TestItem>);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('value', items);
    fixture.componentRef.setInput('moveUpLabel', 'Move up');
    fixture.componentRef.setInput('moveDownLabel', 'Move down');
    fixture.componentRef.setInput('filterBy', 'label');
    fixture.componentRef.setInput('listStyle', { maxHeight: '4px' });
    fixture.detectChanges();
    return { fixture, component };
  }

  function options(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
    return [
      ...fixture.nativeElement.querySelectorAll<HTMLElement>('[role="option"]'),
    ];
  }

  it('maps a filtered DOM selection back to its source index', () => {
    const { fixture, component } = create([
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
      { value: 'c', label: 'Gamma' },
    ]);
    const filter = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    filter.value = 'Gamma';
    filter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    const visible = options(fixture);
    expect(visible.map((option) => option.textContent?.trim())).toEqual([
      'Gamma',
    ]);
    expect(
      (fixture.nativeElement.querySelector('ol') as HTMLOListElement).style
        .maxHeight,
    ).toBe('4px');
    visible[0].click();
    expect(component.selectedIndex()).toBe(2);
    expect(component.selection()).toEqual({ value: 'c', label: 'Gamma' });
  });

  it('supports single and multiple selection through native option interaction', () => {
    const { fixture, component } = create([
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ]);
    options(fixture)[0].click();
    expect(component.selection()).toEqual({ value: 'a', label: 'Alpha' });

    fixture.componentRef.setInput('selectionMode', 'multiple');
    fixture.detectChanges();
    options(fixture)[1].click();
    expect(component.selection()).toEqual([
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ]);
    expect(
      fixture.nativeElement
        .querySelector('[role="listbox"]')
        .getAttribute('aria-multiselectable'),
    ).toBe('true');
  });

  it('keeps falsy option values focusable and preserves them in multiple selection', () => {
    const fixture = TestBed.createComponent(OrderListComponent<number>);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('value', [0, 1]);
    fixture.detectChanges();

    const visible = options(fixture);
    expect(visible[0].tabIndex).toBe(0);
    const mouseDown = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    visible[0].dispatchEvent(mouseDown);
    expect(mouseDown.defaultPrevented).toBeFalse();
    expect(document.activeElement).toBe(visible[0]);

    visible[0].click();
    expect(component.selection()).toBe(0);
    fixture.componentRef.setInput('selectionMode', 'multiple');
    fixture.detectChanges();
    visible[1].click();
    expect(component.selection()).toEqual([0, 1]);
  });

  it('propagates CVA changes and applies CVA disabled state to native controls', () => {
    const { fixture, component } = create([
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ]);
    const changed: TestItem[][] = [];
    component.writeValue([
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ]);
    component.registerOnChange((value) => changed.push(value));
    component.selectedIndex.set(0);
    component.move(1);
    expect(changed).toEqual([
      [
        { value: 'b', label: 'Beta' },
        { value: 'a', label: 'Alpha' },
      ],
    ]);

    component.setDisabledState(true);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector('input') as HTMLInputElement)
        .disabled,
    ).toBeTrue();
    expect(
      [
        ...(
          fixture.nativeElement as HTMLElement
        ).querySelectorAll<HTMLButtonElement>('button'),
      ].every((button) => button.disabled),
    ).toBeTrue();
    expect(
      options(fixture).every((option) => option.tabIndex === -1),
    ).toBeTrue();
    expect(
      options(fixture).every(
        (option) => option.getAttribute('aria-disabled') === 'true',
      ),
    ).toBeTrue();
    const blockedMouseDown = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    options(fixture)[0].dispatchEvent(blockedMouseDown);
    expect(blockedMouseDown.defaultPrevented).toBeTrue();

    component.setDisabledState(false);
    fixture.detectChanges();
    expect(options(fixture)[0].tabIndex).toBe(0);
  });

  it('moves the roving tab stop to the first enabled option', () => {
    const { fixture } = create([
      { value: 'locked', label: 'Locked', disabled: true },
      { value: 'a', label: 'Alpha' },
    ]);
    expect(options(fixture).map((option) => option.tabIndex)).toEqual([-1, 0]);
  });

  it('emits each reorder output once and disables native boundary buttons', () => {
    const { fixture, component } = create([
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
      { value: 'c', label: 'Gamma' },
    ]);
    const canonical: Array<{ value: TestItem[]; direction: 'up' | 'down' }> =
      [];
    const alias: Array<{ value: TestItem[]; direction: 'up' | 'down' }> = [];
    component.reorder.subscribe((event) => canonical.push(event));
    component.onReorder.subscribe((event) => alias.push(event));
    component.selectedIndex.set(1);
    fixture.detectChanges();

    const buttons = () => [
      ...(
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLButtonElement>('button'),
    ];
    expect(buttons().every((button) => button.type === 'button')).toBeTrue();
    expect(buttons()[0].disabled).toBeFalse();
    expect(buttons()[1].disabled).toBeFalse();
    buttons()[1].click();
    expect(canonical.length).toBe(1);
    expect(alias.length).toBe(1);
    expect(alias[0]).toBe(canonical[0]);
    expect(canonical[0].direction).toBe('down');

    fixture.detectChanges();
    expect(buttons()[1].disabled).toBeTrue();
    buttons()[0].click();
    expect(canonical.length).toBe(2);
    expect(alias.length).toBe(2);
    expect(canonical[1].direction).toBe('up');
  });

  it('provides roving keyboard selection and skips disabled options', async () => {
    const { fixture, component } = create([
      { value: 'a', label: 'Alpha' },
      { value: 'locked', label: 'Locked', disabled: true },
      { value: 'b', label: 'Beta' },
      { value: 'c', label: 'Gamma' },
    ]);
    fixture.componentRef.setInput('selectionMode', 'multiple');
    fixture.detectChanges();
    const visible = options(fixture);
    expect(visible.map((option) => option.tabIndex)).toEqual([0, -1, -1, -1]);
    visible[1].click();
    expect(component.selected()).toBeNull();
    visible[0].focus();
    visible[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    await Promise.resolve();
    expect(visible[2].tabIndex).toBe(0);
    expect(document.activeElement).toBe(visible[2]);

    const select = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    visible[2].dispatchEvent(select);
    expect(select.defaultPrevented).toBeTrue();
    expect(component.selected()).toEqual([{ value: 'b', label: 'Beta' }]);

    visible[2].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    await Promise.resolve();
    expect(document.activeElement).toBe(visible[0]);

    visible[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'End',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    await Promise.resolve();
    expect(document.activeElement).toBe(visible[3]);

    const clickFocus = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    visible[0].dispatchEvent(clickFocus);
    expect(document.activeElement).toBe(visible[0]);
  });

  it('defers CVA blur updates and focus outputs until focus leaves the composite', async () => {
    const fixture = TestBed.createComponent(BlurOrderListHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const order = host.order;
    const root = fixture.nativeElement as HTMLElement;
    const focused: Event[] = [];
    const blurred: Event[] = [];
    order.onFocus.subscribe((event) => focused.push(event));
    order.onBlur.subscribe((event) => blurred.push(event));
    const option = root.querySelector('[role="option"]') as HTMLElement;
    option.focus();
    expect(focused.length).toBe(1);

    order.selectedIndex.set(0);
    fixture.detectChanges();
    const moveDown = root.querySelectorAll<HTMLButtonElement>('button')[1];
    moveDown.focus();
    moveDown.click();
    fixture.detectChanges();
    await Promise.resolve();
    expect(host.control.value).toEqual([
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ]);
    expect(host.control.touched).toBeFalse();

    const outside = root.querySelector('#outside') as HTMLButtonElement | null;
    const outsideButton = outside ?? document.createElement('button');
    if (!outside) {
      outsideButton.type = 'button';
      document.body.appendChild(outsideButton);
    }
    try {
      outsideButton.focus();
      await Promise.resolve();
      expect(host.control.value).toEqual([
        { value: 'b', label: 'Beta' },
        { value: 'a', label: 'Alpha' },
      ]);
      expect(host.control.touched).toBeTrue();
      expect(blurred.length).toBe(1);
    } finally {
      if (!outside) outsideButton.remove();
    }
  });
});
