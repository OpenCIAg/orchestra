import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DatePickerComponent } from './date-picker.component';
import { focusElement } from '../../../tools/quality/test-focus-events';
import { ModalComponent } from '../modal/modal.component';
import { attachAnchoredPopup, positionOverlayPanel } from '../internal';

@Component({
  imports: [DatePickerComponent, ModalComponent],
  template: `<orc-modal header="Appointment"
    ><orc-date-picker label="Date" appendTo="body"
  /></orc-modal>`,
})
class DialogHost {}

describe('Date picker popup placement and attachment', () => {
  const karmaArgs =
    (window as unknown as { __karma__?: { config?: { args?: string[] } } })
      .__karma__?.config?.args ?? [];
  const requiresNarrowViewport = karmaArgs.includes('date-picker-narrow');

  function setup(style = '') {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.nativeElement.style.cssText = style;
    fixture.componentRef.setInput('label', 'Date');
    fixture.componentRef.setInput('value', '2026-08-17');
    fixture.detectChanges();
    return fixture;
  }

  function expectHit(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const hit = document.elementFromPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );
    expect(hit === element || element.contains(hit))
      .withContext('popup content accepts pointer input')
      .toBeTrue();
  }

  it('escapes an overflow-hidden container while preserving DOM ancestry and inherited styles', () => {
    const fixture = setup(
      'position:fixed;left:40px;top:40px;width:220px;height:60px;overflow:hidden;--orc-text:rgb(123, 45, 67)',
    );
    fixture.componentInstance.show();
    fixture.detectChanges();
    const panel = fixture.componentInstance.panel()!.nativeElement;
    expect(panel.matches(':popover-open')).toBeTrue();
    expect(fixture.nativeElement.contains(panel)).toBeTrue();
    expect(getComputedStyle(panel).color).toBe('rgb(123, 45, 67)');
    const day = panel.querySelector<HTMLElement>('[data-date="2026-08-17"]')!;
    expect(day.getBoundingClientRect().top).toBeGreaterThan(
      fixture.nativeElement.getBoundingClientRect().bottom,
    );
    expectHit(day);
  });

  it('flips above a low anchor and keeps the whole calendar inside the right viewport edge', () => {
    const fixture = setup('position:fixed;right:4px;bottom:4px;width:220px');
    fixture.componentInstance.show();
    fixture.detectChanges();
    const panel = fixture.componentInstance.panel()!.nativeElement;
    const rect = panel.getBoundingClientRect();
    const anchor = fixture.componentInstance
      .anchor()!
      .nativeElement.getBoundingClientRect();
    expect(rect.right).toBeLessThanOrEqual(
      document.documentElement.clientWidth - 7,
    );
    expect(rect.left).toBeGreaterThanOrEqual(7);
    expect(rect.bottom).toBeLessThanOrEqual(anchor.top - 7);
    expectHit(panel.querySelector<HTMLElement>('[data-date="2026-08-17"]')!);
  });

  it('clamps a 320px viewport without losing the last column', () => {
    const position = positionOverlayPanel(
      { left: 49, right: 300, top: 150, bottom: 190, width: 251, height: 40 },
      { width: 304, height: 330 },
      { width: 320, height: 760 },
      'bottom',
      'start',
    );
    expect(position.left).toBe(8);
    expect(position.left + 304).toBe(312);
  });

  it('scrolls tall DateTime content instead of covering its input when neither side fits the full popup', () => {
    const fixture = setup('position:fixed;left:40px;top:50%;width:220px');
    fixture.componentRef.setInput('showTime', true);
    fixture.componentRef.setInput('showSeconds', true);
    fixture.componentInstance.show();
    fixture.detectChanges();
    const panel = fixture.componentInstance.panel()!.nativeElement;
    const bounds = panel.getBoundingClientRect();
    const anchor = fixture.componentInstance
      .anchor()!
      .nativeElement.getBoundingClientRect();
    expect(bounds.bottom <= anchor.top - 7 || bounds.top >= anchor.bottom + 7)
      .withContext('the popup leaves its input visible')
      .toBeTrue();
    expect(panel.scrollHeight).toBeGreaterThan(panel.clientHeight);
    const last = panel.querySelector<HTMLButtonElement>(
      '[aria-label="Decrease second"]',
    )!;
    focusElement(last);
    expectHit(last);
  });

  it('keeps seconds and meridiem controls within a narrow popup', () => {
    const fixture = setup();
    fixture.componentRef.setInput('showTime', true);
    fixture.componentRef.setInput('showSeconds', true);
    fixture.componentRef.setInput('hourFormat', '12');
    fixture.componentRef.setInput('panelStyle', { maxWidth: '280px' });
    fixture.componentInstance.show();
    fixture.detectChanges();
    const panel = fixture.componentInstance.panel()!.nativeElement;
    const bounds = panel.getBoundingClientRect();
    for (const button of panel.querySelectorAll<HTMLButtonElement>(
      '.orc-date-picker__time button',
    )) {
      expect(button.getBoundingClientRect().left).toBeGreaterThanOrEqual(
        bounds.left,
      );
      expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(
        bounds.right,
      );
    }
    panel
      .querySelector<HTMLButtonElement>('[aria-label="Increase second"]')!
      .click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('2026-08-17T00:00:01');
  });

  it('uses the touch presentation for narrow DateTime content and preserves Escape focus return', () => {
    const fixture = setup('position:fixed;left:4px;top:4px;width:220px');
    fixture.componentRef.setInput('touchUI', true);
    fixture.componentRef.setInput('showTime', true);
    fixture.componentRef.setInput('showSeconds', true);
    fixture.componentInstance.show();
    fixture.detectChanges();

    const panel = fixture.componentInstance.panel()!.nativeElement;
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    expect(panel.classList).toContain('orc-date-picker__panel--touch-ui');
    const bounds = panel.getBoundingClientRect();
    expect(bounds.width).toBeLessThanOrEqual(window.innerWidth - 16);
    if (requiresNarrowViewport) {
      expect(window.innerWidth)
        .withContext('ChromeHeadlessNarrow must use a <=640 CSS-pixel viewport')
        .toBeLessThanOrEqual(640);
    }
    if (requiresNarrowViewport || window.innerWidth <= 640) {
      expect(window.matchMedia('(max-width: 40rem)').matches).toBeTrue();
      const computed = getComputedStyle(panel);
      expect(computed.position).toBe('fixed');
      expect(computed.bottom).toBe('8px');
      expect(bounds.left).toBeCloseTo(8, 0);
      expect(bounds.right).toBeCloseTo(window.innerWidth - 8, 0);
    } else {
      const computed = getComputedStyle(panel);
      expect(computed.position).toBe('fixed');
      expect(computed.bottom).toBe('8px');
      expect(bounds.left).toBeCloseTo(8, 0);
      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();
      expect(getComputedStyle(panel).bottom).toBe('8px');
    }
    for (const button of panel.querySelectorAll<HTMLButtonElement>(
      '.orc-date-picker__time button',
    )) {
      expect(button.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
      expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    }

    panel.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.overlayVisible()).toBeFalse();
    expect(document.activeElement).toBe(input);
  });

  it('keeps the touch popup non-modal to assistive technology while trapping Tab focus', () => {
    const fixture = setup();
    fixture.componentRef.setInput('touchUI', true);
    fixture.componentRef.setInput('showClear', true);
    fixture.componentInstance.show();
    fixture.detectChanges();
    const panel = fixture.componentInstance.panel()!.nativeElement;
    const first = panel.querySelector<HTMLButtonElement>('header button')!;
    const last = panel.querySelector<HTMLButtonElement>(
      '.orc-date-picker__panel-action',
    )!;
    expect(panel.getAttribute('aria-modal')).toBe('false');
    expect(panel.getAttribute('tabindex')).toBe('-1');

    last.focus();
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    panel.dispatchEvent(event);
    expect(event.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(first);
  });

  it('keeps a touch sheet viewport-fixed through scroll and tears it down cleanly', () => {
    const fixture = setup();
    const addEventListener = spyOn(
      document,
      'addEventListener',
    ).and.callThrough();
    const removeEventListener = spyOn(
      document,
      'removeEventListener',
    ).and.callThrough();
    fixture.componentRef.setInput('touchUI', true);
    fixture.componentInstance.show();
    fixture.detectChanges();
    const panel = fixture.componentInstance.panel()!.nativeElement;

    expect(
      addEventListener.calls.allArgs().filter(([type]) => type === 'scroll'),
    ).toHaveSize(1);

    document.dispatchEvent(new Event('scroll', { bubbles: true }));
    fixture.detectChanges();
    expect(getComputedStyle(panel).position).toBe('fixed');
    expect(getComputedStyle(panel).bottom).toBe('8px');

    fixture.componentInstance.hide();
    fixture.detectChanges();
    expect(panel.isConnected).toBeFalse();
    expect(
      removeEventListener.calls.allArgs().filter(([type]) => type === 'scroll'),
    ).toHaveSize(1);
    document.dispatchEvent(new Event('scroll', { bubbles: true }));
    expect(panel.isConnected).toBeFalse();
    fixture.destroy();
  });

  for (const attachment of ['body', 'custom'] as const) {
    it(`honors ${attachment} attachment, handles internal clicks, and removes moved panels on close and destroy`, () => {
      const fixture = setup();
      const target = document.createElement('div');
      document.body.appendChild(target);
      try {
        fixture.componentRef.setInput(
          'appendTo',
          attachment === 'body' ? 'body' : target,
        );
        fixture.componentInstance.show();
        fixture.detectChanges();
        const panel = fixture.componentInstance.panel()!.nativeElement;
        expect(panel.parentElement).toBe(
          attachment === 'body' ? document.body : target,
        );
        panel.querySelector<HTMLButtonElement>('header button')!.click();
        fixture.detectChanges();
        expect(fixture.componentInstance.overlayVisible()).toBeTrue();
        fixture.componentInstance.hide();
        fixture.detectChanges();
        expect(panel.isConnected).toBeFalse();
        fixture.componentInstance.show();
        fixture.detectChanges();
        const reopened = fixture.componentInstance.panel()!.nativeElement;
        fixture.destroy();
        expect(reopened.isConnected).toBeFalse();
      } finally {
        target.remove();
      }
    });
  }

  it('keeps inline calendars in normal flow, including a transition from a moved popup', () => {
    const fixture = setup();
    fixture.componentRef.setInput('appendTo', 'body');
    fixture.componentInstance.show();
    fixture.detectChanges();
    fixture.componentRef.setInput('inline', true);
    fixture.detectChanges();
    const panel = fixture.componentInstance.panel()!.nativeElement;
    expect(fixture.nativeElement.contains(panel)).toBeTrue();
    expect(panel.hasAttribute('popover')).toBeFalse();
    expect(getComputedStyle(panel).position).toBe('static');
    expect(panel.style.maxHeight).toBe('');
  });

  it('repositions after scrolling and releases its observers on destruction', fakeAsync(() => {
    const fixture = setup('position:fixed;left:40px;top:40px;width:220px');
    fixture.componentInstance.show();
    fixture.detectChanges();
    const panel = fixture.componentInstance.panel()!.nativeElement;
    const initial = panel.getBoundingClientRect().left;
    fixture.nativeElement.style.left = '80px';
    document.dispatchEvent(new Event('scroll'));
    tick(32);
    expect(panel.getBoundingClientRect().left).toBeCloseTo(initial + 40, 0);
    fixture.destroy();
    const left = panel.style.left;
    document.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('resize'));
    tick(16);
    expect(panel.style.left).toBe(left);
    expect(panel.isConnected).toBeFalse();
  }));

  it('provides a clipping-free fallback when native popovers are unavailable', () => {
    const parent = document.createElement('div');
    parent.style.cssText =
      'position:fixed;left:40px;top:40px;width:220px;height:40px;overflow:hidden';
    const anchor = document.createElement('button');
    anchor.textContent = 'Date';
    const panel = document.createElement('div');
    panel.textContent = 'Calendar';
    panel.style.cssText = 'width:200px;height:100px;background:white';
    Object.defineProperty(panel, 'showPopover', { value: undefined });
    parent.append(anchor, panel);
    document.body.appendChild(parent);
    const detach = attachAnchoredPopup(anchor, panel);
    try {
      expect(panel.parentElement).toBe(document.body);
      expect(panel.style.position).toBe('fixed');
      expectHit(panel);
      const anchorRect = anchor.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      expect(panelRect.top)
        .withContext(
          `fallback gap (anchor bottom ${anchorRect.bottom}, panel top ${panelRect.top}, scrollY ${window.scrollY}, body top ${document.body.getBoundingClientRect().top}, offset parent ${panel.offsetParent?.tagName ?? 'none'})`,
        )
        .toBeCloseTo(anchorRect.bottom + 8, 0);
    } finally {
      detach();
      expect(panel.parentElement).toBe(parent);
      parent.remove();
    }
  });

  it('positions the fallback relative to a bordered, scrolled custom containing block', () => {
    const target = document.createElement('div');
    target.style.cssText =
      'position:fixed;left:80px;top:40px;width:400px;height:380px;overflow:auto;border:7px solid transparent';
    const content = document.createElement('div');
    content.style.height = '1000px';
    const anchor = document.createElement('button');
    anchor.textContent = 'Date';
    anchor.style.cssText = 'position:absolute;left:30px;top:100px';
    const panel = document.createElement('div');
    panel.style.cssText = 'width:200px;height:100px;background:white';
    Object.defineProperty(panel, 'showPopover', { value: undefined });
    content.append(anchor, panel);
    target.append(content);
    document.body.append(target);
    target.scrollTop = 20;
    const detach = attachAnchoredPopup(anchor, panel, target);
    try {
      const origin = anchor.getBoundingClientRect();
      const popup = panel.getBoundingClientRect();
      expect(popup.left).toBeCloseTo(origin.left, 0);
      expect(popup.top).toBeCloseTo(origin.bottom + 8, 0);
      expectHit(panel);
    } finally {
      detach();
      target.remove();
    }
  });

  it('keeps a body-requested calendar interactive inside a native modal and closes it with the parent', async () => {
    const fixture = TestBed.createComponent(DialogHost);
    fixture.detectChanges();
    const modal = fixture.debugElement.query(By.directive(ModalComponent))
      .componentInstance as ModalComponent;
    const picker = fixture.debugElement.query(By.directive(DatePickerComponent))
      .componentInstance as DatePickerComponent;
    modal.show();
    fixture.detectChanges();
    TestBed.tick();
    await fixture.whenStable();
    const dialog = fixture.nativeElement.querySelector(
      'dialog',
    ) as HTMLDialogElement;
    for (const animation of dialog.getAnimations({ subtree: true }))
      animation.finish();
    picker.show();
    fixture.detectChanges();
    const panel = picker.panel()!.nativeElement;
    expect(panel.parentElement).toBe(dialog);
    const day = panel.querySelector<HTMLElement>('[data-active="true"]')!;
    focusElement(day);
    expect(document.activeElement).toBe(day);
    expectHit(day);
    day.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(picker.overlayVisible()).toBeFalse();
    expect(modal.isOpen()).toBeTrue();
    picker.show();
    fixture.detectChanges();
    modal.close();
    fixture.detectChanges();
    TestBed.tick();
    expect(picker.overlayVisible()).toBeFalse();
    expect(dialog.querySelector('.orc-date-picker__panel')).toBeNull();
  });
});
