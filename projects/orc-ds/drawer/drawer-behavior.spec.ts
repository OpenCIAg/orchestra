import { TestBed } from '@angular/core/testing';
import { DrawerComponent } from './drawer.component';

describe('Drawer interaction lifecycle', () => {
  it('honors either visibility model and restores focus and scroll after dismissal', () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const initialOverflow = document.body.style.overflow;
    const fixture = TestBed.createComponent(DrawerComponent);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    const panel: HTMLElement = fixture.nativeElement.querySelector('aside');
    expect(fixture.componentInstance.open()).toBeTrue();
    expect(panel.contains(document.activeElement)).toBeTrue();
    expect(document.body.style.overflow).toBe('hidden');
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeFalse();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe(initialOverflow);
    fixture.destroy();
    trigger.remove();
  });

  it('dismisses only the top drawer and retains the other scroll lock', () => {
    const lower = TestBed.createComponent(DrawerComponent);
    lower.componentRef.setInput('open', true);
    lower.detectChanges();
    const upper = TestBed.createComponent(DrawerComponent);
    upper.componentRef.setInput('open', true);
    upper.detectChanges();
    const dismiss = () =>
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      );
    dismiss();
    upper.detectChanges();
    lower.detectChanges();
    expect(upper.componentInstance.open()).toBeFalse();
    expect(lower.componentInstance.open()).toBeTrue();
    expect(document.body.style.overflow).toBe('hidden');
    upper.destroy();
    lower.destroy();
  });

  it('traps Tab, respects dismissal flags and releases scroll on destruction', () => {
    const original = document.body.style.overflow;
    const fixture = TestBed.createComponent(DrawerComponent);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('closeOnEscape', false);
    fixture.componentRef.setInput('dismissible', false);
    fixture.detectChanges();
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    button.focus();
    const tab = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    button.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(button);
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    fixture.nativeElement.querySelector('.orc-drawer__backdrop').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeTrue();
    fixture.destroy();
    expect(document.body.style.overflow).toBe(original);
  });
});
