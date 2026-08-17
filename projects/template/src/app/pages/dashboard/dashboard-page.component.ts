import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '@ciag/orchestra/button';
import { CardComponent, CardHeaderComponent, CardBodyComponent, CardFooterComponent } from '@ciag/orchestra/card';
import { BadgeComponent } from '@ciag/orchestra/badge';
import { ProgressBarComponent, ProgressCircleComponent } from '@ciag/orchestra/progress';
import { TabGroupComponent, TabComponent } from '@ciag/orchestra/tabs';
import { AvatarComponent, AvatarGroupComponent } from '@ciag/orchestra/avatar';
import { SkeletonComponent } from '@ciag/orchestra/skeleton';
import { DropdownComponent, DropdownItem } from '@ciag/orchestra/dropdown';
import { ToastService } from '@ciag/orchestra/toast';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    CardFooterComponent,
    BadgeComponent,
    ProgressBarComponent,
    ProgressCircleComponent,
    TabGroupComponent,
    TabComponent,
    AvatarComponent,
    AvatarGroupComponent,
    SkeletonComponent,
    DropdownComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly toastService = inject(ToastService);

  readonly isLoading = signal<boolean>(false);
  readonly currentTab = signal<number>(0);

  readonly exportMenuItems: DropdownItem[] = [
    {
      label: 'Exportar PDF',
      action: () => this.toastService.success('Relatório PDF exportado com sucesso!'),
    },
    {
      label: 'Exportar Planilha Excel',
      action: () => this.toastService.success('Planilha Excel gerada!'),
    },
    {
      label: 'Compartilhar Link Seguro',
      action: () => this.toastService.info('Link seguro copiado para a área de transferência.'),
    },
  ];

  readonly recentActivities = [
    {
      title: 'Novo contrato assinado',
      time: 'Há 5 minutos',
      status: 'success',
      badge: 'Concluído',
      user: 'Ana Beatriz',
    },
    {
      title: 'Deploy em Produção (v2.4.1)',
      time: 'Há 25 minutos',
      status: 'info',
      badge: 'Release',
      user: 'Carlos Eduardo',
    },
    {
      title: 'Alerta de pico de uso de CPU (89%)',
      time: 'Há 1 hora',
      status: 'warning',
      badge: 'Atenção',
      user: 'Servidor SP-01',
    },
    {
      title: 'Transação PIX aprovada R$ 4.850,00',
      time: 'Há 2 horas',
      status: 'success',
      badge: 'Aprovado',
      user: 'Mariana Souza',
    },
  ];

  simulateRefresh(): void {
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      this.toastService.success('Métricas atualizadas em tempo real!');
    }, 800);
  }
}
