import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { OtpInputComponent } from '@ciag/orchestra/otp-input';
import { OtpSlotComponent } from '@ciag/orchestra/otp-input';
import { OtpSeparatorComponent } from '@ciag/orchestra/otp-input';
import { OtpGroupComponent } from '@ciag/orchestra/otp-input';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-otp-input-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    OtpInputComponent,
    OtpSlotComponent,
    OtpSeparatorComponent,
    OtpGroupComponent,
    FooterComponent,
  ],
  templateUrl: './otp-input-page.component.html',
  styleUrl: './otp-input-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtpInputPageComponent {
  private readonly fb = inject(FormBuilder);

  // Demo configuration signals
  readonly length = signal<number>(6);
  readonly isDisabled = signal<boolean>(false);
  readonly inputMode = signal<'numeric' | 'text'>('numeric');
  readonly placeholder = signal<string>('-');

  // State output
  readonly otpValue = signal<string>('');
  readonly isCompleted = signal<boolean>(false);

  // Reactive Forms Demo
  readonly form = this.fb.group({
    twoFactorCode: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly formSubmitted = signal<boolean>(false);
  readonly formResult = signal<any>(null);

  onOtpChange(value: string): void {
    this.otpValue.set(value);
    this.isCompleted.set(value.length === this.length());
  }

  onOtpCompleted(value: string): void {
    console.log('OTP Completed: ', value);
  }

  resetDemo(): void {
    this.otpValue.set('');
    this.isCompleted.set(false);
  }

  onSubmitForm(): void {
    this.formSubmitted.set(true);
    if (this.form.valid) {
      this.formResult.set(this.form.value);
    } else {
      this.formResult.set(null);
    }
  }

  resetForm(): void {
    this.formSubmitted.set(false);
    this.formResult.set(null);
    this.form.reset({ twoFactorCode: '' });
  }
}
