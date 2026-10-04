import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepItem } from './stepper.types';
import { StepperComponent } from './stepper.component';

@Component({
  standalone: true,
  imports: [StepperComponent],
  template: `<orc-stepper
    [steps]="steps()"
    [(currentStep)]="currentStep"
    [(activeIndex)]="activeIndex"
    [selectOnFocus]="selectOnFocus()"
    [clickable]="clickable()"
    [readonly]="readonly()"
    [attr.dir]="direction()"
    [style]="style()"
    (stepChange)="changes.push($event)"
    (completed)="incrementCompleted()"
  />`,
})
class StepperHost {
  steps = signal<StepItem[]>([
    { id: 'one', title: 'One' },
    { id: 'blocked', title: 'Blocked', disabled: true },
    { id: 'three', title: 'Three', status: 'active' },
  ]);
  currentStep = signal(0);
  activeIndex = signal(0);
  selectOnFocus = signal(false);
  clickable = signal(true);
  readonly = signal(false);
  direction = signal<'ltr' | 'rtl'>('ltr');
  style = signal<Record<string, string> | null>(null);
  changes: unknown[] = [];
  completedCount = 0;

  incrementCompleted(): void {
    this.completedCount++;
  }
}

describe('StepperComponent browser behavior', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [StepperComponent] }),
  );

  function create(
    initialize?: (host: StepperHost) => void,
  ): ComponentFixture<StepperHost> {
    const fixture = TestBed.createComponent(StepperHost);
    initialize?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  it('keeps currentStep and activeIndex aliases synchronized without user events', async () => {
    const fixture = create();
    const component = fixture.debugElement.children[0]
      .componentInstance as StepperComponent;
    fixture.componentInstance.currentStep.set(2);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.activeIndex()).toBe(2);
    expect(fixture.componentInstance.changes).toHaveSize(0);
    fixture.componentInstance.currentStep.set(1);
    fixture.componentInstance.activeIndex.set(2);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.currentStep()).toBe(1);
    expect(component.activeIndex()).toBe(1);
    expect(fixture.componentInstance.changes).toHaveSize(0);
    fixture.componentInstance.currentStep.set(99);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.currentStep()).toBe(2);
    expect(component.activeIndex()).toBe(2);
    fixture.componentInstance.currentStep.set(0);
    fixture.componentInstance.activeIndex.set(0);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.currentStep()).toBe(0);
    expect(fixture.componentInstance.changes).toHaveSize(0);
  });

  it('uses currentStep for an initial conflict and activeIndex for later simultaneous writes', async () => {
    const fixture = create((host) => {
      host.currentStep.set(2);
      host.activeIndex.set(1);
    });
    const component = fixture.debugElement.children[0]
      .componentInstance as StepperComponent;
    await fixture.whenStable();
    expect(component.currentStep()).toBe(2);
    expect(component.activeIndex()).toBe(2);
    expect(fixture.componentInstance.currentStep()).toBe(2);
    expect(fixture.componentInstance.activeIndex()).toBe(2);

    const buttons = fixture.nativeElement.querySelectorAll(
      '.orc-stepper__step-btn',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.currentStep()).toBe(0);
    expect(fixture.componentInstance.activeIndex()).toBe(0);
    expect(fixture.componentInstance.changes).toHaveSize(1);

    fixture.componentInstance.currentStep.set(1);
    fixture.componentInstance.activeIndex.set(2);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.currentStep()).toBe(2);
    expect(component.activeIndex()).toBe(2);
    expect(fixture.componentInstance.changes).toHaveSize(1);
  });

  it('exposes one active step and skips disabled steps during native keyboard focus', async () => {
    const fixture = create();
    fixture.componentInstance.selectOnFocus.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    expect(nav.getAttribute('aria-label')).toBe('Steps');
    expect(nav.querySelectorAll('[aria-current="step"]')).toHaveSize(1);
    expect(nav.querySelectorAll('button[tabindex="0"]')).toHaveSize(1);
    const buttons = nav.querySelectorAll(
      '.orc-stepper__step-btn',
    ) as NodeListOf<HTMLButtonElement>;
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    buttons[0].dispatchEvent(event);
    expect(event.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(buttons[2]);
    expect(fixture.componentInstance.changes).toHaveSize(1);
    expect(fixture.componentInstance.changes[0]).toEqual(
      jasmine.objectContaining({ index: 2 }),
    );
  });

  it('does not emit twice when select-on-focus is followed by the native click', async () => {
    const fixture = create();
    fixture.componentInstance.selectOnFocus.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelectorAll(
      '.orc-stepper__step-btn',
    )[2] as HTMLButtonElement;
    button.focus();
    button.click();
    expect(fixture.componentInstance.changes).toHaveSize(1);
    expect(fixture.componentInstance.completedCount).toBe(1);
  });

  it('keeps native form safety and has no focusable control when every step is disabled', async () => {
    const fixture = create();
    fixture.componentInstance.steps.update((steps) =>
      steps.map((step) => ({
        ...step,
        disabled: true,
      })),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    const buttons = fixture.nativeElement.querySelectorAll(
      '.orc-stepper__step-btn',
    ) as NodeListOf<HTMLButtonElement>;
    expect(
      Array.from(buttons).every((button) => button.type === 'button'),
    ).toBeTrue();
    expect(
      fixture.nativeElement.querySelectorAll('button[tabindex="0"]'),
    ).toHaveSize(0);
  });

  it('recovers the roving entry when the current step becomes disabled or navigation is toggled', async () => {
    const fixture = create();
    const component = fixture.debugElement.children[0]
      .componentInstance as StepperComponent;
    fixture.componentInstance.steps.update((steps) =>
      steps.map((step, index) =>
        index === 0 ? { ...step, disabled: true } : step,
      ),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('button[tabindex="0"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement
        .querySelector('button[tabindex="0"]')
        ?.getAttribute('aria-posinset'),
    ).toBe('3');

    fixture.componentInstance.readonly.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelectorAll('button[tabindex="0"]'),
    ).toHaveSize(0);
    fixture.componentInstance.readonly.set(false);

    fixture.componentInstance.clickable.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelectorAll('button[tabindex="0"]'),
    ).toHaveSize(0);
    fixture.componentInstance.clickable.set(true);
    fixture.componentInstance.steps.update((steps) =>
      steps.map((step, index) =>
        index === 0 ? { ...step, disabled: false } : step,
      ),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement
        .querySelector('button[tabindex="0"]')
        ?.getAttribute('aria-posinset'),
    ).toBe('1');
    expect(component.currentStep()).toBe(0);
  });

  it('recovers the entry when initially empty data receives a disabled first step', async () => {
    const fixture = create();
    fixture.componentInstance.steps.set([]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelectorAll('button[tabindex="0"]'),
    ).toHaveSize(0);

    fixture.componentInstance.steps.set([
      { id: 'blocked-first', title: 'Blocked', disabled: true },
      { id: 'reachable', title: 'Reachable' },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('button[tabindex="0"]')?.textContent,
    ).toContain('Reachable');
    expect(fixture.componentInstance.currentStep()).toBe(0);
  });

  it('keeps manual focus separate from selection and reverses horizontal RTL arrows', async () => {
    const fixture = create();
    const buttons = () =>
      fixture.nativeElement.querySelectorAll(
        '.orc-stepper__step-btn',
      ) as NodeListOf<HTMLButtonElement>;
    buttons()[0].focus();
    const manual = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    buttons()[0].dispatchEvent(manual);
    fixture.detectChanges();
    expect(document.activeElement).toBe(buttons()[2]);
    expect(fixture.componentInstance.changes).toHaveSize(0);
    expect(buttons()[2].tabIndex).toBe(0);

    fixture.componentInstance.direction.set('rtl');
    fixture.detectChanges();
    await fixture.whenStable();
    const rtl = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    buttons()[2].dispatchEvent(rtl);
    expect(document.activeElement).toBe(buttons()[0]);
  });

  it('applies consumer styles and clamps active state when the data set shrinks', async () => {
    const fixture = create();
    fixture.componentInstance.style.set({ color: 'rgb(1, 2, 3)' });
    const component = fixture.debugElement.children[0]
      .componentInstance as StepperComponent;
    fixture.componentInstance.selectOnFocus.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const buttons = fixture.nativeElement.querySelectorAll(
      '.orc-stepper__step-btn',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[2].focus();
    expect(component.currentStep()).toBe(2);
    fixture.componentInstance.steps.set([
      { id: 'one', title: 'One' },
      { id: 'three', title: 'Three' },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.currentStep()).toBe(1);
    expect(component.activeIndex()).toBe(1);
    expect(fixture.nativeElement.querySelector('nav').style.color).toBe(
      'rgb(1, 2, 3)',
    );
  });
});
