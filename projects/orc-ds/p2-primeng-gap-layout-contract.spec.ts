import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FieldsetComponent,
  FloatLabelComponent,
  PanelComponent,
} from './p2/p2-primeng-gap-components';

@Component({
  standalone: true,
  imports: [PanelComponent],
  template: `
    <orc-panel [toggleable]="true" header="Details">
      <input aria-label="Panel field" />
    </orc-panel>
  `,
})
class PanelHost {}

@Component({
  standalone: true,
  imports: [FieldsetComponent],
  template: `
    <orc-fieldset [toggleable]="true" legend="Details">
      <input aria-label="Fieldset field" />
    </orc-fieldset>
  `,
})
class FieldsetHost {}

@Component({
  standalone: true,
  imports: [FloatLabelComponent],
  template: `
    <orc-float-label variant="over">
      <input aria-label="Over" placeholder=" " />
      <label>Over</label>
    </orc-float-label>
    <orc-float-label variant="in">
      <input aria-label="In" placeholder=" " />
      <label>In</label>
    </orc-float-label>
    <orc-float-label variant="on">
      <input aria-label="On" placeholder=" " />
      <label>On</label>
    </orc-float-label>
    <orc-float-label variant="over">
      <input aria-label="Empty without placeholder" />
      <label>Empty without placeholder</label>
    </orc-float-label>
  `,
})
class FloatLabelHost {}

@Component({
  standalone: true,
  imports: [FloatLabelComponent],
  template: `
    <orc-float-label variant="over">
      <input aria-label="Initial value" [value]="initialValue" />
      <label>Initial value</label>
    </orc-float-label>
  `,
})
class InitialFloatLabelHost {
  initialValue = 'from reactive form';
}

