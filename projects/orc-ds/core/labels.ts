/**
 * Default UI texts of Orchestra, grouped by family/subject.
 *
 * Every visible text, accessible name and live-region announcement that a
 * component renders by default comes from here. Texts that depend on runtime
 * data are functions, so each language can choose its own word order and
 * plural rules.
 *
 * To translate the library, provide a complete object of this type with
 * `provideOrcLabels(myLocaleLabels)`; to adjust a few texts, provide a partial
 * object (`provideOrcLabels({ common: { close: 'Sair' } })`).
 */
export interface OrcLabels {
  /** Generic texts reused across families. */
  common: {
    close: string;
    clear: string;
    cancel: string;
    confirm: string;
    save: string;
    edit: string;
    loading: string;
    noResults: string;
    noOptions: string;
    noData: string;
    empty: string;
    remove: (item: string) => string;
    moreOptions: string;
    expand: string;
    collapse: string;
    dismiss: string;
    toggleSelection: string;
    select: string;
    required: string;
    optional: string;
    actions: string;
    search: string;
    previous: string;
    next: string;
  };
  /** Filter fields inside overlays, lists and tables. */
  filter: {
    options: string;
    rows: string;
    items: string;
    table: string;
    placeholder: string;
  };
  /** Selection helpers shared by select, listbox, table and tree. */
  selection: {
    clear: string;
    selectAll: string;
    deselectAll: string;
    selectAllRows: string;
    selectRow: (row: number) => string;
    selectedCount: (count: number) => string;
    limitReached: (max: number) => string;
  };
  /** orc-select (single and multiple). */
  select: {
    placeholder: string;
    showOptions: string;
    options: string;
    loadingOptions: string;
    removeOption: (label: string) => string;
  };
  /** orc-autocomplete. */
  autocomplete: {
    label: string;
    showSuggestions: string;
    suggestions: string;
    resultsCount: (count: number) => string;
  };
  /** orc-listbox. */
  listbox: {
    label: string;
  };
  /** orc-tree-select. */
  treeSelect: {
    placeholder: string;
  };
  /** orc-tags-input. */
  tagsInput: {
    label: string;
    add: (tag: string) => string;
    remove: (tag: string) => string;
    added: (tag: string) => string;
    removed: (tag: string) => string;
    duplicate: (tag: string) => string;
  };
  /** orc-input. */
  input: {
    clear: string;
    showPassword: string;
    hidePassword: string;
  };
  /** orc-number-input. */
  numberInput: {
    label: string;
    increment: string;
    decrement: string;
    clear: string;
  };
  /** orc-otp-input. */
  otp: {
    label: string;
    digit: (index: number, total: number) => string;
  };
  /** orc-slider. */
  slider: {
    minimum: string;
    maximum: string;
  };
  /** orc-color-picker. */
  colorPicker: {
    label: string;
    choose: string;
    value: string;
    clear: string;
    presets: string;
  };
  /** orc-calendar and the calendar grid of orc-date-picker. */
  calendar: {
    label: string;
    previousMonth: string;
    nextMonth: string;
    previousYear: string;
    nextYear: string;
    previousDecade: string;
    nextDecade: string;
    chooseMonth: string;
    chooseYear: string;
    today: string;
    clear: string;
    time: string;
    week: string;
    increaseHour: string;
    decreaseHour: string;
    increaseMinute: string;
    decreaseMinute: string;
    increaseSecond: string;
    decreaseSecond: string;
    toggleMeridiem: string;
  };
  /** orc-date-picker. */
  datePicker: {
    chooseDate: string;
    calendar: string;
    outOfRange: string;
    invalidDate: string;
    rangeStart: string;
    rangeEnd: string;
  };
  /** orc-checkbox / orc-switch / orc-radio. */
  toggle: {
    on: string;
    off: string;
  };
  /** orc-form-field. */
  formField: {
    requiredMarker: string;
  };
  /** orc-modal (dialogs, including OrcDialogService.confirm()). */
  dialog: {
    label: string;
    close: string;
    maximize: string;
    restore: string;
  };
  /** Confirmation dialogs. */
  confirm: {
    heading: string;
    accept: string;
    reject: string;
  };
  /** orc-drawer. */
  drawer: {
    label: string;
    close: string;
  };
  /** orc-popover. */
  popover: {
    label: string;
    close: string;
  };
  /** orc-toast. */
  toast: {
    region: string;
    dismiss: string;
  };
  /** orc-alert. */
  alert: {
    dismiss: string;
  };
  /** orc-menu, orc-menubar, orc-context-menu. */
  menu: {
    label: string;
    moreOptions: string;
    submenu: (label: string) => string;
  };
  /** orc-command-menu. */
  commandMenu: {
    label: string;
    search: string;
    empty: string;
  };
  /** orc-navigation. */
  navigation: {
    label: string;
    open: string;
    close: string;
    expandGroup: (group: string) => string;
    collapseGroup: (group: string) => string;
    collapseSidebar: string;
    expandSidebar: string;
  };
  /** orc-breadcrumb. */
  breadcrumb: {
    label: string;
    expand: string;
    home: string;
  };
  /** orc-tabs. */
  tabs: {
    scrollPrevious: string;
    scrollNext: string;
    close: (tab: string) => string;
  };
  /** orc-stepper. */
  stepper: {
    label: string;
    step: (index: number, total: number) => string;
    completed: string;
    current: string;
  };
  /** orc-paginator. */
  pagination: {
    label: string;
    first: string;
    previous: string;
    next: string;
    last: string;
    previousShort: string;
    nextShort: string;
    pageNumber: string;
    goToPage: (page: number) => string;
    page: (page: number, total: number) => string;
    range: (start: number, end: number, total: number) => string;
    itemsPerPage: string;
    jumpToPage: string;
  };
  /** orc-table. */
  table: {
    label: string;
    empty: string;
    selection: string;
    sortAscending: string;
    sortDescending: string;
    sortedAscending: string;
    sortedDescending: string;
    expandRow: string;
    collapseRow: string;
  };
  /** orc-tree. */
  tree: {
    label: string;
    expand: (node: string) => string;
    collapse: (node: string) => string;
  };
  /** orc-timeline. */
  timeline: {
    label: string;
  };
  /** orc-collapsible / orc-accordion / orc-fieldset. */
  disclosure: {
    section: string;
    expand: string;
    collapse: string;
  };
  /** orc-card. */
  card: {
    action: string;
  };
  /** orc-scroll-area. */
  scrollArea: {
    label: string;
  };
  /** orc-splitter. */
  splitter: {
    resize: string;
    resizeBetween: (first: string, second: string) => string;
  };
  /** orc-avatar. */
  avatar: {
    user: string;
    online: string;
    busy: string;
    away: string;
    offline: string;
    more: (count: number) => string;
  };
  /** orc-badge. */
  badge: {
    status: (status: string) => string;
    remove: (label: string) => string;
  };
  /** orc-chip. */
  chip: {
    label: string;
    remove: (label: string) => string;
    toggleSelection: string;
  };
  /** orc-empty-state. */
  emptyState: {
    label: string;
  };
  /** orc-progress / orc-meter / orc-spinner / orc-skeleton. */
  progress: {
    label: string;
    loading: string;
    meter: string;
    percent: (value: number) => string;
  };
  /** orc-code. */
  code: {
    copy: string;
    copied: string;
    copyFailed: string;
    language: (language: string) => string;
  };
  /** orc-link. */
  link: {
    external: string;
  };
  /** orc-file-uploader. */
  fileUpload: {
    label: string;
    choose: string;
    dropzone: string;
    upload: string;
    cancel: string;
    remove: (file: string) => string;
    pending: string;
    uploading: string;
    uploaded: string;
    failed: string;
    retry: string;
    duplicate: string;
    invalidType: (accept: string) => string;
    tooLarge: (maxSize: string) => string;
    limit: (max: number) => string;
    sizeUnits: readonly [string, string, string, string];
  };
  /** orc-galleria (experimental; absorbs carousel). */
  galleria: {
    label: string;
    slides: string;
    previous: string;
    next: string;
    slide: (index: number, total: number) => string;
    thumbnail: (index: number) => string;
    close: string;
  };
  /** orc-image (experimental). */
  image: {
    openPreview: string;
    closePreview: string;
    zoomIn: string;
    zoomOut: string;
    rotateLeft: string;
    rotateRight: string;
  };
  /** orc-image-compare (experimental). */
  imageCompare: {
    position: string;
  };
  /** orc-inplace (experimental). */
  inplace: {
    edit: string;
    close: string;
  };
  /** orc-speed-dial (experimental). */
  speedDial: {
    open: string;
    close: string;
  };
  /** orc-knob (experimental). */
  knob: {
    label: string;
  };
  /** orc-rating (experimental). */
  rating: {
    label: string;
    star: (value: number, max: number) => string;
    clear: string;
  };
  /** orc-pick-list (experimental). */
  pickList: {
    source: string;
    target: string;
    moveToTarget: string;
    moveAllToTarget: string;
    moveToSource: string;
    moveAllToSource: string;
    empty: string;
  };
  /** orc-organization-chart (experimental). */
  organizationChart: {
    label: string;
    expand: (node: string) => string;
    collapse: (node: string) => string;
  };
  /** orc-terminal (experimental). */
  terminal: {
    label: string;
    history: string;
    command: string;
  };
  /** orc-editor (experimental). */
  editor: {
    label: string;
    toolbar: string;
    bold: string;
    italic: string;
    underline: string;
    strikethrough: string;
    bulletList: string;
    orderedList: string;
    link: string;
    clearFormatting: string;
  };
  /** orc-chart (experimental). */
  chart: {
    label: string;
    unsupported: string;
    series: (index: number) => string;
    point: (series: string, label: string, value: string) => string;
  };
}

