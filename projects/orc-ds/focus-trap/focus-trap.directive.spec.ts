import { Component } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FocusTrapDirective } from '../p2/p2-utility-more';

@Component({
  standalone: true,
  imports: [FocusTrapDirective],
  template: `
    <div
      class="trap"
      orcFocusTrap
      [autoFocus]="autoFocus"
      [disabled]="disabled"
    >
      <button id="first">First</button>
    </div>
  `,
})
class FocusTrapHost {
  autoFocus = false;
  disabled = false;
}

function createTrap(markup = ''): {
  host: HTMLElement;
  directive: FocusTrapDirective;
} {
  const host = document.createElement('div');
  host.innerHTML = markup;
  document.body.append(host);
  const directive = TestBed.runInInjectionContext(
    () => new FocusTrapDirective(new ElementRef(host)),
  );
  return { host, directive };
}

function tabEvent(ownerDocument: Document, shiftKey = false): KeyboardEvent {
  return new ownerDocument.defaultView!.KeyboardEvent('keydown', {
    key: 'Tab',
    bubbles: true,
    cancelable: true,
    shiftKey,
  });
}

describe('FocusTrapDirective', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FocusTrapHost],
    }).compileComponents();
  });

  it('autofocuses the first available control', async () => {
    const fixture: ComponentFixture<FocusTrapHost> =
      TestBed.createComponent(FocusTrapHost);
    fixture.componentInstance.autoFocus = true;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement?.id).toBe('first');
    fixture.destroy();
  });

  it('wraps only across enabled, visible, non-inert descendants', () => {
    const { host, directive } = createTrap(`
      <button id="first">First</button>
      <button id="disabled" disabled>Disabled</button>
      <button id="aria-disabled" aria-disabled="true">Aria disabled</button>
      <button id="hidden" hidden>Hidden</button>
      <div inert><button id="inert">Inert</button></div>
      <button id="last">Last</button>
    `);
    const first = host.querySelector('#first') as HTMLElement;
    const last = host.querySelector('#last') as HTMLElement;
    first.focus();
    const backward = tabEvent(document, true);
    directive.onKeydown(backward);
    expect(backward.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(last);
    const forward = tabEvent(document);
    directive.onKeydown(forward);
    expect(forward.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(first);
    directive.ngOnDestroy();
    host.remove();
  });

  it('focuses an empty host, moves into dynamically added controls, and restores tabindex on teardown', () => {
    const { host, directive } = createTrap();
    const emptyTab = tabEvent(document);
    directive.onKeydown(emptyTab);
    expect(emptyTab.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(host);
    expect(host.getAttribute('tabindex')).toBe('-1');

    host.innerHTML = '<button id="dynamic">Dynamic</button>';
    const dynamic = host.querySelector('#dynamic') as HTMLElement;
    const dynamicTab = tabEvent(document);
    directive.onKeydown(dynamicTab);
    expect(dynamicTab.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(dynamic);

    directive.ngOnDestroy();
    expect(host.hasAttribute('tabindex')).toBeFalse();
    host.remove();
  });

  it('does not autofocus or intercept Tab while disabled', async () => {
    const outside = document.createElement('button');
    document.body.append(outside);
    outside.focus();
    const fixture = TestBed.createComponent(FocusTrapHost);
    fixture.componentInstance.autoFocus = true;
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(outside);
    const trap = fixture.nativeElement.querySelector('.trap') as HTMLElement;
    const first = trap.querySelector('#first') as HTMLElement;
    first.focus();
    const event = tabEvent(document);
    const directive = fixture.debugElement
      .query((element) => element.nativeElement === trap)
      .injector.get(FocusTrapDirective);
    directive.onKeydown(event);
    expect(event.defaultPrevented).toBeFalse();
    fixture.destroy();
    outside.remove();
  });

  it('uses the owner document and remains safe when destroyed before autofocus runs', async () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const ownerDocument = frame.contentDocument!;
    const { host, directive } = createTrap('<button id="first">First</button>');
    ownerDocument.body.append(host);
    const first = host.querySelector('#first') as HTMLElement;
    const last = first;
    last.focus();
    const event = tabEvent(ownerDocument, true);
    directive.onKeydown(event);
    expect(event.defaultPrevented).toBeTrue();
    expect(ownerDocument.activeElement).toBe(first);
    directive.ngOnDestroy();
    host.remove();
    frame.remove();

    const fixture = TestBed.createComponent(FocusTrapHost);
    fixture.componentInstance.autoFocus = true;
    fixture.detectChanges();
    fixture.destroy();
    await new Promise<void>((resolve) => queueMicrotask(resolve));
  });
});
