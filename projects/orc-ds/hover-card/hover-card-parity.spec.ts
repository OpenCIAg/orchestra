import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HoverCardComponent } from '@ciag/orchestra/hover-card';

/**
 * Behavior-parity pins for the hover card family. The specs import the
 * component through the family entry point and must pass
 * unchanged while the family moves to its canonical directory.
 */
@Component({
  standalone: true,
  imports: [HoverCardComponent],
  template: `
    <orc-hover-card label="Details" id="card-1">
      <button hover-card-trigger>Trigger</button>
      <span>Card body</span>
    </orc-hover-card>
  `,
})
class HoverCardHost {}

describe('HoverCard behavior parity', () => {
  const setup = () => {
    const fixture = TestBed.createComponent(HoverCardHost);
    fixture.detectChanges();
    return fixture;
  };

  const root = (fixture: ReturnType<typeof setup>) =>
    (fixture.nativeElement as HTMLElement).querySelector('.orc-p2-hover-card')!;

  const card = (fixture: ReturnType<typeof setup>) =>
    fixture.debugElement.query(By.directive(HoverCardComponent))
      .componentInstance as HoverCardComponent;

  beforeEach(() => TestBed.configureTestingModule({}));

  it('stays closed until the trigger area is hovered', () => {
    const fixture = setup();
    expect(card(fixture).open()).toBeFalse();
    expect(fixture.nativeElement.querySelector('.content')).toBeNull();

    root(fixture).dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    expect(card(fixture).open()).toBeTrue();
    const content = fixture.nativeElement.querySelector('.content')!;
    expect(content.getAttribute('role')).toBe('dialog');
    expect(content.getAttribute('id')).toBe('card-1');
    expect(content.getAttribute('aria-label')).toBe('Details');
    expect(content.textContent).toContain('Card body');
  });

  it('marks the trigger with popup semantics and keeps aria-expanded in sync', () => {
    const fixture = setup();
    const trigger = fixture.nativeElement.querySelector(
      '[hover-card-trigger]',
    )!;
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe('card-1');

    card(fixture).open.set(true);
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('closes on mouse leave', () => {
    const fixture = setup();
    root(fixture).dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(card(fixture).open()).toBeTrue();

    root(fixture).dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(card(fixture).open()).toBeFalse();
  });

  it('closes on Escape while open', () => {
    const fixture = setup();
    root(fixture).dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(card(fixture).open()).toBeTrue();

    root(fixture).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    fixture.detectChanges();
    expect(card(fixture).open()).toBeFalse();
  });

  it('stays open when focus moves between children and closes when focus leaves entirely', async () => {
    const fixture = setup();
    root(fixture).dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    const content = fixture.nativeElement.querySelector('.content')!;
    root(fixture).dispatchEvent(
      new FocusEvent('focusout', { relatedTarget: content, bubbles: true }),
    );
    await Promise.resolve();
    expect(card(fixture).open()).toBeTrue();

    root(fixture).dispatchEvent(
      new FocusEvent('focusout', { relatedTarget: null, bubbles: true }),
    );
    await Promise.resolve();
    expect(card(fixture).open()).toBeFalse();
  });
});
