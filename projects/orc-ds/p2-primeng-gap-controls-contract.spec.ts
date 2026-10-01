import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import {
  FluidComponent,
  OverlayBadgeComponent,
  PasswordComponent,
  SplitButtonComponent,
} from './p2/p2-primeng-gap-components';
import { SplitButtonComponent as FocusedSplitButtonComponent } from './p2/p2-split-button-component';

@Component({
  standalone: true,
  imports: [PasswordComponent, ReactiveFormsModule],
  template: `
    <orc-password
      [formControl]="control"
      label="Account password"
      [required]="true"
      [readonly]="isReadonly()"
      [showClear]="true"
      clearAriaLabel="Clear password"
      [toggleMask]="true"
      showPasswordLabel="Show password"
      hidePasswordLabel="Hide password"
      styleClass="password-custom"
      inputStyleClass="native-password"
      [fluid]="true"
      variant="filled"
      size="large"
      weakLabel="Weak"
      mediumLabel="Medium"
      strongLabel="Strong"
      (onClear)="clearCount = clearCount + 1"
    />
  `,
})
class PasswordFormHost {
  readonly control = new FormControl('initial secret', { nonNullable: true });
  readonly isReadonly = signal(false);
  clearCount = 0;
}

describe('P2 PrimeNG gap control contracts', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        FluidComponent,
        OverlayBadgeComponent,
        PasswordComponent,
        SplitButtonComponent,
        ReactiveFormsModule,
      ],
    }),
  );

  it('keeps the focused SplitButton module and compatibility barrel on one component identity', () => {
    expect(SplitButtonComponent).toBe(FocusedSplitButtonComponent);
  });

  it('preserves Fluid base classes while adding caller classes and vertical spacing', () => {
    const fixture = TestBed.createComponent(FluidComponent);
    fixture.componentRef.setInput('styleClass', 'checkout-fields');
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector(
      '.orc-p2-fluid',
    ) as HTMLElement;

    expect(wrapper.classList.contains('p-fluid')).toBeTrue();
    expect(wrapper.classList.contains('p-component')).toBeTrue();
    expect(wrapper.classList.contains('checkout-fields')).toBeTrue();
    expect(getComputedStyle(wrapper).display).toBe('flex');
    expect(getComputedStyle(wrapper).flexDirection).toBe('column');
    expect(getComputedStyle(wrapper).gap).toBe('16px');
  });

  it('shows numeric zero as an accessible badge instead of converting it to a dot', () => {
    const fixture = TestBed.createComponent(OverlayBadgeComponent);
    fixture.componentRef.setInput('value', 0);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector(
      '.orc-p2-overlay-badge__value',
    ) as HTMLElement;

    expect(badge.textContent).toBe('0');
    expect(badge.classList.contains('dot')).toBeFalse();
    expect(badge.getAttribute('role')).toBe('img');
    expect(badge.getAttribute('aria-label')).toBe('0');
  });

  it('keeps an unlabeled dot decorative and allows an explicit accessible name', () => {
    const fixture = TestBed.createComponent(OverlayBadgeComponent);
    fixture.detectChanges();
    let badge = fixture.nativeElement.querySelector(
      '.orc-p2-overlay-badge__value',
    ) as HTMLElement;

    expect(badge.classList.contains('dot')).toBeTrue();
    expect(badge.getAttribute('aria-hidden')).toBe('true');

    fixture.componentRef.setInput('ariaLabel', 'Unread notifications');
    fixture.detectChanges();
    badge = fixture.nativeElement.querySelector(
      '.orc-p2-overlay-badge__value',
    ) as HTMLElement;
    expect(badge.getAttribute('role')).toBe('img');
    expect(badge.getAttribute('aria-label')).toBe('Unread notifications');
    expect(badge.hasAttribute('aria-hidden')).toBeFalse();
  });

  it('integrates Password with Reactive Forms and associates its required label', () => {
    const fixture = TestBed.createComponent(PasswordFormHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector('input') as HTMLInputElement;
    const label = root.querySelector('label') as HTMLLabelElement;
    const wrapper = root.querySelector('.orc-p2-password') as HTMLElement;

    expect(input.value).toBe('initial secret');
    expect(input.required).toBeTrue();
    expect(input.id).toBeTruthy();
    expect(label.htmlFor).toBe(input.id);
    expect(wrapper.classList.contains('orc-p2-password')).toBeTrue();
    expect(wrapper.classList.contains('password-custom')).toBeTrue();
    expect(wrapper.classList.contains('variant-filled')).toBeTrue();
    expect(wrapper.classList.contains('size-large')).toBeTrue();
    expect(wrapper.classList.contains('fluid')).toBeTrue();
    expect(root.querySelector('.meter.weak')).not.toBeNull();

    fixture.componentInstance.control.setValue('server update');
    fixture.detectChanges();
    expect(input.value).toBe('server update');

    input.value = 'user update';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('user update');

    input.dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.control.touched).toBeTrue();
    const clear = root.querySelector(
      '[aria-label="Clear password"]',
    ) as HTMLButtonElement;
    clear.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('');
    expect(fixture.componentInstance.clearCount).toBe(1);
  });

  it('toggles Password visibility, blocks readonly clearing, and honors form-disabled state', () => {
    const fixture = TestBed.createComponent(PasswordFormHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;

    const show = fixture.nativeElement.querySelector(
      '[aria-label="Show password"]',
    ) as HTMLButtonElement;
    show.click();
    fixture.detectChanges();
    expect(input.type).toBe('text');
    expect(
      fixture.nativeElement.querySelector('[aria-label="Hide password"]'),
    ).not.toBeNull();

    fixture.componentInstance.isReadonly.set(true);
    fixture.detectChanges();
    const clear = fixture.nativeElement.querySelector(
      '[aria-label="Clear password"]',
    ) as HTMLButtonElement;
    expect(input.readOnly).toBeTrue();
    expect(clear.disabled).toBeTrue();
    clear.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('initial secret');

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(input.disabled).toBeTrue();
    expect(
      (
        fixture.nativeElement.querySelector(
          '[aria-label="Hide password"]',
        ) as HTMLButtonElement
      ).disabled,
    ).toBeTrue();
  });

  it('opens a labeled menu from ArrowDown and supports arrow, Home, End, and Escape focus', async () => {
    const fixture = TestBed.createComponent(SplitButtonComponent);
    fixture.componentRef.setInput('label', 'Save');
    fixture.componentRef.setInput('model', [
      { label: 'First action' },
      { label: 'Unavailable', disabled: true },
      { label: 'Last action' },
    ]);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const trigger = root.querySelector('.arrow') as HTMLButtonElement;

    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-label')).toBe('More options');

    trigger.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const menu = root.querySelector('[role="menu"]') as HTMLElement;
    const first = menu.querySelector('[role="menuitem"]') as HTMLButtonElement;
    const last =
      menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')[2];
    expect(menu).not.toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(first);

    first.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(last);
    last.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Home',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(first);
    first.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'End',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(last);

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(root.querySelector('[role="menu"]')).toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(
      root.querySelector('.orc-p2-split__primary'),
    );

    fixture.componentRef.setInput('closeOnEscape', false);
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    const reopenedMenu = root.querySelector('[role="menu"]') as HTMLElement;
    const enabledItems = reopenedMenu.querySelectorAll<HTMLElement>(
      '[role="menuitem"]:not([disabled])',
    );
    expect(document.activeElement).toBe(enabledItems[1]);
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(root.querySelector('[role="menu"]')).not.toBeNull();
    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    );
    fixture.detectChanges();
    expect(root.querySelector('[role="menu"]')).toBeNull();
  });

  it('dismisses SplitButton outside, calls visible enabled items once, and returns focus', () => {
    const command = jasmine.createSpy('command');
    const fixture = TestBed.createComponent(SplitButtonComponent);
    fixture.componentRef.setInput('model', [
      { label: 'Run', command },
      { label: 'Hidden', visible: false, command: jasmine.createSpy('hidden') },
    ]);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const trigger = root.querySelector('.arrow') as HTMLButtonElement;
    const primary = root.querySelector(
      '.orc-p2-split__primary',
    ) as HTMLButtonElement;
    const hide = jasmine.createSpy('onMenuHide');
    fixture.componentInstance.onMenuHide.subscribe(hide);

    trigger.click();
    fixture.detectChanges();
    const item = root.querySelector('[role="menuitem"]') as HTMLButtonElement;
    item.click();
    fixture.detectChanges();
    expect(command).toHaveBeenCalledOnceWith();
    expect(root.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(primary);
    expect(hide).toHaveBeenCalledTimes(1);

    trigger.click();
    fixture.detectChanges();
    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    );
    fixture.detectChanges();
    expect(root.querySelector('[role="menu"]')).toBeNull();
    expect(hide).toHaveBeenCalledTimes(2);

    trigger.click();
    fixture.detectChanges();
    (root.querySelector('.orc-p2-split') as HTMLElement).dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: document.body,
      }),
    );
    fixture.detectChanges();
    expect(root.querySelector('[role="menu"]')).toBeNull();
    expect(hide).toHaveBeenCalledTimes(3);
  });

  it('uses SplitButton icon position, tooltip, severity, and size props and respects disabled states', () => {
    const fixture = TestBed.createComponent(SplitButtonComponent);
    fixture.componentRef.setInput('label', 'Archive');
    fixture.componentRef.setInput('icon', 'box');
    fixture.componentRef.setInput('iconPos', 'right');
    fixture.componentRef.setInput('tooltip', 'Archive current record');
    fixture.componentRef.setInput('size', 'small');
    fixture.componentRef.setInput('severity', 'danger');
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const primary = root.querySelector(
      '.orc-p2-split__primary',
    ) as HTMLButtonElement;
    const trigger = root.querySelector('.arrow') as HTMLButtonElement;

    expect(primary.title).toBe('Archive current record');
    expect(primary.classList.contains('icon-right')).toBeTrue();
    expect(primary.textContent?.indexOf('Archive')).toBeLessThan(
      primary.textContent?.indexOf('box') ?? -1,
    );
    expect(
      root.querySelector('.orc-p2-split')?.classList.contains('size-small'),
    ).toBeTrue();
    expect(
      root
        .querySelector('.orc-p2-split')
        ?.classList.contains('severity-danger'),
    ).toBeTrue();

    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(primary.getAttribute('aria-busy')).toBe('true');
    expect(primary.textContent).toContain('…');
    expect(primary.disabled).toBeTrue();
    expect(trigger.disabled).toBeTrue();
    trigger.click();
    fixture.detectChanges();
    expect(root.querySelector('[role="menu"]')).toBeNull();
  });
});
