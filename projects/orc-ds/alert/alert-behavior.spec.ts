import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AlertComponent } from './alert.component';

describe('AlertComponent accessibility and lifecycle contract', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent],
    }).compileComponents();
  });

  it('coerces showIcon and supplies a default accessible close name', () => {
    const fixture = TestBed.createComponent(AlertComponent);
    fixture.componentRef.setInput('showIcon', 'false');
    fixture.componentRef.setInput('closable', true);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.orc-alert__icon-container')).toBeNull();
    expect(
      root.querySelector('.orc-alert__close')?.getAttribute('aria-label'),
    ).toBe('Dismiss alert');
    fixture.destroy();
  });

  it('maps the warn alias to warning presentation and assertive alert semantics', () => {
    const fixture = TestBed.createComponent(AlertComponent);
    fixture.componentRef.setInput('severity', 'warn');
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector(
      '.orc-alert',
    ) as HTMLElement;
    expect(alert.getAttribute('role')).toBe('alert');
    expect(alert.getAttribute('aria-live')).toBe('assertive');
    expect(alert.classList).toContain('orc-alert--severity-warning');
    expect(alert.querySelector('svg')).not.toBeNull();
    fixture.destroy();
  });

  it('renders the custom icon input and supports automatic life dismissal', fakeAsync(() => {
    const fixture = TestBed.createComponent(AlertComponent);
    fixture.componentRef.setInput('icon', 'pi pi-check');
    fixture.componentRef.setInput('life', 1000);
    const closed = jasmine.createSpy('closed');
    fixture.componentInstance.closed.subscribe(closed);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector(
        '.orc-alert__icon-container .pi-check',
      ),
    ).not.toBeNull();
    tick(999);
    fixture.detectChanges();
    expect(fixture.componentInstance.isVisible()).toBeTrue();
    tick(1);
    fixture.detectChanges();
    expect(fixture.componentInstance.isVisible()).toBeFalse();
    expect(closed).toHaveBeenCalledTimes(1);
    fixture.destroy();
  }));

  it('clears the life timer when destroyed', fakeAsync(() => {
    const fixture = TestBed.createComponent(AlertComponent);
    fixture.componentRef.setInput('life', 1000);
    const closed = jasmine.createSpy('closed');
    fixture.componentInstance.closed.subscribe(closed);
    fixture.detectChanges();
    fixture.destroy();

    tick(1000);
    expect(closed).not.toHaveBeenCalled();
  }));
});
