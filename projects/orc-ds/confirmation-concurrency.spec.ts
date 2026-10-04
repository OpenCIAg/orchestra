import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  ConfirmDialogComponent,
  ConfirmationService,
} from './p2/p2-advanced-components';
import {
  ConfirmPopupComponent,
  ConfirmPopupService,
} from './p2/p2-confirm-popup';

describe('confirmation service request ownership', () => {
  it('cancels a superseded dialog request and keeps the latest callback independent', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    const service = TestBed.inject(ConfirmationService);
    const firstReject = jasmine.createSpy('firstReject');
    const secondAccept = jasmine.createSpy('secondAccept');

    service.confirm({ message: 'First', reject: firstReject });
    fixture.detectChanges();
    service.confirm({ message: 'Second', accept: secondAccept });
    fixture.detectChanges();

    expect(firstReject).toHaveBeenCalledTimes(1);
    expect(service.request()?.message).toBe('Second');

    fixture.componentInstance.accept();

    expect(secondAccept).toHaveBeenCalledTimes(1);
    expect(service.request()).toBeNull();
    fixture.destroy();
  });

  it('cancels a superseded popup request and keeps the latest callback independent', fakeAsync(() => {
    const fixture = TestBed.createComponent(ConfirmPopupComponent);
    const service = TestBed.inject(ConfirmPopupService);
    const firstReject = jasmine.createSpy('firstReject');
    const secondReject = jasmine.createSpy('secondReject');

    service.confirm({ message: 'First', reject: firstReject });
    fixture.detectChanges();
    tick();
    service.confirm({ message: 'Second', reject: secondReject });
    fixture.detectChanges();
    tick();

    expect(firstReject).toHaveBeenCalledTimes(1);
    expect(service.request()?.message).toBe('Second');

    fixture.componentInstance.reject();
    tick();

    expect(secondReject).toHaveBeenCalledTimes(1);
    expect(service.request()).toBeNull();
    fixture.destroy();
  }));

  it('clears active dialog and popup requests when their hosts are destroyed', () => {
    const dialogFixture = TestBed.createComponent(ConfirmDialogComponent);
    const dialogService = TestBed.inject(ConfirmationService);
    dialogService.confirm({ message: 'Dialog' });
    dialogFixture.detectChanges();
    dialogFixture.destroy();
    expect(dialogService.request()).toBeNull();

    const popupFixture = TestBed.createComponent(ConfirmPopupComponent);
    const popupService = TestBed.inject(ConfirmPopupService);
    popupService.confirm({ message: 'Popup' });
    popupFixture.detectChanges();
    popupFixture.destroy();
    expect(popupService.request()).toBeNull();
  });
});
