import { TestBed } from '@angular/core/testing';
import { SpeedDialComponent } from '@ciag/orchestra/speed-dial';
import type { SpeedDialAction } from '@ciag/orchestra/speed-dial';

/**
 * Behavior-parity pins for the speed dial. Imported through the public
 * family entry point; must pass unchanged across the family move.
 */
describe('SpeedDial behavior parity', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  const actions: SpeedDialAction[] = [
    { label: 'Add', value: 'add', icon: '+' },
    { label: 'Blocked', value: 'blocked', icon: 'x', disabled: true },
    { label: 'Edit', value: 'edit', icon: '✎' },
  ];

  function create() {
    const fixture = TestBed.createComponent(SpeedDialComponent);
    fixture.componentRef.setInput('actions', actions);
    fixture.detectChanges();
    return fixture;
  }

  const triggerOf = (fixture: ReturnType<typeof create>) =>
    (fixture.nativeElement as HTMLElement).querySelector(
      '.trigger',
    ) as HTMLButtonElement;

  it('opens and closes through the trigger while emitting both visibility aliases and onClick', () => {
    const fixture = create();
    const visibility: boolean[] = [];
    const legacyVisibility: boolean[] = [];
    const clicks: MouseEvent[] = [];
    fixture.componentInstance.visibleChange.subscribe((visible) =>
      visibility.push(visible),
    );
    fixture.componentInstance.onVisibleChange.subscribe((visible) =>
      legacyVisibility.push(visible),
    );
    fixture.componentInstance.onClick.subscribe((event) => clicks.push(event));

    const trigger = triggerOf(fixture);
    trigger.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.open()).toBeTrue();
    expect(visibility).toEqual([true]);
    expect(legacyVisibility).toEqual([true]);
    expect(clicks.length).toBe(1);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    trigger.click();
    fixture.detectChanges();
    expect(visibility).toEqual([true, false]);
    expect(legacyVisibility).toEqual([true, false]);
  });

  it('activates an enabled action, emits actionSelect, closes, and refocuses the trigger', () => {
    const fixture = create();
    const selected: SpeedDialAction[] = [];
    fixture.componentInstance.actionSelect.subscribe((action) =>
      selected.push(action),
    );
    const trigger = triggerOf(fixture);
    trigger.click();
    fixture.detectChanges();

    const actionButtons = Array.from(
      (
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLButtonElement>('.action'),
    );
    expect(actionButtons.length).toBe(3);
    expect(actionButtons[1].matches(':disabled')).toBeTrue();

    actionButtons[2].click();
    fixture.detectChanges();
    expect(selected.map((action) => action.value)).toEqual(['edit']);
    expect(fixture.componentInstance.open()).toBeFalse();
    expect(document.activeElement).toBe(triggerOf(fixture));
  });

  it('closes on Escape from the trigger and keeps roving tabindex on enabled actions', () => {
    const fixture = create();
    const trigger = triggerOf(fixture);
    trigger.click();
    fixture.detectChanges();

    const actionButtons = Array.from(
      (
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLButtonElement>('.action'),
    );
    expect(actionButtons.map((button) => button.tabIndex)).toEqual([0, -1, -1]);

    actionButtons[2].focus();
    actionButtons[2].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeFalse();
    expect(document.activeElement).toBe(trigger);
  });

  it('hides through the mask click when the mask is enabled', () => {
    const fixture = create();
    fixture.componentRef.setInput('mask', true);
    fixture.detectChanges();
    triggerOf(fixture).click();
    fixture.detectChanges();

    const mask = (fixture.nativeElement as HTMLElement).querySelector(
      '.orc-p2-speed-dial__mask',
    ) as HTMLElement;
    expect(mask).not.toBeNull();
    mask.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeFalse();
  });
});
