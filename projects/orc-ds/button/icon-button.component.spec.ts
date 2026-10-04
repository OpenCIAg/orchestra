import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconButtonComponent } from './icon-button.component';

@Component({
  standalone: true,
  imports: [IconButtonComponent],
  template: `<form (submit)="submitted = submitted + 1">
    <orc-icon-button
      ariaLabel="Projected action"
      (clicked)="clicked = clicked + 1"
    >
      <span class="projected-icon" aria-hidden="true">+</span>
    </orc-icon-button>
  </form>`,
})
class ProjectedIconButtonHost {
  clicked = 0;
  submitted = 0;
}

describe('IconButtonComponent browser behavior', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [IconButtonComponent] }),
  );

  function create(): ComponentFixture<IconButtonComponent> {
    const fixture = TestBed.createComponent(IconButtonComponent);
    fixture.componentRef.setInput('ariaLabel', 'Save action');
    fixture.detectChanges();
    return fixture;
  }

  it('requires a meaningful name and keeps native button activation single', () => {
    const fixture = create();
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    const clicked = jasmine.createSpy('clicked');
    fixture.componentInstance.click.subscribe(clicked);

    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-label')).toBe('Save action');
    button.click();
    expect(clicked).toHaveBeenCalledOnceWith(jasmine.any(MouseEvent));
  });

  it('coerces disabled/loading flags, preserves icon geometry, and blocks activation', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const clicked = jasmine.createSpy('clicked');
    component.click.subscribe(clicked);

    fixture.componentRef.setInput('disabled', 'false');
    fixture.detectChanges();
    expect(component.isDisabled()).toBeFalse();

    fixture.componentRef.setInput(
      'icon',
      '<svg viewBox="0 0 24 24"><path d="M1 1h22v22H1z" /></svg>',
    );
    fixture.detectChanges();
    const beforeLoading = (
      fixture.nativeElement.querySelector('button') as HTMLButtonElement
    ).getBoundingClientRect();

    fixture.componentRef.setInput('loading', '');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    expect(component.loading()).toBeTrue();
    expect(button.disabled).toBeTrue();
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.querySelector('.orc-icon-button__spinner')).not.toBeNull();
    expect(button.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(button.getBoundingClientRect().height).toBeGreaterThan(0);
    expect(button.getBoundingClientRect().width).toBe(beforeLoading.width);
    expect(button.getBoundingClientRect().height).toBe(beforeLoading.height);
    expect(
      button
        .querySelector('.orc-icon-button__spinner-svg')
        ?.getBoundingClientRect().width,
    ).toBeGreaterThan(0);
    button.click();
    expect(clicked).not.toHaveBeenCalled();
  });

  it('renders sanitized SVG icons at the size contract and supports projection', () => {
    const fixture = create();
    fixture.componentRef.setInput(
      'icon',
      '<svg viewBox="0 0 24 24"><script>alert(1)</script><path d="M1 1h2v2z" /></svg>',
    );
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    expect(button.classList).toContain('orc-icon-button--size-lg');
    expect(button.querySelector('svg path')).not.toBeNull();
    expect(button.querySelector('script')).toBeNull();

    const projected = TestBed.createComponent(ProjectedIconButtonHost);
    projected.detectChanges();
    expect(
      projected.nativeElement.querySelector('.projected-icon'),
    ).not.toBeNull();
    (
      projected.nativeElement.querySelector('button') as HTMLButtonElement
    ).click();
    expect(projected.componentInstance.clicked).toBe(1);
    expect(projected.componentInstance.submitted).toBe(0);
  });

  it('retains focus-visible support on every square size', () => {
    const fixture = create();
    fixture.componentRef.setInput(
      'icon',
      '<svg viewBox="0 0 24 24"><path d="M1 1h22v22H1z" /></svg>',
    );
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    const icon = fixture.nativeElement.querySelector(
      '.orc-icon-button__icon-container',
    ) as HTMLElement;
    for (const size of ['sm', 'md', 'lg']) {
      fixture.componentRef.setInput('size', size);
      fixture.detectChanges();
      expect(button.classList).toContain(`orc-icon-button--size-${size}`);
      expect(button.getBoundingClientRect().width).toBeGreaterThan(0);
      expect(button.getBoundingClientRect().height).toBeGreaterThan(0);
      expect(button.getBoundingClientRect().width).toBe(
        button.getBoundingClientRect().height,
      );
      expect(icon.getBoundingClientRect().width).toBeGreaterThan(0);
      expect(icon.getBoundingClientRect().height).toBeGreaterThan(0);
    }
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }),
    );
    button.focus();
    expect(document.activeElement).toBe(button);
    expect(button.matches(':focus-visible')).toBeTrue();
    expect(parseFloat(getComputedStyle(button).outlineWidth)).toBeGreaterThan(
      0,
    );
  });
});
