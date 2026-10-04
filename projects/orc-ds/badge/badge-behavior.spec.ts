import { TestBed } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';

describe('BadgeComponent live and dot semantics', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent],
    }).compileComponents();
  });

  it('keeps ordinary visible badges out of the live-region tree by default', () => {
    const fixture = TestBed.createComponent(BadgeComponent);
    fixture.componentRef.setInput('text', 'New');
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector(
      '.orc-badge',
    ) as HTMLElement;
    expect(badge.hasAttribute('role')).toBeFalse();
    expect(badge.hasAttribute('aria-live')).toBeFalse();
    expect(badge.textContent).toContain('New');
    fixture.destroy();
  });

  it('supports explicit polite live announcements', () => {
    const fixture = TestBed.createComponent(BadgeComponent);
    fixture.componentRef.setInput('text', '3 unread');
    fixture.componentRef.setInput('liveRegion', 'true');
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector(
      '.orc-badge',
    ) as HTMLElement;
    expect(badge.getAttribute('role')).toBe('status');
    expect(badge.getAttribute('aria-live')).toBe('polite');
    expect(badge.getAttribute('aria-label')).toBe('3 unread');
    fixture.destroy();
  });

  it('names dot-only badges and avoids a noninteractive role around a dismiss button', () => {
    const fixture = TestBed.createComponent(BadgeComponent);
    fixture.componentRef.setInput('variant', 'dot');
    fixture.componentRef.setInput('status', 'success');
    fixture.detectChanges();
    let badge = fixture.nativeElement.querySelector(
      '.orc-badge',
    ) as HTMLElement;
    expect(badge.getAttribute('role')).toBe('img');
    expect(badge.getAttribute('aria-label')).toBe('success status');

    fixture.componentRef.setInput('dismissible', true);
    fixture.detectChanges();
    badge = fixture.nativeElement.querySelector('.orc-badge') as HTMLElement;
    expect(badge.hasAttribute('role')).toBeFalse();
    expect(
      badge.querySelector('.orc-badge__dismiss')?.getAttribute('aria-label'),
    ).toBe('Remove badge');
    fixture.destroy();
  });
});
