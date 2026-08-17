import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  numberAttribute,
  output,
  signal,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AutocompleteOption } from './autocomplete.types';

let nextAutocompleteId = 0;

@Component({
  selector: 'orc-autocomplete',
  standalone: true,
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AutocompleteComponent), multi: true }],
})
export class AutocompleteComponent implements ControlValueAccessor {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly uniqueId = `orc-autocomplete-${++nextAutocompleteId}`;

  readonly id = input('');
  readonly name = input('');
  readonly label = input('');
  readonly placeholder = input('Comece a digitar...');
  readonly helperText = input('');
  readonly errorMessage = input('');
  readonly options = input<AutocompleteOption[]>([]);
  readonly minChars = input(0, { transform: numberAttribute });
  readonly clearable = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');

  readonly value = model<string | null>(null);
  readonly query = signal('');
  readonly isOpen = signal(false);
  readonly activeIndex = signal(-1);
  readonly optionSelected = output<AutocompleteOption>();
  private readonly cvaDisabled = signal(false);

  readonly effectiveId = computed(() => this.id() || this.uniqueId);
  readonly listId = computed(() => `${this.effectiveId()}-list`);
  readonly effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());
  readonly selectedLabel = computed(() => this.options().find(option => option.value === this.value())?.label ?? '');
  readonly displayText = computed(() => this.query() || this.selectedLabel());
  readonly filteredOptions = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    if (query.length < this.minChars()) return [];
    return this.options().filter(option => option.label.toLocaleLowerCase().includes(query) || option.value.toLocaleLowerCase().includes(query));
  });
  readonly describedBy = computed(() => this.errorMessage() ? `${this.effectiveId()}-error` : this.helperText() ? `${this.effectiveId()}-helper` : null);

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: unknown): void {
    this.value.set(value === null || value === undefined ? null : String(value));
  }
  registerOnChange(fn: (value: string | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.cvaDisabled.set(disabled); }

  onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.query.set(text);
    this.isOpen.set(text.length >= this.minChars());
    this.activeIndex.set(this.firstEnabledIndex());
  }

  onFocus(): void {
    if (!this.effectiveDisabled() && this.query().length >= this.minChars()) this.isOpen.set(true);
  }

  onBlur(): void {
    this.onTouched();
    setTimeout(() => this.isOpen.set(false), 120);
  }

  select(option: AutocompleteOption): void {
    if (option.disabled || this.effectiveDisabled()) return;
    this.value.set(option.value);
    this.query.set(option.label);
    this.isOpen.set(false);
    this.activeIndex.set(-1);
    this.onChange(option.value);
    this.optionSelected.emit(option);
  }

  clear(event?: Event): void {
    event?.preventDefault();
    this.value.set(null);
    this.query.set('');
    this.isOpen.set(false);
    this.onChange(null);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.isOpen.set(false);
  }

  onKeydown(event: KeyboardEvent): void {
    const options = this.filteredOptions();
    if (event.key === 'Escape') { this.isOpen.set(false); return; }
    if (event.key === 'ArrowDown') { event.preventDefault(); this.moveActive(1); return; }
    if (event.key === 'ArrowUp') { event.preventDefault(); this.moveActive(-1); return; }
    if (event.key === 'Enter' && this.isOpen() && this.activeIndex() >= 0) {
      event.preventDefault();
      const option = options[this.activeIndex()];
      if (option) this.select(option);
    }
  }

  optionId(index: number): string { return `${this.effectiveId()}-option-${index}`; }

  private moveActive(direction: -1 | 1): void {
    const options = this.filteredOptions();
    if (!options.length) return;
    let index = this.activeIndex();
    for (let i = 0; i < options.length; i += 1) {
      index = (index + direction + options.length) % options.length;
      if (!options[index]?.disabled) { this.activeIndex.set(index); this.isOpen.set(true); return; }
    }
  }

  private firstEnabledIndex(): number {
    return this.filteredOptions().findIndex(option => !option.disabled);
  }
}
