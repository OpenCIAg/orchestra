import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { ToastContainerComponent } from './toast-container.component';
import { testBedTick } from '../../../tools/quality/test-bed-tick';

describe('Toast service and declarative outlets', () => {
  it('renders the service stream in only one registered outlet and transfers ownership', () => {
    const first = TestBed.createComponent(ToastContainerComponent);
    const second = TestBed.createComponent(ToastContainerComponent);
    first.detectChanges();
    second.detectChanges();
    const service = TestBed.inject(ToastService);
    service.show({ message: 'Saved', duration: 0 });
    first.detectChanges();
    second.detectChanges();
    expect(first.nativeElement.querySelectorAll('orc-toast').length).toBe(1);
    expect(second.nativeElement.querySelectorAll('orc-toast').length).toBe(0);
    first.destroy();
    second.detectChanges();
    expect(second.nativeElement.querySelectorAll('orc-toast').length).toBe(1);
    service.clear();
    second.destroy();
  });

  it('returns the existing duplicate ID so callers can dismiss the visible notification', () => {
    const fixture = TestBed.createComponent(ToastContainerComponent);
    fixture.detectChanges();
    const service = TestBed.inject(ToastService);
    service.setPreventDuplicates(true);
    const first = service.show({ message: 'Saved', duration: 0 });
    const second = service.show({ message: 'Saved', duration: 0 });
    expect(second).toBe(first);
    expect(service.activeCount()).toBe(1);
    service.dismiss(second);
    expect(service.activeCount()).toBe(0);
    fixture.destroy();
  });

  it('does not override service duplicate policy when a container uses its defaults', () => {
    const service = TestBed.inject(ToastService);
    service.setPreventDuplicates(true);
    const fixture = TestBed.createComponent(ToastContainerComponent);
    fixture.detectChanges();
    const first = service.show({ message: 'Saved', duration: 0 });
    expect(service.show({ message: 'Saved', duration: 0 })).toBe(first);
    service.clear();
    fixture.destroy();
  });

  it('does not remove service messages when a separate declarative list dismisses the same ID', () => {
    const serviceOutlet = TestBed.createComponent(ToastContainerComponent);
    serviceOutlet.detectChanges();
    const service = TestBed.inject(ToastService);
    const id = service.show({ id: 'notice', message: 'Saved', duration: 0 });
    const declarative = TestBed.createComponent(ToastContainerComponent);
    declarative.componentRef.setInput('toasts', [...service.toasts()]);
    declarative.detectChanges();
    const dismiss = jasmine.createSpy('dismiss');
    declarative.componentInstance.dismiss.subscribe(dismiss);
    declarative.componentInstance.handleDismiss(id);
    expect(dismiss).toHaveBeenCalledOnceWith(id);
    expect(service.activeCount()).toBe(1);
    service.clear();
    declarative.destroy();
    serviceOutlet.destroy();
  });
  it('mounts an automatic outlet and replaces it when an explicit outlet appears', async () => {
    const app = TestBed.inject(ApplicationRef);
    const attach = app.attachView.bind(app);
    let mounted!: () => void;
    const ready = new Promise<void>((resolve) => {
      mounted = resolve;
    });
    spyOn(app, 'attachView').and.callFake((view) => {
      attach(view);
      mounted();
    });
    const service = TestBed.inject(ToastService);
    service.show({ message: 'Automatically mounted', duration: 0 });
    await ready;
    testBedTick();
    expect(document.querySelectorAll('orc-toast-container').length).toBe(1);
    expect(document.querySelectorAll('orc-toast').length).toBe(1);
    const automatic = document.querySelector('orc-toast-container')!;
    const explicit = TestBed.createComponent(ToastContainerComponent);
    explicit.detectChanges();
    expect(automatic.isConnected).toBeFalse();
    expect(document.querySelectorAll('orc-toast').length).toBe(1);
    expect(explicit.nativeElement.querySelectorAll('orc-toast').length).toBe(1);
    service.clear();
    explicit.destroy();
  });

  it('destroys the automatically attached outlet with its service injector', async () => {
    const app = TestBed.inject(ApplicationRef);
    const attach = app.attachView.bind(app);
    let mounted!: () => void;
    const ready = new Promise<void>((resolve) => {
      mounted = resolve;
    });
    spyOn(app, 'attachView').and.callFake((view) => {
      attach(view);
      mounted();
    });
    TestBed.inject(ToastService).show({
      message: 'Temporary application',
      duration: 0,
    });
    await ready;
    testBedTick();
    expect(document.querySelector('orc-toast-container')).not.toBeNull();
    TestBed.resetTestingModule();
    expect(document.querySelector('orc-toast-container')).toBeNull();
  });
});
