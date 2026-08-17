import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  input,
  output,
  computed,
  signal,
  booleanAttribute,
  numberAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputComponent } from '@ciag/orchestra/input';
import { BadgeComponent } from '@ciag/orchestra/badge';

@Component({
  selector: 'orc-chip-input',
  standalone: true,
  imports: [CommonModule, InputComponent, BadgeComponent],
  templateUrl: './chip-input.component.html',
  styleUrl: './chip-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChipInputComponent),
      multi: true,
    },
  ],
})
export class ChipInputComponent implements ControlValueAccessor {
  // ── Inputs ──────────────────────────────────────────────────
  readonly id = input<string>('');
  readonly label = input<string>('');
  readonly placeholder = input<string>('Digite e pressione Enter...');
  readonly helperText = input<string>('');
  readonly errorMessage = input<string>('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  
  // Chip specific config
  readonly allowDuplicates = input(false, { transform: booleanAttribute });
  readonly maxChips = input<number | undefined, unknown>(undefined, {
    transform: (val: unknown) => (val !== undefined && val !== null ? numberAttribute(val) : undefined),
  });
  readonly separatorKeyCodes = input<string[]>(['Enter', ',', ' ']);
  readonly suggestions = input<string[]>([]);

  // ── Outputs ─────────────────────────────────────────────────
  readonly chipsChange = output<string[]>();
  readonly maxReached = output<void>();

  // ── Estado Interno ──────────────────────────────────────────
  readonly value = signal<string[]>([]);
  readonly inputValue = signal<string>('');
  readonly a11yMessage = signal<string>('');
  readonly cvaDisabled = signal<boolean>(false);
  
  readonly effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());
  readonly status = computed(() => this.errorMessage() ? 'error' : 'default');

  readonly filteredSuggestions = computed(() => {
    const term = this.inputValue().toLowerCase().trim();
    if (!term) return [];
    
    return this.suggestions()
      .filter(s => s.toLowerCase().includes(term))
      .filter(s => !this.value().includes(s)); // Evita sugerir chips já adicionados
  });

  readonly isSuggestionsVisible = computed(() => {
    return this.filteredSuggestions().length > 0 && !this.effectiveDisabled() && !this.readonly();
  });

  // ── ControlValueAccessor ───────────────────────────────────
  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string[]): void {
    if (Array.isArray(val)) {
      this.value.set([...val]);
    } else {
      this.value.set([]);
    }
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

  // ── Handlers ────────────────────────────────────────────────
  onInputChange(val: string | number): void {
    this.inputValue.set(String(val));
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.effectiveDisabled() || this.readonly()) return;

    const currentInput = this.inputValue().trim();

    // Adicionar Chip
    if (this.separatorKeyCodes().includes(event.key)) {
      event.preventDefault();
      if (currentInput) {
        this.addChip(currentInput);
      }
    }

    // Remover último Chip no Backspace se input estiver vazio
    if (event.key === 'Backspace' && currentInput === '' && this.value().length > 0) {
      this.removeChip(this.value().length - 1);
    }
  }

  onPaste(event: ClipboardEvent): void {
    if (this.effectiveDisabled() || this.readonly()) return;
    
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData?.getData('text');
    
    if (pastedText) {
      event.preventDefault();
      // Separar por vírgula ou quebra de linha
      const items = pastedText.split(/[\n,]+/).map(item => item.trim()).filter(item => item.length > 0);
      
      items.forEach(item => this.addChip(item, true));
      this.updateFormAndEmit();
    }
  }

  onBlur(): void {
    this.onTouched();
    const currentInput = this.inputValue().trim();
    if (currentInput) {
      this.addChip(currentInput);
    }
  }

  // ── Lógica de Chips ─────────────────────────────────────────
  selectSuggestion(item: string): void {
    this.addChip(item);
  }

  private addChip(item: string, skipEmit = false): void {
    const max = this.maxChips();
    const current = this.value();

    if (max !== undefined && current.length >= max) {
      this.maxReached.emit();
      return;
    }

    if (!this.allowDuplicates() && current.includes(item)) {
      return; // Previne duplicatas
    }

    this.value.update(arr => [...arr, item]);
    this.inputValue.set('');
    
    // Atualiza A11y
    this.a11yMessage.set(`Item ${item} adicionado.`);

    if (!skipEmit) {
      this.updateFormAndEmit();
    }
  }

  removeChip(index: number): void {
    if (this.effectiveDisabled() || this.readonly()) return;
    
    const current = this.value();
    const removedItem = current[index];
    
    this.value.update(arr => arr.filter((_, i) => i !== index));
    this.a11yMessage.set(`Item ${removedItem} removido.`);
    
    this.updateFormAndEmit();
  }

  private updateFormAndEmit(): void {
    const currentVal = this.value();
    this.onChange(currentVal);
    this.chipsChange.emit(currentVal);
  }
}
