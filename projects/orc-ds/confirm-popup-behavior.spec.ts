import { ElementRef } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  ConfirmPopupComponent,
  ConfirmPopupService,
} from './p2/p2-confirm-popup';

describe('ConfirmPopup outside dismissal and focus contract', () => {
  function create() {
    const service = TestBed.inject(ConfirmPopupService);
    const fixture = TestBed.createComponent(ConfirmPopupComponent);
    return { fixture, service };
  }

  function pointerDown(target: EventTarget): void {
    target.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, composed: true }),
    );
  }

  it('uses the opener as the fallback when a background pointer has no focus target', fakeAsync(() => {
    const opener = document.createElement('button');
    const outside = document.createElement('div');
    document.body.append(opener, outside);
    opener.focus();
    const rejected = jasmine.createSpy('rejected');
    const { fixture, service } = create();
    service.confirm({
      message: 'Discard changes?',
      x: 23,
      y: 41,
      reject: rejected,
    });
    fixture.detectChanges();
    tick();

    const popup = fixture.nativeElement.querySelector(
      '[role="alertdialog"]',
    ) as HTMLElement;
    expect(popup.style.left).toBe('23px');
    expect(popup.style.top).toBe('41px');
    pointerDown(outside);
    fixture.detectChanges();
    tick();

    expect(rejected).toHaveBeenCalledTimes(1);
    expect(service.request()).toBeNull();
    expect(document.activeElement).toBe(opener);
    fixture.destroy();
    opener.remove();
    outside.remove();
  }));

  it('keeps focus on a focusable outside target after capture-phase dismissal', fakeAsync(() => {
    const opener = document.createElement('button');
    const outside = document.createElement('button');
    document.body.append(opener, outside);
    opener.focus();
    const { fixture, service } = create();
    service.confirm({ message: 'Discard changes?' });
    fixture.detectChanges();
    tick();

    // The document capture listener runs before the browser's pointer default
    // action focuses the clicked button. Model that ordering explicitly.
    pointerDown(outside);
    outside.focus();
    fixture.detectChanges();
    tick();

    expect(service.request()).toBeNull();
    expect(document.activeElement).toBe(outside);
    fixture.destroy();
    opener.remove();
    outside.remove();
  }));

  it('keeps an inside pointer open and preserves accept callback semantics', fakeAsync(() => {
    const accepted = jasmine.createSpy('accepted');
    const { fixture, service } = create();
    service.confirm({ message: 'Apply changes?', accept: accepted });
    fixture.detectChanges();
    tick();

    const popup = fixture.nativeElement.querySelector(
      '[role="alertdialog"]',
    ) as HTMLElement;
    pointerDown(popup.querySelector('p')!);
    expect(service.request()).not.toBeNull();
    (popup.querySelector('.accept') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(accepted).toHaveBeenCalledTimes(1);
    expect(service.request()).toBeNull();
    fixture.destroy();
  }));

  it('anchors to the focused opener by default and follows it after scrolling', fakeAsync(() => {
    const opener = document.createElement('button');
    opener.textContent = 'Open confirmation';
    opener.style.cssText =
      'position:fixed;left:24px;top:32px;width:100px;height:30px';
    document.body.append(opener);
    opener.focus();
    const { fixture, service } = create();
    service.confirm({ message: 'Continue?' });
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const popup = fixture.nativeElement.querySelector(
      '[role="alertdialog"]',
    ) as HTMLElement;
    expect(popup.getBoundingClientRect().left).toBe(
      opener.getBoundingClientRect().left,
    );
    expect(popup.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      opener.getBoundingClientRect().bottom,
    );

    opener.style.left = '120px';
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(popup.getBoundingClientRect().left).toBe(120);

    service.close();
    fixture.detectChanges();
    tick();
    expect(document.activeElement).toBe(opener);
    fixture.destroy();
    opener.remove();
  }));

  it('uses an explicit target, ignores non-finite coordinates, and clamps placement', fakeAsync(() => {
    const target = document.createElement('button');
    target.textContent = 'Delete record';
    target.style.cssText =
      'position:fixed;right:4px;bottom:4px;width:32px;height:24px';
    document.body.append(target);
    target.focus();
    const { fixture, service } = create();
    service.confirm({
      message: 'Delete this record?',
      target,
      x: Number.NaN,
      y: Number.NaN,
    });
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    // Re-measure after browser layout has settled (for example, scrollbar/font changes).
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();

    const popup = fixture.nativeElement.querySelector(
      '[role="alertdialog"]',
    ) as HTMLElement;
    const popupRect = popup.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    expect(popupRect.left).toBeGreaterThanOrEqual(7);
    expect(popupRect.right)
      .withContext(
        JSON.stringify({
          left: popup.style.left,
          positionLeft: fixture.componentInstance.positionLeft(),
          rect: popupRect.toJSON(),
        }),
      )
      .toBeLessThanOrEqual(window.innerWidth - 7);
    expect(popupRect.bottom).toBeLessThan(targetRect.top);
    expect(popupRect.top).toBeGreaterThanOrEqual(7);

    service.close();
    fixture.detectChanges();
    tick();
    expect(document.activeElement).toBe(target);
    fixture.destroy();
    target.remove();
  }));

  it('accepts an ElementRef as its explicit anchor', fakeAsync(() => {
    const target = document.createElement('button');
    target.style.cssText =
      'position:fixed;left:40px;top:48px;width:80px;height:24px';
    document.body.append(target);
    const { fixture, service } = create();
    service.confirm({ message: 'Continue?', target: new ElementRef(target) });
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const popup = fixture.nativeElement.querySelector(
      '[role="alertdialog"]',
    ) as HTMLElement;
    expect(popup.getBoundingClientRect().left).toBe(40);
    expect(popup.getBoundingClientRect().top).toBeGreaterThan(
      target.getBoundingClientRect().bottom,
    );

    service.close();
    fixture.detectChanges();
    tick();
    fixture.destroy();
    target.remove();
  }));

  it('restores opener focus when the service closes externally', fakeAsync(() => {
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();
    const { fixture, service } = create();
    service.confirm({ message: 'Continue?' });
    fixture.detectChanges();
    tick();
    expect(document.activeElement).not.toBe(opener);

    service.close();
    fixture.detectChanges();
    tick();

    expect(document.activeElement).toBe(opener);
    fixture.destroy();
    opener.remove();
  }));

  it('removes the outside listener when destroyed while open', fakeAsync(() => {
    const outside = document.createElement('button');
    document.body.append(outside);
    const rejected = jasmine.createSpy('rejected');
    const { fixture, service } = create();
    service.confirm({ message: 'Leave?', reject: rejected });
    fixture.detectChanges();
    tick();
    fixture.destroy();

    pointerDown(outside);
    expect(rejected).not.toHaveBeenCalled();
    expect(service.request()).toBeNull();
    outside.remove();
  }));

  it('uses the iframe owner document and realm for dismissal and opener restoration', fakeAsync(() => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const ownerDocument = frame.contentDocument!;
    const opener = ownerDocument.createElement('button');
    const outside = ownerDocument.createElement('div');
    ownerDocument.body.append(opener, outside);
    opener.focus();

    const service = TestBed.inject(ConfirmPopupService);
    const fixture = TestBed.createComponent(ConfirmPopupComponent);
    ownerDocument.body.append(fixture.nativeElement);
    try {
      service.confirm({ message: 'Continue?' });
      fixture.detectChanges();
      tick();

      const accept = ownerDocument.querySelector(
        '.popup .accept',
      ) as HTMLButtonElement;
      expect(ownerDocument.activeElement).toBe(accept);

      const PointerEventConstructor = ownerDocument.defaultView!.PointerEvent;
      outside.dispatchEvent(
        new PointerEventConstructor('pointerdown', {
          bubbles: true,
          composed: true,
        }),
      );
      fixture.detectChanges();
      tick();

      expect(service.request()).toBeNull();
      expect(ownerDocument.activeElement).toBe(opener);
    } finally {
      service.close();
      fixture.destroy();
      frame.remove();
    }
  }));
});
