import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { KnobComponent } from './p2/p2-org-knob-components';

describe('Knob geometry, readonly, and CVA contract', () => {
  function createFixture() {
    const fixture = TestBed.createComponent(KnobComponent);
    fixture.componentRef.setInput('ariaLabel', 'Volume');
    fixture.componentInstance.value.set(50);
    fixture.detectChanges();
    return {
      fixture,
      knob: fixture.componentInstance,
      input: fixture.debugElement.query(By.css('input[type="range"]'))
        .nativeElement as HTMLInputElement,
    };
  }

  it('applies size to the rendered geometry and exposes range semantics', () => {
    const { fixture, input } = createFixture();
    fixture.componentRef.setInput('size', 240);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(
      '.orc-knob',
    ) as HTMLElement;

    expect(root.style.width).toBe('240px');
    expect(root.style.height).toBe('240px');
    expect(
      fixture.nativeElement.querySelector('svg').getAttribute('aria-hidden'),
    ).toBe('true');
    expect(input.getAttribute('aria-label')).toBe('Volume');
    expect(input.getAttribute('aria-valuenow')).toBe('50');
    expect(input.getAttribute('aria-valuemin')).toBe('0');
    expect(input.getAttribute('aria-valuemax')).toBe('100');
    expect(input.disabled).toBeFalse();
    expect(input.getAttribute('aria-readonly')).toBeNull();
  });

  it('omits absent input ids and preserves caller-provided instance ids', () => {
    const first = TestBed.createComponent(KnobComponent);
    const second = TestBed.createComponent(KnobComponent);
    first.detectChanges();
    second.detectChanges();
    expect(
      (
        first.nativeElement.querySelector('input') as HTMLInputElement
      ).hasAttribute('id'),
    ).toBeFalse();
    expect(
      (
        second.nativeElement.querySelector('input') as HTMLInputElement
      ).hasAttribute('id'),
    ).toBeFalse();

    first.componentRef.setInput('inputId', 'knob-first');
    second.componentRef.setInput('inputId', 'knob-second');
    first.detectChanges();
    second.detectChanges();
    expect(
      (first.nativeElement.querySelector('input') as HTMLInputElement).id,
    ).toBe('knob-first');
    expect(
      (second.nativeElement.querySelector('input') as HTMLInputElement).id,
    ).toBe('knob-second');
  });

  it('blocks native range changes while readonly without setting disabled', () => {
    const { fixture, knob, input } = createFixture();
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    const changed: number[] = [];
    const valueEvents: number[] = [];
    knob.registerOnChange((value) => changed.push(value));
    knob.valueChangeEvent.subscribe((value) => valueEvents.push(value));

    const pointerdown = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(pointerdown);
    const keydown = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(keydown);
    input.value = '75';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(pointerdown.defaultPrevented).toBeTrue();
    expect(keydown.defaultPrevented).toBeTrue();
    expect(input.disabled).toBeFalse();
    expect(input.getAttribute('aria-disabled')).toBeNull();
    expect(input.getAttribute('aria-readonly')).toBe('true');
    expect(knob.value()).toBe(50);
    expect(changed).toEqual([]);
    expect(valueEvents).toEqual([]);
  });

  it('keeps CVA writes and disabled state independent from readonly', () => {
    const { fixture, knob, input } = createFixture();
    knob.registerOnChange(() => {
      throw new Error('readonly input must not report a model change');
    });
    fixture.componentRef.setInput('readonly', true);
    knob.writeValue(80);
    fixture.detectChanges();
    expect(knob.value()).toBe(80);
    expect(input.value).toBe('80');
    expect(input.disabled).toBeFalse();

    knob.setDisabledState(true);
    fixture.detectChanges();
    expect(input.disabled).toBeTrue();
    expect(input.getAttribute('aria-readonly')).toBe('true');
    knob.setDisabledState(false);
    fixture.detectChanges();
    expect(input.disabled).toBeFalse();
  });
});
