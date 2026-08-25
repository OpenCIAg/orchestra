import { ChangeDetectionStrategy, Component, booleanAttribute, forwardRef, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SegmentedControlOption<T = unknown> { label: string; value: T; icon?: string; disabled?: boolean; }

@Component({
  selector: 'orc-segmented-control', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SegmentedControlComponent), multi: true }],
  template: `<div class="orc-segmented-control" [class]="'orc-segmented-control ' + styleClass()" role="group" [attr.aria-label]="label()">@for (option of options(); track option.value) { <button type="button" [disabled]="disabled() || cvaDisabled() || readonly() || option.disabled" [class.orc-segmented-control__option--selected]="isSelected(option)" [attr.aria-pressed]="isSelected(option)" (click)="select(option)">@if(option.icon){<span aria-hidden="true">{{option.icon}}</span>}{{option.label}}</button> }</div>`,
  styles: [':host{display:inline-block}.orc-segmented-control{display:inline-flex;padding:.2rem;border:1px solid var(--orc-border-default,#e2e8f0);border-radius:.6rem;background:var(--orc-surface,#fff)}button{border:0;border-radius:.4rem;padding:.5rem .7rem;background:transparent;color:var(--orc-text,#0f172a);font:inherit;cursor:pointer}.orc-segmented-control__option--selected{background:var(--orc-interactive,#2563eb);color:var(--orc-on-interactive,#fff)}button:disabled{cursor:not-allowed;opacity:.55}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentedControlComponent<T = unknown> implements ControlValueAccessor {
  readonly options = input<SegmentedControlOption<T>[]>([]); readonly value = model<T | null>(null); readonly label = input('Options'); readonly styleClass = input(''); readonly disabled = input(false, { transform: booleanAttribute }); readonly readonly = input(false, { transform: booleanAttribute }); readonly change = output<T>(); readonly onChange = output<{ value: T }>();
  readonly cvaDisabled = signal(false); private onModelChange: (value: T | null) => void = () => {}; private onTouched: () => void = () => {};
  writeValue(value: T | null): void { this.value.set(value); } registerOnChange(fn: (value: T | null) => void): void { this.onModelChange = fn; } registerOnTouched(fn: () => void): void { this.onTouched = fn; } setDisabledState(value: boolean): void { this.cvaDisabled.set(value); }
  isSelected(option: SegmentedControlOption<T>): boolean { return this.value() === option.value; }
  select(option: SegmentedControlOption<T>): void { if (option.disabled || this.disabled() || this.cvaDisabled() || this.readonly()) return; this.value.set(option.value); this.onModelChange(option.value); this.onTouched(); this.change.emit(option.value); this.onChange.emit({ value: option.value }); }
}