describe('P2 PrimeNG gap layout contracts', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [PanelComponent, FieldsetComponent, FloatLabelComponent],
    }),
  );

  it('keeps the Panel header mouse-toggleable while exposing one native keyboard control', () => {
    const fixture = TestBed.createComponent(PanelHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const header = root.querySelector('.orc-p2-panel__header') as HTMLElement;
    const toggle = root.querySelector(
      '.orc-p2-panel__toggle',
    ) as HTMLButtonElement;

    expect(header.hasAttribute('role')).toBeFalse();
    expect(header.hasAttribute('tabindex')).toBeFalse();
    expect(header.hasAttribute('aria-expanded')).toBeFalse();
    expect(header.hasAttribute('aria-controls')).toBeFalse();
    expect(toggle.getAttribute('aria-label')).toBe('Collapse panel');
    expect(toggle.tabIndex).toBe(0);

    header.click();
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(root.querySelector('.orc-p2-panel__content')).toBeNull();
    expect(
      root.querySelector('.orc-p2-panel__toggle')?.getAttribute('aria-label'),
    ).toBe('Expand panel');
  });

  it('only presents a pointer cursor when Panel toggling is enabled', () => {
    const fixture = TestBed.createComponent(PanelComponent);
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector(
      '.orc-p2-panel__header',
    ) as HTMLElement;
    expect(getComputedStyle(header).cursor).toBe('default');

    fixture.componentRef.setInput('toggleable', true);
    fixture.detectChanges();
    expect(getComputedStyle(header).cursor).toBe('pointer');
  });

  it('keeps FloatLabel and Fieldset spacing aligned with the document direction', () => {
    const ltrFloat = TestBed.createComponent(FloatLabelHost);
    ltrFloat.detectChanges();
    const ltrLabel = ltrFloat.nativeElement.querySelector(
      '.orc-p2-float-label label',
    ) as HTMLLabelElement;
    expect(getComputedStyle(ltrLabel).insetInlineStart).toBe('12px');
    expect(getComputedStyle(ltrLabel).left).toBe('12px');

    const rtlFloat = TestBed.createComponent(FloatLabelHost);
    rtlFloat.nativeElement.setAttribute('dir', 'rtl');
    rtlFloat.detectChanges();
    const rtlLabel = rtlFloat.nativeElement.querySelector(
      '.orc-p2-float-label label',
    ) as HTMLLabelElement;
    expect(getComputedStyle(rtlLabel).insetInlineStart).toBe('12px');
    expect(getComputedStyle(rtlLabel).right).toBe('12px');

    const ltrFieldset = TestBed.createComponent(FieldsetHost);
    ltrFieldset.detectChanges();
    const ltrToggle = ltrFieldset.nativeElement.querySelector(
      'legend button',
    ) as HTMLButtonElement;
    expect(getComputedStyle(ltrToggle).marginInlineStart).toBe('8px');
    expect(getComputedStyle(ltrToggle).marginLeft).toBe('8px');

    const rtlFieldset = TestBed.createComponent(FieldsetHost);
    rtlFieldset.nativeElement.setAttribute('dir', 'rtl');
    rtlFieldset.detectChanges();
    const rtlToggle = rtlFieldset.nativeElement.querySelector(
      'legend button',
    ) as HTMLButtonElement;
    expect(getComputedStyle(rtlToggle).marginInlineStart).toBe('8px');
    expect(getComputedStyle(rtlToggle).marginRight).toBe('8px');
  });

  it('uses the native Fieldset legend as its accessible name and supplies a labeled toggle', () => {
    const fixture = TestBed.createComponent(FieldsetHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const fieldset = root.querySelector('fieldset') as HTMLFieldSetElement;
    const legend = root.querySelector('legend') as HTMLLegendElement;
    const button = root.querySelector('legend button') as HTMLButtonElement;
    const content = root.querySelector('.content') as HTMLElement;

    expect(fieldset.getAttribute('aria-labelledby')).toBe(legend.id);
    expect(fieldset.hasAttribute('aria-label')).toBeFalse();
    expect(button.getAttribute('aria-label')).toBe('Collapse fieldset');
    expect(button.getAttribute('aria-controls')).toBe(content.id);

    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(root.querySelector('.content')).toBeNull();
    expect(button.getAttribute('aria-label')).toBe('Expand fieldset');
  });

  it('applies distinct FloatLabel variants and floats the over label on focus', async () => {
    const fixture = TestBed.createComponent(FloatLabelHost);
    fixture.detectChanges();
    const roots = Array.from(
      fixture.nativeElement.querySelectorAll('.orc-p2-float-label'),
    ) as HTMLElement[];

    expect(roots.map((root) => root.className)).toEqual([
      jasmine.stringMatching('variant-over'),
      jasmine.stringMatching('variant-in'),
      jasmine.stringMatching('variant-on'),
      jasmine.stringMatching('variant-over'),
    ]);
    const [over, inside, on, empty] = roots;
    const overLabel = over.querySelector('label') as HTMLLabelElement;
    const insideLabel = inside.querySelector('label') as HTMLLabelElement;
    const onLabel = on.querySelector('label') as HTMLLabelElement;
    const emptyLabel = empty.querySelector('label') as HTMLLabelElement;
    expect(getComputedStyle(overLabel).top).not.toBe('auto');
    expect(getComputedStyle(insideLabel).top).not.toBe(
      getComputedStyle(overLabel).top,
    );
    expect(getComputedStyle(onLabel).top).not.toBe(
      getComputedStyle(overLabel).top,
    );
    expect(getComputedStyle(emptyLabel).top).toBe(
      getComputedStyle(overLabel).top,
    );

    (over.querySelector('input') as HTMLInputElement).focus();
    fixture.detectChanges();
    expect(document.activeElement).toBe(over.querySelector('input'));
    expect(over.classList.contains('focused')).toBeTrue();
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(getComputedStyle(overLabel).fontSize).toBe('12px');
    expect(getComputedStyle(overLabel).top).toBe('0px');

    const emptyInput = empty.querySelector('input') as HTMLInputElement;
    emptyInput.value = 'filled';
    emptyInput.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(empty.classList.contains('filled')).toBeTrue();
    expect(getComputedStyle(emptyLabel).top).toBe('0px');
  });

  it('floats an initially nonempty projected control without a placeholder', async () => {
    const fixture = TestBed.createComponent(InitialFloatLabelHost);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(
      '.orc-p2-float-label',
    ) as HTMLElement;
    const label = root.querySelector('label') as HTMLLabelElement;

    expect((root.querySelector('input') as HTMLInputElement).value).toBe(
      'from reactive form',
    );
    expect(root.classList.contains('filled')).toBeTrue();
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(getComputedStyle(label).top).toBe('0px');
  });
});
