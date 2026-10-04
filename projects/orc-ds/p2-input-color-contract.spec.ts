import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputColorComponent } from './p2/p2-input-more';

@Component({
  standalone: true,
  imports: [InputColorComponent, ReactiveFormsModule],
  template: `<orc-input-color
    [formControl]="control"
    ariaLabel="Theme color"
  />`,
})
class InputColorFormHost {
  readonly control = new FormControl<string | null>('#112233');
}

describe('InputColorComponent contract', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [InputColorFormHost] }),
  );

  it('normalizes supported hex text and ignores invalid values', () => {
    const fixture = TestBed.createComponent(InputColorComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const changes: string[] = [];
    component.valueChangeEvent.subscribe((value) => changes.push(value));
    const text = fixture.nativeElement.querySelector(
      'input.text',
    ) as HTMLInputElement;

    text.value = ' #AbC ';
    text.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(component.value()).toBe('#aabbcc');

    text.value = 'hsl(20 50% 40%)';
    text.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(component.value()).toBe('#aabbcc');
    expect(changes).toEqual(['#aabbcc']);
  });

  it('coerces disabled input, exposes distinct names, and ignores interaction while disabled', () => {
    const fixture = TestBed.createComponent(InputColorComponent);
    fixture.componentRef.setInput('ariaLabel', 'Accent');
    fixture.componentRef.setInput('disabled', 'true');
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const color = root.querySelector('input[type="color"]') as HTMLInputElement;
    const text = root.querySelector('input.text') as HTMLInputElement;
    expect(color.disabled).toBeTrue();
    expect(text.disabled).toBeTrue();
    expect(color.getAttribute('aria-label')).toBe('Accent picker');
    expect(text.getAttribute('aria-label')).toBe('Accent value');

    text.value = '#ffffff';
    text.dispatchEvent(new Event('input', { bubbles: true }));
    expect(fixture.componentInstance.value()).toBe('#3b82f6');
  });

  it('integrates with ControlValueAccessor for write, change, touch, and disabled state', () => {
    const fixture = TestBed.createComponent(InputColorFormHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const text = root.querySelector('input.text') as HTMLInputElement;
    expect(text.getAttribute('aria-label')).toBe('Theme color value');
    expect(text.value).toBe('#112233');

    text.value = '#445566';
    text.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('#445566');

    const color = root.querySelector('input[type="color"]') as HTMLInputElement;
    color.focus();
    text.focus();
    expect(fixture.componentInstance.control.touched).toBeFalse();
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();
    expect(fixture.componentInstance.control.touched).toBeTrue();
    outside.remove();

    fixture.componentInstance.control.setValue('#abcdef');
    fixture.detectChanges();
    expect(text.value).toBe('#abcdef');
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(text.disabled).toBeTrue();
    expect(
      (root.querySelector('input[type="color"]') as HTMLInputElement).disabled,
    ).toBeTrue();
  });

  it('uses one canonical display when a form writes null or an invalid color', () => {
    const fixture = TestBed.createComponent(InputColorFormHost);
    fixture.detectChanges();
    fixture.componentInstance.control.setValue(null);
    fixture.detectChanges();
    let root = fixture.nativeElement as HTMLElement;
    expect(
      (root.querySelector('input[type="color"]') as HTMLInputElement).value,
    ).toBe('#3b82f6');
    expect((root.querySelector('input.text') as HTMLInputElement).value).toBe(
      '#3b82f6',
    );

    fixture.componentInstance.control.setValue('rgb(0 0 0)');
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
    expect(
      (root.querySelector('input[type="color"]') as HTMLInputElement).value,
    ).toBe('#3b82f6');
    expect((root.querySelector('input.text') as HTMLInputElement).value).toBe(
      '#3b82f6',
    );
  });
});
