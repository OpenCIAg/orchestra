import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  AlertComponent,
  AlertSeverity,
  AlertVariant,
} from '../../../shared/alert';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-alert-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AlertComponent,
    FooterComponent,
  ],
  templateUrl: './alert-page.component.html',
  styleUrl: './alert-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertPageComponent {
  // ── Playground Signals ────────────────────────────────────
  readonly playgroundTitle = signal<string>('Título do Alerta');
  readonly playgroundMessage = signal<string>(
    'Esta é uma mensagem demonstrativa para informar o usuário.'
  );
  readonly playgroundSeverity = signal<AlertSeverity>('info');
  readonly playgroundVariant = signal<AlertVariant>('subtle');
  readonly playgroundShowIcon = signal<boolean>(true);
  readonly playgroundDismissible = signal<boolean>(true);

  // ── Dismissible Alerts Demo List ──────────────────────────
  readonly demoAlerts = signal<
    { id: number; severity: AlertSeverity; title: string; message: string }[]
  >([
    {
      id: 1,
      severity: 'info',
      title: 'Informação',
      message: 'Este é um alerta informativo padrão para comunicar algo ao usuário.',
    },
    {
      id: 2,
      severity: 'success',
      title: 'Sucesso',
      message: 'Sua ação foi concluída com sucesso. Tudo está funcionando conforme esperado.',
    },
    {
      id: 3,
      severity: 'warning',
      title: 'Atenção',
      message: 'Verifique as configurações antes de continuar. Alguns campos podem estar incompletos.',
    },
    {
      id: 4,
      severity: 'error',
      title: 'Erro',
      message: 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.',
    },
  ]);

  removeAlert(id: number): void {
    this.demoAlerts.update(alerts => alerts.filter(a => a.id !== id));
  }

  resetDemoAlerts(): void {
    this.demoAlerts.set([
      {
        id: 1,
        severity: 'info',
        title: 'Informação',
        message: 'Este é um alerta informativo padrão para comunicar algo ao usuário.',
      },
      {
        id: 2,
        severity: 'success',
        title: 'Sucesso',
        message: 'Sua ação foi concluída com sucesso. Tudo está funcionando conforme esperado.',
      },
      {
        id: 3,
        severity: 'warning',
        title: 'Atenção',
        message: 'Verifique as configurações antes de continuar. Alguns campos podem estar incompletos.',
      },
      {
        id: 4,
        severity: 'error',
        title: 'Erro',
        message: 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.',
      },
    ]);
  }
}
