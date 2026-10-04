import { Component, ViewEncapsulation } from '@angular/core';
import { By } from '@angular/platform-browser';
import { OverlayModule } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { BadgeComponent } from '../badge/badge.component';
import { ChipComponent } from '../chip/chip.component';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { InputComponent } from '../input/input.component';
import { SelectComponent } from '../select/select.component';
import { TagComponent } from '../tag/tag.component';
import { focusElement } from '../../../tools/quality/test-focus-events';

@Component({
  standalone: true,
  imports: [
    BadgeComponent,
    ChipComponent,
    DatePickerComponent,
    InputComponent,
    SelectComponent,
    TagComponent,
  ],
  styleUrl: './core.scss',
  encapsulation: ViewEncapsulation.None,
  template: `
    <section>
      <orc-input size="sm" label="Small input" />
      <orc-select size="small" label="Small select" />
      <orc-date-picker size="small" label="Small date" />

      <orc-input size="md" label="Medium input" />
      <orc-select label="Medium select" />
      <orc-date-picker label="Medium date" />

      <orc-input size="lg" label="Large input" />
      <orc-select size="large" label="Large select" />
      <orc-date-picker size="large" label="Large date" />

      <orc-input clearable label="Clearable input" />
      <orc-chip removable label="Chip" />
      <orc-tag removable value="Tag" />
      <orc-badge dismissible size="sm" text="Badge" />
      <orc-select multiple [options]="options" />
      <orc-select clearable [options]="options" />
    </section>
  `,
})
class SpacingContractHost {
  readonly options = [{ label: 'Alpha', value: 'alpha' }];
}

