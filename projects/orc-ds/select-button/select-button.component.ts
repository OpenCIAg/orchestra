import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { P2_SHARED_STYLES } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-select-button',
  standalone: true,
  templateUrl: './select-button.component.html',
  styles: [P2_SHARED_STYLES],
  styleUrl: './select-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectButtonComponent),
      multi: true,
    },
  ],
})
export class SelectButtonComponent<
  T = unknown,
> implements ControlValueAccessor {
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly options = input<any[]>([]);
  readonly value = model<T | T[] | null>(null);
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly label = input<string | undefined>(undefined);
  readonly optionLabel = input<string | undefined>(undefined);
  readonly optionValue = input<string | undefined>(undefined);
  readonly optionDisabled = input<string | undefined>(undefined);
  readonly unselectable = input(false, { transform: booleanAttribute });
  readonly allowEmpty = input(true, { transform: booleanAttribute });
  readonly tabindex = input(0);
  readonly styleClass = input('');
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly size = input<'small' | 'large' | undefined>(undefined);
  readonly autofocus = input(false, { transform: booleanAttribute });
  readonly dataKey = input<string | undefined>(undefined);
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly valueChangeEvent = output<T | T[] | null>();
  readonly onOptionClick = output<{
    originalEvent: Event;
    option: any;
    index: number;
  }>();
  readonly onChange = output<{ originalEvent: Event; value: T | T[] | null }>();
  readonly onFocus = output<Event>();
  readonly onBlur = output<void>();
  readonly cvaDisabled = signal(false);
  private onModelChange: (value: T | T[] | null) => void = () => {};
  private onModelTouched: () => void = () => {};
  writeValue(value: T | T[] | null): void {
    this.value.set(value ?? null);
  }
  registerOnChange(fn: (value: T | T[] | null) => void): void {
    this.onModelChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }
  setDisabledState(value: boolean): void {
    this.cvaDisabled.set(value);
  }
  getOptionValue(option: any): any {
    const key = this.optionValue();
    return key ? option?.[key] : (option?.value ?? option);
  }
  getOptionLabel(option: any): string {
    const key = this.optionLabel();
    return String(
      key ? (option?.[key] ?? '') : (option?.label ?? option ?? ''),
    );
  }
  isOptionDisabled(option: any): boolean {
    const key = this.optionDisabled();
    return Boolean(key ? option?.[key] : option?.disabled);
  }
  isSelected(option: any): boolean {
    const candidate = this.getOptionValue(option);
    const current = this.value();
    return this.multiple()
      ? Array.isArray(current) &&
          current.some((value) => this.sameValue(value, candidate))
      : this.sameValue(current, candidate);
  }
  private sameValue(left: any, right: any): boolean {
    const key = this.dataKey();
    return key && left && right ? left?.[key] === right?.[key] : left === right;
  }
  onContainerFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    const NodeConstructor =
      this.host.nativeElement.ownerDocument.defaultView?.Node;
    if (
      !NodeConstructor ||
      !(next instanceof NodeConstructor) ||
      !(event.currentTarget as HTMLElement).contains(next as Node)
    )
      this.onModelTouched();
  }
  select(option: any, event?: Event): void {
    if (this.disabled() || this.cvaDisabled() || this.isOptionDisabled(option))
      return;
    if (event) {
      this.onOptionClick.emit({
        originalEvent: event,
        option,
        index: this.options().indexOf(option),
      });
    }
    const candidate = this.getOptionValue(option);
    const current = this.value();
    let next: T | T[] | null;
    if (this.multiple()) {
      const items: any[] = Array.isArray(current) ? [...current] : [];
      const index = items.findIndex((value) =>
        this.sameValue(value, candidate),
      );
      if (index >= 0) {
        if (this.unselectable() || (!this.allowEmpty() && items.length === 1))
          return;
        items.splice(index, 1);
      } else items.push(candidate);
      next = items as T[];
    } else {
      if (this.sameValue(current, candidate) && !this.allowEmpty()) return;
      next = this.sameValue(current, candidate) ? null : (candidate as T);
    }
    this.value.set(next);
    this.onModelChange(next);
    this.valueChangeEvent.emit(next);
    if (event) {
      this.onChange.emit({ originalEvent: event, value: next });
    }
  }
}
