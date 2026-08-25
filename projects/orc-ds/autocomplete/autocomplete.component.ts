import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly uniqueId = `orc-autocomplete-${++nextAutocompleteId}`;
  private blurTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly id = input('');
  readonly inputId = input<string | undefined>(undefined);
  readonly name = input('');
  readonly label = input('');
  readonly placeholder = input('Comece a digitar...');
  readonly helperText = input('');
  readonly errorMessage = input('');
  readonly options = input<AutocompleteOption[]>([]);
  readonly suggestions = input<AutocompleteOption[]>([], { alias: 'suggestions' });
  readonly minChars = input(0, { transform: numberAttribute });
  readonly minLength = input<number | undefined, unknown>(undefined, { transform: numberAttribute });
  readonly clearable = input(true, { transform: booleanAttribute });
  readonly showClear = input<boolean | undefined, unknown>(undefined, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly dropdown = input(false, { transform: booleanAttribute });
  readonly emptyMessage = input('No results found');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly styleClass = input('');
  readonly panelStyle = input<Record<string, any> | null | undefined>(undefined);
  readonly panelStyleClass = input('');
  readonly appendTo = input<unknown>(undefined);
  readonly delay = input(300, { transform: numberAttribute });
  readonly forceSelection = input(false, { transform: booleanAttribute });
  readonly autoHighlight = input(false, { transform: booleanAttribute });
  readonly showEmptyMessage = input(true, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });

  readonly value = model<string | null>(null);
  readonly query = signal('');
  readonly isOpen = signal(false);
  readonly activeIndex = signal(-1);
  readonly optionSelected = output<AutocompleteOption>();
  readonly onChange = output<{ value: string | null }>();
  readonly onClear = output<void>(); readonly onShow = output<void>(); readonly onHide = output<void>(); readonly onFocusEvent = output<Event>(); readonly onBlurEvent = output<Event>();
  private readonly cvaDisabled = signal(false);

  readonly effectiveId = computed(() => this.inputId() || this.id() || this.uniqueId);
  readonly listId = computed(() => `${this.effectiveId()}-list`);
  readonly effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());
  readonly effectiveOptions = computed(() => this.suggestions().length ? this.suggestions() : this.options());
  readonly effectiveMinLength = computed(() => this.minLength() ?? this.minChars());
  readonly effectiveShowClear = computed(() => this.showClear() ?? this.clearable());
  readonly selectedLabel = computed(() => this.effectiveOptions().find(option => option.value === this.value())?.label ?? '');
  readonly displayText = computed(() => this.query() || this.selectedLabel());
  readonly filteredOptions = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    if (query.length < this.effectiveMinLength()) return [];
    return this.effectiveOptions().filter(option => option.label.toLocaleLowerCase().includes(query) || option.value.toLocaleLowerCase().includes(query));
  });
  readonly describedBy = computed(() => this.errorMessage() ? `${this.effectiveId()}-error` : this.helperText() ? `${this.effectiveId()}-helper` : null);

  private cvaChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    this.destroyRef.onDestroy(() => this.clearBlurTimeout());
  }

  writeValue(value: unknown): void {
    this.value.set(value === null || value === undefined ? null : String(value));
  }
  registerOnChange(fn: (value: string | null) => void): void { this.cvaChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.cvaDisabled.set(disabled); }

  onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.query.set(text);
    this.isOpen.set(text.length >= this.effectiveMinLength());
    this.activeIndex.set(this.autoHighlight() ? this.firstEnabledIndex() : -1);
  }

  onFocus(event?: Event): void {
    this.clearBlurTimeout();
    if (!this.effectiveDisabled() && (this.dropdown() || this.query().length >= this.effectiveMinLength())) { this.isOpen.set(true); this.onShow.emit(); }
    if (event) this.onFocusEvent.emit(event);
  }

  toggleDropdown(event?: Event): void {
    event?.preventDefault();
    if (this.effectiveDisabled()) return;
    this.clearBlurTimeout();
    if (this.isOpen()) { this.isOpen.set(false); this.onHide.emit(); return; }
    this.isOpen.set(true); this.activeIndex.set(this.firstEnabledIndex()); this.onShow.emit();
  }

  onBlur(event?: Event): void {
    this.onTouched();
    if (this.forceSelection()) {
      const selected = this.effectiveOptions().find(option => option.label === this.query());
      if (!selected) this.clear();
    }
    this.clearBlurTimeout();
    this.blurTimeout = setTimeout(() => {
      this.blurTimeout = null;
      if (this.isOpen()) { this.isOpen.set(false); this.onHide.emit(); }
    }, 120);
    if (event) this.onBlurEvent.emit(event);
  }

  select(option: AutocompleteOption): void {
    if (option.disabled || this.effectiveDisabled()) return;
    this.clearBlurTimeout();
    this.value.set(option.value);
    this.query.set(option.label);
    this.isOpen.set(false);
    this.activeIndex.set(-1);
    this.cvaChange(option.value);
    this.onChange.emit({ value: option.value });
    this.optionSelected.emit(option);
  }

  clear(event?: Event): void {
    event?.preventDefault();
    this.clearBlurTimeout();
    this.value.set(null);
    this.query.set('');
    this.isOpen.set(false);
    this.cvaChange(null);
    this.onChange.emit({ value: null }); this.onClear.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.clearBlurTimeout();
    if (!this.host.nativeElement.contains(event.target as Node) && this.isOpen()) { this.isOpen.set(false); this.onHide.emit(); }
  }

  onKeydown(event: KeyboardEvent): void {
    const options = this.filteredOptions();
    if (event.key === 'Escape' && this.closeOnEscape()) { event.preventDefault(); if (this.isOpen()) this.onHide.emit(); this.isOpen.set(false); return; }
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

  private clearBlurTimeout(): void {
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
      this.blurTimeout = null;
    }
  }
}
