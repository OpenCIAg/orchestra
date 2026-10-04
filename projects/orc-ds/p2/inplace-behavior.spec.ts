import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { InplaceComponent } from './p2-inplace-component';
import { InplaceComponent as LegacyInplaceComponent } from './p2-input-gap-components';

@Component({
  standalone: true,
  imports: [InplaceComponent],
  template: `
    <button id="outside">Outside</button>
    <orc-inplace
      [active]="active()"
      (activeChange)="active.set($event)"
      [closable]="closable()"
      [disabled]="disabled()"
      [preventClick]="preventClick()"
      [label]="label()"
      [closeLabel]="closeLabel()"
      [styleClass]="styleClass()"
      (activated)="recordActivation()"
      (deactivated)="recordDeactivation()"
      (onActivate)="activateEvents.push($event)"
      (onDeactivate)="deactivateEvents.push($event)"
    >
      <span orcInplaceDisplay>Current customer</span>
      <label orcInplaceContent for="customer-name">Customer name</label>
      <input orcInplaceContent id="customer-name" value="Acme" />
    </orc-inplace>
  `,
})
class InplaceHost {
  readonly active = signal(false);
  readonly closable = signal(true);
  readonly disabled = signal(false);
  readonly preventClick = signal(false);
  readonly label = signal<string | undefined>('Edit customer');
  readonly closeLabel = signal<string | undefined>(undefined);
  readonly styleClass = signal('consumer-inplace');
  activatedCount = 0;
  deactivatedCount = 0;
  readonly activateEvents: Event[] = [];
  readonly deactivateEvents: Event[] = [];

  recordActivation(): void {
    this.activatedCount += 1;
  }

  recordDeactivation(): void {
    this.deactivatedCount += 1;
  }
}

@Component({
  standalone: true,
  imports: [InplaceComponent],
  template: `<orc-inplace label="Edit customer" />`,
})
class InplaceLabelFallbackHost {}

