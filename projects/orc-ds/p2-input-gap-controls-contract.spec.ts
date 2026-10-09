import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  InputGroupComponent,
  InputGroupAddonComponent,
} from '@ciag/orchestra/input-group';
import { IconFieldComponent } from '@ciag/orchestra/icon-field';

@Component({
  standalone: true,
  imports: [InputGroupComponent],
  template: `
    <orc-input-group [label]="label()" [prefix]="prefix()" [suffix]="suffix()">
      <input aria-label="Amount" />
    </orc-input-group>
  `,
})
class InputGroupHost {
  readonly label = signal('');
  readonly prefix = signal('$');
  readonly suffix = signal('USD');
}

@Component({
  standalone: true,
  imports: [InputGroupAddonComponent],
  template: '<orc-input-group-addon>USD</orc-input-group-addon>',
})
class InputGroupAddonHost {}

@Component({
  standalone: true,
  imports: [IconFieldComponent],
  template: `
    <div dir="rtl">
      <orc-icon-field [icon]="icon()"
        ><input aria-label="Search"
      /></orc-icon-field>
    </div>
  `,
})
class IconFieldHost {
  readonly icon = signal('⌕');
}

describe('P2 input-gap control DOM contracts', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [InputGroupHost, InputGroupAddonHost, IconFieldHost],
    }),
  );

  it('names InputGroup only when it has a usable label and lays out its projected control', () => {
    const fixture = TestBed.createComponent(InputGroupHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    let group = root.querySelector('.orc-p2-input-group') as HTMLElement;

    expect(group.hasAttribute('role')).toBeFalse();
    expect(group.hasAttribute('aria-label')).toBeFalse();
    expect(root.querySelector('.prefix')?.textContent?.trim()).toBe('$');
    expect(root.querySelector('.suffix')?.textContent?.trim()).toBe('USD');
    const control = root.querySelector('.control') as HTMLElement;
    const input = root.querySelector('.control input') as HTMLInputElement;
    expect(
      Math.abs(input.getBoundingClientRect().width - control.clientWidth),
    ).toBeLessThan(2);

    fixture.componentInstance.label.set('  Price editor  ');
    fixture.detectChanges();
    group = root.querySelector('.orc-p2-input-group') as HTMLElement;
    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-label')).toBe('Price editor');

    fixture.componentInstance.label.set('   ');
    fixture.componentInstance.prefix.set('');
    fixture.componentInstance.suffix.set('');
    fixture.detectChanges();
    expect(group.hasAttribute('role')).toBeFalse();
    expect(group.hasAttribute('aria-label')).toBeFalse();
    expect(
      root.querySelector('.prefix')?.classList.contains('empty'),
    ).toBeTrue();
    expect(
      root.querySelector('.suffix')?.classList.contains('empty'),
    ).toBeTrue();
  });

  it('renders the InputGroup addon as projected inline content with its control height', () => {
    const fixture = TestBed.createComponent(InputGroupAddonHost);
    fixture.detectChanges();
    const addon = fixture.nativeElement.querySelector(
      '.orc-input-addon',
    ) as HTMLElement;

    expect(addon.textContent?.trim()).toBe('USD');
    expect(getComputedStyle(addon).display).toBe('inline-flex');
    expect(getComputedStyle(addon).minHeight).toBe('40px');
  });

  it('uses a block wrapper and positions the decorative icon at inline-start in RTL', () => {
    const fixture = TestBed.createComponent(IconFieldHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const field = root.querySelector('.orc-icon-field') as HTMLElement;
    const icon = root.querySelector('.orc-icon-field .icon') as HTMLElement;
    const input = root.querySelector('input') as HTMLInputElement;

    expect(field.tagName).toBe('DIV');
    expect(icon.textContent?.trim()).toBe('⌕');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(input.getAttribute('aria-label')).toBe('Search');
    expect(parseFloat(getComputedStyle(icon).right)).toBeLessThan(20);
    expect(getComputedStyle(input).paddingRight).toBe('32px');

    fixture.componentInstance.icon.set('⌖');
    fixture.detectChanges();
    expect(icon.textContent?.trim()).toBe('⌖');
  });
});
