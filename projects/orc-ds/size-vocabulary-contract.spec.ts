import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { ButtonComponent } from './button/button.component';
import { IconButtonComponent } from './button/icon-button.component';
import { InputComponent } from './input/input.component';
import { TextareaComponent } from './input/textarea.component';
import { TabGroupComponent } from './tabs/tab-group.component';
import { LoadingSpinnerComponent } from './spinner/spinner.component';
import { SwitchComponent } from './switch/switch.component';
import { SliderComponent } from './slider/slider.component';
import { ProgressBarComponent } from './progress/progress-bar.component';
import { ProgressCircleComponent } from './progress/progress-circle.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { ModalComponent } from './modal/modal.component';
import { ChipComponent } from './chip/chip.component';
import { BadgeComponent } from './badge/badge.component';
import { ChipInputComponent } from './chip-input/chip-input.component';
import { NumberInputComponent } from './number-input/number-input.component';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { AvatarComponent } from './avatar/avatar.component';
import { IconComponent } from './icon/icon.component';
import { SelectComponent } from './select/select.component';
import { TableComponent } from './table/table.component';
import { RadioButtonComponent } from './radio/radio-button.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { OtpInputComponent } from './otp-input/otp-input.component';
import { MultiSelectComponent } from './multi-select/multi-select.component';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { SelectButtonComponent } from './select-button/select-button.component';
import { ToggleButtonComponent } from './toggle-button/toggle-button.component';
import { TreeSelectComponent } from './tree-select/tree-select.component';
import { PasswordComponent } from './password/password.component';
import { DataTableComponent } from '@ciag/orchestra/data-table';

/**
 * Size-vocabulary contract (ticket: unify the size vocabulary).
 *
 * Every sized control accepts the canonical `sm | md | lg` vocabulary.
 * Controls that historically spoke the PrimeNG-era `small | large`
 * vocabulary keep rendering identically for those deprecated values:
 * the documented mapping is `small` → `sm`, `large` → `lg`.
 */
