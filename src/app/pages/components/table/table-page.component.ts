import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  TableComponent,
  ColumnDirective,
  CellDefDirective,
  HeaderCellDefDirective,
  SortDirection,
  TableSortEvent,
} from '../../../shared/table';
import { BadgeComponent } from '../../../shared/badge/badge.component';
import { BadgeStatus } from '../../../shared/badge/badge.types';
import { FooterComponent } from '../../../shared/footer/footer.component';

export interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'success' | 'warning' | 'info' | 'error' | 'neutral' | 'active';
  statusLabel: string;
  createdAt: string;
}

@Component({
  selector: 'app-table-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableComponent,
    ColumnDirective,
    CellDefDirective,
    HeaderCellDefDirective,
    BadgeComponent,
    FooterComponent,
  ],
  templateUrl: './table-page.component.html',
  styleUrl: './table-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablePageComponent {
  // ── Controles Interativos do Playground ───────────────────
  readonly selectable = signal<boolean>(true);
  readonly paginated = signal<boolean>(true);
  readonly striped = signal<boolean>(false);
  readonly bordered = signal<boolean>(true);
  readonly hoverable = signal<boolean>(true);
  readonly loading = signal<boolean>(false);
  readonly pageSize = signal<number>(5);
  readonly currentPage = signal<number>(1);
  readonly sortColumn = signal<string>('name');
  readonly sortDirection = signal<SortDirection>('asc');

  // ── Seleção Reativa ───────────────────────────────────────
  readonly selectedRows = signal<UserRow[]>([]);

  // ── Dados de Exemplo do Design System (Figma Spec) ────────
  readonly mockUsers = signal<UserRow[]>([
    {
      id: 1,
      name: 'Orquestra Tech',
      email: 'contato@orchestra.dev',
      role: 'Desenvolvimento',
      status: 'success',
      statusLabel: 'Sucesso',
      createdAt: '01/08/2026',
    },
    {
      id: 2,
      name: 'Design System',
      email: 'design@orchestra.dev',
      role: 'UI/UX Design',
      status: 'warning',
      statusLabel: 'Aviso',
      createdAt: '02/08/2026',
    },
    {
      id: 3,
      name: 'API Gateway',
      email: 'infra@orchestra.dev',
      role: 'Infraestrutura',
      status: 'info',
      statusLabel: 'Novo',
      createdAt: '03/08/2026',
    },
    {
      id: 4,
      name: 'Auth Service',
      email: 'security@orchestra.dev',
      role: 'Segurança',
      status: 'active',
      statusLabel: 'Ativo',
      createdAt: '04/08/2026',
    },
    {
      id: 5,
      name: 'Analytics Pipeline',
      email: 'data@orchestra.dev',
      role: 'Data Science',
      status: 'error',
      statusLabel: 'Erro',
      createdAt: '05/08/2026',
    },
    {
      id: 6,
      name: 'Billing Gateway',
      email: 'finance@orchestra.dev',
      role: 'Financeiro',
      status: 'neutral',
      statusLabel: 'Inativo',
      createdAt: '06/08/2026',
    },
    {
      id: 7,
      name: 'Notification Hub',
      email: 'alerts@orchestra.dev',
      role: 'Comunicações',
      status: 'success',
      statusLabel: 'Sucesso',
      createdAt: '07/08/2026',
    },
    {
      id: 8,
      name: 'Storage Cluster',
      email: 'storage@orchestra.dev',
      role: 'Infraestrutura',
      status: 'active',
      statusLabel: 'Ativo',
      createdAt: '08/08/2026',
    },
  ]);

  // ── Mapeamento de Status do Badge ─────────────────────────
  mapBadgeStatus(status: UserRow['status']): BadgeStatus {
    switch (status) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'error':
        return 'danger';
      case 'active':
        return 'primary';
      case 'neutral':
      default:
        return 'neutral';
    }
  }

  // ── Ações Interativas ─────────────────────────────────────
  onSortChanged(event: TableSortEvent): void {
    console.log('Tabela ordenada:', event);
  }

  onRowClicked(row: UserRow): void {
    console.log('Linha clicada:', row);
  }

  deleteRow(id: number): void {
    this.mockUsers.update(list => list.filter(u => u.id !== id));
    this.selectedRows.update(list => list.filter(u => u.id !== id));
  }

  resetData(): void {
    this.mockUsers.set([
      { id: 1, name: 'Orquestra Tech', email: 'contato@orchestra.dev', role: 'Desenvolvimento', status: 'success', statusLabel: 'Sucesso', createdAt: '01/08/2026' },
      { id: 2, name: 'Design System', email: 'design@orchestra.dev', role: 'UI/UX Design', status: 'warning', statusLabel: 'Aviso', createdAt: '02/08/2026' },
      { id: 3, name: 'API Gateway', email: 'infra@orchestra.dev', role: 'Infraestrutura', status: 'info', statusLabel: 'Novo', createdAt: '03/08/2026' },
      { id: 4, name: 'Auth Service', email: 'security@orchestra.dev', role: 'Segurança', status: 'active', statusLabel: 'Ativo', createdAt: '04/08/2026' },
      { id: 5, name: 'Analytics Pipeline', email: 'data@orchestra.dev', role: 'Data Science', status: 'error', statusLabel: 'Erro', createdAt: '05/08/2026' },
      { id: 6, name: 'Billing Gateway', email: 'finance@orchestra.dev', role: 'Financeiro', status: 'neutral', statusLabel: 'Inativo', createdAt: '06/08/2026' },
      { id: 7, name: 'Notification Hub', email: 'alerts@orchestra.dev', role: 'Comunicações', status: 'success', statusLabel: 'Sucesso', createdAt: '07/08/2026' },
      { id: 8, name: 'Storage Cluster', email: 'storage@orchestra.dev', role: 'Infraestrutura', status: 'active', statusLabel: 'Ativo', createdAt: '08/08/2026' },
    ]);
    this.selectedRows.set([]);
  }

  toggleLoadingSimulation(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
    }, 1500);
  }
}
