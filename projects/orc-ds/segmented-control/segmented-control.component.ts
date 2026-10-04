import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SegmentedControlOption<T = unknown> {
  label: string;
  value: T;
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'orc-segmented-control',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SegmentedControlComponent),
      multi: true,
    },
  ],
  templateUrl: './segmented-control.component.html',
  styleUrl: './segmented-control.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'onFocusOut($event)' },
})
export class SegmentedControlComponent<
  T = unknown,
> implements ControlValueAccessor {
  readonly options = input<SegmentedControlOption<T>[]>([]);
  readonly value = model<T | null>(null);
  readonly label = input<string | undefined>(undefined);
  readonly inputId = input<string | undefined>(undefined);
  readonly tabindex = input(0);
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly change = output<T>();
  readonly onChange = output<{ value: T }>();
  /** Compatibility output retained for the P2 import path. */
  readonly valueChangeEvent = output<T>();
  readonly cvaDisabled = signal(false);
  readonly activeIndex = signal(0);
  private readonly focusedIndex = signal<number | null>(null);
  readonly segments = viewChildren<ElementRef<HTMLButtonElement>>('segment');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private onModelChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  readonly tabStopIndex = computed(() => {
    const options = this.options();
    const focused = this.focusedIndex();
    if (
      this.readonly() &&
      focused !== null &&
      options[focused] &&
      !options[focused].disabled
    )
      return focused;
    const selected = options.findIndex(
      (option) => !option.disabled && this.isSelected(option),
    );
    return selected >= 0
      ? selected
      : options.findIndex((option) => !option.disabled);
  });

  writeValue(value: T | null): void {
    this.value.set(value);
  }
  registerOnChange(fn: (value: T | null) => void): void {
    this.onModelChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(value: boolean): void {
    this.cvaDisabled.set(value);
  }
  isSelected(option: SegmentedControlOption<T>): boolean {
    return this.value() === option.value;
  }
  isTabStop(option: SegmentedControlOption<T>): boolean {
    return this.options()[this.tabStopIndex()] === option;
  }

  onKeydown(event: KeyboardEvent, index?: number): void {
    if (this.disabled() || this.cvaDisabled()) return;
    const enabled = this.options()
      .map((option, i) => (option.disabled ? -1 : i))
      .filter((i) => i >= 0);
    if (!enabled.length) return;
    const current = enabled.indexOf(index ?? this.activeIndex());
    let target: number;
    // Arrow direction follows visual reading order in right-to-left layouts.
    const rtl =
      this.host.nativeElement.ownerDocument.defaultView?.getComputedStyle(
        this.host.nativeElement,
      ).direction === 'rtl';
    const next =
      event.key === 'ArrowDown' ||
      event.key === (rtl ? 'ArrowLeft' : 'ArrowRight');
    const previous =
      event.key === 'ArrowUp' ||
      event.key === (rtl ? 'ArrowRight' : 'ArrowLeft');
    if (next) target = enabled[(current + 1) % enabled.length];
    else if (previous)
      target =
        enabled[
          (current < 0 ? enabled.length - 1 : current + enabled.length - 1) %
            enabled.length
        ];
    else if (event.key === 'Home') target = enabled[0];
    else if (event.key === 'End') target = enabled[enabled.length - 1];
    else if (event.key === 'Enter' || event.key === ' ')
      target = index ?? this.activeIndex();
    else return;
    event.preventDefault();
    this.activeIndex.set(target);
    this.segments()[target]?.nativeElement.focus();
    const option = this.options()[target];
    if (option) this.select(option);
  }

  select(option: SegmentedControlOption<T>): void {
    if (
      option.disabled ||
      this.disabled() ||
      this.cvaDisabled() ||
      this.readonly()
    )
      return;
    this.activeIndex.set(this.options().indexOf(option));
    this.onTouched();
    if (this.isSelected(option)) return;
    this.value.set(option.value);
    this.onModelChange(option.value);
    this.change.emit(option.value);
    this.onChange.emit({ value: option.value });
    this.valueChangeEvent.emit(option.value);
  }

  onFocus(index: number): void {
    this.activeIndex.set(index);
    this.focusedIndex.set(index);
  }

  onFocusOut(event: FocusEvent): void {
    if (
      !event.relatedTarget ||
      !this.host.nativeElement.contains(event.relatedTarget as Node)
    ) {
      this.focusedIndex.set(null);
      this.onTouched();
    }
  }
}
