import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FieldsetComponent } from '@ciag/orchestra/fieldset';
import { PanelComponent } from '@ciag/orchestra/panel';

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

describe('P2 PrimeNG gap layout contracts', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [PanelComponent, FieldsetComponent],
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

  it('keeps Fieldset spacing aligned with the document direction', () => {
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
});
