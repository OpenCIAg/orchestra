import { TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent DOM contract', () => {
  it('provides a named region without requiring a visible heading', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.detectChanges();

    const section = fixture.nativeElement.querySelector(
      'section',
    ) as HTMLElement;
    expect(section.getAttribute('role')).toBe('region');
    expect(section.getAttribute('aria-label')).toBe('Empty state');
    expect(section.querySelector('h2')).toBeNull();
  });

  it('uses the title by default and allows an explicit region name', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('title', 'No invoices');
    fixture.detectChanges();

    const section = fixture.nativeElement.querySelector(
      'section',
    ) as HTMLElement;
    expect(section.getAttribute('aria-label')).toBe('No invoices');
    expect(section.querySelector('h2')?.textContent?.trim()).toBe(
      'No invoices',
    );

    fixture.componentRef.setInput('ariaLabel', 'Invoice results');
    fixture.detectChanges();
    expect(section.getAttribute('aria-label')).toBe('Invoice results');
  });

  it('trims visible text and falls back when optional content is blank', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('title', '   ');
    fixture.componentRef.setInput('description', '  \n ');
    fixture.componentRef.setInput('icon', '   ');
    fixture.detectChanges();

    const section = fixture.nativeElement.querySelector(
      'section',
    ) as HTMLElement;
    expect(section.getAttribute('aria-label')).toBe('Empty state');
    expect(section.querySelector('h2')).toBeNull();
    expect(section.querySelector('p')).toBeNull();
    expect(
      section.querySelector('.orc-empty-state__icon')?.textContent?.trim(),
    ).toBe('∅');

    fixture.componentRef.setInput('title', ' No invoices ');
    fixture.componentRef.setInput('description', ' Nothing to display. ');
    fixture.componentRef.setInput('icon', ' 📭 ');
    fixture.detectChanges();

    expect(section.getAttribute('aria-label')).toBe('No invoices');
    expect(section.querySelector('h2')?.textContent).toBe('No invoices');
    expect(section.querySelector('p')?.textContent).toBe('Nothing to display.');
    expect(
      section.querySelector('.orc-empty-state__icon')?.textContent?.trim(),
    ).toBe('📭');
  });

  it('renders and emits only a configured action with its accessible name', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();

    fixture.componentRef.setInput('actionLabel', 'Create invoice');
    fixture.componentRef.setInput('actionAriaLabel', 'Create an invoice');
    fixture.detectChanges();
    const action = jasmine.createSpy('action');
    fixture.componentInstance.action.subscribe(action);
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-label')).toBe('Create an invoice');

    button.click();
    expect(action).toHaveBeenCalledTimes(1);

    fixture.componentRef.setInput('actionLabel', '   ');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
