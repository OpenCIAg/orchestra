import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AccordionComponent } from './accordion.component';
import { AccordionItemComponent } from './accordion-item.component';

@Component({
  imports: [AccordionComponent, AccordionItemComponent],
  template: `<orc-accordion
    [value]="value()"
    [activeIndex]="active()"
    [multiple]="multiple()"
    styleClass="consumer-accordion"
    [style]="{ outlineColor: 'rgb(1, 2, 3)' }"
    transitionOptions="400ms ease"
    expandIcon="pi pi-plus"
    collapseIcon="pi pi-minus"
  >
    <orc-accordion-item
      header="First"
      value="first"
      headerStyleClass="consumer-header"
      contentStyleClass="consumer-content"
      icon="pi pi-star"
      iconPos="start"
      >One</orc-accordion-item
    >
    <orc-accordion-item header="Second" [value]="42">Two</orc-accordion-item>
    <orc-accordion-item header="Disabled" value="disabled" [disabled]="true"
      >Three</orc-accordion-item
    >
  </orc-accordion>`,
})
class Host {
  value = signal<string | number | (string | number)[]>('first');
  active = signal<number | number[] | null>(0);
  multiple = signal(false);
}

describe('Accordion controlled selection', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const items = fixture.debugElement
      .queryAll(By.directive(AccordionItemComponent))
      .map((el) => el.componentInstance as AccordionItemComponent);
    const accordion = fixture.debugElement.query(
      By.directive(AccordionComponent),
    ).componentInstance as AccordionComponent;
    return {
      fixture,
      items,
      accordion,
      states: () => items.map((item) => item.expanded()),
    };
  }

  it('uses configured string and numeric values and emits the configured value after clicks', () => {
    const { fixture, items, accordion, states } = setup();
    expect(states()).toEqual([true, false, false]);
    fixture.componentInstance.value.set(42);
    fixture.detectChanges();
    expect(states()).toEqual([false, true, false]);
    items[0].headerButton()!.nativeElement.click();
    fixture.detectChanges();
    expect(accordion.value()).toBe('first');
    expect(states()).toEqual([true, false, false]);
  });

  it('accepts activeIndex updates after value updates and can close every panel', () => {
    const { fixture, states } = setup();
    fixture.componentInstance.active.set(1);
    fixture.detectChanges();
    expect(states()).toEqual([false, true, false]);
    fixture.componentInstance.active.set(null);
    fixture.detectChanges();
    expect(states()).toEqual([false, false, false]);
    fixture.componentInstance.value.set(42);
    fixture.detectChanges();
    expect(states()).toEqual([false, true, false]);
  });

  it('supports mixed values in multiple mode, excludes disabled panels and enforces single mode', () => {
    const { fixture, states } = setup();
    fixture.componentInstance.multiple.set(true);
    fixture.componentInstance.value.set(['first', 42, 'disabled']);
    fixture.detectChanges();
    expect(states()).toEqual([true, true, false]);
    fixture.componentInstance.multiple.set(false);
    fixture.detectChanges();
    expect(states()).toEqual([true, false, false]);
  });

  it('keeps collapsed panels out of the accessibility tree and applies item presentation inputs', () => {
    const { fixture } = setup();
    const host = fixture.nativeElement as HTMLElement;
    const headers = Array.from(
      host.querySelectorAll<HTMLButtonElement>('.orc-accordion-item__header'),
    );
    const headings = Array.from(
      host.querySelectorAll<HTMLElement>('.orc-accordion-item__heading'),
    );
    const panels = Array.from(
      host.querySelectorAll<HTMLElement>('.orc-accordion-item__collapse'),
    );
    const accordion = host.querySelector<HTMLElement>('.orc-accordion')!;

    expect(accordion.classList.contains('consumer-accordion')).toBe(true);
    expect(accordion.style.outlineColor).toBe('rgb(1, 2, 3)');
    expect(accordion.style.getPropertyValue('--orc-accordion-transition')).toBe(
      '400ms ease',
    );
    expect(headings[0].getAttribute('role')).toBe('heading');
    expect(headings[0].getAttribute('aria-level')).toBe('2');
    expect(headers[0].hasAttribute('aria-level')).toBe(false);
    expect(headers[0].getAttribute('aria-expanded')).toBe('true');
    expect(headers[0].getAttribute('aria-controls')).toBe(panels[0].id);
    expect(panels[0].getAttribute('aria-labelledby')).toBe(headers[0].id);
    expect(panels[0].hidden).toBe(false);
    expect(panels[0].getAttribute('aria-hidden')).toBeNull();

    expect(headers[1].getAttribute('aria-expanded')).toBe('false');
    expect(panels[1].hidden).toBe(true);
    expect(panels[1].getAttribute('aria-hidden')).toBe('true');
    expect(getComputedStyle(panels[1]).display).toBe('none');

    expect(headers[0].classList.contains('consumer-header')).toBe(true);
    expect(host.querySelector('.consumer-content')).not.toBeNull();
    expect(headers[0].querySelector('.pi.pi-star')).not.toBeNull();
    expect(
      headers[0]
        .querySelector('.orc-accordion-item__icon')
        ?.nextElementSibling?.classList.contains(
          'orc-accordion-item__header-content',
        ),
    ).toBe(true);
    expect(headers[0].querySelector('.pi.pi-minus')).not.toBeNull();
    expect(headers[1].querySelector('.pi.pi-plus')).not.toBeNull();

    headers[1].click();
    fixture.detectChanges();

    expect(panels[0].hidden).toBe(true);
    expect(panels[0].getAttribute('aria-hidden')).toBe('true');
    expect(getComputedStyle(panels[0]).display).toBe('none');
    expect(panels[1].hidden).toBe(false);
    expect(panels[1].getAttribute('aria-hidden')).toBeNull();
    expect(getComputedStyle(panels[1]).display).toBe('grid');
  });
});
