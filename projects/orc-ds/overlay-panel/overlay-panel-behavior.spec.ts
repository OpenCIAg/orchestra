import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { OverlayPanelComponent } from './overlay-panel.component';
import { positionOverlayPanel } from './overlay-panel-position';
import { testBedTick } from '../../../tools/quality/test-bed-tick';

@Component({
  imports: [OverlayPanelComponent],
  template: `<button
      #trigger
      type="button"
      (click)="panel.show($event, trigger)"
    >
      Open</button
    ><orc-overlay-panel
      #panel
      appendTo="body"
      [showCloseIcon]="true"
      header="Edit record"
      ><input aria-label="Name" /></orc-overlay-panel
    ><button class="outside">Outside</button>`,
})
class Host {}

describe('OverlayPanel shared lifecycle', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    testBedTick();
    const component = fixture.debugElement.query(
      By.directive(OverlayPanelComponent),
    ).componentInstance as OverlayPanelComponent;
    const trigger: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    trigger.focus();
    trigger.click();
    fixture.detectChanges();
    testBedTick();
    return {
      fixture,
      component,
      trigger,
      panel: component.panel()!.nativeElement,
    };
  }

  it('opens from an external trigger, focuses content and returns focus on Escape', () => {
    const { fixture, component, trigger, panel } = setup();
    expect(panel.parentElement).toBe(document.body);
    expect(panel.classList.contains('orc-p2-overlay-panel')).toBeTrue();
    expect(panel.dataset['pcName']).toBe('overlaypanel');
    expect(panel.contains(document.activeElement)).toBeTrue();
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        cancelable: true,
        bubbles: true,
      }),
    );
    fixture.detectChanges();
    testBedTick();
    expect(component.visible()).toBeFalse();
    expect(document.activeElement).toBe(trigger);
  });

  it('recognizes detached content and capture-phase outside interactions', () => {
    const { fixture, component, panel } = setup();
    panel.querySelector('input')!.click();
    expect(component.visible()).toBeTrue();
    const outside: HTMLButtonElement =
      fixture.nativeElement.querySelector('.outside');
    outside.addEventListener('click', (event) => event.stopPropagation());
    outside.focus();
    outside.click();
    fixture.detectChanges();
    testBedTick();
    expect(component.visible()).toBeFalse();
    expect(document.activeElement).toBe(outside);
  });

  it('provides a default close label and removes attached content on destruction', () => {
    const { fixture, panel } = setup();
    expect(panel.querySelector('button')!.getAttribute('aria-label')).toBe(
      'Close panel',
    );
    fixture.destroy();
    expect(panel.isConnected).toBeFalse();
  });

  it('resolves an iframe trigger through its owner document realm', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    testBedTick();
    const component = fixture.debugElement.query(
      By.directive(OverlayPanelComponent),
    ).componentInstance as OverlayPanelComponent;
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const frameDocument = iframe.contentDocument;
    if (!frameDocument)
      throw new Error('same-origin iframe document unavailable');
    const trigger = frameDocument.createElement('button');
    frameDocument.body.appendChild(trigger);
    let event: Event | undefined;
    trigger.addEventListener('click', (currentEvent) => {
      event = currentEvent;
      component.show(currentEvent);
    });
    trigger.click();
    if (!event) throw new Error('iframe trigger event unavailable');

    expect(
      (component as unknown as { anchor: HTMLElement | null }).anchor,
    ).toBe(trigger);
    component.close(false);
    fixture.destroy();
    iframe.remove();
  });

  it('constructs resize observation from the panel owner window', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    testBedTick();
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const frameDocument = iframe.contentDocument;
    const frameWindow = iframe.contentWindow;
    if (!frameDocument || !frameWindow)
      throw new Error('same-origin iframe unavailable');
    frameDocument.body.appendChild(
      frameDocument.adoptNode(fixture.nativeElement),
    );
    fixture.detectChanges();
    class FrameResizeObserver {
      static instances: FrameResizeObserver[] = [];
      constructor(_callback: ResizeObserverCallback) {
        FrameResizeObserver.instances.push(this);
      }
      observe(_target: Element): void {}
      disconnect(): void {}
      unobserve(_target: Element): void {}
    }
    const originalResizeObserver = (
      frameWindow as unknown as { ResizeObserver?: unknown }
    ).ResizeObserver;
    Object.defineProperty(frameWindow, 'ResizeObserver', {
      configurable: true,
      value: FrameResizeObserver,
    });
    try {
      const trigger = fixture.nativeElement.querySelector(
        'button',
      ) as HTMLButtonElement;
      trigger.click();
      fixture.detectChanges();
      testBedTick();
      expect(FrameResizeObserver.instances.length).toBeGreaterThan(0);
    } finally {
      Object.defineProperty(frameWindow, 'ResizeObserver', {
        configurable: true,
        value: originalResizeObserver,
      });
      fixture.destroy();
      iframe.remove();
    }
  });
});

describe('Overlay placement boundaries', () => {
  const origin = {
    left: 250,
    right: 330,
    top: 300,
    bottom: 330,
    width: 80,
    height: 30,
  };
  const panel = { width: 200, height: 120 };

  it('flips above a trigger near the viewport bottom when there is more space above', () => {
    const result = positionOverlayPanel(
      origin,
      panel,
      { width: 800, height: 360 },
      'bottom',
      'start',
    );
    expect(result.placement).toBe('top');
    expect(result.top + panel.height).toBeLessThan(origin.top);
    expect(result.left).toBe(origin.left);
  });

  it('keeps the panel within a narrow viewport regardless of requested side', () => {
    for (const placement of ['top', 'bottom', 'left', 'right'] as const) {
      const result = positionOverlayPanel(
        origin,
        panel,
        { width: 360, height: 400 },
        placement,
        'end',
      );
      expect(result.left).toBeGreaterThanOrEqual(8);
      expect(result.left + panel.width).toBeLessThanOrEqual(352);
      expect(result.top).toBeGreaterThanOrEqual(8);
      expect(result.top + panel.height).toBeLessThanOrEqual(392);
    }
  });

  it('aligns the starting edge to the right in right-to-left layouts', () => {
    const result = positionOverlayPanel(
      origin,
      panel,
      { width: 800, height: 600 },
      'bottom',
      'start',
      true,
    );
    expect(result.left + panel.width).toBe(origin.right);
  });
});
