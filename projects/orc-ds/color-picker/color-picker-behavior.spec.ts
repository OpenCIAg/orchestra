import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ColorPickerComponent,
  ColorPickerFormat,
} from './color-picker.component';

describe('ColorPicker color parsing', () => {
  let fixture: ComponentFixture<ColorPickerComponent>;
  let component: ColorPickerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorPickerComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ColorPickerComponent);
    component = fixture.componentInstance;
  });

  it('accepts black in every supported text format without confusing it with a parse failure', () => {
    const blackInputs: Array<[ColorPickerFormat, string, string]> = [
      ['hex', '#000', '#000'],
      ['hex', '#000000', '#000000'],
      ['rgb', 'rgb(0, 0, 0)', 'rgb(0, 0, 0)'],
      ['hsv', 'hsv(0, 0%, 0%)', 'hsv(0, 0%, 0%)'],
      ['hsb', 'hsb(0, 0%, 0%)', 'hsb(0, 0%, 0%)'],
    ];

    for (const [format, input, expected] of blackInputs) {
      fixture.componentRef.setInput('format', format);
      component.selectColor(input);

      expect(component.value())
        .withContext(`${format}: ${input}`)
        .toBe(expected);
      expect(component.nativeValue())
        .withContext(`${format}: ${input}`)
        .toBe('#000000');
    }
  });

  it('rejects HSV and HSB values outside their inclusive component ranges', () => {
    const invalidInputs: Array<[ColorPickerFormat, string]> = [
      ['hsv', 'hsv(-1, 0%, 0%)'],
      ['hsv', 'hsv(361, 0%, 0%)'],
      ['hsv', 'hsv(0, -1%, 0%)'],
      ['hsv', 'hsv(0, 101%, 0%)'],
      ['hsv', 'hsv(0, 0%, -1%)'],
      ['hsv', 'hsv(0, 0%, 101%)'],
      ['hsb', 'hsb(361, 0%, 0%)'],
      ['hsb', 'hsb(0, 101%, 0%)'],
      ['hsb', 'hsb(0, 0%, 101%)'],
    ];

    for (const [format, input] of invalidInputs) {
      fixture.componentRef.setInput('format', format);
      const previousValue = component.value();
      component.onTextInput({ target: { value: input } } as unknown as Event);
      expect(component.value()).withContext(input).toBe(previousValue);
    }
  });

  it('accepts the inclusive upper hue and saturation/brightness boundaries', () => {
    fixture.componentRef.setInput('format', 'hsv');
    component.selectColor('hsv(360, 100%, 100%)');

    expect(component.value()).toBe('hsv(0, 100%, 100%)');
    expect(component.nativeValue()).toBe('#ff0000');
  });

  it('gives the clear-color icon button a default accessible name', () => {
    fixture.detectChanges();

    const clearButton = fixture.nativeElement.querySelector(
      '.orc-color-picker__clear',
    ) as HTMLButtonElement;

    expect(clearButton.getAttribute('aria-label')).toBe('Clear color');
  });

  it('names an unlabeled swatch trigger while preserving caller labels', () => {
    fixture.componentRef.setInput('showInput', false);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      '.orc-color-picker__trigger',
    ) as HTMLButtonElement;

    expect(trigger.getAttribute('aria-label')).toBe('Choose color');

    fixture.componentRef.setInput('label', 'Accent color');
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-label')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('label')?.getAttribute('for'),
    ).toBe(trigger.id);

    fixture.componentRef.setInput('ariaLabel', 'Open accent color picker');
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-label')).toBe('Open accent color picker');
  });
});
