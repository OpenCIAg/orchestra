import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ConfirmPopupComponent, ConfirmPopupService } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the confirm popup. Imported through the public
 * `@ciag/orchestra/p2` surface; must pass unchanged across the family move.
 */
describe('ConfirmPopup behavior parity', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  function create() {
    const service = TestBed.inject(ConfirmPopupService);
    const fixture = TestBed.createComponent(ConfirmPopupComponent);
    fixture.detectChanges();
    return { fixture, service };
  }

  it('renders the requested confirmation with header, message, and label overrides', fakeAsync(() => {
    const { fixture, service } = create();
    service.confirm({
      message: 'Delete this file?',
      header: 'Confirmation',
      acceptLabel: 'Delete',
      rejectLabel: 'Keep',
    });
    tick();
    fixture.detectChanges();

    const popup = (fixture.nativeElement as HTMLElement).querySelector(
      'aside',
    ) as HTMLElement;
    expect(popup).not.toBeNull();
    expect(popup.getAttribute('role')).toBe('alertdialog');
    expect(popup.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'ConfirmationDelete this file? Keep Delete',
    );
    service.close();
    tick();
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('aside'),
    ).toBeNull();
  }));

  it('runs accept and reject callbacks and closes the popup either way', fakeAsync(() => {
    const { fixture, service } = create();
    let accepted = 0;
    let rejected = 0;
    service.confirm({
      message: 'Proceed?',
      accept: () => (accepted += 1),
      reject: () => (rejected += 1),
    });
    tick();
    fixture.detectChanges();

    const buttons = Array.from(
      (
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLButtonElement>('aside button'),
    );
    buttons[1].click();
    tick();
    fixture.detectChanges();
    expect(accepted).toBe(1);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('aside'),
    ).toBeNull();

    service.confirm({
      message: 'Proceed again?',
      accept: () => (accepted += 1),
      reject: () => (rejected += 1),
    });
    tick();
    fixture.detectChanges();
    const [reject] = Array.from(
      (
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLButtonElement>('aside button'),
    );
    reject.click();
    tick();
    fixture.detectChanges();
    expect(rejected).toBe(1);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('aside'),
    ).toBeNull();
  }));

  it('rejects on Escape and lets a newer request cancel the pending one', fakeAsync(() => {
    const { fixture, service } = create();
    const outcomes: string[] = [];
    service.confirm({
      message: 'First?',
      accept: () => outcomes.push('first-accept'),
      reject: () => outcomes.push('first-reject'),
    });
    tick();
    fixture.detectChanges();

    service.confirm({
      message: 'Second?',
      accept: () => outcomes.push('second-accept'),
      reject: () => outcomes.push('second-reject'),
    });
    tick();
    fixture.detectChanges();
    expect(outcomes).toEqual(['first-reject']);

    const popup = (fixture.nativeElement as HTMLElement).querySelector(
      'aside',
    ) as HTMLElement;
    popup.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    tick();
    fixture.detectChanges();
    expect(outcomes).toEqual(['first-reject', 'second-reject']);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('aside'),
    ).toBeNull();
  }));
});