describe('InplaceComponent behavior', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [InplaceHost],
    }),
  );

  function createFixture() {
    const fixture = TestBed.createComponent(InplaceHost);
    fixture.detectChanges();
    return fixture;
  }

  function getInplace(
    fixture: ReturnType<typeof createFixture>,
  ): InplaceComponent {
    return fixture.debugElement.query(By.directive(InplaceComponent))
      .componentInstance;
  }

  it('projects display and edit content, applies styleClass in both states, and emits each pointer transition once', () => {
    const fixture = createFixture();
    const host = fixture.componentInstance;
    let display = fixture.nativeElement.querySelector(
      '.display',
    ) as HTMLButtonElement;
    expect(display.textContent).toContain('Current customer');
    expect(display.textContent.trim()).toBe('Current customer');
    expect(display.getAttribute('aria-label')).toBe('Edit customer');
    expect(display.classList.contains('consumer-inplace')).toBeTrue();

    const activateEvent = new MouseEvent('click', { bubbles: true });
    display.dispatchEvent(activateEvent);
    // A second call during the same rendered state is a redundant transition.
    getInplace(fixture).activate(new MouseEvent('click'));
    fixture.detectChanges();

    expect(host.active()).toBeTrue();
    expect(host.activatedCount).toBe(1);
    expect(host.activateEvents).toEqual([activateEvent]);
    const content = fixture.nativeElement.querySelector(
      '.content',
    ) as HTMLElement;
    expect(content.classList.contains('consumer-inplace')).toBeTrue();
    expect(content.getAttribute('aria-label')).toBe('Edit customer');
    expect(fixture.nativeElement.querySelector('label')?.textContent).toContain(
      'Customer name',
    );
    expect(document.activeElement).toBe(
      fixture.nativeElement.querySelector('#customer-name'),
    );

    let close = fixture.nativeElement.querySelector(
      '.close',
    ) as HTMLButtonElement;
    expect(close.getAttribute('aria-label')).toBe('Close');
    host.closeLabel.set('Cancel editing');
    fixture.detectChanges();
    close = fixture.nativeElement.querySelector('.close') as HTMLButtonElement;
    expect(close.getAttribute('aria-label')).toBe('Cancel editing');

    const deactivateEvent = new MouseEvent('click', { bubbles: true });
    close.dispatchEvent(deactivateEvent);
    getInplace(fixture).deactivate(new MouseEvent('click'));
    fixture.detectChanges();

    display = fixture.nativeElement.querySelector(
      '.display',
    ) as HTMLButtonElement;
    expect(host.active()).toBeFalse();
    expect(host.deactivatedCount).toBe(1);
    expect(host.deactivateEvents).toEqual([deactivateEvent]);
    expect(document.activeElement).toBe(display);
  });

  it('uses label as display fallback when no display content is projected', () => {
    const fixture = TestBed.createComponent(InplaceLabelFallbackHost);
    fixture.detectChanges();

    const display = fixture.nativeElement.querySelector(
      '.display',
    ) as HTMLButtonElement;
    expect(display.textContent.trim()).toBe('Edit customer');
    expect(display.getAttribute('aria-label')).toBe('Edit customer');
  });

  it('activates from Enter and Space, exits on Escape, and restores focus to display', () => {
    const fixture = createFixture();
    const host = fixture.componentInstance;
    let display = fixture.nativeElement.querySelector(
      '.display',
    ) as HTMLButtonElement;

    const enter = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    display.dispatchEvent(enter);
    fixture.detectChanges();

    expect(enter.defaultPrevented).toBeTrue();
    expect(host.active()).toBeTrue();
    expect(host.activateEvents).toEqual([enter]);
    const input = fixture.nativeElement.querySelector(
      '#customer-name',
    ) as HTMLInputElement;
    expect(document.activeElement).toBe(input);

    const escape = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(escape);
    fixture.detectChanges();

    display = fixture.nativeElement.querySelector(
      '.display',
    ) as HTMLButtonElement;
    expect(escape.defaultPrevented).toBeTrue();
    expect(host.active()).toBeFalse();
    expect(host.deactivateEvents).toEqual([escape]);
    expect(document.activeElement).toBe(display);

    const spaceDown = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    display.dispatchEvent(spaceDown);
    expect(spaceDown.defaultPrevented).toBeTrue();
    expect(host.active()).toBeFalse();

    const spaceUp = new KeyboardEvent('keyup', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    display.dispatchEvent(spaceUp);
    fixture.detectChanges();
    expect(spaceUp.defaultPrevented).toBeTrue();
    expect(host.active()).toBeTrue();
    expect(host.activatedCount).toBe(2);
    expect(host.activateEvents[1]).toBe(spaceUp);
  });

  it('keeps edit mode active while Escape is canceling IME composition', () => {
    const fixture = createFixture();
    const host = fixture.componentInstance;
    const display = fixture.nativeElement.querySelector(
      '.display',
    ) as HTMLButtonElement;
    display.click();
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      '#customer-name',
    ) as HTMLInputElement;
    const component = getInplace(fixture);
    const deactivated = spyOn(component.deactivated, 'emit').and.callThrough();

    const composingEscape = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
      isComposing: true,
    });
    input.dispatchEvent(composingEscape);
    fixture.detectChanges();

    const legacyComposingEscape = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(legacyComposingEscape, 'keyCode', { value: 229 });
    input.dispatchEvent(legacyComposingEscape);
    fixture.detectChanges();

    expect(host.active()).toBeTrue();
    expect(composingEscape.defaultPrevented).toBeFalse();
    expect(legacyComposingEscape.defaultPrevented).toBeFalse();
    expect(document.activeElement).toBe(input);
    expect(deactivated).not.toHaveBeenCalled();

    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(host.active()).toBeFalse();
    expect(deactivated).toHaveBeenCalledOnceWith();
  });

  it('syncs externally controlled active changes and emits no synthetic DOM event payloads', () => {
    const fixture = createFixture();
    const host = fixture.componentInstance;

    host.active.set(true);
    fixture.detectChanges();
    expect(host.activatedCount).toBe(1);
    expect(host.activateEvents).toEqual([]);
    expect(
      fixture.nativeElement.querySelector('#customer-name'),
    ).not.toBeNull();
    expect(document.activeElement).toBe(
      fixture.nativeElement.querySelector('#customer-name'),
    );

    host.active.set(false);
    fixture.detectChanges();
    expect(host.deactivatedCount).toBe(1);
    expect(host.deactivateEvents).toEqual([]);
    expect(document.activeElement).toBe(
      fixture.nativeElement.querySelector('.display'),
    );
  });

  it('renders an initially active model without reporting initialization as a user transition', () => {
    const fixture = TestBed.createComponent(InplaceHost);
    const host = fixture.componentInstance;
    host.active.set(true);
    fixture.detectChanges();

    expect(host.activatedCount).toBe(0);
    expect(host.deactivatedCount).toBe(0);
    expect(fixture.nativeElement.querySelector('.content')).not.toBeNull();
    expect(document.activeElement).toBe(
      fixture.nativeElement.querySelector('#customer-name'),
    );
  });

  it('exposes disabled and preventClick affordances and leaves focus untouched when activation is blocked', () => {
    const fixture = createFixture();
    const host = fixture.componentInstance;
    const outside = fixture.nativeElement.querySelector(
      '#outside',
    ) as HTMLButtonElement;
    outside.focus();

    host.disabled.set(true);
    fixture.detectChanges();
    let display = fixture.nativeElement.querySelector(
      '.display',
    ) as HTMLButtonElement;
    expect(display.disabled).toBeTrue();
    display.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    getInplace(fixture).activate(new MouseEvent('click'));
    fixture.detectChanges();
    expect(host.active()).toBeFalse();
    expect(host.activatedCount).toBe(0);
    expect(document.activeElement).toBe(outside);

    host.disabled.set(false);
    host.preventClick.set(true);
    fixture.detectChanges();
    display = fixture.nativeElement.querySelector(
      '.display',
    ) as HTMLButtonElement;
    expect(display.disabled).toBeFalse();
    expect(display.getAttribute('aria-disabled')).toBe('true');
    display.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    display.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(host.active()).toBeFalse();
    expect(host.activatedCount).toBe(0);
    expect(host.activateEvents).toEqual([]);
    expect(document.activeElement).toBe(outside);
  });

  it('keeps the close control available by default and applies disabled state while editing', () => {
    const fixture = createFixture();
    const host = fixture.componentInstance;
    host.active.set(true);
    host.disabled.set(true);
    fixture.detectChanges();

    const close = fixture.nativeElement.querySelector(
      '.close',
    ) as HTMLButtonElement;
    expect(close).not.toBeNull();
    expect(close.disabled).toBeTrue();
    expect(close.getAttribute('aria-label')).toBe('Close');
    close.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(host.active()).toBeTrue();
    expect(host.deactivatedCount).toBe(0);
  });

  it('omits the close control when closable is false and still exits on Escape', () => {
    const fixture = createFixture();
    const host = fixture.componentInstance;
    host.closable.set(false);
    host.active.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.close')).toBeNull();
    const input = fixture.nativeElement.querySelector(
      '#customer-name',
    ) as HTMLInputElement;
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();

    expect(host.active()).toBeFalse();
    expect(host.deactivatedCount).toBe(1);
  });

  it('normalizes whitespace labels and classes while coercing boolean attributes', () => {
    const fixture = TestBed.createComponent(InplaceComponent);
    fixture.componentRef.setInput('label', '   ');
    fixture.componentRef.setInput('closeLabel', '   ');
    fixture.componentRef.setInput('styleClass', ' consumer-inplace ');
    fixture.componentRef.setInput('closable', 'true');
    fixture.componentRef.setInput('disabled', 'false');
    fixture.componentRef.setInput('preventClick', 'false');
    fixture.detectChanges();

    let display = fixture.nativeElement.querySelector(
      '.display',
    ) as HTMLButtonElement;
    expect(display.textContent.trim()).toBe('Edit');
    expect(display.getAttribute('aria-label')).toBeNull();
    expect(display.classList).toContain('consumer-inplace');
    expect(display.disabled).toBeFalse();

    display.click();
    fixture.detectChanges();
    let content = fixture.nativeElement.querySelector(
      '.content',
    ) as HTMLElement;
    let close = fixture.nativeElement.querySelector(
      '.close',
    ) as HTMLButtonElement;
    expect(content.getAttribute('aria-label')).toBe('Edit content');
    expect(content.classList).toContain('consumer-inplace');
    expect(close.getAttribute('aria-label')).toBe('Close');

    fixture.componentRef.setInput('disabled', 'true');
    fixture.detectChanges();
    close = fixture.nativeElement.querySelector('.close') as HTMLButtonElement;
    expect(close.disabled).toBeTrue();
    expect(document.activeElement).toBe(content);
    close.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBeTrue();

    fixture.componentRef.setInput('disabled', 'false');
    fixture.componentRef.setInput('closable', 'false');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.close')).toBeNull();
    content = fixture.nativeElement.querySelector('.content') as HTMLElement;
    content.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    display = fixture.nativeElement.querySelector(
      '.display',
    ) as HTMLButtonElement;
    expect(fixture.componentInstance.active()).toBeFalse();
    expect(document.activeElement).toBe(display);
  });

  it('preserves the legacy component class identity after module extraction', () => {
    expect(LegacyInplaceComponent).toBe(InplaceComponent);
  });
});
