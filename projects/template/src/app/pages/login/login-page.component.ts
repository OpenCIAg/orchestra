import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InputComponent } from '@ciag/orchestra/input';
import { ButtonComponent } from '@ciag/orchestra/button';
import { CheckboxComponent } from '@ciag/orchestra/checkbox';
import { AlertComponent } from '@ciag/orchestra/alert';
import { ToastService } from '@ciag/orchestra/toast';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    InputComponent,
    ButtonComponent,
    CheckboxComponent,
    AlertComponent,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly email = signal<string>('admin@ciag.com');
  readonly password = signal<string>('Orchestra@2026');
  readonly rememberMe = signal<boolean>(true);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  handleLogin(): void {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor preencha todos os campos obrigatórios.');
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);

    setTimeout(() => {
      this.isLoading.set(false);
      this.toastService.success('Autenticação realizada com sucesso!');
      this.router.navigate(['/dashboard']);
    }, 900);
  }
}
