import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  PaginatorComponent,
  PaginatorSize,
} from '@ciag/orchestra/paginator';
import { FooterComponent } from '../../../shared/footer/footer.component';

interface MockItem {
  id: number;
  name: string;
  category: string;
  status: 'Ativo' | 'Pendente' | 'Concluído';
  value: string;
}

@Component({
  selector: 'app-paginator-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PaginatorComponent,
    FooterComponent,
  ],
  templateUrl: './paginator-page.component.html',
  styleUrl: './paginator-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorPageComponent {
  // ── Playground Signals ────────────────────────────────────
  readonly playgroundTotalItems = signal<number>(120);
  readonly playgroundPageSize = signal<number>(20);
  readonly playgroundCurrentPage = signal<number>(2);
  readonly playgroundSize = signal<PaginatorSize>('md');
  readonly playgroundShowFirstLast = signal<boolean>(false);
  readonly playgroundShowPageSizeSelector = signal<boolean>(true);
  readonly playgroundShowTotalInfo = signal<boolean>(false);
  readonly playgroundDisabled = signal<boolean>(false);
  readonly playgroundPageSizeOptions = [10, 20, 50, 100];

  // ── Figma Showcase Demos (Node 382:5385) ──────────────────
  readonly figmaPage = signal<number>(2);
  readonly figmaPageSize = signal<number>(20);

  // ── Tabela com dados paginados em tempo real ──────────────
  readonly tablePage = signal<number>(1);
  readonly tablePageSize = signal<number>(5);

  private readonly allTableData: MockItem[] = [
    { id: 101, name: 'Design System Orchestra', category: 'Design', status: 'Ativo', value: 'R$ 14.500' },
    { id: 102, name: 'Componente Checkbox WCAG', category: 'Acessibilidade', status: 'Concluído', value: 'R$ 3.200' },
    { id: 103, name: 'Refatoração Switch Signals', category: 'Frontend', status: 'Ativo', value: 'R$ 4.800' },
    { id: 104, name: 'Módulo de Paginação Dinâmica', category: 'Navegação', status: 'Concluído', value: 'R$ 5.600' },
    { id: 105, name: 'Guia de Estilo de Cores e Tokens', category: 'Design', status: 'Concluído', value: 'R$ 2.400' },
    { id: 106, name: 'Integração de Avatares Dinâmicos', category: 'Frontend', status: 'Pendente', value: 'R$ 3.900' },
    { id: 107, name: 'Validação de Formulários Reativos', category: 'Frontend', status: 'Ativo', value: 'R$ 6.100' },
    { id: 108, name: 'Testes Unitários Automatizados', category: 'QA', status: 'Ativo', value: 'R$ 7.200' },
    { id: 109, name: 'Documentação Interativa de API', category: 'Docs', status: 'Pendente', value: 'R$ 4.300' },
    { id: 110, name: 'Auditoria de Acessibilidade WAI-ARIA', category: 'Acessibilidade', status: 'Concluído', value: 'R$ 8.900' },
    { id: 111, name: 'Sistema de Badges e Tags', category: 'Design', status: 'Concluído', value: 'R$ 2.100' },
    { id: 112, name: 'Navegação por Abas (Tabs)', category: 'Navegação', status: 'Concluído', value: 'R$ 4.500' },
  ];

  readonly tableTotalItems = this.allTableData.length;

  readonly visibleTableData = computed(() => {
    const page = this.tablePage();
    const size = this.tablePageSize();
    const start = (page - 1) * size;
    return this.allTableData.slice(start, start + size);
  });
}
