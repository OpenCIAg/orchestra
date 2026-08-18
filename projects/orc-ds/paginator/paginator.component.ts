import {
  Component,
  ChangeDetectionStrategy,
  input,
  model,
  output,
  computed,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PageChangeEvent,
  PageItem,
  PaginatorSize,
  PaginatorVariant,
} from './paginator.types';

@Component({
  selector: 'orc-paginator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent {
  // ── Inputs & Models (Signals API) ─────────────────────────
  /** Total de itens na coleção de dados */
  readonly totalItems = input<number>(0);
  /** PrimeNG naming alias for totalItems. */
  readonly totalRecords = input<number | undefined>(undefined);

  /** Quantidade de itens por página (Two-Way Data Binding) */
  readonly pageSize = model<number>(10);
  /** PrimeNG naming alias for pageSize. */
  readonly rowsInput = input<number | undefined>(undefined, { alias: 'rows' });
  readonly rows = this.pageSize;
  /** PrimeNG zero-based first-row model. */
  readonly first = model<number>(0);

  /** Página atual selecionada (1-indexed, Two-Way Data Binding) */
  readonly currentPage = model<number>(1);

  /** Opções de quantidade de itens por página */
  readonly pageSizeOptions = input<number[]>([10, 20, 50]);
  readonly rowsPerPageOptions = input<number[] | undefined>(undefined, { alias: 'rowsPerPageOptions' });

  /** Se deve exibir o seletor de quantidade de itens por página */
  readonly showPageSizeSelector = input<boolean>(true);

  /** Se deve exibir os botões de Primeira e Última página */
  readonly showFirstLastButtons = input<boolean>(false);
  readonly showFirstLastIcon = input(false, { transform: booleanAttribute });

  /** Se deve exibir os botões Anterior e Próximo */
  readonly showPrevNextButtons = input<boolean>(true);

  /** Se deve exibir o texto informativo de total (ex: 1-20 de 100 itens) */
  readonly showTotalInfo = input<boolean>(false);
  readonly showCurrentPageReport = input(false, { transform: booleanAttribute });
  readonly currentPageReportTemplate = input<string | undefined>(undefined);
  readonly alwaysShow = input(false, { transform: booleanAttribute });
  readonly showPageLinks = input(true, { transform: booleanAttribute });
  readonly showJumpToPageDropdown = input(false, { transform: booleanAttribute });
  readonly showJumpToPageInput = input(false, { transform: booleanAttribute });
  readonly locale = input<string | undefined>(undefined);
  readonly dropdownAppendTo = input<HTMLElement | string | null | undefined>(undefined);
  readonly appendTo = input<HTMLElement | string | null | undefined>(undefined);
  readonly dropdownScrollHeight = input('200px');
  readonly templateLeft = input<unknown>(undefined);
  readonly templateRight = input<unknown>(undefined);
  readonly style = input<Record<string, string> | null>(null);
  readonly styleClass = input<string | undefined>(undefined);

  /** Se o componente está desabilitado */
  readonly disabled = input<boolean>(false);

  /** Tamanho visual do componente ('sm' | 'md' | 'lg') */
  readonly size = input<PaginatorSize>('md');

  /** Quantidade máxima de botões numéricos visíveis antes de colapsar */
  readonly maxVisiblePages = input<number>(7);
  readonly pageLinkSizeInput = input<number | undefined>(undefined, { alias: 'pageLinkSize' });

  /** Rótulo do botão Anterior */
  readonly previousLabel = input<string>('Anterior');

  /** Rótulo do botão Próximo */
  readonly nextLabel = input<string>('Próximo');

  /** Rótulo do botão Primeira Página */
  readonly firstLabel = input<string>('Primeira');

  /** Rótulo do botão Última Página */
  readonly lastLabel = input<string>('Última');

  /** Sufixo exibido no seletor de itens (ex: "20 / Página") */
  readonly itemsPerPageLabel = input<string>('Página');

  /** Atributo de acessibilidade aria-label da tag nav */
  readonly ariaLabel = input<string>('Paginação');
  readonly jumpPageInput = model('');

  // ── Outputs (Event Emitting) ──────────────────────────────
  /** Disparado sempre que a página ou o pageSize é alterado */
  readonly pageChange = output<PageChangeEvent>();
  readonly onPageChange = output<PageChangeEvent>();
  readonly effectiveTotalRecords = computed(() => this.totalRecords() ?? this.totalItems());
  readonly effectivePageSize = computed(() => Math.max(1, (this.rowsInput() ?? this.pageSize()) || 1));
  readonly effectivePageSizeOptions = computed(() => this.rowsPerPageOptions() ?? this.pageSizeOptions());
  readonly effectivePageLinkSize = computed(() => Math.max(5, this.pageLinkSizeInput() ?? this.maxVisiblePages()));
  readonly effectiveShowFirstLast = computed(() => this.showFirstLastButtons() || this.showFirstLastIcon());

  // ── Computeds (Reatividade Inteligente) ────────────────────
  /** Total de páginas calculado dinamicamente */
  readonly totalPages = computed(() => {
    const total = this.effectiveTotalRecords();
    const size = this.effectivePageSize();
    return Math.max(1, Math.ceil(total / size));
  });

  /** Índice inicial do intervalo visível (1-indexed) */
  readonly startIndex = computed(() => {
    if (this.effectiveTotalRecords() === 0) return 0;
    return (this.currentPage() - 1) * this.effectivePageSize() + 1;
  });

  /** Índice final do intervalo visível (1-indexed) */
  readonly endIndex = computed(() => {
    return Math.min(this.currentPage() * this.effectivePageSize(), this.effectiveTotalRecords());
  });

  /** Se está na primeira página */
  readonly isFirstPage = computed(() => this.currentPage() <= 1);

  /** Se está na última página */
  readonly isLastPage = computed(() => this.currentPage() >= this.totalPages());

  /** Lista inteligente de páginas e reticências a serem renderizadas */
  readonly visiblePages = computed<PageItem[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const max = this.effectivePageLinkSize();

    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: PageItem[] = [];
    const leftSibling = Math.max(current - 1, 1);
    const rightSibling = Math.min(current + 1, total);

    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < total - 2;

    if (!showLeftEllipsis && showRightEllipsis) {
      // Perto do início: 1, 2, 3, ..., total
      const count = 3;
      for (let i = 1; i <= count; i++) {
        pages.push(i);
      }
      pages.push('ellipsis');
      pages.push(total);
    } else if (showLeftEllipsis && !showRightEllipsis) {
      // Perto do fim: 1, ..., total-2, total-1, total
      pages.push(1);
      pages.push('ellipsis');
      const count = 3;
      for (let i = total - count + 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // No meio: 1, ..., current-1, current, current+1, ..., total
      pages.push(1);
      pages.push('ellipsis');
      for (let i = leftSibling; i <= rightSibling; i++) {
        pages.push(i);
      }
      pages.push('ellipsis');
      pages.push(total);
    }

    return pages;
  });
  readonly allPages = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));

  // ── Ações de Navegação ────────────────────────────────────
  /** Navega para uma página específica */
  goToPage(page: number): void {
    if (this.disabled()) return;
    const target = Math.max(1, Math.min(page, this.totalPages()));
    if (target !== this.currentPage()) {
      this.currentPage.set(target);
      this.first.set((target - 1) * this.effectivePageSize());
      this.emitPageChangeEvent();
    }
  }

  jumpToPage(): void {
    const target = Number(this.jumpPageInput());
    if (Number.isFinite(target)) this.goToPage(target);
    this.jumpPageInput.set('');
  }

  /** Navega para a página anterior */
  prevPage(): void {
    if (!this.isFirstPage() && !this.disabled()) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  /** Navega para a próxima página */
  nextPage(): void {
    if (!this.isLastPage() && !this.disabled()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  /** Navega para a primeira página */
  firstPage(): void {
    if (!this.isFirstPage() && !this.disabled()) {
      this.goToPage(1);
    }
  }

  /** Navega para a última página */
  lastPage(): void {
    if (!this.isLastPage() && !this.disabled()) {
      this.goToPage(this.totalPages());
    }
  }

  /** Manipula a mudança de itens por página via select */
  onPageSizeChange(event: Event): void {
    if (this.disabled()) return;
    const select = event.target as HTMLSelectElement;
    const newSize = Number(select.value);

    if (newSize && newSize !== this.pageSize()) {
      this.pageSize.set(newSize);
      this.first.set((this.currentPage() - 1) * newSize);

      // Ajusta a página atual caso exceda o novo total de páginas
      const newTotalPages = Math.max(1, Math.ceil(this.effectiveTotalRecords() / newSize));
      if (this.currentPage() > newTotalPages) {
        this.currentPage.set(newTotalPages);
      }

      this.emitPageChangeEvent();
    }
  }

  /** Emite o evento unificado de alteração */
  private emitPageChangeEvent(): void {
    this.pageChange.emit({
      first: this.first(),
      rows: this.effectivePageSize(),
      page: this.currentPage(),
      pageSize: this.effectivePageSize(),
      totalPages: this.totalPages(),
      startIndex: this.startIndex(),
      endIndex: this.endIndex(),
      totalItems: this.effectiveTotalRecords(),
    });
    this.onPageChange.emit({
      first: this.first(), rows: this.effectivePageSize(), page: this.currentPage(),
      pageSize: this.effectivePageSize(), totalPages: this.totalPages(), startIndex: this.startIndex(),
      endIndex: this.endIndex(), totalItems: this.effectiveTotalRecords(),
    });
  }
}
