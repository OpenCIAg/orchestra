import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './spinner.component';

@Component({
  standalone: true,
  imports: [LoadingSpinnerComponent],
  template: `<orc-spinner [(fullScreen)]="cheia" [closeOnEscape]="escape()" />`,
})
class SpinnerHost {
  readonly cheia = signal(true);
  readonly escape = signal(true);
}

const escape = () =>
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

describe('LoadingSpinnerComponent Escape handling', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [SpinnerHost] }));

  it('requests leaving full screen on Escape when closeOnEscape is set', () => {
    const fixture = TestBed.createComponent(SpinnerHost);
    fixture.detectChanges();
    escape();
    fixture.detectChanges();
    expect(fixture.componentInstance.cheia()).toBeFalse();
    expect(
      fixture.nativeElement.querySelector('orc-spinner').classList,
    ).not.toContain('orc-spinner--fullscreen-host');
  });

  it('ignores Escape by default, so a blocking loader stays blocking', () => {
    const fixture = TestBed.createComponent(SpinnerHost);
    fixture.componentInstance.escape.set(false);
    fixture.detectChanges();
    escape();
    fixture.detectChanges();
    expect(fixture.componentInstance.cheia()).toBeTrue();
  });

  it('does nothing when it is not full screen', () => {
    const fixture = TestBed.createComponent(SpinnerHost);
    fixture.componentInstance.cheia.set(false);
    fixture.detectChanges();
    const emitidos: boolean[] = [];
    fixture.debugElement.children[0].componentInstance.fullScreenChange.subscribe(
      (v: boolean) => emitidos.push(v),
    );
    escape();
    expect(emitidos).toEqual([]);
  });
});