describe('Shared control geometry and action target contracts', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayModule, SpacingContractHost],
    }).compileComponents();
  });

  it('aligns Input, Select, and DatePicker control heights at each density', () => {
    const fixture = TestBed.createComponent(SpacingContractHost);
    fixture.detectChanges();

    const controls: Record<string, HTMLElement> = {
      inputSm: fixture.nativeElement.querySelector(
        'orc-input[size="sm"] .orc-input-box',
      ),
      selectSm: fixture.nativeElement.querySelector(
        'orc-select[size="small"] .orc-select-trigger',
      ),
      dateSm: fixture.nativeElement.querySelector(
        'orc-date-picker[size="small"] .orc-date-picker__input',
      ),
      inputMd: fixture.nativeElement.querySelector(
        'orc-input[size="md"] .orc-input-box',
      ),
      selectMd: fixture.nativeElement.querySelector(
        'orc-select:not([size]) .orc-select-trigger',
      ),
      dateMd: fixture.nativeElement.querySelector(
        'orc-date-picker:not([size]) .orc-date-picker__input',
      ),
      inputLg: fixture.nativeElement.querySelector(
        'orc-input[size="lg"] .orc-input-box',
      ),
      selectLg: fixture.nativeElement.querySelector(
        'orc-select[size="large"] .orc-select-trigger',
      ),
      dateLg: fixture.nativeElement.querySelector(
        'orc-date-picker[size="large"] .orc-date-picker__input',
      ),
    };

    for (const [density, names, expected] of [
      ['small', ['inputSm', 'selectSm', 'dateSm'], '36px'],
      ['medium', ['inputMd', 'selectMd', 'dateMd'], '44px'],
      ['large', ['inputLg', 'selectLg', 'dateLg'], '52px'],
    ] as const) {
      const heights = names.map((name) => {
        const element = controls[name];
        const minHeight = getComputedStyle(element).minHeight;
        expect(minHeight)
          .withContext(`${density} ${name} min-height`)
          .toBe(expected);
        expect(element.getBoundingClientRect().height)
          .withContext(`${density} ${name} rendered height`)
          .toBeGreaterThanOrEqual(parseFloat(expected));
        return minHeight;
      });
      expect(new Set(heights).size)
        .withContext(`${density} height agreement`)
        .toBe(1);
    }

    fixture.destroy();
  });

  it('uses the same 8px standalone label-to-control spacing', () => {
    const fixture = TestBed.createComponent(SpacingContractHost);
    fixture.detectChanges();

    const measurements = [
      [
        fixture.nativeElement.querySelector(
          'orc-input[size="md"] .orc-input__label',
        ),
        fixture.nativeElement.querySelector(
          'orc-input[size="md"] .orc-input-box',
        ),
      ],
      [
        fixture.nativeElement.querySelector(
          'orc-select:not([size]) .orc-select-label',
        ),
        fixture.nativeElement.querySelector(
          'orc-select:not([size]) .orc-select-trigger',
        ),
      ],
      [
        fixture.nativeElement.querySelector(
          'orc-date-picker:not([size]) .orc-date-picker__label',
        ),
        fixture.nativeElement.querySelector(
          'orc-date-picker:not([size]) .orc-date-picker__input',
        ),
      ],
    ] as const;

    for (const [label, control] of measurements) {
      const gap =
        control.getBoundingClientRect().top -
        label.getBoundingClientRect().bottom;
      expect(gap).withContext(label.textContent?.trim()).toBe(8);
    }

    fixture.destroy();
  });

  it('gives removable actions and input clear controls a 24px target while keeping glyphs compact', () => {
    const fixture = TestBed.createComponent(SpacingContractHost);
    fixture.detectChanges();

    const clearableInput = fixture.debugElement
      .queryAll(By.directive(InputComponent))
      .map((debugElement) => debugElement.componentInstance as InputComponent)
      .find((component) => component.clearable());
    clearableInput?.writeValue('Clear me');
    const select = fixture.debugElement
      .queryAll(By.directive(SelectComponent))
      .map((debugElement) => debugElement.componentInstance as SelectComponent)
      .find((component) => component.multiple());
    expect(select).toBeTruthy();
    select?.writeValue(['alpha']);
    const clearableSelect = fixture.debugElement
      .queryAll(By.directive(SelectComponent))
      .map((debugElement) => debugElement.componentInstance as SelectComponent)
      .find((component) => component.clearable() && !component.multiple());
    expect(clearableSelect).toBeTruthy();
    clearableSelect?.writeValue('alpha');
    fixture.detectChanges();

    const targets = [
      fixture.nativeElement.querySelector('.orc-input__clear-btn'),
      fixture.nativeElement.querySelector('.orc-chip__remove'),
      fixture.nativeElement.querySelector('orc-tag button'),
      fixture.nativeElement.querySelector('.orc-badge__dismiss'),
      fixture.nativeElement.querySelector('.orc-select-chip .orc-chip-remove'),
      fixture.nativeElement.querySelector('.orc-select-clear-btn'),
    ] as HTMLButtonElement[];

    expect(targets.every(Boolean))
      .withContext(
        `Found target buttons: ${targets.map((target) => !!target).join(', ')}`,
      )
      .toBeTrue();
    for (const target of targets) {
      const { width, height } = target.getBoundingClientRect();
      expect(width).withContext(target.className).toBeGreaterThanOrEqual(24);
      expect(height).withContext(target.className).toBeGreaterThanOrEqual(24);
    }

    expect(
      getComputedStyle(targets[0].querySelector('svg') as SVGElement).width,
    ).toBe('14px');
    expect(getComputedStyle(targets[1]).fontSize).toBe('16px');
    expect(getComputedStyle(targets[2]).fontSize).toBe('12.8px');
    expect(
      getComputedStyle(targets[3].querySelector('svg') as SVGElement).width,
    ).toBe('10px');
    expect(getComputedStyle(targets[4]).fontSize).toBe('14px');
    expect(getComputedStyle(targets[5]).fontSize).toBe('18px');

    for (const index of [3, 4, 5]) {
      focusElement(targets[index]);
      const focusStyle = getComputedStyle(targets[index]);
      expect(focusStyle.outlineStyle)
        .withContext(targets[index].className)
        .toBe('solid');
      expect(focusStyle.outlineWidth)
        .withContext(targets[index].className)
        .toBe('2px');
      expect(focusStyle.outlineOffset)
        .withContext(targets[index].className)
        .toBe('1px');
      expect(focusStyle.outlineColor)
        .withContext(targets[index].className)
        .not.toBe('rgba(0, 0, 0, 0)');
    }
    fixture.destroy();
  });
});
