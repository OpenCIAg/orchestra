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
  selector: 'app-radio-button',
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
  readonly ariaLabel = input<string>('');

  // Outputs (Signals API)
  readonly select = output<any>();

  // Element reference ao input nativo para foco acessível
  readonly inputElement = viewChild<ElementRef<HTMLInputElement>>('nativeInput');

  // ID interno único
  readonly uniqueId = `orc-radio-${++nextUniqueId}`;

  // Injeção desacoplada via InjectionToken
  readonly radioGroup = inject(ORC_RADIO_GROUP, { optional: true });

  // Identificadores e estados derivados (Signals)
  readonly effectiveId = computed(() => this.id() || this.uniqueId);

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
    return this.standaloneChecked();
  });

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
      this.radioGroup.select(this.value());
    } else {
      this.standaloneChecked.set(true);
    }

    this.select.emit(this.value());
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.radioGroup) {
      this.radioGroup.handleKeydown(event, this);
    }
  }

  focus(): void {
    this.inputElement()?.nativeElement.focus();
  }
}
