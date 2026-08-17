import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StepperComponent } from '@ciag/orchestra/stepper';
import { StepItem } from '@ciag/orchestra/stepper';
import { InputComponent } from '@ciag/orchestra/input';
import { ButtonComponent } from '@ciag/orchestra/button';
import { RadioGroupComponent, RadioButtonComponent } from '@ciag/orchestra/radio';
import { SwitchComponent } from '@ciag/orchestra/switch';
import { OtpInputComponent } from '@ciag/orchestra/otp-input';
import { FileUploaderComponent } from '@ciag/orchestra/file-uploader';
import { AccordionComponent, AccordionItemComponent } from '@ciag/orchestra/accordion';
import { AlertComponent } from '@ciag/orchestra/alert';
import { ToastService } from '@ciag/orchestra/toast';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StepperComponent,
    InputComponent,
    ButtonComponent,
    RadioGroupComponent,
    RadioButtonComponent,
    SwitchComponent,
    OtpInputComponent,
    FileUploaderComponent,
    AccordionComponent,
    AccordionItemComponent,
    AlertComponent,
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  private readonly toastService = inject(ToastService);

  readonly currentStep = signal<number>(0);
  readonly steps: StepItem[] = [
    { title: 'Perfil & Dados', description: 'Informações pessoais' },
    { title: 'Segurança & 2FA', description: 'Autenticação em 2 etapas' },
    { title: 'Preferências', description: 'Canais de comunicação' },
  ];

  readonly fullName = signal<string>('Matheus Castro');
  readonly company = signal<string>('CIAG Soluções Tecnológicas');
  readonly phone = signal<string>('+55 (11) 98765-4321');
  readonly otpCode = signal<string>('');
  readonly is2faEnabled = signal<boolean>(false);

  readonly selectedThemeMode = signal<string>('auto');
  readonly emailNotifications = signal<boolean>(true);
  readonly pushNotifications = signal<boolean>(true);
  readonly smsAlerts = signal<boolean>(false);

  nextStep(): void {
    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update((s) => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update((s) => s - 1);
    }
  }

  verifyOtp(): void {
    if (this.otpCode().length === 6) {
      this.is2faEnabled.set(true);
      this.toastService.success('Autenticação em 2 etapas (2FA) configurada com sucesso!');
    } else {
      this.toastService.error('Digite o código de 6 dígitos completo.');
    }
  }

  saveAllPreferences(): void {
    this.toastService.success('Todas as configurações foram salvas com sucesso!');
  }
}
