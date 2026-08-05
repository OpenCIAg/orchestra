export interface PageChangeEvent {
  /** Página atual selecionada (1-indexed) */
  page: number;
  /** Quantidade de itens por página */
  pageSize: number;
  /** Total de páginas calculadas */
  totalPages: number;
  /** Índice do primeiro item visível (1-indexed) */
  startIndex: number;
  /** Índice do último item visível (1-indexed) */
  endIndex: number;
  /** Total geral de itens */
  totalItems: number;
}

export type PageItem = number | 'ellipsis';

export type PaginatorSize = 'sm' | 'md' | 'lg';

export type PaginatorVariant = 'default' | 'bordered' | 'subtle';
