import {
  Component,
  inject,
  input,
  model,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { expectConsoleWarning } from '../../../../tools/quality/browser-diagnostics';
import { provideOrcField, OrcFieldContext } from './field-context';
import { OrcValueControl } from './value-control';

/** Minimal text control built on the shared base. */
@Component({
  selector: 'orc-test-text',
  host: { '(focusout)': 'markAsTouched()' },
  template: `<input
    class="native"
    [id]="field.id()"
    [value]="value()"
    [disabled]="isDisabled()"
    [required]="isRequired()"
    [attr.aria-describedby]="field.describedBy()"
    [attr.aria-invalid]="field.invalid() || null"
    (input)="commitValue($any($event.target).value)"
  />`,
})
class TextControlComponent extends OrcValueControl<string> {
  readonly value = model('');
  protected override coerceValue(raw: unknown): string {
    return raw == null ? '' : String(raw);
  }
}

/** Minimal field: the shape orc-form-field will take in wave B. */
@Component({
  selector: 'orc-test-field',
  providers: [provideOrcField()],
  template: `
    @if (label()) {
      <label [id]="ctx.labelId()" [for]="ctx.controlId()">{{ label() }}</label>
    }
    <ng-content />
    @if (hint()) {
      <p class="hint" [id]="ctx.hintId()">{{ hint() }}</p>
    }
    @if (ctx.errorVisible()) {
      <p class="error" [id]="ctx.errorId()">{{ ctx.errorMessage() }}</p>
    }
  `,
})
class FieldComponent {
  readonly label = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly required = input(false);
  readonly fieldId = input<string>();
  readonly ctx = inject(OrcFieldContext);
  constructor() {
    this.ctx.bind({
      id: () => this.fieldId(),
      label: () => !!this.label(),
      hint: () => !!this.hint(),
      error: () => this.error(),
      required: () => this.required(),
    });
  }
}

describe('internal/forms', () => {
  const type = (element: HTMLInputElement, value: string) => {
    element.value = value;
    element.dispatchEvent(new Event('input'));
  };

  describe('OrcValueControl', () => {
    it('works with a FormControl: write, user edit, disable, touched', () => {
      @Component({
        imports: [TextControlComponent, ReactiveFormsModule],
        template: '<orc-test-text [formControl]="control" />',
      })
      class Host {
        readonly control = new FormControl('inicial');
      }
      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      const native = fixture.nativeElement.querySelector(
        '.native',
      ) as HTMLInputElement;
      const control = fixture.componentInstance.control;
      expect(native.value).toBe('inicial');

      type(native, 'digitado');
      expect(control.value).toBe('digitado');
      expect(control.dirty).toBeTrue();

      control.setValue('externo');
      fixture.detectChanges();
      expect(native.value).toBe('externo');

      control.reset();
      fixture.detectChanges();
      expect(native.value).toBe('');

      control.disable();
      fixture.detectChanges();
      expect(native.disabled).toBeTrue();
      control.enable();
      fixture.detectChanges();
      expect(native.disabled).toBeFalse();

      expect(control.touched).toBeFalse();
      native.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      expect(control.touched).toBeTrue();
    });

    it('works with ngModel', async () => {
      @Component({
        imports: [TextControlComponent, FormsModule],
        template: '<orc-test-text [(ngModel)]="name" required />',
      })
      class Host {
        name = 'Ana';
      }
      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const native = fixture.nativeElement.querySelector(
        '.native',
      ) as HTMLInputElement;
      expect(native.value).toBe('Ana');
      expect(native.required).toBeTrue();
      type(native, 'Bia');
      expect(fixture.componentInstance.name).toBe('Bia');
    });

    it('works with [(value)] and the disabled input, without forms', () => {
      @Component({
        imports: [TextControlComponent],
        template:
          '<orc-test-text [(value)]="name" [disabled]="off()" (valueChange)="changes = changes + 1" />',
      })
      class Host {
        name = 'Ana';
        changes = 0;
        readonly off = signal(false);
      }
      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      const native = fixture.nativeElement.querySelector(
        '.native',
      ) as HTMLInputElement;
      expect(native.value).toBe('Ana');
      type(native, 'Carla');
      expect(fixture.componentInstance.name).toBe('Carla');
      expect(fixture.componentInstance.changes).toBe(1);
      fixture.componentInstance.off.set(true);
      fixture.detectChanges();
      expect(native.disabled).toBeTrue();
    });

    it('derives required from Validators.required', () => {
      @Component({
        imports: [TextControlComponent, ReactiveFormsModule],
        template: '<orc-test-text [formControl]="control" />',
      })
      class Host {
        readonly control = new FormControl('', Validators.required);
      }
      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      const native = fixture.nativeElement.querySelector(
        '.native',
      ) as HTMLInputElement;
      expect(native.required).toBeTrue();
      // Invalid is only shown after interaction.
      expect(native.hasAttribute('aria-invalid')).toBeFalse();
      native.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      fixture.detectChanges();
      expect(native.getAttribute('aria-invalid')).toBe('true');
    });

    it('is zoneless-compatible', async () => {
      // The suite loads zone.js; Angular warns once when zoneless is enabled.
      expectConsoleWarning(/NG0914/);
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection()],
      });
      @Component({
        imports: [TextControlComponent, ReactiveFormsModule],
        template: '<orc-test-text [formControl]="control" />',
      })
      class Host {
        readonly control = new FormControl('a');
      }
      const fixture = TestBed.createComponent(Host);
      await fixture.whenStable();
      const native = fixture.nativeElement.querySelector(
        '.native',
      ) as HTMLInputElement;
      expect(native.value).toBe('a');
      fixture.componentInstance.control.setValue('b');
      await fixture.whenStable();
      expect(native.value).toBe('b');
      fixture.componentInstance.control.disable();
      await fixture.whenStable();
      expect(native.disabled).toBeTrue();
    });
  });

  describe('field context', () => {
    @Component({
      imports: [TextControlComponent, FieldComponent, ReactiveFormsModule],
      template: `
        <form [formGroup]="form" (ngSubmit)="(0)">
          <orc-test-field
            label="Nome"
            [hint]="hint()"
            [error]="error()"
            fieldId="nome"
          >
            <orc-test-text formControlName="name" />
          </orc-test-field>
          <button type="submit">Enviar</button>
        </form>
      `,
    })
    class FieldHost {
      readonly hint = signal('Como no documento');
      readonly error = signal('');
      readonly form = new FormGroup({
        name: new FormControl('', Validators.required),
      });
    }

    function setup() {
      const fixture = TestBed.createComponent(FieldHost);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      const native = el.querySelector('.native') as HTMLInputElement;
      return { fixture, el, native };
    }

    it('wires label, id and aria-describedby from the field', () => {
      const { el, native } = setup();
      const label = el.querySelector('label')!;
      expect(native.id).toBe('nome-control');
      expect(label.htmlFor).toBe(native.id);
      expect(native.getAttribute('aria-describedby')).toBe('nome-hint');
      expect(el.querySelector('#nome-hint')?.textContent).toContain(
        'Como no documento',
      );
      expect(native.required).toBeTrue();
    });

    it('shows invalid after touch and references the error', () => {
      const { fixture, el, native } = setup();
      expect(native.hasAttribute('aria-invalid')).toBeFalse();
      native.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      fixture.detectChanges();
      expect(native.getAttribute('aria-invalid')).toBe('true');

      fixture.componentInstance.error.set('Informe o nome');
      fixture.detectChanges();
      expect(native.getAttribute('aria-describedby')).toBe(
        'nome-hint nome-error',
      );
      expect(el.querySelector('#nome-error')?.textContent).toContain(
        'Informe o nome',
      );

      type(native, 'Ana');
      fixture.componentInstance.error.set('');
      fixture.detectChanges();
      expect(native.hasAttribute('aria-invalid')).toBeFalse();
      expect(native.getAttribute('aria-describedby')).toBe('nome-hint');
    });

    it('shows invalid after the form is submitted, and clears on reset', () => {
      const { fixture, el, native } = setup();
      el.querySelector('form')!.dispatchEvent(new Event('submit'));
      fixture.detectChanges();
      expect(native.getAttribute('aria-invalid')).toBe('true');
      fixture.componentInstance.form.reset();
      fixture.detectChanges();
      expect(native.hasAttribute('aria-invalid')).toBeFalse();
    });

    it('omits aria-describedby when there is no hint nor error', () => {
      const { fixture, native } = setup();
      fixture.componentInstance.hint.set('');
      fixture.detectChanges();
      expect(native.hasAttribute('aria-describedby')).toBeFalse();
    });

    it('gives standalone controls their own unique id', () => {
      @Component({
        imports: [TextControlComponent],
        template: '<orc-test-text /><orc-test-text />',
      })
      class Host {}
      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      const inputs = fixture.nativeElement.querySelectorAll('.native');
      expect(inputs[0].id).toMatch(/^orc-control-/);
      expect(inputs[0].id).not.toBe(inputs[1].id);
    });
  });
});
