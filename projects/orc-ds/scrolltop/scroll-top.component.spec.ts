import { TestBed } from '@angular/core/testing';
import { ScrollTopComponent } from '../p2/p2-primeng-gap-components';

describe('ScrollTopComponent', () => {
  it('rebinds its scroll source when target changes after view initialization', () => {
    const parent = document.createElement('div');
    Object.defineProperty(parent, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 240,
    });
    document.body.appendChild(parent);

    const fixture = TestBed.createComponent(ScrollTopComponent);
    parent.appendChild(fixture.nativeElement);
    fixture.componentRef.setInput('threshold', Number.MAX_SAFE_INTEGER);
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeFalse();

    fixture.componentRef.setInput('threshold', 200);
    fixture.componentRef.setInput('target', 'parent');
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeTrue();

    // Keep the window branch deterministic even when an earlier spec scrolled the page.
    fixture.componentRef.setInput('threshold', Number.MAX_SAFE_INTEGER);
    fixture.componentRef.setInput('target', 'window');
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeFalse();
    parent.scrollTop = 480;
    parent.dispatchEvent(new Event('scroll'));
    expect(fixture.componentInstance.visible()).toBeFalse();

    fixture.destroy();
    parent.remove();
  });

  it('refreshes visibility immediately when threshold changes', () => {
    const parent = document.createElement('div');
    Object.defineProperty(parent, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 240,
    });
    document.body.appendChild(parent);

    const fixture = TestBed.createComponent(ScrollTopComponent);
    parent.appendChild(fixture.nativeElement);
    fixture.componentRef.setInput('target', 'parent');
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeTrue();

    fixture.componentRef.setInput('threshold', 300);
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeFalse();

    fixture.componentRef.setInput('threshold', 100);
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeTrue();

    fixture.destroy();
    parent.remove();
  });

  it('provides a useful default button name and respects both label inputs', () => {
    const fixture = TestBed.createComponent(ScrollTopComponent);
    fixture.detectChanges();
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Scroll to top');

    fixture.componentRef.setInput('ariaLabel', 'Back to page start');
    fixture.detectChanges();
    expect(button.getAttribute('aria-label')).toBe('Back to page start');

    fixture.componentRef.setInput('buttonAriaLabel', 'Go to top');
    fixture.detectChanges();
    expect(button.getAttribute('aria-label')).toBe('Go to top');

    fixture.componentRef.setInput('buttonAriaLabel', '   ');
    fixture.detectChanges();
    expect(button.getAttribute('aria-label')).toBe('Back to page start');

    fixture.componentRef.setInput('ariaLabel', '  ');
    fixture.detectChanges();
    expect(button.getAttribute('aria-label')).toBe('Scroll to top');

    fixture.componentRef.setInput('icon', '⇧');
    fixture.componentRef.setInput('styleClass', 'consumer-scroll-top');
    fixture.componentRef.setInput('style', { color: 'rgb(255, 0, 0)' });
    const scrollTo = spyOn(window, 'scrollTo').and.stub();
    const clicked = jasmine.createSpy('clicked');
    fixture.componentInstance.clicked.subscribe(clicked);
    fixture.detectChanges();
    expect(button.textContent?.trim()).toBe('⇧');
    expect(button.classList.contains('consumer-scroll-top')).toBeTrue();
    expect(button.style.color).toBe('rgb(255, 0, 0)');
    button.click();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(clicked).toHaveBeenCalledTimes(1);

    fixture.destroy();
  });

  it('honors reduced motion when smooth behavior is requested', () => {
    const fixture = TestBed.createComponent(ScrollTopComponent);
    fixture.componentRef.setInput('behavior', 'smooth');
    fixture.detectChanges();

    const matchMedia = spyOn(window, 'matchMedia').and.returnValue({
      matches: true,
    } as MediaQueryList);
    const scrollTo = spyOn(window, 'scrollTo').and.stub();
    fixture.componentInstance.scroll();

    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    fixture.destroy();
  });

  it('keeps keyboard focus while scrolling below the threshold and hides after blur', () => {
    const originalScrollY = Object.getOwnPropertyDescriptor(window, 'scrollY');
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 400,
    });

    const fixture = TestBed.createComponent(ScrollTopComponent);
    fixture.componentRef.setInput('threshold', 200);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    button.focus();
    expect(document.activeElement).toBe(button);

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
    });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(fixture.componentInstance.visible()).toBeTrue();
    expect(fixture.nativeElement.querySelector('button')).toBe(button);
    expect(document.activeElement).toBe(button);

    button.blur();
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeFalse();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();

    fixture.destroy();
    if (originalScrollY) {
      Object.defineProperty(window, 'scrollY', originalScrollY);
    } else {
      Object.defineProperty(window, 'scrollY', {
        configurable: true,
        value: 0,
      });
    }
  });

  it('uses only the immediate parent scroll surface and cleans up its listener', () => {
    const parent = document.createElement('div');
    Object.defineProperty(parent, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 0,
    });
    const parentScrollTo = jasmine.createSpy('parentScrollTo');
    Object.defineProperty(parent, 'scrollTo', {
      configurable: true,
      value: parentScrollTo,
    });
    document.body.appendChild(parent);

    const parentAdd = spyOn(parent, 'addEventListener').and.callThrough();
    const parentRemove = spyOn(parent, 'removeEventListener').and.callThrough();
    const windowAdd = spyOn(window, 'addEventListener').and.callThrough();
    const windowRemove = spyOn(window, 'removeEventListener').and.callThrough();
    const fixture = TestBed.createComponent(ScrollTopComponent);
    parent.appendChild(fixture.nativeElement);
    fixture.componentRef.setInput('target', 'parent');
    fixture.componentRef.setInput('threshold', 100);
    fixture.detectChanges();

    const parentScrollListener = parentAdd.calls
      .allArgs()
      .filter(([type]) => type === 'scroll')
      .pop()?.[1];
    expect(parentScrollListener).toEqual(jasmine.any(Function));
    expect(
      windowAdd.calls.allArgs().filter(([type]) => type === 'scroll'),
    ).toHaveSize(0);
    expect(fixture.componentInstance.visible()).toBeFalse();

    parent.scrollTop = 120;
    parent.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeTrue();
    const windowScrollTo = spyOn(window, 'scrollTo').and.stub();
    fixture.componentInstance.scroll();
    expect(parentScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
    expect(windowScrollTo).not.toHaveBeenCalled();

    fixture.destroy();
    expect(parentRemove).toHaveBeenCalledWith(
      'scroll',
      parentScrollListener as EventListenerOrEventListenerObject,
    );
    expect(
      windowRemove.calls.allArgs().filter(([type]) => type === 'scroll'),
    ).toHaveSize(0);
    parent.remove();
  });

  it('rebinds the sole scroll listener across window and parent target changes', () => {
    const parent = document.createElement('div');
    Object.defineProperty(parent, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 0,
    });
    document.body.appendChild(parent);
    const windowAdd = spyOn(window, 'addEventListener').and.callThrough();
    const windowRemove = spyOn(window, 'removeEventListener').and.callThrough();
    const parentAdd = spyOn(parent, 'addEventListener').and.callThrough();
    const parentRemove = spyOn(parent, 'removeEventListener').and.callThrough();
    const fixture = TestBed.createComponent(ScrollTopComponent);
    parent.appendChild(fixture.nativeElement);
    fixture.detectChanges();

    const windowListeners = () =>
      windowAdd.calls
        .allArgs()
        .filter(([type]) => type === 'scroll')
        .map(([, listener]) => listener);
    const parentListeners = () =>
      parentAdd.calls
        .allArgs()
        .filter(([type]) => type === 'scroll')
        .map(([, listener]) => listener);
    expect(windowListeners()).toHaveSize(1);
    const firstWindowListener = windowListeners()[0];

    fixture.componentRef.setInput('target', 'parent');
    fixture.detectChanges();
    expect(windowRemove).toHaveBeenCalledWith(
      'scroll',
      firstWindowListener as EventListenerOrEventListenerObject,
    );
    expect(parentListeners()).toHaveSize(1);
    const parentListener = parentListeners()[0];

    fixture.componentRef.setInput('target', 'window');
    fixture.detectChanges();
    expect(parentRemove).toHaveBeenCalledWith(
      'scroll',
      parentListener as EventListenerOrEventListenerObject,
    );
    expect(windowListeners()).toHaveSize(2);
    const activeWindowListener = windowListeners()[1];

    fixture.destroy();
    expect(windowRemove).toHaveBeenCalledWith(
      'scroll',
      activeWindowListener as EventListenerOrEventListenerObject,
    );
    parent.remove();
  });

  it('reads and scrolls through the owning iframe window', () => {
    const fixture = TestBed.createComponent(ScrollTopComponent);
    fixture.componentRef.setInput('threshold', 200);
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    const frameDocument = frame.contentDocument;
    const frameWindow = frame.contentWindow;
    if (!frameDocument || !frameWindow)
      throw new Error('same-origin iframe unavailable');
    frameDocument.body.appendChild(
      frameDocument.adoptNode(fixture.nativeElement),
    );
    Object.defineProperty(frameWindow, 'scrollY', {
      configurable: true,
      value: 240,
    });
    const scrollTo = spyOn(frameWindow, 'scrollTo').and.stub();
    fixture.detectChanges();
    frameWindow.dispatchEvent(new Event('scroll'));
    expect(fixture.componentInstance.visible()).toBeTrue();
    fixture.componentInstance.scroll();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    fixture.destroy();
    frame.remove();
  });
});
