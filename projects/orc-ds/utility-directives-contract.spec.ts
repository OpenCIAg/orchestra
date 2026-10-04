import { Component, signal } from '@angular/core';
import {
  TestBed,
  fakeAsync,
  flushMicrotasks,
  tick,
} from '@angular/core/testing';
import {
  AnimateOnScrollDirective,
  UseStyleDirective,
} from './p2/p2-utility-more';
import { AutoFocusDirective } from './p2/p2-input-more';
import {
  RippleDirective,
  StyleClassDirective,
} from './p2/p2-utility-directives';

@Component({
  standalone: true,
  imports: [
    RippleDirective,
    StyleClassDirective,
    AutoFocusDirective,
    AnimateOnScrollDirective,
    UseStyleDirective,
  ],
  template: `
    <button
      id="ripple"
      orcRipple
      [disabled]="rippleDisabled()"
      style="position: static !important; overflow: visible !important"
    >
      Ripple
    </button>
    <button
      id="style-class"
      orcStyleClass
      [targetClass]="targetSelector()"
      [enterClass]="'open'"
      [leaveClass]="'closed'"
      [hideOnOutsideClick]="true"
    >
      Toggle
    </button>
    <button id="autofocus" orcAutoFocus [disabled]="focusDisabled()">
      Focus
    </button>
    <div id="animate" orcAnimateOnScroll (visible)="countVisible()"></div>
    <div
      id="style"
      [orcUseStyle]="dynamicStyles()"
      style="color: purple; margin-top: 4px"
    ></div>
    <div id="panel"></div>
    <button id="outside">Outside</button>
  `,
})
class UtilityDirectivesHost {
  rippleDisabled = signal(false);
  focusDisabled = signal(false);
  targetSelector = signal('#panel');
  dynamicStyles = signal<Record<string, string | number>>({
    color: 'red',
    width: '20px',
  });
  visibleCount = signal(0);

  countVisible(): void {
    this.visibleCount.update((value) => value + 1);
  }
}

