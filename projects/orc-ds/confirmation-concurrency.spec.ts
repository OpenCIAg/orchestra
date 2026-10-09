import { TestBed } from '@angular/core/testing';
import {
  ConfirmDialogComponent,
  ConfirmationService,
} from '@ciag/orchestra/confirm-dialog';

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

  it('clears the active dialog request when its host is destroyed', () => {
    const dialogFixture = TestBed.createComponent(ConfirmDialogComponent);
    const dialogService = TestBed.inject(ConfirmationService);
    dialogService.confirm({ message: 'Dialog' });
    dialogFixture.detectChanges();
    dialogFixture.destroy();
    expect(dialogService.request()).toBeNull();
  });
});
