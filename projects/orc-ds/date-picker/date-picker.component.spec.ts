import { TestBed } from '@angular/core/testing';
import { DatePickerComponent } from './date-picker.component';

describe('DatePickerComponent', () => {
  it('uses only the library calendar trigger and does not render a native date input', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('showIcon', true);
    fixture.componentRef.setInput('showClear', true);
    fixture.componentRef.setInput('value', '2026-08-26');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const control = fixture.nativeElement.querySelector('.orc-date-picker__control') as HTMLElement;
    const trigger = control.querySelector('.orc-date-picker__trigger') as HTMLButtonElement;

    expect(input.getAttribute('type')).toBe('text');
    expect(fixture.nativeElement.querySelector('input[type="date"]')).toBeNull();
    expect(control.querySelectorAll('button')).toHaveSize(1);
    expect(trigger.querySelector('svg')).not.toBeNull();
    expect(trigger.textContent?.trim()).toBe('');
  });

  it('renders Today and Clear inside an anchored overlay panel', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('showIcon', true);
    fixture.componentRef.setInput('showButtonBar', true);
    fixture.componentRef.setInput('showClear', true);
    fixture.componentRef.setInput('value', '2026-08-26');
    fixture.componentInstance.show();
    fixture.detectChanges();

    const anchor = fixture.nativeElement.querySelector('.orc-date-picker__anchor') as HTMLElement;
    const panel = fixture.nativeElement.querySelector('.orc-date-picker__panel') as HTMLElement;
    const control = fixture.nativeElement.querySelector('.orc-date-picker__control') as HTMLElement;
    const actions = Array.from(panel.querySelectorAll<HTMLButtonElement>('.orc-date-picker__buttonbar button'));

    expect(panel.parentElement).toBe(anchor);
    expect(getComputedStyle(panel).position).toBe('absolute');
    expect(control.querySelectorAll('button')).toHaveSize(1);
    expect(actions.map(button => button.textContent?.trim())).toEqual(['Today', 'Clear']);

    actions[1].click();
    expect(fixture.componentInstance.value()).toBe('');
  });

  it('keeps a standalone Clear action in the panel instead of beside the input', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('showClear', true);
    fixture.componentRef.setInput('value', '2026-08-26');
    fixture.componentInstance.show();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.orc-date-picker__control button')).toBeNull();
    expect(fixture.nativeElement.querySelector('.orc-date-picker__buttonbar button')?.textContent?.trim()).toBe('Clear');
  });

  it('closes the overlay and emits the outside event only for clicks outside the component', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    const outside = jasmine.createSpy('outside');
    fixture.componentInstance.onClickOutside.subscribe(outside);
    fixture.componentInstance.show();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    fixture.componentInstance.onDocumentClick({ target: input } as unknown as MouseEvent);
    expect(fixture.componentInstance.overlayVisible()).toBeTrue();

    fixture.componentInstance.onDocumentClick({ target: document.body } as unknown as MouseEvent);
    expect(fixture.componentInstance.overlayVisible()).toBeFalse();
    expect(outside).toHaveBeenCalledTimes(1);
  });

  it('keeps an ISO model while formatting and parsing the visible date', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('dateFormat', 'dd/mm/yy');
    fixture.componentRef.setInput('value', '2026-08-26');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('26/08/2026');

    input.value = '27/08/2026';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.value()).toBe('2026-08-27');
  });
});