/** Recursive partial used by `provideOrcLabels`; functions and tuples are leaves. */
export type OrcLabelsOverrides = {
  [Group in keyof OrcLabels]?: Partial<OrcLabels[Group]>;
};

/**
 * Identity helper that type-checks a complete language pack.
 *
 * ```ts
 * export const ORC_LABELS_EN_US = defineOrcLabels({ common: { close: 'Close', ... }, ... });
 * provideOrcLabels(ORC_LABELS_EN_US);
 * ```
 */
export function defineOrcLabels(labels: OrcLabels): OrcLabels {
  return labels;
}

const plural = (count: number, one: string, many: string): string =>
  count === 1 ? one : many;

/** Default Orchestra texts, in Brazilian Portuguese. */
export const ORC_LABELS_PT_BR: OrcLabels = defineOrcLabels({
  common: {
    close: 'Fechar',
    clear: 'Limpar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Salvar',
    edit: 'Editar',
    loading: 'Carregando',
    noResults: 'Nenhum resultado encontrado',
    noOptions: 'Nenhuma opção disponível',
    noData: 'Nenhum dado encontrado',
    empty: 'Sem conteúdo',
    remove: (item) => `Remover ${item}`,
    moreOptions: 'Mais opções',
    expand: 'Expandir',
    collapse: 'Recolher',
    dismiss: 'Dispensar',
    toggleSelection: 'Alternar seleção',
    select: 'Selecione',
    required: 'Obrigatório',
    optional: 'Opcional',
    actions: 'Ações',
    search: 'Buscar',
    previous: 'Anterior',
    next: 'Próximo',
  },
  filter: {
    options: 'Filtrar opções',
    rows: 'Filtrar linhas',
    items: 'Filtrar itens',
    table: 'Filtrar tabela',
    placeholder: 'Filtrar',
  },
  selection: {
    clear: 'Limpar seleção',
    selectAll: 'Selecionar tudo',
    deselectAll: 'Desmarcar tudo',
    selectAllRows: 'Selecionar todas as linhas',
    selectRow: (row) => `Selecionar linha ${row}`,
    selectedCount: (count) =>
      plural(count, '1 selecionado', `${count} selecionados`),
    limitReached: (max) =>
      plural(
        max,
        'Limite de 1 item selecionado',
        `Limite de ${max} itens selecionados`,
      ),
  },
  select: {
    placeholder: 'Selecione',
    showOptions: 'Mostrar opções',
    options: 'Opções',
    loadingOptions: 'Carregando opções',
    removeOption: (label) => `Remover ${label}`,
  },
  autocomplete: {
    label: 'Busca com sugestões',
    showSuggestions: 'Mostrar sugestões',
    suggestions: 'Sugestões',
    resultsCount: (count) =>
      count === 0
        ? 'Nenhum resultado'
        : plural(
            count,
            '1 resultado disponível',
            `${count} resultados disponíveis`,
          ),
  },
  listbox: {
    label: 'Lista de opções',
  },
  treeSelect: {
    placeholder: 'Selecione',
  },
  tagsInput: {
    label: 'Etiquetas',
    add: (tag) => `Adicionar ${tag}`,
    remove: (tag) => `Remover ${tag}`,
    added: (tag) => `Etiqueta ${tag} adicionada`,
    removed: (tag) => `Etiqueta ${tag} removida`,
    duplicate: (tag) => `A etiqueta ${tag} já existe`,
  },
  input: {
    clear: 'Limpar campo',
    showPassword: 'Mostrar senha',
    hidePassword: 'Ocultar senha',
  },
  numberInput: {
    label: 'Número',
    increment: 'Aumentar valor',
    decrement: 'Diminuir valor',
    clear: 'Limpar valor',
  },
  otp: {
    label: 'Código de verificação',
    digit: (index, total) => `Dígito ${index} de ${total}`,
  },
  slider: {
    minimum: 'Valor mínimo',
    maximum: 'Valor máximo',
  },
  colorPicker: {
    label: 'Seletor de cor',
    choose: 'Escolher cor',
    value: 'Valor da cor',
    clear: 'Limpar cor',
    presets: 'Cores predefinidas',
  },
  calendar: {
    label: 'Calendário',
    previousMonth: 'Mês anterior',
    nextMonth: 'Próximo mês',
    previousYear: 'Ano anterior',
    nextYear: 'Próximo ano',
    previousDecade: 'Década anterior',
    nextDecade: 'Próxima década',
    chooseMonth: 'Escolher mês',
    chooseYear: 'Escolher ano',
    today: 'Hoje',
    clear: 'Limpar',
    time: 'Horário',
    week: 'Semana',
    increaseHour: 'Aumentar hora',
    decreaseHour: 'Diminuir hora',
    increaseMinute: 'Aumentar minuto',
    decreaseMinute: 'Diminuir minuto',
    increaseSecond: 'Aumentar segundo',
    decreaseSecond: 'Diminuir segundo',
    toggleMeridiem: 'Alternar AM/PM',
  },
  datePicker: {
    chooseDate: 'Escolher data',
    calendar: 'Calendário',
    outOfRange: 'Data fora do intervalo permitido',
    invalidDate: 'Data inválida',
    rangeStart: 'Data inicial',
    rangeEnd: 'Data final',
  },
  toggle: {
    on: 'Ativado',
    off: 'Desativado',
  },
  formField: {
    requiredMarker: '(obrigatório)',
  },
  dialog: {
    label: 'Diálogo',
    close: 'Fechar diálogo',
    maximize: 'Maximizar diálogo',
    restore: 'Restaurar tamanho do diálogo',
  },
  confirm: {
    heading: 'Confirmação',
    accept: 'Confirmar',
    reject: 'Cancelar',
  },
  drawer: {
    label: 'Painel lateral',
    close: 'Fechar painel',
  },
  popover: {
    label: 'Informações adicionais',
    close: 'Fechar',
  },
  toast: {
    region: 'Notificações',
    dismiss: 'Fechar notificação',
  },
  alert: {
    dismiss: 'Fechar alerta',
  },
  menu: {
    label: 'Menu',
    moreOptions: 'Mais opções',
    submenu: (label) => `Submenu ${label}`,
  },
  commandMenu: {
    label: 'Paleta de comandos',
    search: 'Buscar comandos',
    empty: 'Nenhum resultado',
  },
  navigation: {
    label: 'Navegação principal',
    open: 'Abrir navegação',
    close: 'Fechar navegação',
    expandGroup: (group) => `Expandir ${group}`,
    collapseGroup: (group) => `Recolher ${group}`,
    collapseSidebar: 'Recolher menu lateral',
    expandSidebar: 'Expandir menu lateral',
  },
  breadcrumb: {
    label: 'Trilha de navegação',
    expand: 'Mostrar caminho completo',
    home: 'Início',
  },
  tabs: {
    scrollPrevious: 'Abas anteriores',
    scrollNext: 'Próximas abas',
    close: (tab) => `Fechar ${tab}`,
  },
  stepper: {
    label: 'Etapas',
    step: (index, total) => `Etapa ${index} de ${total}`,
    completed: 'Concluída',
    current: 'Etapa atual',
  },
  pagination: {
    label: 'Paginação',
    first: 'Primeira página',
    previous: 'Página anterior',
    next: 'Próxima página',
    last: 'Última página',
    previousShort: 'Anterior',
    nextShort: 'Próximo',
    pageNumber: 'Número da página',
    goToPage: (page) => `Ir para a página ${page}`,
    page: (page, total) => `Página ${page} de ${total}`,
    range: (start, end, total) =>
      total === 0 ? '0 de 0' : `${start}–${end} de ${total}`,
    itemsPerPage: 'Itens por página',
    jumpToPage: 'Ir para a página',
  },
  table: {
    label: 'Tabela de dados',
    empty: 'Nenhum dado encontrado',
    selection: 'Seleção',
    sortAscending: 'Ordenar em ordem crescente',
    sortDescending: 'Ordenar em ordem decrescente',
    sortedAscending: 'Ordenado em ordem crescente',
    sortedDescending: 'Ordenado em ordem decrescente',
    expandRow: 'Expandir linha',
    collapseRow: 'Recolher linha',
  },
  tree: {
    label: 'Árvore',
    expand: (node) => `Expandir ${node}`,
    collapse: (node) => `Recolher ${node}`,
  },
  timeline: {
    label: 'Linha do tempo',
  },
  disclosure: {
    section: 'Seção recolhível',
    expand: 'Expandir seção',
    collapse: 'Recolher seção',
  },
  card: {
    action: 'Ação do cartão',
  },
  scrollArea: {
    label: 'Conteúdo rolável',
  },
  splitter: {
    resize: 'Redimensionar painéis',
    resizeBetween: (first, second) => `Redimensionar ${first} e ${second}`,
  },
  avatar: {
    user: 'Usuário',
    online: 'Disponível',
    busy: 'Ocupado',
    away: 'Ausente',
    offline: 'Offline',
    more: (count) => plural(count, 'Mais 1 pessoa', `Mais ${count} pessoas`),
  },
  badge: {
    status: (status) => `Status: ${status}`,
    remove: (label) => `Remover ${label}`,
  },
  chip: {
    label: 'Etiqueta',
    remove: (label) => `Remover ${label}`,
    toggleSelection: 'Alternar seleção',
  },
  emptyState: {
    label: 'Nenhum conteúdo',
  },
  progress: {
    label: 'Progresso',
    loading: 'Carregando',
    meter: 'Medidor',
    percent: (value) => `${value}%`,
  },
  code: {
    copy: 'Copiar',
    copied: 'Copiado',
    copyFailed: 'Falha ao copiar',
    language: (language) => `Linguagem: ${language}`,
  },
  link: {
    external: '(abre em nova aba)',
  },
  fileUpload: {
    label: 'Envio de arquivos',
    choose: 'Escolher arquivos',
    dropzone: 'Arraste arquivos ou clique para escolher',
    upload: 'Enviar',
    cancel: 'Cancelar',
    remove: (file) => `Remover ${file}`,
    pending: 'Pendente',
    uploading: 'Enviando',
    uploaded: 'Enviado',
    failed: 'Falha no envio',
    retry: 'Tentar novamente',
    duplicate: 'Arquivo duplicado',
    invalidType: (accept) => `O tipo do arquivo deve ser ${accept}`,
    tooLarge: (maxSize) => `O arquivo excede ${maxSize}`,
    limit: (max) =>
      plural(max, 'Máximo de 1 arquivo', `Máximo de ${max} arquivos`),
    sizeUnits: ['bytes', 'KB', 'MB', 'GB'],
  },
  galleria: {
    label: 'Galeria',
    slides: 'Slides',
    previous: 'Imagem anterior',
    next: 'Próxima imagem',
    slide: (index, total) => `Imagem ${index} de ${total}`,
    thumbnail: (index) => `Miniatura ${index}`,
    close: 'Fechar galeria',
  },
  image: {
    openPreview: 'Ampliar imagem',
    closePreview: 'Fechar visualização',
    zoomIn: 'Aumentar zoom',
    zoomOut: 'Diminuir zoom',
    rotateLeft: 'Girar para a esquerda',
    rotateRight: 'Girar para a direita',
  },
  imageCompare: {
    position: 'Posição da comparação',
  },
  inplace: {
    edit: 'Editar conteúdo',
    close: 'Fechar edição',
  },
  speedDial: {
    open: 'Abrir ações',
    close: 'Fechar ações',
  },
  knob: {
    label: 'Controle giratório',
  },
  rating: {
    label: 'Avaliação',
    star: (value, max) =>
      plural(value, `1 estrela de ${max}`, `${value} estrelas de ${max}`),
    clear: 'Limpar avaliação',
  },
  pickList: {
    source: 'Disponíveis',
    target: 'Selecionados',
    moveToTarget: 'Mover selecionados para a direita',
    moveAllToTarget: 'Mover todos para a direita',
    moveToSource: 'Mover selecionados para a esquerda',
    moveAllToSource: 'Mover todos para a esquerda',
    empty: 'Nenhum item',
  },
  organizationChart: {
    label: 'Organograma',
    expand: (node) => `Expandir ${node}`,
    collapse: (node) => `Recolher ${node}`,
  },
  terminal: {
    label: 'Terminal',
    history: 'Histórico do terminal',
    command: 'Comando do terminal',
  },
  editor: {
    label: 'Editor de texto',
    toolbar: 'Formatação',
    bold: 'Negrito',
    italic: 'Itálico',
    underline: 'Sublinhado',
    strikethrough: 'Tachado',
    bulletList: 'Lista com marcadores',
    orderedList: 'Lista numerada',
    link: 'Inserir link',
    clearFormatting: 'Limpar formatação',
  },
  chart: {
    label: 'Gráfico',
    unsupported: 'Tipo de gráfico não suportado',
    series: (index) => `Série ${index}`,
    point: (series, label, value) => `${series}, ${label}, valor ${value}`,
  },
});
