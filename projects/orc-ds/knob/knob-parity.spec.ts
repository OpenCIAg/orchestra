import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { KnobComponent } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the knob. The specs import the component through
 * the public `@ciag/orchestra/p2` surface and must pass unchanged while the
 * family moves to its canonical directory.
 */
describe('Knob behavior parity', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  function create() {
    const fixture = TestBed.createComponent(KnobComponent);
    fixture.detectChanges();
    return fixture;
  }

  function rangeInput(fixture: ReturnType<typeof create>): HTMLInputElement {
    return fixture.nativeElement.querySelector(
      'input[type="range"]',
    ) as HTMLInputElement;
  }

  it('snaps and clamps forms values into the configured range', () => {
    const fixture = create();
    fixture.componentRef.setInput('min', 10);
    fixture.componentRef.setInput('max', 90);
    fixture.componentRef.setInput('step', 7);
    fixture.detectChanges();

    fixture.componentInstance.writeValue(150);
    expect(fixture.componentInstance.value()).toBe(90);

    fixture.componentInstance.writeValue(5);
    expect(fixture.componentInstance.value()).toBe(10);

    fixture.componentInstance.writeValue(23.4);
    // min + round((23.4 - 10) / 7) * 7 = 10 + 14 = 24
    expect(fixture.componentInstance.value()).toBe(24);
  });

  it('emits valueChangeEvent and onChange when the range input moves', () => {
    const fixture = create();
    const valueChanges: number[] = [];
    const domChanges: number[] = [];
    fixture.componentInstance.valueChangeEvent.subscribe((value) =>
      valueChanges.push(value),
    );
    fixture.componentInstance.onChange.subscribe((value) =>
      domChanges.push(value),
    );

    const native = rangeInput(fixture);
    native.value = '42';
    native.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe(42);
    expect(valueChanges).toEqual([42]);
    expect(domChanges).toEqual([42]);
  });

  it('blocks pointer and keyboard interaction while readonly', () => {
    const fixture = create();
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();

    const pointer = new MouseEvent('mousedown', { cancelable: true });
    rangeInput(fixture).dispatchEvent(pointer);
    expect(pointer.defaultPrevented).toBeTrue();

    for (const key of ['ArrowLeft', 'Home', 'PageUp', ' ']) {
      const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
      });
      rangeInput(fixture).dispatchEvent(event);
      expect(event.defaultPrevented).toBeTrue();
    }

    const native = rangeInput(fixture);
    native.value = '50';
    native.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe(0);
  });

  it('applies the forms disabled handshake', () => {
    const fixture = create();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(rangeInput(fixture).disabled).toBeTrue();

    const native = rangeInput(fixture);
    native.value = '50';
    native.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe(0);
  });

  it('renders the value label and keeps the aria surface in sync', () => {
    const fixture = create();
    fixture.componentRef.setInput('ariaLabel', 'Volume');
    fixture.componentRef.setInput('valueTemplate', '{value}%');
    fixture.componentRef.setInput('value', 25);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('svg text')?.textContent?.trim(),
    ).toBe('{value}%');
    expect(rangeInput(fixture).getAttribute('aria-label')).toBe('Volume');
    expect(rangeInput(fixture).getAttribute('aria-valuenow')).toBe('25');
    expect(rangeInput(fixture).getAttribute('aria-valuemin')).toBe('0');
    expect(rangeInput(fixture).getAttribute('aria-valuemax')).toBe('100');
  });
});
