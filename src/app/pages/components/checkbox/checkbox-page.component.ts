import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckboxComponent } from '../../../shared/checkbox';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-checkbox-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CheckboxComponent,
    FooterComponent,
  ],
  templateUrl: './checkbox-page.component.html',
  styleUrl: './checkbox-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxPageComponent {
  // ── Playground Signals ────────────────────────────────────
  readonly playgroundChecked = signal<boolean>(true);
  readonly playgroundIndeterminate = signal<boolean>(false);
  readonly playgroundDisabled = signal<boolean>(false);
  readonly playgroundError = signal<boolean>(false);
  readonly playgroundLabel = signal<string>('Opção de seleção');
  readonly playgroundDescription = signal<string>('Descrição informativa ou texto de apoio para o usuário');
  readonly playgroundErrorMessage = signal<string>('Você precisa marcar esta opção');

  // ── Parent / Child Indeterminate Demo ─────────────────────
  readonly parentChildren = signal([
    { id: 'dash', name: 'Dashboard Executivo', checked: true },
    { id: 'analytics', name: 'Métricas e Analytics', checked: false },
    { id: 'reports', name: 'Exportação de Relatórios', checked: false },
  ]);

  readonly allChildrenChecked = computed(() =>
    this.parentChildren().every((c) => c.checked)
  );

  readonly someChildrenChecked = computed(() => {
    const checkedCount = this.parentChildren().filter((c) => c.checked).length;
    return checkedCount > 0 && checkedCount < this.parentChildren().length;
  });

  onParentToggle(): void {
    const targetState = !this.allChildrenChecked();
    this.parentChildren.update((list) =>
      list.map((item) => ({ ...item, checked: targetState }))
    );
  }

  onChildToggle(index: number, isChecked: boolean): void {
    this.parentChildren.update((list) => {
      const updated = [...list];
      updated[index] = { ...updated[index], checked: isChecked };
      return updated;
    });
  }

  // ── Reactive Forms Demo ───────────────────────────────────
  readonly form: FormGroup;
  readonly formSubmitted = signal<boolean>(false);
  readonly formResult = signal<any>(null);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      acceptTerms: [false, [Validators.requiredTrue]],
      newsletter: [true],
      marketingCookies: [false],
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
      acceptTerms: false,
      newsletter: true,
      marketingCookies: false,
    });
  }

  resetPlayground(): void {
    this.playgroundChecked.set(true);
    this.playgroundIndeterminate.set(false);
    this.playgroundDisabled.set(false);
    this.playgroundError.set(false);
    this.playgroundLabel.set('Opção de seleção');
    this.playgroundDescription.set('Descrição informativa ou texto de apoio para o usuário');
    this.playgroundErrorMessage.set('Você precisa marcar esta opção');
  }
}
