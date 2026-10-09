import { TestBed } from '@angular/core/testing';
import { CloseButtonComponent } from '@ciag/orchestra/close-button';

describe('CloseButtonComponent behavior contract', () => {
  it('has a named native close button, hides its glyph from the accessible name, and emits on activation', () => {
    const fixture = TestBed.createComponent(CloseButtonComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    const closes: void[] = [];
    fixture.componentInstance.close.subscribe(() => closes.push(undefined));

    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-label')).toBe('Close');
    expect(
      button.querySelector('[aria-hidden="true"]')?.textContent?.trim(),
    ).toBe('×');
    expect(button.textContent?.trim()).toBe('×');
    expect(getComputedStyle(button).width).toBe('32px');
    expect(getComputedStyle(button).height).toBe('32px');
    button.click();
    expect(closes).toHaveSize(1);

    fixture.componentRef.setInput('ariaLabel', 'Dismiss notification');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    button.click();
    expect(button.getAttribute('aria-label')).toBe('Dismiss notification');
    expect(button.disabled).toBeTrue();
    expect(closes).toHaveSize(1);
  });

  it('applies each documented size to the actual hit target', () => {
    const fixture = TestBed.createComponent(CloseButtonComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;

    for (const [size, dimension] of [
      ['sm', '24px'],
      ['md', '32px'],
      ['lg', '40px'],
    ] as const) {
      fixture.componentRef.setInput('size', size);
      fixture.detectChanges();
      expect(
        button.classList.contains(`orc-p2-close-button--${size}`),
      ).toBeTrue();
      expect(getComputedStyle(button).width).toBe(dimension);
      expect(getComputedStyle(button).height).toBe(dimension);
    }
  });
});
