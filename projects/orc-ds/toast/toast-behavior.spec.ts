import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastItem } from './toast.types';

const item: ToastItem = {
  id: 'notice',
  type: 'info',
  title: 'Saved',
  message: 'Your changes were saved',
  duration: 1000,
  dismissible: true,
  showIcon: true,
  position: 'top-right',
  pauseOnHover: true,
  createdAt: 0,
};

describe('Toast deadline and interaction lifecycle', () => {
  function setup(overrides: Partial<ToastItem> = {}) {
    const fixture = TestBed.createComponent(ToastComponent);
    fixture.componentRef.setInput('toast', { ...item, ...overrides });
    fixture.detectChanges();
    const dismissed = jasmine.createSpy('dismissed');
    fixture.componentInstance.dismiss.subscribe(dismissed);
    return { fixture, component: fixture.componentInstance, dismissed };
  }

  it('uses no polling for a notification without a progress bar and dismisses once', fakeAsync(() => {
    const interval = spyOn(window, 'setInterval').and.callThrough();
    const { fixture, component, dismissed } = setup();
    expect(interval).not.toHaveBeenCalled();
    tick(999);
    expect(component.isExiting()).toBeFalse();
    tick(1);
    expect(component.isExiting()).toBeTrue();
    tick(200);
    expect(dismissed).toHaveBeenCalledOnceWith('notice');
    fixture.destroy();
  }));

  it('pauses independently for hover and focus, preserving the exact remaining duration', fakeAsync(() => {
    const { fixture, component, dismissed } = setup();
    tick(400);
    component.onMouseEnter();
    tick(1000);
    const close: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    close.focus();
    component.onMouseLeave();
    tick(1000);
    expect(dismissed).not.toHaveBeenCalled();
    close.blur();
    tick(599);
    expect(component.isExiting()).toBeFalse();
    tick(1);
    expect(component.isExiting()).toBeTrue();
    tick(200);
    expect(dismissed).toHaveBeenCalledOnceWith('notice');
    fixture.destroy();
  }));

  it('does not reset the deadline on mouseleave when hover pause is disabled', fakeAsync(() => {
    const { fixture, component } = setup({ pauseOnHover: false });
    tick(400);
    component.onMouseEnter();
    tick(200);
    component.onMouseLeave();
    tick(400);
    expect(component.isExiting()).toBeTrue();
    fixture.destroy();
  }));

  it('owns progress timers and cancels delayed dismissal when destroyed', fakeAsync(() => {
    const { fixture, component, dismissed } = setup({ showProgressBar: true });
    tick(500);
    expect(component.progress()).toBe(50);
    component.handleClose();
    fixture.destroy();
    tick(2000);
    expect(dismissed).not.toHaveBeenCalled();
  }));

  it('keeps sticky notifications until explicitly dismissed', fakeAsync(() => {
    const { fixture, component, dismissed } = setup({ duration: 0 });
    tick(10000);
    expect(component.isExiting()).toBeFalse();
    component.handleClose();
    component.handleClose();
    tick(200);
    expect(dismissed).toHaveBeenCalledOnceWith('notice');
    fixture.destroy();
  }));
});
