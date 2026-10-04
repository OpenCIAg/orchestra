import { TestBed } from '@angular/core/testing';
import {
  CloseButtonComponent,
  FloatingActionButtonComponent,
} from './p2/p2-overlay-components';

describe('FloatingActionButtonComponent behavior contract', () => {
  it('uses native button semantics, a useful accessible name, and consistent icon-label spacing', () => {
    const fixture = TestBed.createComponent(FloatingActionButtonComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;

    expect(button.type).toBe('button');
    expect(button.disabled).toBeFalse();
    expect(button.getAttribute('aria-label')).toBe('Create');
    expect(button.getAttribute('aria-busy')).toBeNull();
    expect(
      button.querySelector('[aria-hidden="true"]')?.textContent?.trim(),
    ).toBe('+');
    expect(getComputedStyle(button).display).toBe('inline-flex');
    expect(getComputedStyle(button).gap).toBe('8px');
    expect(getComputedStyle(button).minWidth).toBe('48px');
    expect(getComputedStyle(button).minHeight).toBe('48px');

    const activations: MouseEvent[] = [];
    fixture.componentInstance.clicked.subscribe((event) =>
      activations.push(event),
    );
    button.click();
    expect(activations).toHaveSize(1);
    expect(activations[0]).toBeInstanceOf(MouseEvent);
    expect(activations[0].target).toBe(button);
  });

  it('uses visible label as the accessible-name fallback and honors an explicit aria label', () => {
    const fixture = TestBed.createComponent(FloatingActionButtonComponent);
    fixture.componentRef.setInput('label', 'Create report');
    fixture.componentRef.setInput('extended', true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    expect(button.textContent).toContain('Create report');
    expect(button.getAttribute('aria-label')).toBe('Create report');

    fixture.componentRef.setInput('ariaLabel', 'Start a report');
    fixture.detectChanges();
    expect(button.getAttribute('aria-label')).toBe('Start a report');
  });

  it('blocks activation when disabled or loading and announces its busy state', () => {
    const fixture = TestBed.createComponent(FloatingActionButtonComponent);
    const activations = jasmine.createSpy('activations');
    fixture.componentInstance.clicked.subscribe(activations);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    button.click();
    expect(button.disabled).toBeTrue();
    expect(activations).not.toHaveBeenCalled();

    fixture.componentRef.setInput('disabled', false);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    button.click();
    expect(button.disabled).toBeTrue();
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(
      button.querySelector('[aria-hidden="true"]')?.textContent?.trim(),
    ).toBe('…');
    expect(activations).not.toHaveBeenCalled();
  });
});

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
