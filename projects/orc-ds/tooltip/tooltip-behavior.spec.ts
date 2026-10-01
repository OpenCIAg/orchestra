import { Component, signal } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  blurElement,
  focusElement,
} from '../../../tools/quality/test-focus-events';
import { TooltipDirective } from './tooltip.directive';

@Component({
  imports: [TooltipDirective],
  template: `<button
      [orcTooltip]="text()"
      [tooltipDisabled]="disabled()"
      [fitContent]="fitContent()"
      [showDelay]="20"
      [hideDelay]="20"
      aria-describedby="help"
    >
      Trigger</button
    ><span id="help">Help</span>`,
})
class Host {
  text = signal('Details');
  disabled = signal(false);
  fitContent = signal(true);
}

describe('Tooltip event and resource ownership', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    const enter = () => {
      button.dispatchEvent(new MouseEvent('mouseenter'));
      tick(40);
      fixture.detectChanges();
    };
    return { fixture, button, enter };
  }
  const tooltip = () =>
    document.querySelector<HTMLElement>('orc-tooltip-overlay');

  it('keeps a focused tooltip visible when the pointer leaves, then hides after focus leaves', fakeAsync(() => {
    const { fixture, button, enter } = setup();
    focusElement(button);
    enter();
    button.dispatchEvent(new MouseEvent('mouseleave'));
    tick(200);
    expect(tooltip()).not.toBeNull();
    blurElement(button);
    tick(200);
    expect(tooltip()).toBeNull();
    fixture.destroy();
  }));

  it('owns repeated show timers and cancels pending and fading views on destruction', fakeAsync(() => {
    const { fixture, button } = setup();
    button.dispatchEvent(new MouseEvent('mouseenter'));
    tick(5);
    button.dispatchEvent(new MouseEvent('mouseenter'));
    tick(30);
    fixture.detectChanges();
    expect(document.querySelectorAll('orc-tooltip-overlay').length).toBe(1);
    button.dispatchEvent(new MouseEvent('mouseleave'));
    tick(25);
    fixture.destroy();
    expect(tooltip()).toBeNull();
    tick(300);
    expect(tooltip()).toBeNull();
  }));

  it('preserves descriptions added by the consumer while open and handles Escape', fakeAsync(() => {
    const { fixture, button, enter } = setup();
    enter();
    button.setAttribute(
      'aria-describedby',
      button.getAttribute('aria-describedby') + ' validation',
    );
    button.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    expect(tooltip()).toBeNull();
    expect(button.getAttribute('aria-describedby')).toBe('help validation');
    fixture.destroy();
    tick(200);
  }));

  it('reacts to content changes and disabling while open', fakeAsync(() => {
    const { fixture, enter } = setup();
    enter();
    fixture.componentInstance.text.set('Updated details');
    fixture.detectChanges();
    expect(tooltip()?.textContent).toContain('Updated details');
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(tooltip()).toBeNull();
    fixture.destroy();
    tick(200);
  }));

  it('keeps fitting short text by default and wraps when fitContent is false', fakeAsync(() => {
    const { fixture, enter } = setup();
    enter();
    const text = tooltip()!.querySelector('.orc-tooltip__text') as HTMLElement;
    expect(
      text
        .closest('.orc-tooltip')
        ?.classList.contains('orc-tooltip--fit-content'),
    ).toBe(true);

    fixture.componentInstance.fitContent.set(false);
    fixture.detectChanges();
    expect(
      text
        .closest('.orc-tooltip')
        ?.classList.contains('orc-tooltip--fit-content'),
    ).toBe(false);
    expect(getComputedStyle(text).whiteSpace).toBe('normal');
    expect(getComputedStyle(text).maxWidth).not.toBe('none');
    fixture.destroy();
    tick(200);
  }));

  it('repositions when an ancestor scrolls and stops listening after dismissal', fakeAsync(() => {
    const { fixture, button, enter } = setup();
    let top = 200;
    const rect = spyOn(button, 'getBoundingClientRect').and.callFake(() => ({
      top,
      bottom: top + 30,
      left: 200,
      right: 280,
      width: 80,
      height: 30,
      x: 200,
      y: top,
      toJSON: () => ({}),
    }));
    enter();
    const initial = tooltip()!.style.top;
    top = 300;
    button.dispatchEvent(new Event('scroll', { bubbles: false }));
    expect(tooltip()!.style.top).not.toBe(initial);
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    const calls = rect.calls.count();
    button.dispatchEvent(new Event('scroll'));
    expect(rect.calls.count()).toBe(calls);
    fixture.destroy();
    tick(200);
  }));

  it('schedules animation and measures viewport through a same-origin iframe window', fakeAsync(() => {
    const { fixture } = setup();
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    const frameDocument = frame.contentDocument;
    const frameWindow = frame.contentWindow;
    if (!frameDocument || !frameWindow)
      throw new Error('same-origin iframe unavailable');
    frameDocument.body.appendChild(
      frameDocument.adoptNode(fixture.nativeElement),
    );
    fixture.detectChanges();
    const requestAnimationFrame = spyOn(
      frameWindow,
      'requestAnimationFrame',
    ).and.callFake((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    tick(40);
    fixture.detectChanges();

    expect(requestAnimationFrame).toHaveBeenCalled();
    expect(frameDocument.querySelector('orc-tooltip-overlay')).not.toBeNull();
    fixture.destroy();
    frame.remove();
    tick(200);
  }));
});
