import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  computed,
  signal,
  ElementRef,
  viewChild,
  OnInit,
  OnDestroy,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ORC_RADIO_GROUP, RadioButtonItem } from './radio.types';

let nextUniqueId = 0;

@Component({
  selector: 'orc-radio-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './radio-button.component.html',
  styleUrl: './radio-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioButtonComponent implements OnInit, OnDestroy, RadioButtonItem {
  // Inputs (Signals API)
  readonly value = input<any>(undefined);
  readonly label = input<string>('');
  readonly description = input<string>('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly error = input(false, { transform: booleanAttribute });
  readonly name = input<string>('');
  readonly id = input<string>('');
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string>('');
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly tabindex = input<number | undefined>(undefined);
  readonly autofocus = input(false, { transform: booleanAttribute });
  readonly binary = input(false, { transform: booleanAttribute });
  readonly variant = input<'outlined' | 'filled' | undefined>(undefined);
  readonly size = input<'small' | 'large' | undefined>(undefined);

  // Outputs (Signals API)
  readonly select = output<any>();
  readonly onClick = output<{ originalEvent?: Event; value: any }>();
  readonly onFocus = output<Event>();
  readonly onBlur = output<Event>();

  // Element reference ao input nativo para foco acessível
  readonly inputElement = viewChild<ElementRef<HTMLInputElement>>('nativeInput');

  // ID interno único
  readonly uniqueId = `orc-radio-${++nextUniqueId}`;

  // Injeção desacoplada via InjectionToken
  readonly radioGroup = inject(ORC_RADIO_GROUP, { optional: true });

  // Identificadores e estados derivados (Signals)
  readonly effectiveId = computed(() => this.inputId() || this.id() || this.uniqueId);

  readonly effectiveName = computed(() => {
    if (this.name()) return this.name();
    if (this.radioGroup) return this.radioGroup.name();
    return this.uniqueId;
  });

  readonly isDisabled = computed(() => {
    return this.disabled() || (this.radioGroup ? this.radioGroup.isDisabled() : false);
  });

  readonly isError = computed(() => {
    return this.error() || (this.radioGroup ? this.radioGroup.isError() : false);
  });

  private readonly standaloneChecked = signal<boolean>(false);

  readonly isChecked = computed(() => {
    if (this.radioGroup) {
      return this.radioGroup.value() === this.value();
    }
    return this.checked() ?? this.standaloneChecked();
  });

  readonly checked = signal<boolean | null>(null);

  // Roving tabindex para acessibilidade WCAG
  readonly tabIndex = computed(() => {
    if (this.isDisabled()) return -1;
    if (!this.radioGroup) return 0;
    if (this.isChecked()) return 0;
    if (!this.radioGroup.hasSelectedRadio() && this.radioGroup.isFirstEnabled(this)) {
      return 0;
    }
    return -1;
  });

  ngOnInit(): void {
    if (this.radioGroup) {
      this.radioGroup.registerRadio(this);
    }
  }

  ngOnDestroy(): void {
    if (this.radioGroup) {
      this.radioGroup.unregisterRadio(this);
    }
  }

  onSelect(event?: Event): void {
    if (this.isDisabled()) {
      event?.preventDefault();
      return;
    }

    if (this.radioGroup) {
      this.radioGroup.select(this.value(), event);
    } else {
      this.standaloneChecked.set(true);
      this.checked.set(true);
    }

    this.select.emit(this.value());
    this.onClick.emit({ originalEvent: event, value: this.binary() ? true : this.value() });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.radioGroup) {
      this.radioGroup.handleKeydown(event, this);
    }
  }

  focus(): void {
    this.inputElement()?.nativeElement.focus();
  }

  onFocusEvent(event: Event): void { this.onFocus.emit(event); }
  onBlurEvent(event: Event): void { this.onBlur.emit(event); }
}
