import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PopoverComponent } from './popover.component';
import { OverlayPanelComponent } from '../overlay-panel/overlay-panel.component';

@Component({
  imports: [PopoverComponent],
  template: `<orc-popover
      label="Details"
      [appendTo]="appendTo()"
      [modal]="modal()"
    >
      <button popover-trigger type="button">Details</button>
      <button class="content-action" type="button">Edit</button
      ><input aria-label="Name" /> </orc-popover
    ><button class="outside-target" type="button">Outside</button>`,
})
class Host {
  appendTo = signal<unknown>(undefined);
  modal = signal(false);
}

@Component({
  imports: [PopoverComponent],
  template: `<orc-popover label="Details"
    ><span popover-trigger>Details</span
    ><button disabled autofocus>Unavailable</button
    ><button class="enabled-action">Edit</button></orc-popover
  >`,
})
class TextTriggerHost {}

@Component({
  imports: [PopoverComponent],
  template: `
    <button class="surviving-opener">Open details</button>
    @if (present()) {
      <orc-popover label="Details" [visible]="true">
        <span popover-trigger>Details</span>
        <button class="content-action">Edit</button>
      </orc-popover>
    }
  `,
})
class ConditionalPopoverHost {
  readonly present = signal(false);
}

describe('Popover trigger, attachment and lifecycle', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    TestBed.tick();
    const component = fixture.debugElement.query(By.directive(PopoverComponent))
      .componentInstance as PopoverComponent;
    const trigger = fixture.nativeElement.querySelector(
      '[popover-trigger]',
    ) as HTMLButtonElement;
    const panel = component.panel()!.nativeElement;
    trigger.focus();
    return { fixture, component, trigger, panel };
  }

  it('uses one implementation and places trigger semantics on the projected native button', () => {
    const { fixture, component, trigger, panel } = setup();
    expect(component instanceof OverlayPanelComponent).toBeTrue();
    expect(trigger.parentElement?.getAttribute('role')).toBeNull();
    expect(trigger.parentElement?.hasAttribute('tabindex')).toBeFalse();
    trigger.click();
    fixture.detectChanges();
    TestBed.tick();
    expect(component.open()).toBeTrue();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
    expect(document.activeElement).toBe(panel.querySelector('button'));
    panel.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(component.open()).toBeFalse();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('keeps body-attached content open and dismisses outside interactions with stopped bubbling', () => {
    const { fixture, component, trigger, panel } = setup();
    fixture.componentInstance.appendTo.set('body');
    trigger.click();
    fixture.detectChanges();
    TestBed.tick();
    expect(panel.parentElement).toBe(document.body);
    panel.querySelector('button')!.click();
    fixture.detectChanges();
    TestBed.tick();
    expect(component.open()).toBeTrue();
    const outside: HTMLButtonElement =
      fixture.nativeElement.querySelector('.outside-target');
    outside.addEventListener('click', (event) => event.stopPropagation());
    outside.focus();
    outside.click();
    fixture.detectChanges();
    TestBed.tick();
    expect(component.open()).toBeFalse();
    expect(document.activeElement).toBe(outside);
    expect(panel.parentElement).not.toBe(document.body);
  });

  it('supports controlled visible and open updates and names a header-only dialog', () => {
    const fixture = TestBed.createComponent(PopoverComponent);
    fixture.componentRef.setInput('header', 'Invoice details');
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    TestBed.tick();
    const panel = fixture.componentInstance.panel()!.nativeElement;
    expect(fixture.componentInstance.open()).toBeTrue();
    expect(panel.getAttribute('aria-labelledby')).toBe(
      panel.querySelector('header span')!.id,
    );
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    TestBed.tick();
    expect(fixture.componentInstance.visible()).toBeFalse();
    expect(panel.inert).toBeTrue();
  });

  it('generates independent panel IDs and dismisses only the top overlay', () => {
    const lower = setup();
    lower.trigger.click();
    lower.fixture.detectChanges();
    TestBed.tick();
    const upper = setup();
    document.body.append(lower.fixture.nativeElement);
    upper.trigger.click();
    // The outside click changed the other root too. Render both fixtures in
    // their Angular zone before flushing application-wide render callbacks.
    upper.fixture.detectChanges();
    lower.fixture.detectChanges();
    TestBed.tick();
    expect(lower.panel.id).not.toBe(upper.panel.id);
    expect(lower.component.open()).toBeFalse(); // Opening an unrelated trigger dismisses its predecessor.
    lower.component.show();
    lower.fixture.detectChanges();
    TestBed.tick();
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    lower.fixture.detectChanges();
    TestBed.tick();
    upper.fixture.detectChanges();
    TestBed.tick();
    expect(lower.component.open()).toBeFalse();
    expect(upper.component.open()).toBeTrue();
    upper.fixture.destroy();
    lower.fixture.destroy();
  });

  it('traps modal focus and releases scroll and detached nodes on destruction', () => {
    const before = document.body.style.overflow;
    const { fixture, trigger, panel } = setup();
    fixture.componentInstance.appendTo.set('body');
    fixture.componentInstance.modal.set(true);
    trigger.click();
    fixture.detectChanges();
    TestBed.tick();
    const last = panel.querySelector('input')!;
    last.focus();
    const tab = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    last.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(panel.querySelector('button'));
    expect(document.body.style.overflow).toBe('hidden');
    fixture.destroy();
    expect(panel.isConnected).toBeFalse();
    expect(document.body.style.overflow).toBe(before);
    expect(() =>
      document.dispatchEvent(new MouseEvent('click', { bubbles: true })),
    ).not.toThrow();
  });

  it('returns focus to its opener when an open Popover is destroyed with its parent view', () => {
    const fixture = TestBed.createComponent(ConditionalPopoverHost);
    fixture.detectChanges();
    TestBed.tick();
    const opener = fixture.nativeElement.querySelector(
      '.surviving-opener',
    ) as HTMLButtonElement;
    opener.focus();

    fixture.componentInstance.present.set(true);
    fixture.detectChanges();
    TestBed.tick();
    const popover = fixture.debugElement.query(By.directive(PopoverComponent))
      .componentInstance as PopoverComponent;
    expect(popover.open()).toBeTrue();
    expect(
      popover.panel()!.nativeElement.contains(document.activeElement),
    ).toBeTrue();

    fixture.componentInstance.present.set(false);
    fixture.detectChanges();
    TestBed.tick();

    expect(document.activeElement).toBe(opener);
    fixture.destroy();
  });

  it('anchors a programmatically opened popover and repositions it on scroll', () => {
    const { fixture, component, trigger, panel } = setup();
    fixture.componentInstance.appendTo.set('body');
    let top = 100;
    spyOn(trigger, 'getBoundingClientRect').and.callFake(() => ({
      left: 100,
      right: 180,
      top,
      bottom: top + 30,
      width: 80,
      height: 30,
      x: 100,
      y: top,
      toJSON: () => ({}),
    }));
    component.show(undefined, trigger);
    fixture.detectChanges();
    TestBed.tick();
    const initial = panel.style.top;
    top = 160;
    trigger.dispatchEvent(new Event('scroll'));
    expect(panel.style.top).not.toBe(initial);
    expect(panel.style.position).toBe('fixed');
  });

  it('restores controlled attributes on a surviving projected trigger during destruction', () => {
    const { fixture, trigger } = setup();
    trigger.click();
    fixture.detectChanges();
    TestBed.tick();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    fixture.destroy();
    expect(trigger.hasAttribute('aria-expanded')).toBeFalse();
    expect(trigger.hasAttribute('aria-haspopup')).toBeFalse();
  });
  it('supports a non-interactive projected trigger and skips disabled autofocus content', () => {
    const fixture = TestBed.createComponent(TextTriggerHost);
    fixture.detectChanges();
    TestBed.tick();
    const trigger: HTMLElement = fixture.nativeElement.querySelector(
      '.orc-popover__trigger',
    );
    expect(trigger.getAttribute('role')).toBe('button');
    expect(trigger.tabIndex).toBe(0);
    trigger.focus();
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(document.activeElement).toBe(
      fixture.nativeElement.querySelector('.enabled-action'),
    );
  });

  it('honors outside/Escape flags, close-button labels and an explicit zero z-index', () => {
    const fixture = TestBed.createComponent(PopoverComponent);
    fixture.componentRef.setInput('dismissable', false);
    fixture.componentRef.setInput('closeOnEscape', false);
    fixture.componentRef.setInput('closable', true);
    fixture.componentRef.setInput('ariaCloseLabel', 'Close details');
    fixture.componentRef.setInput('autoZIndex', false);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    TestBed.tick();
    const panel = fixture.componentInstance.panel()!.nativeElement;
    document.body.click();
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(fixture.componentInstance.open()).toBeTrue();
    expect(panel.style.zIndex).toBe('0');
    const close = panel.querySelector('button')!;
    expect(close.getAttribute('aria-label')).toBe('Close details');
    close.click();
    fixture.detectChanges();
    TestBed.tick();
    expect(fixture.componentInstance.open()).toBeFalse();
  });
});
