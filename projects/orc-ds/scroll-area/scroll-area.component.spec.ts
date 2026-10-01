import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ScrollAreaComponent,
  ScrollAreaOrientation,
} from './scroll-area.component';

@Component({
  standalone: true,
  imports: [ScrollAreaComponent],
  template: `<orc-scroll-area [orientation]="orientation" [label]="label"
    ><button id="projected">Projected action</button></orc-scroll-area
  >`,
})
class ScrollAreaHost {
  orientation: ScrollAreaOrientation = 'both';
  label = 'Scrollable report';
}

describe('ScrollAreaComponent behavior', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollAreaComponent, ScrollAreaHost],
    }).compileComponents();
  });

  it('measures both axes independently, updates shadows on scroll, and disables shadows for hidden axes', () => {
    const observerDisconnect = spyOn(
      ResizeObserver.prototype,
      'disconnect',
    ).and.callThrough();
    const fixture = TestBed.createComponent(ScrollAreaComponent);
    fixture.componentRef.setInput('orientation', 'both');
    fixture.detectChanges();
    const viewport = fixture.nativeElement.querySelector(
      '.orc-scroll-area__viewport',
    ) as HTMLElement;
    Object.defineProperties(viewport, {
      scrollLeft: { configurable: true, writable: true, value: 0 },
      scrollTop: { configurable: true, writable: true, value: 0 },
      clientWidth: { configurable: true, value: 80 },
      clientHeight: { configurable: true, value: 100 },
      scrollWidth: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 250 },
    });
    expect([
      viewport.clientWidth,
      viewport.clientHeight,
      viewport.scrollWidth,
      viewport.scrollHeight,
    ]).toEqual([80, 100, 200, 250]);
    viewport.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.orc-scroll-area__shadow--bottom')
        .classList,
    ).toContain('orc-scroll-area__shadow--visible');
    expect(
      fixture.nativeElement.querySelector('.orc-scroll-area__shadow--right')
        .classList,
    ).toContain('orc-scroll-area__shadow--visible');
    expect(
      fixture.nativeElement.querySelector('.orc-scroll-area__shadow--top')
        .classList,
    ).not.toContain('orc-scroll-area__shadow--visible');

    viewport.scrollTop = 20;
    viewport.scrollLeft = 15;
    viewport.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.orc-scroll-area__shadow--top')
        .classList,
    ).toContain('orc-scroll-area__shadow--visible');
    expect(
      fixture.nativeElement.querySelector('.orc-scroll-area__shadow--left')
        .classList,
    ).toContain('orc-scroll-area__shadow--visible');

    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.orc-scroll-area__shadow--left')
        .classList,
    ).not.toContain('orc-scroll-area__shadow--visible');
    expect(
      fixture.nativeElement.querySelector('.orc-scroll-area__shadow--right')
        .classList,
    ).not.toContain('orc-scroll-area__shadow--visible');
    fixture.destroy();
    expect(observerDisconnect).toHaveBeenCalled();
  });

  it('provides a named scroll region and only consumes paging keys when the viewport owns focus', () => {
    const fixture = TestBed.createComponent(ScrollAreaHost);
    fixture.detectChanges();
    const viewport = fixture.nativeElement.querySelector(
      '.orc-scroll-area__viewport',
    ) as HTMLElement;
    const scrollBy = spyOn(viewport, 'scrollBy');
    expect(viewport.getAttribute('role')).toBe('region');
    expect(viewport.getAttribute('aria-label')).toBe('Scrollable report');
    Object.defineProperty(viewport, 'clientHeight', {
      configurable: true,
      value: 100,
    });
    const pageDown = new KeyboardEvent('keydown', {
      key: 'PageDown',
      bubbles: true,
      cancelable: true,
    });
    viewport.dispatchEvent(pageDown);
    expect(pageDown.defaultPrevented).toBeTrue();
    expect(scrollBy.calls.mostRecent().args[0] as unknown).toEqual({
      top: 100,
      behavior: 'smooth',
    });

    const child = fixture.nativeElement.querySelector(
      '#projected',
    ) as HTMLButtonElement;
    const childPageDown = new KeyboardEvent('keydown', {
      key: 'PageDown',
      bubbles: true,
      cancelable: true,
    });
    child.dispatchEvent(childPageDown);
    expect(childPageDown.defaultPrevented).toBeFalse();
    expect(scrollBy).toHaveBeenCalledTimes(1);
    fixture.destroy();
  });

  it('uses directional keys for each enabled axis and keeps paging on the primary axis', () => {
    const fixture = TestBed.createComponent(ScrollAreaComponent);
    fixture.componentRef.setInput('orientation', 'both');
    fixture.detectChanges();
    const viewport = fixture.nativeElement.querySelector(
      '.orc-scroll-area__viewport',
    ) as HTMLElement;
    Object.defineProperties(viewport, {
      clientWidth: { configurable: true, value: 120 },
      clientHeight: { configurable: true, value: 80 },
    });
    const scrollBy = spyOn(viewport, 'scrollBy');

    const dispatch = (key: string): KeyboardEvent => {
      const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
      });
      viewport.dispatchEvent(event);
      expect(event.defaultPrevented).toBeTrue();
      return event;
    };

    dispatch('ArrowRight');
    expect(scrollBy.calls.mostRecent().args[0] as unknown).toEqual({
      left: 30,
      behavior: 'smooth',
    });
    dispatch('ArrowLeft');
    expect(scrollBy.calls.mostRecent().args[0] as unknown).toEqual({
      left: -30,
      behavior: 'smooth',
    });
    dispatch('ArrowDown');
    expect(scrollBy.calls.mostRecent().args[0] as unknown).toEqual({
      top: 20,
      behavior: 'smooth',
    });
    dispatch('ArrowUp');
    expect(scrollBy.calls.mostRecent().args[0] as unknown).toEqual({
      top: -20,
      behavior: 'smooth',
    });
    dispatch('PageDown');
    expect(scrollBy.calls.mostRecent().args[0] as unknown).toEqual({
      top: 80,
      behavior: 'smooth',
    });
    dispatch('PageUp');
    expect(scrollBy.calls.mostRecent().args[0] as unknown).toEqual({
      top: -80,
      behavior: 'smooth',
    });

    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();
    const horizontalKey = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    viewport.dispatchEvent(horizontalKey);
    expect(horizontalKey.defaultPrevented).toBeFalse();
    const modifiedKey = new KeyboardEvent('keydown', {
      key: 'PageDown',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    viewport.dispatchEvent(modifiedKey);
    expect(modifiedKey.defaultPrevented).toBeFalse();
    expect(scrollBy).toHaveBeenCalledTimes(6);
    fixture.destroy();
  });

  it('refreshes both-axis affordances after projected content changes', async () => {
    const fixture = TestBed.createComponent(ScrollAreaHost);
    fixture.componentInstance.orientation = 'both';
    fixture.detectChanges();
    const viewport = fixture.nativeElement.querySelector(
      '.orc-scroll-area__viewport',
    ) as HTMLElement;
    Object.defineProperties(viewport, {
      scrollLeft: { configurable: true, writable: true, value: 0 },
      scrollTop: { configurable: true, writable: true, value: 0 },
      clientWidth: { configurable: true, value: 80 },
      clientHeight: { configurable: true, value: 100 },
      scrollWidth: { configurable: true, value: 80 },
      scrollHeight: { configurable: true, value: 100 },
    });
    fixture.componentInstance.orientation = 'vertical';
    fixture.detectChanges();
    fixture.componentInstance.orientation = 'both';
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.orc-scroll-area__shadow--bottom')
        .classList,
    ).not.toContain('orc-scroll-area__shadow--visible');

    Object.defineProperty(viewport, 'scrollHeight', {
      configurable: true,
      value: 250,
    });
    viewport.appendChild(document.createElement('div'));
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.orc-scroll-area__shadow--bottom')
        .classList,
    ).toContain('orc-scroll-area__shadow--visible');
    fixture.destroy();
  });

  it('pages both axes in the rendered viewport and remeasures after its bounds shrink', async () => {
    const fixture = TestBed.createComponent(ScrollAreaComponent);
    fixture.componentRef.setInput('orientation', 'both');
    fixture.componentRef.setInput('maxHeight', '200px');
    fixture.componentRef.setInput('maxWidth', '200px');
    fixture.nativeElement.style.width = '400px';
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();

    const viewport = fixture.nativeElement.querySelector(
      '.orc-scroll-area__viewport',
    ) as HTMLElement;
    const content = document.createElement('div');
    content.style.width = '160px';
    content.style.height = '160px';
    viewport.appendChild(content);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    fixture.detectChanges();

    expect(viewport.clientHeight).toBe(160);
    expect(viewport.clientWidth).toBe(200);
    expect(viewport.scrollHeight).toBe(viewport.clientHeight);
    expect(viewport.scrollWidth).toBe(viewport.clientWidth);
    expect(
      fixture.nativeElement.querySelector('.orc-scroll-area__shadow--bottom')
        .classList,
    ).not.toContain('orc-scroll-area__shadow--visible');
    expect(
      fixture.nativeElement.querySelector('.orc-scroll-area__shadow--right')
        .classList,
    ).not.toContain('orc-scroll-area__shadow--visible');

    fixture.componentRef.setInput('maxHeight', '100px');
    fixture.componentRef.setInput('maxWidth', '100px');
    fixture.detectChanges();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    fixture.detectChanges();

    expect(viewport.style.maxHeight).toBe('100px');
    expect(viewport.style.maxWidth).toBe('100px');
    expect(viewport.getBoundingClientRect().height).toBe(100);
    expect(viewport.getBoundingClientRect().width).toBe(100);
    expect(viewport.clientHeight).toBeLessThanOrEqual(100);
    expect(viewport.clientWidth).toBeLessThanOrEqual(100);
    expect(
      fixture.nativeElement.querySelector('.orc-scroll-area__shadow--bottom')
        .classList,
    ).toContain('orc-scroll-area__shadow--visible');
    expect(
      fixture.nativeElement.querySelector('.orc-scroll-area__shadow--right')
        .classList,
    ).toContain('orc-scroll-area__shadow--visible');

    const matchMedia = spyOn(window, 'matchMedia').and.callFake(
      () => ({ matches: true }) as MediaQueryList,
    );
    const pageDown = new KeyboardEvent('keydown', {
      key: 'PageDown',
      bubbles: true,
      cancelable: true,
    });
    viewport.dispatchEvent(pageDown);
    expect(pageDown.defaultPrevented).toBeTrue();
    expect(viewport.scrollTop).toBeGreaterThan(0);

    const arrowRight = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    viewport.dispatchEvent(arrowRight);
    expect(arrowRight.defaultPrevented).toBeTrue();
    expect(viewport.scrollLeft).toBeGreaterThan(0);
    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');

    fixture.destroy();
    fixture.nativeElement.remove();
  });

  it('uses a useful default accessible name when no label is supplied', () => {
    const fixture = TestBed.createComponent(ScrollAreaComponent);
    fixture.detectChanges();
    const viewport = fixture.nativeElement.querySelector(
      '.orc-scroll-area__viewport',
    ) as HTMLElement;
    expect(viewport.getAttribute('role')).toBe('region');
    expect(viewport.getAttribute('aria-label')).toBe('Scrollable content');
    fixture.destroy();
  });
});
