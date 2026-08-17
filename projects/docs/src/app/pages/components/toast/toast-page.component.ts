import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  ToastService,
  ToastStatus,
  ToastPosition,
  ToastComponent,
  ToastContainerComponent,
} from '@ciag/orchestra/toast';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-toast-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ToastComponent,
    FooterComponent,
  ],
  templateUrl: './toast-page.component.html',
  styleUrl: './toast-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastPageComponent {
  readonly toastService = inject(ToastService);

  // ── Playground Signals ────────────────────────────────────
  readonly playgroundTitle = signal<string>('Notificação');
  readonly playgroundMessage = signal<string>('Operação realizada com sucesso no sistema.');
  readonly playgroundType = signal<ToastStatus>('success');
  readonly playgroundPosition = signal<ToastPosition>('top-right');
  readonly playgroundDuration = signal<number>(5000);
  readonly playgroundDismissible = signal<boolean>(true);
  readonly playgroundShowIcon = signal<boolean>(true);
  readonly playgroundShowProgressBar = signal<boolean>(false);
  readonly playgroundHasAction = signal<boolean>(false);
  readonly playgroundActionLabel = signal<string>('Desfazer');

  // ── Métodos de Disparo do Playground ──────────────────────
  triggerPlaygroundToast(): void {
    this.toastService.show({
      type: this.playgroundType(),
      title: this.playgroundTitle(),
      message: this.playgroundMessage(),
      position: this.playgroundPosition(),
      duration: Number(this.playgroundDuration()),
      showProgressBar: this.playgroundShowProgressBar(),
      dismissible: this.playgroundDismissible(),
      showIcon: this.playgroundShowIcon(),
      action: this.playgroundHasAction()
        ? {
            label: this.playgroundActionLabel(),
            icon: 'undo',
            onClick: toast => {
              this.toastService.info(`Ação "${this.playgroundActionLabel()}" executada para o toast ${toast.title || toast.id}!`);
            },
          }
        : undefined,
    });
  }

  // ── Métodos de Disparo Rápido (Figma Node 382:5265) ────────
  triggerSuccess(): void {
    this.toastService.show({
      type: 'success',
      title: 'Sucesso',
      position: this.playgroundPosition(),
    });
  }

  triggerInfo(): void {
    this.toastService.show({
      type: 'info',
      title: 'Infos',
      position: this.playgroundPosition(),
    });
  }

  triggerWarning(): void {
    this.toastService.show({
      type: 'warning',
      title: 'Atenção',
      position: this.playgroundPosition(),
    });
  }

  triggerError(): void {
    this.toastService.show({
      type: 'error',
      title: 'Erro',
      position: this.playgroundPosition(),
    });
  }

  triggerLoading(): void {
    this.toastService.show({
      type: 'loading',
      title: 'Carregando',
      duration: 4000,
      position: this.playgroundPosition(),
    });
  }

  triggerNotification(): void {
    this.toastService.show({
      type: 'notification',
      title: 'Notificações',
      message: 'Sexta-feira, 28 de Fevereiro às 14:00',
      position: this.playgroundPosition(),
    });
  }

  triggerUndoAction(): void {
    this.toastService.show({
      type: 'info',
      showIcon: false,
      title: 'Ações canceláveis',
      message: 'Usuário pode desfazer por enquanto',
      position: this.playgroundPosition(),
      action: {
        label: 'Desfazer',
        icon: 'undo',
        onClick: () => {
          this.toastService.success('Ação desfeita com sucesso!');
        },
      },
    });
  }

  triggerLearnMore(): void {
    this.toastService.show({
      type: 'info',
      showIcon: false,
      title: 'Mais informações',
      message: 'Eventos que user precisa saber mais',
      position: this.playgroundPosition(),
      action: {
        label: 'Saiba mais',
        onClick: () => {
          this.toastService.info('Abrindo detalhes adicionais...');
        },
      },
    });
  }

  clearAll(): void {
    this.toastService.clear();
  }
}
