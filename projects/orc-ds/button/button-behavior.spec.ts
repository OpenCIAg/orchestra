import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

@Component({
  imports: [ButtonComponent],
  template: `<orc-button
    [loading]="loading()"
    [iconOnly]="iconOnly()"
    ariaLabel="Save"
    (clicked)="clicks = clicks + 1"
  >
    <svg iconLeft viewBox="0 0 24 24"><path d="M1 1h20v20H1z" /></svg
    ><span>Save</span>
  </orc-button>`,
})
class ProjectedButton {
  loading = signal(false);
  iconOnly = signal(false);
  clicks = 0;
}

describe('Button layout and browser interaction', () => {
  it('normalizes projected SVG size and leaves exactly one gap before the label', () => {
    const fixture = TestBed.createComponent(ProjectedButton);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const button = root.querySelector('button')!;
    const icon = root.querySelector('svg')!.getBoundingClientRect();
    const text = root
      .querySelector('.orc-button__text')!
      .getBoundingClientRect();
    expect(icon.width).toBe(20);
    expect(icon.height).toBe(20);
    expect(text.left - icon.right).toBeCloseTo(
      parseFloat(getComputedStyle(button).columnGap),
      0,
    );
    expect(
      getComputedStyle(root.querySelector('.orc-button__icon--right')!).display,
    ).toBe('none');
  });

  it('preserves dimensions while loading and prevents native activation', () => {
    const fixture = TestBed.createComponent(ProjectedButton);
    fixture.detectChanges();
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    const initial = button.getBoundingClientRect();
    button.click();
    expect(fixture.componentInstance.clicks).toBe(1);
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    button.click();
    expect(fixture.componentInstance.clicks).toBe(1);
    expect(button.disabled).toBeTrue();
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getBoundingClientRect().width).toBe(initial.width);
    expect(button.getBoundingClientRect().height).toBe(initial.height);
  });

  it('sanitizes active SVG markup while keeping static icon geometry', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('ariaLabel', 'Save');
    fixture.componentRef.setInput(
      'icon',
      '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(1)</script><foreignObject><iframe src="https://example.com"></iframe></foreignObject><a href="javascript:alert(1)"><path d="M1 1h20v20z" /></a><animate attributeName="href" values="javascript:alert(1)" /></svg>',
    );
    fixture.detectChanges();
    const icon: SVGElement = fixture.nativeElement.querySelector('svg');
    expect(icon).not.toBeNull();
    expect(icon.querySelector('path')).not.toBeNull();
    expect(
      icon.querySelector('script, foreignObject, iframe, animate'),
    ).toBeNull();
    expect(icon.hasAttribute('onload')).toBeFalse();
    expect(icon.querySelector('a')?.hasAttribute('href')).toBeFalse();
  });

  it('keeps all icon-only sizes square and applies vertical icon placement', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('ariaLabel', 'Save');
    fixture.componentRef.setInput('iconOnly', true);
    fixture.componentRef.setInput('icon', 'test-icon');
    for (const size of ['sm', 'md', 'lg']) {
      fixture.componentRef.setInput('size', size);
      fixture.detectChanges();
      const rect = fixture.nativeElement
        .querySelector('button')
        .getBoundingClientRect();
      expect(rect.width).withContext(size).toBe(rect.height);
    }
    fixture.componentRef.setInput('iconOnly', false);
    fixture.componentRef.setInput('iconPos', 'top');
    fixture.detectChanges();
    expect(
      getComputedStyle(fixture.nativeElement.querySelector('button'))
        .flexDirection,
    ).toBe('column');
  });

  it('visually hides projected text in icon-only mode while retaining its accessible name', () => {
    const fixture = TestBed.createComponent(ProjectedButton);
    fixture.componentInstance.iconOnly.set(true);
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    const text: HTMLElement =
      fixture.nativeElement.querySelector('.orc-button__text');
    expect(getComputedStyle(text).display).toBe('none');
    expect(button.getAttribute('aria-label')).toBe('Save');
  });
});
