import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SwitchComponent, SwitchLabelPosition, SwitchSize } from '@ciag/orchestra/switch';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-switch-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SwitchComponent,
    FooterComponent,
  ],
  templateUrl: './switch-page.component.html',
  styleUrl: './switch-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchPageComponent {
  // ── Playground Signals ────────────────────────────────────
  readonly playgroundChecked = signal<boolean>(true);
  readonly playgroundDisabled = signal<boolean>(false);
  readonly playgroundError = signal<boolean>(false);
  readonly playgroundSize = signal<SwitchSize>('md');
  readonly playgroundLabelPosition = signal<SwitchLabelPosition>('end');
  readonly playgroundLabel = signal<string>('Notificações automáticas');
  readonly playgroundDescription = signal<string>('Receba alertas instantâneos sobre novas transações');
  readonly playgroundErrorMessage = signal<string>('Você deve ativar este serviço');

  // ── Reactive Forms Demo ───────────────────────────────────
  readonly form: FormGroup;
  readonly formSubmitted = signal<boolean>(false);
  readonly formResult = signal<any>(null);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      autoSave: [true],
      twoFactorAuth: [false, [Validators.requiredTrue]],
      darkMode: [false],
    });
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
    this.form.reset({
      autoSave: true,
      twoFactorAuth: false,
      darkMode: false,
    });
  }

  resetPlayground(): void {
    this.playgroundChecked.set(true);
    this.playgroundDisabled.set(false);
    this.playgroundError.set(false);
    this.playgroundSize.set('md');
    this.playgroundLabelPosition.set('end');
    this.playgroundLabel.set('Notificações automáticas');
    this.playgroundDescription.set('Receba alertas instantâneos sobre novas transações');
    this.playgroundErrorMessage.set('Você deve ativar este serviço');
  }
}
