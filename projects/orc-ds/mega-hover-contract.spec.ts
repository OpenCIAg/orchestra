import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HoverCardComponent } from './p2/p2-data-components';
import { MegaMenuComponent } from './p2/p2-menu-family-components';
import type { PrimeMenuItem } from './p2/p2-advanced-components';
import { focusElement } from '../../tools/quality/test-focus-events';

@Component({
  standalone: true,
  imports: [HoverCardComponent],
  template: `<orc-hover-card id="preview-details" label="Preview details"
    ><button type="button" hover-card-trigger>Preview</button
    ><a href="#details" class="panel-link">Open details</a></orc-hover-card
  >`,
})
class HoverCardHostComponent {}

describe('MegaMenuComponent behavior contract', () => {
  it('renders orientation and group semantics, with one roving tab stop among visible enabled items', () => {
    const fixture = TestBed.createComponent(MegaMenuComponent);
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.componentRef.setInput('model', [
      {
        label: 'Workspace',
        items: [
          { label: 'Overview' },
          { label: 'Hidden', visible: false },
          { label: 'Reports' },
          { label: 'Unavailable', disabled: true },
        ],
      },
      { label: 'Hidden group', visible: false, items: [{ label: 'Nope' }] },
      {
        label: 'Disabled group',
        disabled: true,
        items: [{ label: 'Nope either' }],
      },
      { label: 'Admin', items: [{ label: 'Settings' }] },
    ] satisfies PrimeMenuItem[]);
    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    const buttons = Array.from(
      nav.querySelectorAll<HTMLButtonElement>('[data-mega-item]'),
    );
    expect(nav.getAttribute('aria-orientation')).toBe('vertical');
    expect(nav.classList.contains('vertical')).toBeTrue();
    expect(getComputedStyle(nav).flexDirection).toBe('column');
    expect(nav.tabIndex).toBe(-1);
    expect(nav.querySelectorAll('[role="group"]')).toHaveSize(3);
    expect(buttons.map((button) => button.textContent?.trim())).toEqual([
      'Overview',
      'Reports',
      'Unavailable',
      'Nope either',
      'Settings',
    ]);
    expect(buttons.map((button) => button.tabIndex)).toEqual([
      0, -1, -1, -1, -1,
    ]);
    expect(buttons[2].disabled).toBeTrue();
    expect(buttons[3].disabled).toBeTrue();
    expect(
      fixture.componentInstance.navigableItems().map((item) => item.label),
    ).toEqual(['Overview', 'Reports', 'Settings']);
  });

  it('moves focus in the configured direction and reports focus only when it leaves the menubar', () => {
    const fixture = TestBed.createComponent(MegaMenuComponent);
    fixture.componentRef.setInput('model', [
      { label: 'Main', items: [{ label: 'First' }, { label: 'Second' }] },
    ] satisfies PrimeMenuItem[]);
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    const buttons = nav.querySelectorAll<HTMLButtonElement>('[data-mega-item]');
    const focusEvents: Event[] = [];
    const blurEvents: Event[] = [];
    fixture.componentInstance.onFocus.subscribe((event) =>
      focusEvents.push(event),
    );
    fixture.componentInstance.onBlur.subscribe((event) =>
      blurEvents.push(event),
    );

    focusElement(buttons[0]);
    buttons[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(buttons[1]);
    expect(buttons[1].tabIndex).toBe(0);
    expect(blurEvents).toHaveSize(0);
    expect(focusEvents.length).toBeGreaterThan(0);

    const outside = document.createElement('button');
    document.body.appendChild(outside);
    focusElement(outside);
    expect(blurEvents).toHaveSize(1);
    outside.remove();
  });

  it('selects only an enabled item belonging to a visible enabled group and emits both selection outputs', () => {
    const fixture = TestBed.createComponent(MegaMenuComponent);
    const selected: PrimeMenuItem[] = [];
    const aliases: PrimeMenuItem[] = [];
    const action = jasmine.createSpy('action');
    const valid: PrimeMenuItem = { label: 'Run', command: action };
    const hidden: PrimeMenuItem = { label: 'Hidden', visible: false };
    fixture.componentRef.setInput('items', [
      { label: 'Main', items: [valid, hidden] },
      {
        label: 'Disabled',
        disabled: true,
        items: [{ label: 'Disabled command' }],
      },
    ] satisfies PrimeMenuItem[]);
    fixture.componentInstance.itemSelect.subscribe((item) =>
      selected.push(item),
    );
    fixture.componentInstance.onItemClick.subscribe((item) =>
      aliases.push(item),
    );

    fixture.componentInstance.select(valid);
    fixture.componentInstance.select(hidden);
    fixture.componentInstance.select({ label: 'Foreign item' });
    fixture.componentInstance.select({ label: 'Disabled command' });

    expect(action).toHaveBeenCalledTimes(1);
    expect(selected).toEqual([valid]);
    expect(aliases).toEqual(selected);
  });

  it('renders URL items as safe links and preserves their selection contract', () => {
    const fixture = TestBed.createComponent(MegaMenuComponent);
    const linkItem: PrimeMenuItem = {
      label: 'Help center',
      url: '/help',
      target: '_blank',
    };
    const selected: PrimeMenuItem[] = [];
    fixture.componentRef.setInput('items', [
      { label: 'Support', items: [linkItem] },
    ]);
    fixture.componentInstance.itemSelect.subscribe((item) =>
      selected.push(item),
    );
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector(
      'a[data-mega-item]',
    ) as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/help');
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener noreferrer');
    expect(link.tabIndex).toBe(0);
    fixture.componentInstance.select(linkItem);
    expect(selected).toEqual([linkItem]);
  });
});

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
