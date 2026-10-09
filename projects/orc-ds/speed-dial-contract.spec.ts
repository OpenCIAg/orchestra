import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  SpeedDialAction,
  SpeedDialComponent,
} from '@ciag/orchestra/speed-dial';

describe('SpeedDialComponent contract', () => {
  const actions: SpeedDialAction[] = [
    { value: 'one', label: 'One', icon: '1' },
    { value: 'two', label: 'Two', icon: '2' },
    { value: 'three', label: 'Three', icon: '3' },
  ];

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [SpeedDialComponent],
    }),
  );

  function open(fixture: ComponentFixture<SpeedDialComponent>): void {
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector('.trigger') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
  }

  function offset(button: HTMLButtonElement): [number, number] {
    const match =
      /translate\(-50%, -50%\) translate\((-?[\d.]+)px, (-?[\d.]+)px\)/.exec(
        button.style.transform,
      );
    if (!match)
      throw new Error(`Unexpected action transform: ${button.style.transform}`);
    return [Number(match[1]), Number(match[2])];
  }

  it('renders linear direction classes, button classes, and radius-based geometry', () => {
    const fixture = TestBed.createComponent(SpeedDialComponent);
    fixture.componentRef.setInput('actions', actions);
    fixture.componentRef.setInput('direction', 'up-right');
    fixture.componentRef.setInput('radius', 40);
    fixture.componentRef.setInput('styleClass', 'speed-dial-custom');
    fixture.componentRef.setInput('buttonClass', 'trigger-custom');
    open(fixture);

    const root = fixture.nativeElement.querySelector(
      '.orc-p2-speed-dial',
    ) as HTMLElement;
    const trigger = fixture.nativeElement.querySelector(
      '.trigger',
    ) as HTMLButtonElement;
    const itemButtons = Array.from(
      fixture.nativeElement.querySelectorAll('.actions .action'),
    ) as HTMLButtonElement[];
    expect(root.classList.contains('orc-p2-speed-dial--linear')).toBeTrue();
    expect(
      root.classList.contains('orc-p2-speed-dial--direction-up-right'),
    ).toBeTrue();
    expect(root.classList.contains('speed-dial-custom')).toBeTrue();
    expect(trigger.classList.contains('trigger-custom')).toBeTrue();
    expect(itemButtons).toHaveSize(3);
    expect(itemButtons[0].style.transform).toContain('40px, -40px');
    expect(itemButtons[1].style.transform).toContain('80px, -80px');
    expect(itemButtons[2].style.transform).toContain('120px, -120px');
  });

  it('maps every supported linear direction to a distinct visible offset', () => {
    const expected: Array<
      [
        (
          | 'up'
          | 'down'
          | 'left'
          | 'right'
          | 'up-left'
          | 'up-right'
          | 'down-left'
          | 'down-right'
        ),
        string,
      ]
    > = [
      ['up', '0px, -40px'],
      ['down', '0px, 40px'],
      ['left', '-40px, 0px'],
      ['right', '40px, 0px'],
      ['up-left', '-40px, -40px'],
      ['up-right', '40px, -40px'],
      ['down-left', '-40px, 40px'],
      ['down-right', '40px, 40px'],
    ];
    const fixture = TestBed.createComponent(SpeedDialComponent);
    fixture.componentRef.setInput('actions', [
      { value: 'only', label: 'Only' },
    ]);
    fixture.componentRef.setInput('radius', 40);
    open(fixture);

    for (const [direction, offset] of expected) {
      fixture.componentRef.setInput('direction', direction);
      fixture.detectChanges();
      const action = fixture.nativeElement.querySelector(
        '.actions .action',
      ) as HTMLButtonElement;
      expect(action.style.transform).toContain(offset);
    }
  });

  it('uses circle, semi-circle, and quarter-circle geometry classes and offsets', () => {
    const fixture = TestBed.createComponent(SpeedDialComponent);
    fixture.componentRef.setInput('actions', actions);
    fixture.componentRef.setInput('radius', 60);
    fixture.componentRef.setInput('direction', 'right');
    open(fixture);

    fixture.componentRef.setInput('type', 'circle');
    fixture.detectChanges();
    let root = fixture.nativeElement.querySelector(
      '.orc-p2-speed-dial',
    ) as HTMLElement;
    let first = fixture.nativeElement.querySelector(
      '.actions .action',
    ) as HTMLButtonElement;
    expect(root.classList.contains('orc-p2-speed-dial--circle')).toBeTrue();
    expect(first.style.transform).toContain('60px, 0px');

    fixture.componentRef.setInput('type', 'semi-circle');
    fixture.componentRef.setInput('direction', 'up');
    fixture.detectChanges();
    root = fixture.nativeElement.querySelector(
      '.orc-p2-speed-dial',
    ) as HTMLElement;
    first = fixture.nativeElement.querySelector(
      '.actions .action',
    ) as HTMLButtonElement;
    expect(
      root.classList.contains('orc-p2-speed-dial--semi-circle'),
    ).toBeTrue();
    expect(first.style.transform).toContain('60px, 0px');

    fixture.componentRef.setInput('type', 'quarter-circle');
    fixture.componentRef.setInput('direction', 'up-left');
    fixture.detectChanges();
    root = fixture.nativeElement.querySelector(
      '.orc-p2-speed-dial',
    ) as HTMLElement;
    first = fixture.nativeElement.querySelector(
      '.actions .action',
    ) as HTMLButtonElement;
    expect(
      root.classList.contains('orc-p2-speed-dial--quarter-circle'),
    ).toBeTrue();
    expect(first.style.transform).toContain('-60px, 0px');
  });

  it('uses direction as the starting rotation for circle layouts', () => {
    const fixture = TestBed.createComponent(SpeedDialComponent);
    fixture.componentRef.setInput('actions', [
      { value: 'only', label: 'Only' },
    ]);
    fixture.componentRef.setInput('type', 'circle');
    fixture.componentRef.setInput('radius', 60);
    fixture.componentRef.setInput('direction', 'up');
    open(fixture);

    let action = fixture.nativeElement.querySelector(
      '.actions .action',
    ) as HTMLButtonElement;
    expect(offset(action)).toEqual([0, -60]);

    fixture.componentRef.setInput('direction', 'right');
    fixture.detectChanges();
    action = fixture.nativeElement.querySelector(
      '.actions .action',
    ) as HTMLButtonElement;
    expect(offset(action)).toEqual([60, 0]);
  });

  it('keeps quarter-circle endpoints within each requested diagonal quadrant', () => {
    const fixture = TestBed.createComponent(SpeedDialComponent);
    fixture.componentRef.setInput('actions', actions);
    fixture.componentRef.setInput('type', 'quarter-circle');
    fixture.componentRef.setInput('radius', 60);
    open(fixture);

    const quadrants = [
      ['up-left', (x: number, y: number) => x <= 0 && y <= 0],
      ['up-right', (x: number, y: number) => x >= 0 && y <= 0],
      ['down-left', (x: number, y: number) => x <= 0 && y >= 0],
      ['down-right', (x: number, y: number) => x >= 0 && y >= 0],
    ] as const;
    for (const [direction, inQuadrant] of quadrants) {
      fixture.componentRef.setInput('direction', direction);
      fixture.detectChanges();
      const itemButtons = Array.from(
        fixture.nativeElement.querySelectorAll('.actions .action'),
      ) as HTMLButtonElement[];
      const [x, y] = offset(itemButtons[itemButtons.length - 1]);
      expect(inQuadrant(x, y)).toBeTrue();
      expect(Math.hypot(x, y)).toBeCloseTo(60, 5);
    }
  });

  it('applies a staggered transition delay to each action', () => {
    const fixture = TestBed.createComponent(SpeedDialComponent);
    fixture.componentRef.setInput('actions', actions);
    fixture.componentRef.setInput('transitionDelay', 50);
    open(fixture);

    const delays = Array.from(
      fixture.nativeElement.querySelectorAll('.actions .action'),
    ).map((button) => (button as HTMLButtonElement).style.transitionDelay);
    expect(delays).toEqual(['0ms', '50ms', '100ms']);
  });

  it('inherits RTL directionality through the responsive host surface', () => {
    const fixture = TestBed.createComponent(SpeedDialComponent);
    fixture.nativeElement.setAttribute('dir', 'rtl');
    fixture.componentRef.setInput('actions', actions);
    open(fixture);

    const root = fixture.nativeElement.querySelector(
      '.orc-p2-speed-dial',
    ) as HTMLElement;
    expect(getComputedStyle(root).direction).toBe('rtl');
    expect(
      getComputedStyle(root.querySelector('.trigger') as HTMLElement).direction,
    ).toBe('rtl');
  });

  it('keeps menu actions reachable after the trigger and supports keyboard navigation', () => {
    const fixture = TestBed.createComponent(SpeedDialComponent);
    fixture.componentRef.setInput('actions', [
      { value: 'blocked', label: 'Blocked', disabled: true },
      { value: 'first', label: 'First' },
      { value: 'second', label: 'Second' },
      { value: 'last', label: 'Last' },
    ]);
    open(fixture);

    const trigger = fixture.nativeElement.querySelector(
      '.trigger',
    ) as HTMLButtonElement;
    const itemButtons = Array.from(
      fixture.nativeElement.querySelectorAll('.actions .action'),
    ) as HTMLButtonElement[];
    expect(
      trigger.compareDocumentPosition(itemButtons[1]) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(itemButtons.map((button) => button.tabIndex)).toEqual([
      -1, 0, -1, -1,
    ]);

    itemButtons[1].focus();
    itemButtons[1].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(itemButtons[2]);
    expect(itemButtons.map((button) => button.tabIndex)).toEqual([
      -1, -1, 0, -1,
    ]);

    itemButtons[2].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(itemButtons[3]);

    itemButtons[3].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(itemButtons[1]);

    itemButtons[1].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeFalse();
    expect(document.activeElement).toBe(trigger);
  });

  it('shows and dismisses a mask while preserving the hideOnClickOutside policy', () => {
    const fixture = TestBed.createComponent(SpeedDialComponent);
    fixture.componentRef.setInput('actions', actions);
    fixture.componentRef.setInput('mask', true);
    open(fixture);

    let mask = fixture.nativeElement.querySelector(
      '.orc-p2-speed-dial__mask',
    ) as HTMLElement;
    expect(mask).not.toBeNull();
    expect(mask.getAttribute('aria-hidden')).toBe('true');
    expect(getComputedStyle(mask).position).toBe('fixed');
    mask.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeFalse();

    fixture.componentRef.setInput('hideOnClickOutside', false);
    open(fixture);
    mask = fixture.nativeElement.querySelector(
      '.orc-p2-speed-dial__mask',
    ) as HTMLElement;
    mask.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeTrue();
  });

  it('blocks disabled actions and emits/selects enabled actions', () => {
    const fixture = TestBed.createComponent(SpeedDialComponent);
    const selected: SpeedDialAction[] = [];
    fixture.componentRef.setInput('actions', [
      { value: 'blocked', label: 'Blocked', disabled: true },
      { value: 'enabled', label: 'Enabled' },
    ]);
    fixture.componentInstance.actionSelect.subscribe((action) =>
      selected.push(action),
    );
    open(fixture);

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('.actions .action'),
    ) as HTMLButtonElement[];
    expect(buttons[0].disabled).toBeTrue();
    buttons[0].click();
    expect(selected).toHaveSize(0);
    expect(fixture.componentInstance.open()).toBeTrue();
    buttons[1].click();
    fixture.detectChanges();
    expect(selected).toEqual([{ value: 'enabled', label: 'Enabled' }]);
    expect(fixture.componentInstance.open()).toBeFalse();

    fixture.componentRef.setInput('disabled', true);
    fixture.componentInstance.show();
    expect(fixture.componentInstance.open()).toBeFalse();
  });

  it('dismisses on outside mousedown and keeps open when outside dismissal is disabled', () => {
    const fixture = TestBed.createComponent(SpeedDialComponent);
    fixture.componentRef.setInput('actions', actions);
    open(fixture);
    const trigger = fixture.nativeElement.querySelector(
      '.trigger',
    ) as HTMLButtonElement;
    const action = fixture.nativeElement.querySelector(
      '.actions .action',
    ) as HTMLButtonElement;
    action.focus();
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeFalse();
    expect(document.activeElement).not.toBe(trigger);

    fixture.componentRef.setInput('hideOnClickOutside', false);
    fixture.componentInstance.show();
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(fixture.componentInstance.open()).toBeTrue();
  });
});
