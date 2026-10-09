import {
  Component,
  ChangeDetectionStrategy,
  input,
  model,
  output,
  computed,
  booleanAttribute,
  effect,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageChangeEvent, PageItem, PaginatorSize } from './paginator.types';

const JUMP_DROPDOWN_MAX_OPTIONS = 100;

const PORTUGUESE_LABELS = {
  navigation: 'Paginação',
  page: 'Página',
  jumpToPage: 'Ir para a página',
  pageNumber: 'Número da página',
  itemsPerPage: 'Itens por página',
  itemsPerPageShort: 'Página',
  firstPage: 'Primeira página',
  previousPage: 'Anterior',
  nextPage: 'Próximo',
  lastPage: 'Última página',
};

const ENGLISH_LABELS = {
  navigation: 'Pagination',
  page: 'Page',
  jumpToPage: 'Jump to page',
  pageNumber: 'Page number',
  itemsPerPage: 'Items per page',
  itemsPerPageShort: 'page',
  firstPage: 'First page',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  lastPage: 'Last page',
};

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
  /** Optional controlled 1-indexed page alias. */
  readonly pageInput = input<number | undefined>(undefined, { alias: 'page' });
  readonly page = this.pageInput;
  /** Optional controlled zero-indexed page alias. */
  readonly pageIndexInput = input<number | undefined>(undefined, {
    alias: 'pageIndex',
  });
  readonly pageIndex = this.pageIndexInput;

  /** Opções de quantidade de itens por página */
  readonly pageSizeOptions = input<number[]>([10, 20, 50]);
  readonly rowsPerPageOptions = input<number[] | undefined>(undefined, {
    alias: 'rowsPerPageOptions',
  });

  /** Se deve exibir o seletor de quantidade de itens por página */
  readonly showPageSizeSelector = input<boolean, unknown>(true, {
    transform: booleanAttribute,
  });

  /** Se deve exibir os botões de Primeira e Última página */
  readonly showFirstLastButtons = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });
  readonly showFirstLastIcon = input(false, { transform: booleanAttribute });

  /** Se deve exibir os botões Anterior e Próximo */
  readonly showPrevNextButtons = input<boolean, unknown>(true, {
    transform: booleanAttribute,
  });

  /** Se deve exibir o texto informativo de total (ex: 1-20 de 100 itens) */
  readonly showTotalInfo = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });
  readonly showCurrentPageReport = input(false, {
    transform: booleanAttribute,
  });
  readonly currentPageReportTemplate = input<string | undefined>(undefined);
  readonly alwaysShow = input(false, { transform: booleanAttribute });
  readonly showPageLinks = input(true, { transform: booleanAttribute });
  readonly showJumpToPageDropdown = input(false, {
    transform: booleanAttribute,
  });
  readonly showJumpToPageInput = input(false, { transform: booleanAttribute });
  readonly locale = input<string | undefined>('pt-BR');
  /**
   * @deprecated Accepted for PrimeNG template compatibility. Paginator uses
   * an in-flow native select, so it has no overlay to attach elsewhere.
   */
  readonly dropdownAppendTo = input<HTMLElement | string | null | undefined>(
    undefined,
  );
  /**
   * @deprecated Accepted for PrimeNG template compatibility. Paginator uses
   * in-flow native controls and does not create a movable overlay.
   */
  readonly appendTo = input<HTMLElement | string | null | undefined>(undefined);
  /**
   * @deprecated Accepted for PrimeNG template compatibility. Native select
   * popup dimensions are controlled by the browser or operating system.
   */
  readonly dropdownScrollHeight = input('200px');
  /**
   * @deprecated Accepted for PrimeNG template compatibility. The native
   * paginator has no custom template outlet on the left side.
   */
  readonly templateLeft = input<unknown>(undefined);
  /**
   * @deprecated Accepted for PrimeNG template compatibility. The native
   * paginator has no custom template outlet on the right side.
   */
  readonly templateRight = input<unknown>(undefined);
  readonly style = input<Record<string, string> | null>(null);
  readonly styleClass = input<string | undefined>(undefined);

  /** Se o componente está desabilitado */
  readonly disabled = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });

  /** Tamanho visual do componente ('sm' | 'md' | 'lg') */
  readonly size = input<PaginatorSize>('md');

  /** Quantidade máxima de botões numéricos visíveis antes de colapsar */
  readonly maxVisiblePages = input<number>(7);
  readonly pageLinkSizeInput = input<number | undefined>(undefined, {
    alias: 'pageLinkSize',
  });

  /** Rótulo do botão Anterior */
  readonly previousLabel = input<string | undefined>(undefined);

  /** Rótulo do botão Próximo */
  readonly nextLabel = input<string | undefined>(undefined);

  /** Rótulo do botão Primeira Página */
  readonly firstLabel = input<string | undefined>(undefined);

  /** Rótulo do botão Última Página */
  readonly lastLabel = input<string | undefined>(undefined);

  /** Sufixo exibido no seletor de itens (ex: "20 / Página") */
  readonly itemsPerPageLabel = input<string | undefined>(undefined);

  /** Atributo de acessibilidade aria-label da tag nav */
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly jumpAriaLabel = input<string | undefined>(undefined);
  readonly pageAriaLabel = input<string | undefined>(undefined);
  readonly pageNumberAriaLabel = input<string | undefined>(undefined);
  readonly pageSizeAriaLabel = input<string | undefined>(undefined);
  readonly jumpPageInput = model('');
  readonly defaultLabels = computed(() =>
    this.locale()?.toLowerCase().startsWith('en')
      ? ENGLISH_LABELS
      : PORTUGUESE_LABELS,
  );
  private readonly pageSizeOverride = signal<number | undefined>(undefined);
  private readonly localPageSizeWrite = signal<number | undefined>(undefined);
  private previousRowsInput: number | undefined;
  private previousPageInput: number | undefined;
  private previousPageIndexInput: number | undefined;
  private previousPageSizeInput = 10;
  private previousFirst = 0;
  private previousPage = 1;
  private previousPageSize = 10;

  // ── Outputs (Event Emitting) ──────────────────────────────
  /** Disparado sempre que a página ou o pageSize é alterado */
  readonly pageChange = output<PageChangeEvent>();
  readonly onPageChange = output<PageChangeEvent>();
  readonly effectiveTotalRecords = computed(() =>
    this.normalizeTotal(this.totalRecords() ?? this.totalItems()),
  );
  readonly effectivePageSize = computed(() =>
    this.normalizePageSize(this.pageSizeOverride() ?? this.pageSize()),
  );
  readonly effectivePageSizeOptions = computed(() => {
    const options = this.rowsPerPageOptions() ?? this.pageSizeOptions();
    const values = (Array.isArray(options) ? options : [])
      .map((value) => this.normalizePageSize(value))
      .filter((value, index, all) => all.indexOf(value) === index);
    if (values.length === 0) return values;
    const current = this.effectivePageSize();
    return values.includes(current) ? values : [current, ...values];
  });
  readonly effectivePageLinkSize = computed(() =>
    this.normalizePageSize(this.pageLinkSizeInput() ?? this.maxVisiblePages()),
  );
  readonly effectiveShowFirstLast = computed(
    () => this.showFirstLastButtons() || this.showFirstLastIcon(),
  );

  constructor() {
    effect(() => {
      const rowsInput = this.rowsInput();
      const pageInput = this.pageInput();
      const pageIndexInput = this.pageIndexInput();
      const first = this.normalizeFirst(this.first());
      const page = this.normalizePage(this.currentPage());
      const rawPageSize = this.normalizePageSize(this.pageSize());
      const rows = this.effectivePageSize();
      const totalPages = this.totalPages();
      const rowsChanged = rowsInput !== this.previousRowsInput;
      const pageAliasChanged = pageInput !== this.previousPageInput;
      const pageIndexAliasChanged =
        pageIndexInput !== this.previousPageIndexInput;
      const pageSizeInputChanged = rawPageSize !== this.previousPageSizeInput;
      const firstChanged = first !== this.previousFirst;
      const pageChanged = page !== this.previousPage;
      const sizeChanged = rows !== this.previousPageSize;

      // A controlled rows input supersedes a value selected inside the component.
      if (rowsChanged) {
        this.previousRowsInput = rowsInput;
        if (this.pageSizeOverride() !== undefined)
          this.pageSizeOverride.set(undefined);
        if (
          !pageSizeInputChanged &&
          rowsInput !== undefined &&
          this.normalizePageSize(this.pageSize()) !==
            this.normalizePageSize(rowsInput)
        ) {
          this.pageSize.set(this.normalizePageSize(rowsInput));
        }
      }

      if (pageSizeInputChanged) {
        if (this.localPageSizeWrite() === rawPageSize) {
          this.localPageSizeWrite.set(undefined);
        } else if (this.pageSizeOverride() !== undefined) {
          // A parent pageSize update is authoritative over a previous local
          // selector choice, just like a parent rows update.
          this.pageSizeOverride.set(undefined);
        }
        this.previousPageSizeInput = rawPageSize;
      }

      this.previousPageInput = pageInput;
      this.previousPageIndexInput = pageIndexInput;

      // first and currentPage are both public controlled models. Reconcile the
      // model that changed instead of always deriving page from first.
      let targetPage = page;
      if (
        (pageIndexAliasChanged && pageIndexInput !== undefined) ||
        (pageAliasChanged && pageInput !== undefined)
      ) {
        targetPage =
          pageIndexAliasChanged && pageIndexInput !== undefined
            ? this.normalizePage(Number(pageIndexInput) + 1)
            : this.normalizePage(pageInput);
      } else if (firstChanged && !pageChanged) {
        targetPage = Math.floor(first / rows) + 1;
      } else if (pageChanged && !firstChanged) {
        targetPage = page;
      } else if (firstChanged && pageChanged) {
        // When both are supplied in one update, the explicit page model wins.
        targetPage = page;
      } else if (sizeChanged) {
        targetPage = page;
      }

      targetPage = Math.max(1, Math.min(targetPage, totalPages));
      const targetFirst = (targetPage - 1) * rows;
      if (this.currentPage() !== targetPage) this.currentPage.set(targetPage);
      if (this.first() !== targetFirst) this.first.set(targetFirst);

      this.previousFirst = targetFirst;
      this.previousPage = targetPage;
      this.previousPageSize = rows;
    });
  }

  private normalizePageSize(value: number | undefined): number {
    const normalized = Number(value);
    return Number.isFinite(normalized) && normalized > 0
      ? Math.max(1, Math.floor(normalized))
      : 1;
  }

  private normalizeTotal(value: number | undefined): number {
    const normalized = Number(value);
    return Number.isFinite(normalized) && normalized > 0
      ? Math.floor(normalized)
      : 0;
  }

  private normalizeFirst(value: number | undefined): number {
    const normalized = Number(value);
    return Number.isFinite(normalized)
      ? Math.max(0, Math.floor(normalized))
      : 0;
  }

  private normalizePage(value: number | undefined): number {
    const normalized = Number(value);
    return Number.isFinite(normalized)
      ? Math.max(1, Math.floor(normalized))
      : 1;
  }

  private formatNumber(value: number): string {
    try {
      return new Intl.NumberFormat(this.locale() || 'pt-BR').format(value);
    } catch {
      return new Intl.NumberFormat('pt-BR').format(value);
    }
  }

  resolveLabel(label: string | undefined, fallback: string): string {
    return label?.trim() || fallback;
  }

  // ── Computeds (Reatividade Inteligente) ────────────────────
  /** Total de páginas calculado dinamicamente */
  readonly totalPages = computed(() => {
    const total = this.effectiveTotalRecords();
    const size = this.effectivePageSize();
    return Math.max(1, Math.ceil(total / size));
  });
  readonly effectiveCurrentPage = computed(() =>
    Math.max(
      1,
      Math.min(this.normalizePage(this.currentPage()), this.totalPages()),
    ),
  );
  readonly shouldRender = computed(
    () => this.alwaysShow() || this.totalPages() > 1,
  );
  readonly jumpUsesInput = computed(
    () => this.totalPages() > JUMP_DROPDOWN_MAX_OPTIONS,
  );
  readonly jumpPageOptions = computed(() => {
    const total = this.totalPages();
    if (total <= JUMP_DROPDOWN_MAX_OPTIONS) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }
    const current = this.effectiveCurrentPage();
    const pages = new Set<number>([1, total, current]);
    for (let page = current - 2; page <= current + 2; page++) {
      if (page > 1 && page < total) pages.add(page);
    }
    return [...pages].sort((left, right) => left - right);
  });

  /** Índice inicial do intervalo visível (1-indexed) */
  readonly startIndex = computed(() => {
    if (this.effectiveTotalRecords() === 0) return 0;
    return (this.effectiveCurrentPage() - 1) * this.effectivePageSize() + 1;
  });

  /** Índice final do intervalo visível (1-indexed) */
  readonly endIndex = computed(() => {
    return Math.min(
      this.effectiveCurrentPage() * this.effectivePageSize(),
      this.effectiveTotalRecords(),
    );
  });
  readonly pageReport = computed(() => {
    const template = this.currentPageReportTemplate();
    const first = this.formatNumber(this.startIndex());
    const last = this.formatNumber(this.endIndex());
    const total = this.formatNumber(this.effectiveTotalRecords());
    if (template === undefined) {
      const separator = this.locale()?.toLowerCase().startsWith('en')
        ? 'of'
        : 'de';
      return `${first}-${last} ${separator} ${total}`;
    }
    return template
      .replaceAll('{first}', first)
      .replaceAll('{last}', last)
      .replaceAll('{totalRecords}', total)
      .replaceAll(
        '{currentPage}',
        this.formatNumber(this.effectiveCurrentPage()),
      )
      .replaceAll('{totalPages}', this.formatNumber(this.totalPages()));
  });

  /** Se está na primeira página */
  readonly isFirstPage = computed(() => this.effectiveCurrentPage() <= 1);

  /** Se está na última página */
  readonly isLastPage = computed(
    () => this.effectiveCurrentPage() >= this.totalPages(),
  );

  /** Lista inteligente de páginas e reticências a serem renderizadas */
  readonly visiblePages = computed<PageItem[]>(() => {
    const total = this.totalPages();
    const current = this.effectiveCurrentPage();
    const max = this.effectivePageLinkSize();

    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: PageItem[] = [];
    if (max === 1) return [current];
    if (max === 2) {
      if (current <= 1 || current >= total) return [1, total];
      return current <= Math.ceil(total / 2) ? [1, current] : [current, total];
    }

    // Reserve two numeric links for the first and last pages. The bounded
    // middle window always contains the active page and never duplicates them.
    const middleCount = max - 2;
    const lastMiddleStart = total - middleCount;
    const middleStart = Math.max(
      2,
      Math.min(current - Math.floor((middleCount - 1) / 2), lastMiddleStart),
    );
    const middleEnd = Math.min(total - 1, middleStart + middleCount - 1);
    pages.push(1);
    if (middleStart > 2) pages.push('ellipsis');
    for (let page = middleStart; page <= middleEnd; page++) pages.push(page);
    if (middleEnd < total - 1) pages.push('ellipsis');
    pages.push(total);

    return pages;
  });
  readonly allPages = this.jumpPageOptions;

  // ── Ações de Navegação ────────────────────────────────────
  /** Navega para uma página específica */
  goToPage(page: number): void {
    if (this.disabled()) return;
    const requested = Number(page);
    if (!Number.isFinite(requested)) return;
    const target = Math.max(
      1,
      Math.min(Math.floor(requested), this.totalPages()),
    );
    if (target !== this.effectiveCurrentPage()) {
      this.currentPage.set(target);
      this.first.set((target - 1) * this.effectivePageSize());
      this.emitPageChangeEvent();
    }
  }

  jumpToPage(): void {
    const raw = this.jumpPageInput().trim();
    const target = Number(raw);
    if (raw && Number.isFinite(target)) this.goToPage(target);
    this.jumpPageInput.set('');
  }

  onJumpInputKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;
    if (event.cancelable) event.preventDefault();
    this.jumpToPage();
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
    const newSize = this.normalizePageSize(Number(select.value));

    if (newSize !== this.effectivePageSize()) {
      this.localPageSizeWrite.set(newSize);
      this.pageSize.set(newSize);
      this.pageSizeOverride.set(newSize);

      // Ajusta a página atual caso exceda o novo total de páginas
      const newTotalPages = Math.max(
        1,
        Math.ceil(this.effectiveTotalRecords() / newSize),
      );
      const targetPage = Math.max(
        1,
        Math.min(this.normalizePage(this.currentPage()), newTotalPages),
      );
      this.currentPage.set(targetPage);
      this.first.set((targetPage - 1) * newSize);

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
      first: this.first(),
      rows: this.effectivePageSize(),
      page: this.currentPage(),
      pageSize: this.effectivePageSize(),
      totalPages: this.totalPages(),
      startIndex: this.startIndex(),
      endIndex: this.endIndex(),
      totalItems: this.effectiveTotalRecords(),
    });
  }
}
