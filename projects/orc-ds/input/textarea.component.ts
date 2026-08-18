import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  input,
  model,
  output,
  computed,
  signal,
  linkedSignal,
  ElementRef,
  viewChild,
  booleanAttribute,
  numberAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputSize, InputStatus, TextareaResize } from './input.types';

let nextTextareaUniqueId = 0;

@Component({
  selector: 'orc-textarea, orc-input-textarea',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
})
export class TextareaComponent implements ControlValueAccessor {
  private readonly uniqueId = `orc-textarea-${++nextTextareaUniqueId}`;

  // ── Native Textarea Element Reference ─────────────────────
  readonly nativeTextareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('nativeTextarea');

  // ── Inputs (Signals API) ──────────────────────────────────
  readonly id = input<string>('');
  readonly inputId = input<string | undefined>(undefined);
  readonly name = input<string>('');
  readonly size = input<InputSize>('md');
  readonly status = input<InputStatus>('default');
  readonly placeholder = input<string>('Digite algo...');
  readonly label = input<string>('');
  readonly helperText = input<string>('');
  readonly errorMessage = input<string>('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly rows = input<number, unknown>(4, {
    transform: (val: unknown) => numberAttribute(val, 4),
  });
  readonly cols = input<number | undefined, unknown>(undefined, {
    transform: (val: unknown) => (val !== undefined && val !== null ? numberAttribute(val) : undefined),
  });
  readonly resize = input<TextareaResize>('vertical');
  readonly autoResize = input(false, { transform: booleanAttribute });
  readonly maxLength = input<number | undefined, unknown>(undefined, {
    transform: (val: unknown) => (val !== undefined && val !== null ? numberAttribute(val) : undefined),
  });
  readonly minLength = input<number | undefined, unknown>(undefined, {
    transform: (val: unknown) => (val !== undefined && val !== null ? numberAttribute(val) : undefined),
  });
  readonly showCharCount = input(false, { transform: booleanAttribute });
  readonly autofocus = input(false, { transform: booleanAttribute });
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(undefined);
  readonly variant = input<'filled' | 'outlined' | undefined>(undefined);
  readonly fluid = input(false, { transform: booleanAttribute });

  // Acessibilidade WCAG
  readonly ariaLabel = input<string>('');
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly ariaDescribedby = input<string>('');

  // ── Two-Way Model ─────────────────────────────────────────
  readonly value = model<string>('');

  // ── Outputs (Signals API) ─────────────────────────────────
  readonly inputChange = output<string>();
  readonly blur = output<FocusEvent>();
  readonly focus = output<FocusEvent>();

  // ── Estado Interno ────────────────────────────────────────
  protected readonly isFocused = signal<boolean>(false);
  protected readonly cvaDisabled = signal<boolean>(false);
  /** Writable browser state that cannot be rolled back mid-keystroke. */
  protected readonly viewValue = linkedSignal<string>(() => this.value());

  // ── Computeds ─────────────────────────────────────────────
  readonly effectiveId = computed(() => this.inputId() || this.id() || this.uniqueId);
  readonly helperId = computed(() => `${this.effectiveId()}-helper`);
  readonly errorId = computed(() => `${this.effectiveId()}-error`);

  readonly effectiveDisabled = computed(
    () => this.disabled() || this.cvaDisabled()
  );

  readonly stringValue = computed(() => {
    const v = this.viewValue();
    return v !== null && v !== undefined ? String(v) : '';
  });

  readonly charCount = computed(() => this.stringValue().length);

  readonly computedAriaDescribedBy = computed(() => {
    const ids: string[] = [];
    if (this.ariaDescribedby()) {
      ids.push(this.ariaDescribedby());
    }
    if ((this.status() === 'error' || this.errorMessage()) && this.errorMessage()) {
      ids.push(this.errorId());
    } else if (this.helperText()) {
      ids.push(this.helperId());
    }
    return ids.length ? ids.join(' ') : null;
  });

  // ── ControlValueAccessor ──────────────────────────────────
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    const nextValue = value ?? '';
    this.viewValue.set(nextValue);
    this.value.set(nextValue);
    this.adjustHeight();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // ── Handlers de Eventos ───────────────────────────────────
  protected onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    const val = target.value;

    this.viewValue.set(val);
    this.value.set(val);
    this.onChange(val);
    this.inputChange.emit(val);
    this.adjustHeight();
  }

  protected onFocus(event: FocusEvent): void {
    this.isFocused.set(true);
    this.focus.emit(event);
  }

  protected onBlur(event: FocusEvent): void {
    this.isFocused.set(false);
    this.onTouched();
    this.blur.emit(event);
  }

  private adjustHeight(): void {
    if (!this.autoResize()) return;
    const textarea = this.nativeTextareaRef()?.nativeElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }

  focusNative(): void {
    this.nativeTextareaRef()?.nativeElement.focus();
  }

  select(): void {
    this.nativeTextareaRef()?.nativeElement.select();
  }
}