describe('Utility directive contracts', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilityDirectivesHost],
    }).compileComponents();
  });

  it('shows a ripple, keeps pointer ripples at the click point, and restores consumer inline styles', fakeAsync(() => {
    const fixture = TestBed.createComponent(UtilityDirectivesHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector(
      '#ripple',
    ) as HTMLButtonElement;
    spyOn(host, 'getBoundingClientRect').and.returnValue({
      left: 100,
      top: 50,
      right: 180,
      bottom: 80,
      width: 80,
      height: 30,
      x: 100,
      y: 50,
      toJSON: () => ({}),
    });
    host.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        detail: 1,
        clientX: 120,
        clientY: 60,
      }),
    );
    const ripple = host.querySelector('.orc-ripple') as HTMLElement;
    expect(ripple).not.toBeNull();
    expect(ripple.style.left).toBe('-20px');
    expect(ripple.style.top).toBe('-30px');
    expect(getComputedStyle(host).overflow).toBe('hidden');
    expect(host.style.position).toBe('relative');
    expect(host.classList.contains('orc-ripple-host')).toBeTrue();
    tick(500);
    expect(host.querySelector('.orc-ripple')).toBeNull();
    expect(host.style.position).toBe('static');
    expect(host.style.getPropertyPriority('position')).toBe('important');
    expect(host.style.overflow).toBe('visible');
    expect(host.style.getPropertyPriority('overflow')).toBe('important');
    expect(host.classList.contains('orc-ripple-host')).toBeFalse();
    fixture.destroy();
  }));

  it('does not create ripples for disabled or zero-size hosts and cleans up active ripples on destroy', fakeAsync(() => {
    const fixture = TestBed.createComponent(UtilityDirectivesHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector(
      '#ripple',
    ) as HTMLButtonElement;
    fixture.componentInstance.rippleDisabled.set(true);
    fixture.detectChanges();
    host.click();
    expect(host.querySelector('.orc-ripple')).toBeNull();
    fixture.componentInstance.rippleDisabled.set(false);
    fixture.detectChanges();
    spyOn(host, 'getBoundingClientRect').and.returnValue({
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    host.click();
    expect(host.querySelector('.orc-ripple')).toBeNull();
    (host.getBoundingClientRect as jasmine.Spy).and.returnValue({
      left: 0,
      top: 0,
      right: 40,
      bottom: 30,
      width: 40,
      height: 30,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    host.click();
    expect(host.querySelector('.orc-ripple')).not.toBeNull();
    fixture.destroy();
    expect(host.querySelector('.orc-ripple')).toBeNull();
    expect(host.style.overflow).toBe('visible');
    tick(500);
  }));

  it('keeps reduced-motion ripple feedback visible without starting an animation', fakeAsync(() => {
    const fixture = TestBed.createComponent(UtilityDirectivesHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector(
      '#ripple',
    ) as HTMLButtonElement;
    spyOn(host, 'getBoundingClientRect').and.returnValue({
      left: 0,
      top: 0,
      right: 40,
      bottom: 30,
      width: 40,
      height: 30,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    spyOn(window, 'matchMedia').and.returnValue({
      matches: true,
    } as MediaQueryList);
    const animate = spyOn(Element.prototype, 'animate').and.callThrough();
    host.click();
    expect(animate).not.toHaveBeenCalled();
    expect(
      (host.querySelector('.orc-ripple') as HTMLElement).style.opacity,
    ).toBe('0.12');
    tick(150);
    fixture.destroy();
  }));

  it('toggles target state classes and closes only for clicks outside both trigger and panel', () => {
    const fixture = TestBed.createComponent(UtilityDirectivesHost);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector(
      '#style-class',
    ) as HTMLButtonElement;
    const panel = fixture.nativeElement.querySelector('#panel') as HTMLElement;
    const outside = fixture.nativeElement.querySelector(
      '#outside',
    ) as HTMLButtonElement;
    trigger.click();
    expect(panel.classList.contains('open')).toBeTrue();
    expect(panel.classList.contains('closed')).toBeFalse();
    panel.click();
    expect(panel.classList.contains('open')).toBeTrue();
    outside.click();
    expect(panel.classList.contains('open')).toBeFalse();
    expect(panel.classList.contains('closed')).toBeTrue();
    fixture.destroy();
    expect(panel.classList.contains('closed')).toBeFalse();
  });

  it('restores prior inline styles when a style is removed, cleared, or the directive is destroyed', () => {
    const fixture = TestBed.createComponent(UtilityDirectivesHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('#style') as HTMLElement;
    const directive =
      fixture.debugElement.children[4].injector.get(UseStyleDirective);
    expect(host.style.color).toBe('red');
    fixture.componentInstance.dynamicStyles.set({ width: '30px' });
    fixture.detectChanges();
    expect(host.style.color).toBe('purple');
    expect(host.style.width).toBe('30px');
    directive.clear();
    expect(host.style.width).toBe('');
    expect(host.style.marginTop).toBe('4px');
    fixture.componentInstance.dynamicStyles.set({ color: 'green' });
    fixture.detectChanges();
    fixture.destroy();
    expect(host.style.color).toBe('purple');
  });

  it('autofocuses only while enabled and mounted when the queued focus runs', fakeAsync(() => {
    const fixture = TestBed.createComponent(UtilityDirectivesHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector(
      '#autofocus',
    ) as HTMLButtonElement;
    flushMicrotasks();
    expect(document.activeElement).toBe(host);
    fixture.destroy();

    const second = TestBed.createComponent(UtilityDirectivesHost);
    second.detectChanges();
    second.componentInstance.focusDisabled.set(false);
    second.detectChanges();
    second.componentInstance.focusDisabled.set(true);
    second.detectChanges();
    flushMicrotasks();
    expect(document.activeElement).not.toBe(
      second.nativeElement.querySelector('#autofocus'),
    );
    second.destroy();
  }));

  it('adds the animation class once, ignores stale observer callbacks, and falls back without IntersectionObserver', () => {
    const ownerWindow = window as any;
    const nativeObserver = ownerWindow.IntersectionObserver;
    let callback: IntersectionObserverCallback | undefined;
    let unobserved = 0;
    let disconnected = 0;
    ownerWindow.IntersectionObserver = class {
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe(): void {}
      unobserve(): void {
        unobserved += 1;
      }
      disconnect(): void {
        disconnected += 1;
      }
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
      root: Element | Document | null = null;
      rootMargin = '0px';
      thresholds = [0.1];
    } as unknown as typeof IntersectionObserver;
    const fixture = TestBed.createComponent(UtilityDirectivesHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('#animate') as HTMLElement;
    const entry = {
      isIntersecting: true,
      target: host,
    } as unknown as IntersectionObserverEntry;
    callback!([entry], {} as IntersectionObserver);
    expect(host.classList.contains('orc-animate-visible')).toBeTrue();
    expect(fixture.componentInstance.visibleCount()).toBe(1);
    expect(unobserved).toBe(1);
    callback!([entry], {} as IntersectionObserver);
    expect(fixture.componentInstance.visibleCount()).toBe(1);
    fixture.destroy();
    callback!([entry], {} as IntersectionObserver);
    expect(fixture.componentInstance.visibleCount()).toBe(1);
    expect(disconnected).toBe(1);

    ownerWindow.IntersectionObserver =
      undefined as unknown as typeof IntersectionObserver;
    const fallback = TestBed.createComponent(UtilityDirectivesHost);
    fallback.detectChanges();
    expect(
      (
        fallback.nativeElement.querySelector('#animate') as HTMLElement
      ).classList.contains('orc-animate-visible'),
    ).toBeTrue();
    fallback.destroy();
    ownerWindow.IntersectionObserver = nativeObserver;
  });
});
