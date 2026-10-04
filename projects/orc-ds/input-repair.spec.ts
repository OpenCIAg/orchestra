import { Component } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { InputComponent } from './input/input.component';
import { TextareaComponent } from './input/textarea.component';
import { NumberInputComponent } from './number-input/number-input.component';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { ChipInputComponent } from './chip-input/chip-input.component';

@Component({
  standalone: true,
  imports: [AutocompleteComponent],
  template: `<orc-autocomplete [options]="options" [forceSelection]="true" />`,
})
class AutocompleteHost {
  options = [{ value: 'sp', label: 'São Paulo' }];
}

describe('Input control repairs', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        InputComponent,
        TextareaComponent,
        NumberInputComponent,
        ColorPickerComponent,
        AutocompleteComponent,
        ChipInputComponent,
        AutocompleteHost,
      ],
    }).compileComponents();
  });

  it('marks CVA input touched when cleared', () => {
    const fixture: ComponentFixture<InputComponent> =
      TestBed.createComponent(InputComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('clearable', true);
    component.writeValue('value');
    let touched = false;
    component.registerOnTouched(() => (touched = true));
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector(
        '.orc-input__clear-btn',
      ) as HTMLButtonElement
    ).click();
    expect(touched).toBeTrue();
  });

  it('keeps clear and password actions keyboard reachable and named by default', () => {
    const clearFixture: ComponentFixture<InputComponent> =
      TestBed.createComponent(InputComponent);
    clearFixture.componentRef.setInput('type', 'search');
    clearFixture.componentInstance.writeValue('query');
    clearFixture.detectChanges();
    const clearButton = clearFixture.nativeElement.querySelector(
      '.orc-input__clear-btn',
    ) as HTMLButtonElement;
    expect(clearButton.tabIndex).toBe(0);
    expect(clearButton.getAttribute('aria-label')).toBe('Clear input');

    const passwordFixture: ComponentFixture<InputComponent> =
      TestBed.createComponent(InputComponent);
    passwordFixture.componentRef.setInput('type', 'password');
    passwordFixture.detectChanges();
    const passwordButton = passwordFixture.nativeElement.querySelector(
      '.orc-input__password-btn',
    ) as HTMLButtonElement;
    expect(passwordButton.tabIndex).toBe(0);
    expect(passwordButton.getAttribute('aria-label')).toBe('Show password');
    passwordButton.click();
    passwordFixture.detectChanges();
    expect(passwordButton.getAttribute('aria-label')).toBe('Hide password');

    clearFixture.destroy();
    passwordFixture.destroy();
  });

  it('adjusts an auto-resizing textarea after initial CVA write', () => {
    const fixture: ComponentFixture<TextareaComponent> =
      TestBed.createComponent(TextareaComponent);
    fixture.componentRef.setInput('autoResize', true);
    fixture.componentInstance.writeValue('Initial value');
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector(
      'textarea',
    ) as HTMLTextAreaElement;
    expect(textarea.style.height).not.toBe('');
  });

  it('uses a safe step for number input increments and touches on clear', () => {
    const fixture: ComponentFixture<NumberInputComponent> =
      TestBed.createComponent(NumberInputComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('step', 0);
    component.writeValue(2);
    let touched = false;
    component.registerOnTouched(() => (touched = true));
    component.increment();
    expect(component.value()).toBe(3);
    component.clear();
    expect(touched).toBeTrue();
  });

  it('accepts black in supported color formats', () => {
    const fixture: ComponentFixture<ColorPickerComponent> =
      TestBed.createComponent(ColorPickerComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('format', 'rgb');
    component['selectColor']('rgb(0, 0, 0)');
    expect(component.value()).toBe('rgb(0, 0, 0)');
    fixture.componentRef.setInput('format', 'hex');
    component['selectColor']('#000');
    expect(component.value()).toBe('#000');
  });

  it('preserves a programmatic force-selection value through blur', fakeAsync(() => {
    const fixture = TestBed.createComponent(AutocompleteHost);
    fixture.detectChanges();
    const component = fixture.debugElement.children[0]
      .componentInstance as AutocompleteComponent;
    component.writeValue('sp');
    component.onBlur();
    tick(121);
    expect(component.value()).toBe('sp');
  }));

  it('accepts the configured separator when pasting chips', () => {
    const fixture: ComponentFixture<ChipInputComponent> =
      TestBed.createComponent(ChipInputComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('separator', '|');
    const clipboard = { getData: () => 'one|two' } as unknown as DataTransfer;
    component.onPaste({
      preventDefault: () => {},
      clipboardData: clipboard,
    } as unknown as ClipboardEvent);
    expect(component.value()).toEqual(['one', 'two']);
  });
});
