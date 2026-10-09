import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import {
  SplitterComponent,
  SplitterPanelContentDirective,
} from '@ciag/orchestra/splitter';

@Component({
  standalone: true,
  imports: [SplitterComponent, SplitterPanelContentDirective],
  template: `
    <orc-splitter
      [panels]="panels"
      [orientation]="orientation"
      label="Workspace"
    >
      <ng-template orcSplitterPanel="left">
        <span class="left-content">Left content</span>
      </ng-template>
      <ng-template orcSplitterPanel="right">
        <span class="right-content">Right content</span>
      </ng-template>
    </orc-splitter>
  `,
})
class SplitterHost {
  orientation: 'horizontal' | 'vertical' = 'horizontal';
  readonly panels = [
    { id: 'left', label: 'Left', size: 30, minSize: 20 },
    { id: 'right', label: 'Right', size: 70, minSize: 40 },
  ];
}

describe('Splitter panel/content contract', () => {
  function createFixture(
    orientation: 'horizontal' | 'vertical' = 'horizontal',
  ) {
    const fixture = TestBed.createComponent(SplitterHost);
    fixture.componentInstance.orientation = orientation;
    fixture.detectChanges();
    return {
      fixture,
      splitter: fixture.debugElement.query(By.directive(SplitterComponent))
        .componentInstance as SplitterComponent,
    };
  }

  it('routes named projected templates and exposes accessible resizable gutters', () => {
    const { fixture } = createFixture();
    const sections = Array.from(
      fixture.nativeElement.querySelectorAll('section.panel'),
    ) as HTMLElement[];
    const bodies = Array.from(
      fixture.nativeElement.querySelectorAll('.panel-body'),
    ) as HTMLElement[];
    const gutter = fixture.nativeElement.querySelector(
      '.gutter',
    ) as HTMLButtonElement;

    expect(sections).toHaveSize(2);
    expect(sections[0].getAttribute('role')).toBe('region');
    expect(sections[0].getAttribute('aria-label')).toBe('Left');
    expect(bodies[0].textContent).toContain('Left content');
    expect(bodies[0].textContent).not.toContain('Right content');
    expect(bodies[1].textContent).toContain('Right content');
    expect(gutter.getAttribute('role')).toBe('separator');
    expect(gutter.getAttribute('aria-orientation')).toBe('horizontal');
    expect(gutter.getAttribute('aria-valuenow')).toBe('30');
    expect(gutter.getAttribute('aria-valuemin')).toBe('20');
    expect(gutter.getAttribute('aria-valuemax')).toBe('60');
    expect(gutter.tabIndex).toBe(0);
    expect(gutter.getAttribute('aria-label')).toBe('Resize Left and Right');
  });

  it('uses panel sizes, enforces minSize, and keeps resize outputs meaningful', () => {
    const { fixture, splitter } = createFixture();
    const starts: number[] = [];
    const changes: number[][] = [];
    splitter.onResizeStart.subscribe(({ index }) => starts.push(index));
    splitter.onResize.subscribe(({ sizes }) => changes.push(sizes));

    expect(splitter.panelSize(0)).toBe(30);
    expect(splitter.panelSize(1)).toBe(70);

    splitter.resize(0, -100);
    expect(splitter.sizes()).toEqual([20, 80]);
    splitter.resize(0, 100);
    expect(splitter.sizes()).toEqual([60, 40]);
    splitter.resize(0, 100);
    expect(splitter.sizes()).toEqual([60, 40]);
    expect(starts).toEqual([0, 0]);
    expect(changes).toEqual([
      [20, 80],
      [60, 40],
    ]);
    fixture.detectChanges();
    expect(
      (
        fixture.nativeElement.querySelector('.gutter') as HTMLElement
      ).getAttribute('aria-valuenow'),
    ).toBe('60');
  });

  it('resizes by pointer movement and leaves a plain gutter click unchanged', () => {
    const { fixture, splitter } = createFixture();
    const root = fixture.nativeElement.querySelector(
      '.orc-p2-splitter',
    ) as HTMLElement;
    spyOn(root, 'getBoundingClientRect').and.returnValue(
      new DOMRect(0, 0, 200, 100),
    );
    const gutter = fixture.nativeElement.querySelector(
      '.gutter',
    ) as HTMLButtonElement;
    const starts: number[] = [];
    const changes: number[][] = [];
    const completions: PointerEvent[] = [];
    splitter.onResizeStart.subscribe(({ index }) => starts.push(index));
    splitter.onResize.subscribe(({ sizes }) => changes.push(sizes));
    splitter.onPointerResizeEnd.subscribe((event) => completions.push(event));

    gutter.click();
    expect(splitter.panelSize(0)).toBe(30);

    const down = new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      pointerId: 7,
      isPrimary: true,
      button: 0,
      clientX: 60,
    });
    gutter.dispatchEvent(down);
    expect(down.defaultPrevented).toBeTrue();
    gutter.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        pointerId: 8,
        isPrimary: true,
        clientX: 120,
      }),
    );
    expect(splitter.panelSize(0)).toBe(30);

    gutter.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        pointerId: 7,
        isPrimary: true,
        clientX: 80,
      }),
    );
    fixture.detectChanges();
    expect(splitter.sizes()).toEqual([40, 60]);
    expect(starts).toEqual([0]);
    expect(changes).toEqual([[40, 60]]);

    const up = new PointerEvent('pointerup', {
      bubbles: true,
      pointerId: 7,
      isPrimary: true,
      button: 0,
      clientX: 80,
    });
    gutter.dispatchEvent(up);
    expect(completions).toEqual([up]);
  });

  it('uses the vertical axis and stops resizing after pointer cancellation', () => {
    const { fixture, splitter } = createFixture('vertical');
    const root = fixture.nativeElement.querySelector(
      '.orc-p2-splitter',
    ) as HTMLElement;
    spyOn(root, 'getBoundingClientRect').and.returnValue(
      new DOMRect(0, 0, 200, 200),
    );
    const gutter = fixture.nativeElement.querySelector(
      '.gutter',
    ) as HTMLButtonElement;
    const completions: PointerEvent[] = [];
    splitter.onPointerResizeEnd.subscribe((event) => completions.push(event));

    gutter.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        pointerId: 2,
        isPrimary: true,
        button: 0,
        clientY: 60,
      }),
    );
    gutter.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        pointerId: 2,
        isPrimary: true,
        clientY: 80,
      }),
    );
    expect(splitter.sizes()).toEqual([40, 60]);

    const cancel = new PointerEvent('pointercancel', {
      bubbles: true,
      pointerId: 2,
      isPrimary: true,
    });
    gutter.dispatchEvent(cancel);
    gutter.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        pointerId: 2,
        isPrimary: true,
        clientY: 120,
      }),
    );
    expect(splitter.sizes()).toEqual([40, 60]);
    expect(completions).toEqual([cancel]);
  });

  it('supports orientation-aware arrow resizing and emits resize completion', () => {
    const { fixture, splitter } = createFixture('vertical');
    const gutterDebug = fixture.debugElement.query(By.css('.gutter'));
    const gutter = gutterDebug.nativeElement as HTMLButtonElement;
    const completed: KeyboardEvent[] = [];
    splitter.onResizeEnd.subscribe((event) => completed.push(event));

    const down = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    gutterDebug.triggerEventHandler('keydown', down);
    fixture.detectChanges();
    expect(down.defaultPrevented).toBeTrue();
    expect(splitter.sizes()).toEqual([35, 65]);
    expect(gutter.getAttribute('aria-orientation')).toBe('vertical');
    gutterDebug.triggerEventHandler(
      'keyup',
      new KeyboardEvent('keyup', { key: 'ArrowDown', bubbles: true }),
    );
    expect(completed).toHaveSize(1);

    gutterDebug.triggerEventHandler(
      'keydown',
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
    );
    expect(splitter.sizes()).toEqual([35, 65]);
  });
});
