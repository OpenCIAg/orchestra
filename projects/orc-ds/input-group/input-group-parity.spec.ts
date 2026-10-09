import { TestBed } from '@angular/core/testing';
import { IconFieldComponent } from '@ciag/orchestra/icon-field';
import {
  InputGroupAddonComponent,
  InputGroupComponent,
} from '@ciag/orchestra/input-group';

/**
 * Behavior-parity pins for the input-group / icon-field / ifta-label /
 * float-label rendering family. The specs import through the public
 * family entry point and must pass unchanged while the family
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
});
