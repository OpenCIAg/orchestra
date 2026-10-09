import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HoverCardComponent } from '@ciag/orchestra/hover-card';

@Component({
  standalone: true,
  imports: [HoverCardComponent],
  template: `<orc-hover-card id="preview-details" label="Preview details"
    ><button type="button" hover-card-trigger>Preview</button
    ><a href="#details" class="panel-link">Open details</a></orc-hover-card
  >`,
})
class HoverCardHostComponent {}

describe('HoverCardComponent behavior contract', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [HoverCardHostComponent] }),
  );

  it('keeps the preview open while keyboard focus moves from trigger into its content', async () => {
    const fixture = TestBed.createComponent(HoverCardHostComponent);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector(
      '[hover-card-trigger]',
    ) as HTMLButtonElement;
    trigger.focus();
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector(
      '[role="dialog"]',
    ) as HTMLElement;
    const panelLink = fixture.nativeElement.querySelector(
      '.panel-link',
    ) as HTMLAnchorElement;
    expect(panel).not.toBeNull();
    expect(panel.getAttribute('aria-label')).toBe('Preview details');
    expect(panel.id).toBe('preview-details');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe('preview-details');

    panelLink.focus();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[role="dialog"]'),
    ).not.toBeNull();
    expect(document.activeElement).toBe(panelLink);
  });

  it('closes on Escape and returns focus from preview content to its trigger', () => {
    const fixture = TestBed.createComponent(HoverCardHostComponent);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector(
      '[hover-card-trigger]',
    ) as HTMLButtonElement;
    trigger.focus();
    fixture.detectChanges();
    const panelLink = fixture.nativeElement.querySelector(
      '.panel-link',
    ) as HTMLAnchorElement;
    panelLink.focus();
    panelLink.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes when focus leaves the component and closes on pointer leave when it has no focus', async () => {
    const fixture = TestBed.createComponent(HoverCardHostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector(
      '.orc-p2-hover-card',
    ) as HTMLElement;
    const trigger = fixture.nativeElement.querySelector(
      '[hover-card-trigger]',
    ) as HTMLButtonElement;
    trigger.focus();
    fixture.detectChanges();
    const panelLink = fixture.nativeElement.querySelector(
      '.panel-link',
    ) as HTMLAnchorElement;
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();

    outside.focus();
    host.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[role="dialog"]'),
    ).not.toBeNull();
    host.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
    expect(panelLink.isConnected).toBeFalse();
    outside.remove();
  });
});
