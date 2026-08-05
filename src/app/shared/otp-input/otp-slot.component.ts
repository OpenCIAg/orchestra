import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  computed,
  ElementRef,
  viewChild,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ORC_OTP_INPUT } from './otp.types';

@Component({
  selector: 'app-otp-slot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './otp-slot.component.html',
  styleUrl: './otp-slot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtpSlotComponent {
  readonly index = input<number>(0);
  readonly placeholder = input<string>('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly isFirst = input(false, { transform: booleanAttribute });
  readonly isLast = input(false, { transform: booleanAttribute });

  readonly inputElement = viewChild<ElementRef<HTMLInputElement>>('slotInput');
  readonly parentContext = inject(ORC_OTP_INPUT, { optional: true });

  readonly value = computed(() => {
    if (!this.parentContext) return '';
    const values = this.parentContext.inputValues();
    return values[this.index()] || '';
  });

  readonly inputMode = computed(() => {
    return this.parentContext ? this.parentContext.inputMode() : 'numeric';
  });

  readonly effectivePlaceholder = computed(() => {
    return this.placeholder() || (this.parentContext ? this.parentContext.placeholder() : '');
  });

  readonly isDisabled = computed(() => {
    return this.disabled() || (this.parentContext ? this.parentContext.isDisabled() : false);
  });

  readonly ariaLabel = computed(() => {
    if (!this.parentContext) return `Dígito ${this.index() + 1}`;
    return `${this.parentContext.ariaLabel()} - dígito ${this.index() + 1} de ${this.parentContext.length()}`;
  });

  onInput(event: Event): void {
    this.parentContext?.onSlotInput(event, this.index());
  }

  onKeyDown(event: KeyboardEvent): void {
    this.parentContext?.onSlotKeyDown(event, this.index());
  }

  onPaste(event: ClipboardEvent): void {
    this.parentContext?.onSlotPaste(event, this.index());
  }

  onFocus(): void {
    this.parentContext?.onSlotFocus(this.index());
  }

  focus(): void {
    this.inputElement()?.nativeElement.focus();
  }
}
