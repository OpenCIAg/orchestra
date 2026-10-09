import { TestBed } from '@angular/core/testing';
import {
  FloatLabelComponent,
  IconFieldComponent,
  InputGroupAddonComponent,
  InputGroupComponent,
  IftaLabelComponent,
} from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the input-group / icon-field / ifta-label /
 * float-label rendering family. The specs import through the public
 * `@ciag/orchestra/p2` surface and must pass unchanged while the family
 * moves to its canonical directory.
 */
describe('Input group family behavior parity', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('renders the input group shell with prefix, suffix and projected control', () => {
    const fixture = TestBed.createComponent(InputGroupComponent);
    fixture.componentRef.setInput('label', 'Amount');
    fixture.componentRef.setInput('prefix', '$');
    fixture.componentRef.setInput('suffix', 'USD');
    fixture.detectChanges();

    const group = fixture.nativeElement.querySelector('[role="group"]');
    expect(group).not.toBeNull();
    expect(group.getAttribute('aria-label')).toBe('Amount');
    const prefix = fixture.nativeElement.querySelector('.prefix');
    const suffix = fixture.nativeElement.querySelector('.suffix');
    expect(prefix.textContent?.trim()).toBe('$');
    expect(suffix.textContent?.trim()).toBe('USD');

    // Without a label there is no group role.
    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="group"]')).toBeNull();

    // Empty affordances collapse.
    expect(prefix.className).not.toContain('empty');
    fixture.componentRef.setInput('prefix', '');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.prefix').className).toContain(
      'empty',
    );
  });

  it('renders the addon slot content', () => {
    const fixture = TestBed.createComponent(InputGroupAddonComponent);
    fixture.detectChanges();
    const addon = fixture.nativeElement.querySelector('span');
    expect(addon).not.toBeNull();
  });

  it('renders the icon-field icon with projected content', () => {
    const fixture = TestBed.createComponent(IconFieldComponent);
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.icon');
    expect(icon.textContent?.trim()).toBe('⌕');

    fixture.componentRef.setInput('icon', '@');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.icon').textContent?.trim(),
    ).toBe('@');
  });

  it('renders the ifta-label wrapper', () => {
    const fixture = TestBed.createComponent(IftaLabelComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.orc-ifta')).not.toBeNull();
  });

  it('tracks focus and filled state for the float label variants', () => {
    const fixture = TestBed.createComponent(FloatLabelComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('span');

    expect(host.className).toContain('variant-over');
    expect(host.className).not.toContain('filled');

    host.dispatchEvent(new Event('focusin', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.focused()).toBeTrue();
    expect(host.className).toContain('focused');

    host.dispatchEvent(new Event('focusout', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.focused()).toBeFalse();

    // A filled control lifts the label: the input event target carries the value.
    const native = document.createElement('input');
    host.appendChild(native);
    native.value = 'typed';
    native.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.filled()).toBeTrue();
    expect(host.className).toContain('filled');

    native.value = '';
    native.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.filled()).toBeFalse();
  });

  it('keeps the float label variants switchable', () => {
    const fixture = TestBed.createComponent(FloatLabelComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('span');
    fixture.componentRef.setInput('variant', 'in');
    fixture.detectChanges();
    expect(host.className).toContain('variant-in');
    fixture.componentRef.setInput('variant', 'on');
    fixture.detectChanges();
    expect(host.className).toContain('variant-on');
  });
});