describe('Size vocabulary contract', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayModule],
    }).compileComponents();
  });

  const create = (
    component: Type<unknown>,
    inputs: Record<string, unknown> = {},
  ): ComponentFixture<unknown> => {
    const fixture = TestBed.createComponent(component);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    return fixture;
  };

  /** Class list of every rendered element (host first), in document order. */
  const classMatrix = (fixture: ComponentFixture<unknown>): string[][] => {
    const root = fixture.nativeElement as HTMLElement;
    return [root, ...Array.from(root.querySelectorAll('*'))].map((el) =>
      Array.from(el.classList),
    );
  };

  describe('legacy controls widened to the canonical vocabulary', () => {
    interface LegacyCase {
      name: string;
      component: Type<unknown>;
      /** A class the control renders for the legacy `small` value. */
      smallMarker?: string;
      /** A class the control renders for the legacy `large` value. */
      largeMarker?: string;
      inputs?: Record<string, unknown>;
    }

    const cases: LegacyCase[] = [
      {
        name: 'select',
        component: SelectComponent,
        smallMarker: 'is-small',
        largeMarker: 'is-large',
      },
      {
        name: 'table',
        component: TableComponent,
        smallMarker: 'orc-table-container--small',
        largeMarker: 'orc-table-container--large',
      },
      {
        name: 'radio-button',
        component: RadioButtonComponent,
        smallMarker: 'orc-radio--small',
        largeMarker: 'orc-radio--large',
      },
      {
        name: 'checkbox',
        component: CheckboxComponent,
        smallMarker: 'size-small',
        largeMarker: 'size-large',
      },
      {
        name: 'otp-input',
        component: OtpInputComponent,
        smallMarker: 'otp-container--small',
        largeMarker: 'otp-container--large',
      },
      {
        name: 'multi-select (deprecated no-op size)',
        component: MultiSelectComponent,
      },
      {
        name: 'date-picker',
        component: DatePickerComponent,
        smallMarker: 'orc-date-picker--size-small',
        largeMarker: 'orc-date-picker--size-large',
      },
      {
        name: 'select-button',
        component: SelectButtonComponent,
        smallMarker: 'orc-select-button--small',
        largeMarker: 'orc-select-button--large',
      },
      {
        name: 'toggle-button',
        component: ToggleButtonComponent,
        smallMarker: 'orc-toggle-button--small',
        largeMarker: 'orc-toggle-button--large',
      },
      {
        name: 'tree-select',
        component: TreeSelectComponent,
        smallMarker: 'orc-p2-tree-select--small',
        largeMarker: 'orc-p2-tree-select--large',
      },
      {
        name: 'password',
        component: PasswordComponent,
        smallMarker: 'size-small',
        largeMarker: 'size-large',
      },
      {
        name: 'data-table',
        component: DataTableComponent,
        smallMarker: 'small',
        largeMarker: 'large',
      },
    ];

    for (const c of cases) {
      describe(c.name, () => {
        const render = (size: string | undefined) => {
          const fixture = create(c.component, { ...c.inputs, size });
          return { fixture, matrix: classMatrix(fixture) };
        };

        it('renders the deprecated `small` value identically to canonical `sm`', () => {
          const legacy = render('small');
          const canonical = render('sm');
          expect(canonical.matrix).toEqual(legacy.matrix);
          if (c.smallMarker) {
            expect(legacy.matrix.flat()).toContain(c.smallMarker);
          }
        });

        it('renders the deprecated `large` value identically to canonical `lg`', () => {
          const legacy = render('large');
          const canonical = render('lg');
          expect(canonical.matrix).toEqual(legacy.matrix);
          if (c.largeMarker) {
            expect(legacy.matrix.flat()).toContain(c.largeMarker);
          }
        });

        it('renders canonical `md` as the default (middle) size', () => {
          expect(render('md').matrix).toEqual(render(undefined).matrix);
        });
      });
    }
  });

  describe('canonical controls accept the canonical vocabulary everywhere', () => {
    const canonicalCases: Array<{
      name: string;
      component: Type<unknown>;
      inputs?: Record<string, unknown>;
    }> = [
      { name: 'button', component: ButtonComponent },
      {
        name: 'icon-button',
        component: IconButtonComponent,
        inputs: { ariaLabel: 'Add item' },
      },
      { name: 'input', component: InputComponent },
      { name: 'textarea', component: TextareaComponent },
      { name: 'tabs', component: TabGroupComponent },
      { name: 'spinner', component: LoadingSpinnerComponent },
      { name: 'switch', component: SwitchComponent },
      { name: 'slider', component: SliderComponent },
      { name: 'progress-bar', component: ProgressBarComponent },
      { name: 'progress-circle', component: ProgressCircleComponent },
      { name: 'paginator', component: PaginatorComponent },
      { name: 'chip', component: ChipComponent },
      { name: 'badge', component: BadgeComponent },
      { name: 'chip-input', component: ChipInputComponent },
      { name: 'number-input', component: NumberInputComponent },
      { name: 'color-picker', component: ColorPickerComponent },
      { name: 'avatar', component: AvatarComponent },
      { name: 'icon', component: IconComponent },
    ];

    for (const c of canonicalCases) {
      it(`${c.name} renders sm, md and lg without error`, () => {
        expect(() => {
          for (const size of ['sm', 'md', 'lg']) {
            create(c.component, { ...c.inputs, size }).destroy();
          }
        }).not.toThrow();
      });
    }

    it('button surfaces the canonical size on its host classes', () => {
      expect(
        classMatrix(create(ButtonComponent, { size: 'sm' })).flat(),
      ).toContain('orc-button--size-sm');
    });

    it('modal accepts the canonical vocabulary plus its documented extras', () => {
      expect(() => {
        for (const size of ['sm', 'md', 'lg', 'xl', 'fullScreen', 'custom']) {
          create(ModalComponent, { size }).destroy();
        }
      }).not.toThrow();
    });
  });
});
