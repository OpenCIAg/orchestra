import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IconButtonComponent } from '@ciag/orchestra/button';
import { AvatarComponent } from '@ciag/orchestra/avatar';
import { BadgeComponent } from '@ciag/orchestra/badge';
import { BreadcrumbComponent, BreadcrumbItemComponent } from '@ciag/orchestra/breadcrumb';
import { DropdownComponent, DropdownItem } from '@ciag/orchestra/dropdown';
import { TooltipDirective } from '@ciag/orchestra/tooltip';
import { ToastService } from '@ciag/orchestra/toast';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IconButtonComponent,
    AvatarComponent,
    BadgeComponent,
    BreadcrumbComponent,
    BreadcrumbItemComponent,
    DropdownComponent,
    TooltipDirective,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly isSidebarCollapsed = signal<boolean>(false);
  readonly isDarkMode = signal<boolean>(false);

  readonly userMenuItems: DropdownItem[] = [
    {
      label: 'Meu Perfil',
      action: () => this.router.navigate(['/settings']),
    },
    {
      label: 'Configurações da Conta',
      action: () => this.router.navigate(['/settings']),
    },
    {
      label: 'Sair do Sistema',
      danger: true,
      action: () => {
        this.toastService.info('Você saiu da sessão.');
        this.router.navigate(['/login']);
      },
    },
  ];

  toggleSidebar(): void {
    this.isSidebarCollapsed.update((v) => !v);
  }

  toggleTheme(): void {
    const nextTheme = !this.isDarkMode();
    this.isDarkMode.set(nextTheme);

    if (this.isBrowser) {
      if (nextTheme) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
    this.toastService.success(`Tema ${nextTheme ? 'Escuro' : 'Claro'} ativado!`);
  }
}
