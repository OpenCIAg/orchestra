import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';
import { ComponentCatalogService } from '../../services/component-catalog.service';

describe('Component catalog search', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [provideRouter([])] }),
  );

  it('restores both the search text and matching results after returning to the catalog', () => {
    const first = TestBed.createComponent(HomeComponent);
    first.detectChanges();
    const input = first.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    input.value = 'Date Picker';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    first.detectChanges();
    const matching = first.nativeElement.querySelectorAll('.card').length;
    expect(matching).toBeGreaterThan(0);
    first.destroy();
    const returned = TestBed.createComponent(HomeComponent);
    returned.detectChanges();
    expect(returned.nativeElement.querySelector('input').value).toBe(
      'Date Picker',
    );
    expect(returned.nativeElement.querySelectorAll('.card').length).toBe(
      matching,
    );
    returned.nativeElement.querySelector('[aria-label="Limpar busca"]').click();
    returned.detectChanges();
    expect(TestBed.inject(ComponentCatalogService).query()).toBe('');
    expect(returned.nativeElement.querySelector('input').value).toBe('');
    expect(
      returned.nativeElement.querySelectorAll('.card').length,
    ).toBeGreaterThan(matching);
    expect(document.activeElement).toBe(
      returned.nativeElement.querySelector('input'),
    );
  });

  it('does not steal focus or open a mobile keyboard after initial rendering', fakeAsync(() => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const focus = spyOn(input, 'focus').and.callThrough();
    tick(300);
    expect(focus).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(input);
  }));

  it('implements the advertised slash shortcut without consuming typing or modified shortcuts', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const focus = spyOn(input, 'focus').and.callThrough();
    const slash = new KeyboardEvent('keydown', {
      key: '/',
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(slash);
    expect(slash.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(input);
    focus.calls.reset();
    for (const config of [
      {},
      { ctrlKey: true },
      { metaKey: true },
      { isComposing: true },
    ]) {
      const event = new KeyboardEvent('keydown', {
        key: '/',
        bubbles: true,
        cancelable: true,
        ...config,
      });
      input.dispatchEvent(event);
      expect(event.defaultPrevented).toBeFalse();
    }
    expect(focus).not.toHaveBeenCalled();
    fixture.destroy();
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: '/',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(focus).not.toHaveBeenCalled();
  });
});
