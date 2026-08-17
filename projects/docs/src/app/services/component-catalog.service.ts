import { Injectable, signal, computed } from '@angular/core';
import { ComponentEntry } from '../models/component-entry.model';

const P2_CATALOG: ComponentEntry[] = [
  { id: 'button-group', name: 'Button Group', description: 'Agrupa ações relacionadas em uma composição acessível.', category: 'Utility', status: 'beta', tags: ['button', 'group', 'actions'], icon: '▦', route: '/components/button-group' },
  { id: 'calendar', name: 'Calendar', description: 'Calendário controlado para seleção e navegação por datas.', category: 'Data Display', status: 'beta', tags: ['calendar', 'date', 'month'], icon: '📅', route: '/components/calendar' },
  { id: 'code', name: 'Code', description: 'Bloco de código com linguagem, cópia e leitura preservada.', category: 'Data Display', status: 'beta', tags: ['code', 'snippet', 'copy'], icon: '</>', route: '/components/code' },
  { id: 'combobox', name: 'Combobox', description: 'Entrada pesquisável com seleção, teclado e estados vazios.', category: 'Inputs', status: 'beta', tags: ['combobox', 'search', 'select'], icon: '⌕', route: '/components/combobox' },
  { id: 'dropdown', name: 'Dropdown', description: 'Menu de ações posicionado junto ao gatilho.', category: 'Utility', status: 'beta', tags: ['dropdown', 'menu', 'actions'], icon: '⌄', route: '/components/dropdown' },
  { id: 'file-upload', name: 'File Upload', description: 'Alias canônico para upload com seleção e drag-and-drop.', category: 'Inputs', status: 'beta', tags: ['file', 'upload', 'drop'], icon: '↑', route: '/components/file-upload' },
  { id: 'grid', name: 'Grid', description: 'Layout responsivo em colunas com largura mínima configurável.', category: 'Layout', status: 'beta', tags: ['grid', 'layout', 'responsive'], icon: '▦', route: '/components/grid' },
  { id: 'kbd', name: 'Kbd', description: 'Representação visual de teclas e atalhos.', category: 'Typography', status: 'beta', tags: ['keyboard', 'shortcut', 'kbd'], icon: '⌘', route: '/components/kbd' },
  { id: 'link', name: 'Link', description: 'Link semântico com estados de foco, desabilitado e externo.', category: 'Typography', status: 'beta', tags: ['link', 'anchor', 'navigation'], icon: '↗', route: '/components/link' },
  { id: 'menubar', name: 'Menubar', description: 'Barra de menus com navegação por setas e atalhos.', category: 'Navigation', status: 'beta', tags: ['menu', 'navigation', 'keyboard'], icon: '☰', route: '/components/menubar' },
  { id: 'splitter', name: 'Splitter', description: 'Estrutura de painéis redimensionáveis em orientação horizontal ou vertical.', category: 'Layout', status: 'beta', tags: ['splitter', 'resize', 'panels'], icon: '║', route: '/components/splitter' },
  { id: 'tag', name: 'Tag', description: 'Rótulo semântico removível para entidades e filtros.', category: 'Data Display', status: 'beta', tags: ['tag', 'label', 'status'], icon: '🏷️', route: '/components/tag' },
  { id: 'typography', name: 'Typography', description: 'Primitiva tipográfica com escala, peso e truncamento.', category: 'Typography', status: 'beta', tags: ['type', 'text', 'font'], icon: 'T', route: '/components/typography' },
  { id: 'aspect-ratio', name: 'Aspect Ratio', description: 'Mantém uma proporção previsível para conteúdo responsivo.', category: 'Layout', status: 'beta', tags: ['ratio', 'media', 'layout'], icon: '▣', route: '/components/aspect-ratio' },
  { id: 'container', name: 'Container', description: 'Container centralizado com largura máxima e padding.', category: 'Layout', status: 'beta', tags: ['container', 'layout', 'width'], icon: '□', route: '/components/container' },
  { id: 'floating-action-button', name: 'Floating Action Button', description: 'Ação primária flutuante com estado estendido e loading.', category: 'Utility', status: 'beta', tags: ['fab', 'action', 'floating'], icon: '+', route: '/components/floating-action-button' },
  { id: 'hover-card', name: 'Hover Card', description: 'Conteúdo contextual aberto por hover ou foco.', category: 'Data Display', status: 'beta', tags: ['hover', 'card', 'preview'], icon: '▱', route: '/components/hover-card' },
  { id: 'portal', name: 'Portal', description: 'Ponto de composição para conteúdo que pode ser movido pelo consumidor.', category: 'Utility', status: 'beta', tags: ['portal', 'composition', 'overlay'], icon: '◌', route: '/components/portal' },
  { id: 'segmented-control', name: 'Segmented Control', description: 'Seleção compacta entre opções mutuamente exclusivas.', category: 'Utility', status: 'beta', tags: ['segmented', 'select', 'toggle'], icon: '▤', route: '/components/segmented-control' },
  { id: 'separator', name: 'Separator', description: 'Separador visual e semântico para seções de conteúdo.', category: 'Layout', status: 'beta', tags: ['separator', 'divider', 'layout'], icon: '—', route: '/components/separator' },
  { id: 'stack', name: 'Stack', description: 'Layout flexível para empilhar elementos com alinhamento previsível.', category: 'Layout', status: 'beta', tags: ['stack', 'flex', 'layout'], icon: '▤', route: '/components/stack' },
  { id: 'visually-hidden', name: 'Visually Hidden', description: 'Conteúdo disponível para tecnologias assistivas sem ocupar espaço visual.', category: 'Utility', status: 'beta', tags: ['a11y', 'screen reader', 'hidden'], icon: '◉', route: '/components/visually-hidden' },
  { id: 'box', name: 'Box', description: 'Primitiva de superfície para padding, margem, fundo e raio.', category: 'Layout', status: 'beta', tags: ['box', 'surface', 'layout'], icon: '□', route: '/components/box' },
  { id: 'close-button', name: 'Close Button', description: 'Ação compacta e nomeada para fechar overlays e mensagens.', category: 'Utility', status: 'beta', tags: ['close', 'dismiss', 'button'], icon: '×', route: '/components/close-button' },
  { id: 'context-menu', name: 'Context Menu', description: 'Menu acionado pelo botão direito com posição contextual.', category: 'Navigation', status: 'beta', tags: ['context', 'menu', 'right click'], icon: '☷', route: '/components/context-menu' },
  { id: 'data-table', name: 'Data Table', description: 'Tabela acessível com ordenação, seleção, loading e estado vazio.', category: 'Data Display', status: 'beta', tags: ['table', 'data', 'sort', 'select'], icon: '▤', route: '/components/data-table' },
  { id: 'date-input', name: 'Date Input', description: 'Campo de data nativo com limites e integração a formulários.', category: 'Inputs', status: 'beta', tags: ['date', 'input', 'form'], icon: '📅', route: '/components/date-input' },
  { id: 'empty-state', name: 'Empty State', description: 'Mensagem de ausência de dados com ação opcional.', category: 'Feedback', status: 'beta', tags: ['empty', 'feedback', 'action'], icon: '∅', route: '/components/empty-state' },
  { id: 'flex', name: 'Flex', description: 'Primitiva flexível para direção, alinhamento, gap e wrapping.', category: 'Layout', status: 'beta', tags: ['flex', 'layout', 'alignment'], icon: '↔', route: '/components/flex' },
  { id: 'input-group', name: 'Input Group', description: 'Composição de controle com prefixo e sufixo semântico.', category: 'Inputs', status: 'beta', tags: ['input', 'group', 'prefix'], icon: '[]', route: '/components/input-group' },
  { id: 'listbox', name: 'Listbox', description: 'Lista selecionável com modo simples ou múltiplo e teclado.', category: 'Data Display', status: 'beta', tags: ['listbox', 'select', 'keyboard'], icon: '☷', route: '/components/listbox' },
  { id: 'multi-select', name: 'Multi Select', description: 'Seleção múltipla com lista de opções e valores controlados.', category: 'Inputs', status: 'beta', tags: ['multi', 'select', 'form'], icon: '☑', route: '/components/multi-select' },
  { id: 'space', name: 'Space', description: 'Utilitário de espaçamento em linha ou coluna.', category: 'Layout', status: 'beta', tags: ['space', 'gap', 'layout'], icon: '↕', route: '/components/space' },
  { id: 'speed-dial', name: 'Speed Dial', description: 'Ações secundárias agrupadas a partir de um gatilho flutuante.', category: 'Utility', status: 'beta', tags: ['speed dial', 'actions', 'fab'], icon: '⋮', route: '/components/speed-dial' },
  { id: 'tags-input', name: 'Tags Input', description: 'Campo de tags com sugestões, remoção e integração a formulários.', category: 'Inputs', status: 'beta', tags: ['tags', 'input', 'chips'], icon: '🏷️', route: '/components/tags-input' },
  { id: 'text', name: 'Text', description: 'Primitiva textual com escala, tom muted e truncamento.', category: 'Typography', status: 'beta', tags: ['text', 'typography', 'copy'], icon: 'T', route: '/components/text' },
  { id: 'tree-select', name: 'Tree Select', description: 'Seleção em uma hierarquia expansível.', category: 'Inputs', status: 'beta', tags: ['tree', 'select', 'hierarchy'], icon: '🌳', route: '/components/tree-select' },
  { id: 'virtual-scroller', name: 'Virtual Scroller', description: 'Viewport eficiente para listas grandes com overscan e range.', category: 'Utility', status: 'beta', tags: ['virtual', 'scroll', 'performance'], icon: '↕', route: '/components/virtual-scroller' },
];

const CATALOG: ComponentEntry[] = [
  ...P2_CATALOG,
  { id:'date-picker', name:'Date Picker', description:'Seleção nativa de datas com validação e formulários.', category:'Inputs', status:'stable', tags:['date','calendar','data'], icon:'📅', route:'/components/date-picker' },
  { id:'form-field', name:'Form Field', description:'Composição de rótulo, controle, ajuda e erro.', category:'Inputs', status:'stable', tags:['field','label','validation'], icon:'🧾', route:'/components/form-field' },
  { id:'menu', name:'Menu', description:'Alias canônico do Dropdown com itens acessíveis.', category:'Navigation', status:'stable', tags:['menu','dropdown','actions'], icon:'☰', route:'/components/menu' },
  { id:'drawer', name:'Drawer', description:'Painel lateral ou vertical com backdrop e dismiss.', category:'Overlay', status:'stable', tags:['drawer','sheet','sidenav'], icon:'◧', route:'/components/drawer' },
  { id:'popover', name:'Popover', description:'Conteúdo contextual posicionado junto ao gatilho.', category:'Overlay', status:'stable', tags:['popover','overlay','context'], icon:'💭', route:'/components/popover' },
  { id:'list', name:'List', description:'Lista acessível com estados de seleção e vazio.', category:'Data Display', status:'stable', tags:['list','selection','empty'], icon:'☷', route:'/components/list' },
  { id:'tree-view', name:'Tree View', description:'Hierarquia expansível com navegação por teclado.', category:'Data Display', status:'stable', tags:['tree','hierarchy','expand'], icon:'🌳', route:'/components/tree-view' },
  { id:'autocomplete', name:'Autocomplete', description:'Seleção assistida com filtragem, teclado e estados de lista.', category:'Inputs', status:'beta', tags:['autocomplete','combobox','search','input'], icon:'⌕', route:'/components/autocomplete' },
  { id:'number-input', name:'Number Input', description:'Entrada numérica com incremento, limites e precisão.', category:'Inputs', status:'beta', tags:['number','stepper','input','quantity'], icon:'🔢', route:'/components/number-input' },
  { id:'color-picker', name:'Color Picker', description:'Seleção de cores com campo nativo, presets e valor hexadecimal.', category:'Inputs', status:'beta', tags:['color','picker','palette','hex'], icon:'🎨', route:'/components/color-picker' },
  { id:'chip', name:'Chip', description:'Rótulo compacto selecionável ou removível para filtros e entidades.', category:'Data Display', status:'beta', tags:['chip','tag','filter','pill'], icon:'🏷️', route:'/components/chip' },
  { id:'collapsible', name:'Collapsible', description:'Conteúdo progressivo com região nomeada e estado controlado.', category:'Layout', status:'beta', tags:['collapse','expand','disclosure'], icon:'▾', route:'/components/collapsible' },
  { id:'carousel', name:'Carousel', description:'Slides navegáveis com indicadores, loop e suporte a teclado.', category:'Data Display', status:'beta', tags:['carousel','slider','slides','content'], icon:'▤', route:'/components/carousel' },
  { id:'divider', name:'Divider', description:'Separador horizontal ou vertical com rótulo opcional.', category:'Layout', status:'beta', tags:['divider','separator','layout'], icon:'—', route:'/components/divider' },
  { id:'image', name:'Image', description:'Imagem com fit, fallback, placeholder e estados de carregamento.', category:'Data Display', status:'beta', tags:['image','media','fallback','visual'], icon:'🖼️', route:'/components/image' },
  { id:'timeline', name:'Timeline', description:'Eventos sequenciais com estados, datas e orientação adaptável.', category:'Navigation', status:'beta', tags:['timeline','events','steps','history'], icon:'◉', route:'/components/timeline' },
  { id:'toolbar', name:'Toolbar', description:'Ações agrupadas com navegação roving por teclado.', category:'Navigation', status:'beta', tags:['toolbar','actions','keyboard','roving'], icon:'🛠️', route:'/components/toolbar' },
  { id:'icon', name:'Icon', description:'Ícones SVG acessíveis com nomes e tamanhos consistentes.', category:'Utility', status:'beta', tags:['icon','svg','symbol','accessibility'], icon:'✦', route:'/components/icon' },
  { id:'scroll-area', name:'Scroll Area', description:'Viewport com overflow controlado, sombras e scrollbar tematizado.', category:'Utility', status:'beta', tags:['scroll','viewport','overflow'], icon:'↕', route:'/components/scroll-area' },
  { id:'form', name:'Form', description:'Wrapper de formulário com validação, submit e reset tipados.', category:'Inputs', status:'beta', tags:['form','submit','validation'], icon:'🧾', route:'/components/form' },
  // ── Inputs ────────────────────────────────────────────────
  {
    id: 'button',
    name: 'Button',
    description: 'Elemento de ação principal. Suporta variantes, tamanhos, ícones e estados de loading.',
    category: 'Inputs',
    status: 'stable',
    tags: ['action', 'cta', 'interactive', 'click', 'botão'],
    icon: '⚡',
    route: '/components/button',
  },
  {
    id: 'input',
    name: 'Input',
    description: 'Campo de texto para captura de dados do usuário com suporte a máscaras e validação.',
    category: 'Inputs',
    status: 'stable',
    tags: ['text', 'form', 'campo', 'formulário', 'entry'],
    icon: '✏️',
    route: '/components/input',
  },
  {
    id: 'chip-input',
    name: 'Chip Input',
    description: 'Campo de entrada com tags (chips) integradas e autocompletar.',
    category: 'Inputs',
    status: 'beta',
    tags: ['tag', 'chip', 'input', 'autocomplete', 'tags'],
    icon: '🏷️',
    route: '/components/chip-input',
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    description: 'Seleção múltipla de opções independentes com estado indeterminado.',
    category: 'Inputs',
    status: 'stable',
    tags: ['select', 'form', 'boolean', 'toggle', 'check'],
    icon: '☑️',
    route: '/components/checkbox',
  },
  {
    id: 'radio',
    name: 'Radio',
    description: 'Seleção exclusiva entre opções de um grupo.',
    category: 'Inputs',
    status: 'stable',
    tags: ['select', 'form', 'group', 'radio', 'escolha'],
    icon: '🔘',
    route: '/components/radio',
  },
  {
    id: 'select',
    name: 'Select',
    description: 'Dropdown para seleção de uma ou múltiplas opções de uma lista.',
    category: 'Inputs',
    status: 'stable',
    tags: ['dropdown', 'form', 'lista', 'pick', 'escolha'],
    icon: '🔽',
    route: '/components/select',
  },
  {
    id: 'switch',
    name: 'Switch / Toggle',
    description: 'Alternância de estado binário (on/off) com animação fluida.',
    category: 'Inputs',
    status: 'stable',
    tags: ['toggle', 'on/off', 'boolean', 'switch', 'habilitar'],
    icon: '🔄',
    route: '/components/switch',
  },
  {
    id: 'slider',
    name: 'Slider',
    description: 'Seleção de valores numéricos e intervalos com arrastar e navegação por teclado.',
    category: 'Inputs',
    status: 'stable',
    tags: ['range', 'numeric', 'slide', 'valor', 'intervalo', 'dual'],
    icon: '🎚️',
    route: '/components/slider',
  },
  {
    id: 'otp-input',
    name: 'OTP Input',
    description: 'Entrada de código de uso único (One-Time Password) acessível e reativo.',
    category: 'Inputs',
    status: 'stable',
    tags: ['otp', 'password', 'code', 'form', 'segurança', 'verificação'],
    icon: '🔢',
    route: '/components/otp-input',
  },
  {
    id: 'file-uploader',
    name: 'File Uploader',
    description: 'Componente de envio de arquivos com suporte a arrastar e soltar (drag and drop).',
    category: 'Inputs',
    status: 'stable',
    tags: ['file', 'upload', 'drag', 'drop', 'arquivo', 'envio'],
    icon: '📁',
    route: '/components/file-uploader',
  },
  {
    id: 'rating',
    name: 'Rating',
    description: 'Avaliação por estrelas e notas com suporte a meias-estrelas, ícones customizados e escala numérica.',
    category: 'Inputs',
    status: 'stable',
    tags: ['rating', 'star', 'estrela', 'avaliação', 'nota', 'score'],
    icon: '⭐',
    route: '/components/rating',
  },
  // ── Navigation ────────────────────────────────────────────
  {
    id: 'tabs',
    name: 'Tabs',
    description: 'Organização de conteúdo em abas com animação de indicador.',
    category: 'Navigation',
    status: 'stable',
    tags: ['navigation', 'tabs', 'abas', 'sections', 'panel'],
    icon: '📑',
    route: '/components/tabs',
  },
  {
    id: 'breadcrumb',
    name: 'Breadcrumb',
    description: 'Trilha de navegação hierárquica para orientação do usuário.',
    category: 'Navigation',
    status: 'stable',
    tags: ['path', 'navigation', 'hierarchy', 'trilha', 'migalha'],
    icon: '🗺️',
    route: '/components/breadcrumb',
  },
  {
    id: 'paginator',
    name: 'Paginator',
    description: 'Controle de navegação entre páginas de conteúdo com seletor de quantidade de itens.',
    category: 'Navigation',
    status: 'stable',
    tags: ['pages', 'navigation', 'list', 'paginação', 'página', 'paginator'],
    icon: '📄',
    route: '/components/paginator',
  },
  // ── Feedback ──────────────────────────────────────────────
  {
    id: 'badge',
    name: 'Badge',
    description: 'Rótulo visual compacto para status, contadores e categorias.',
    category: 'Feedback',
    status: 'stable',
    tags: ['label', 'tag', 'status', 'counter', 'badge', 'etiqueta'],
    icon: '🏷️',
    route: '/components/badge',
  },
  {
    id: 'alert',
    name: 'Alert',
    description: 'Mensagem inline de feedback com variantes de severidade.',
    category: 'Feedback',
    status: 'stable',
    tags: ['message', 'warning', 'info', 'error', 'alerta', 'mensagem'],
    icon: '⚠️',
    route: '/components/alert',
  },
  {
    id: 'toast',
    name: 'Toast / Snackbar',
    description: 'Notificação temporária flutuante com posicionamento configurável.',
    category: 'Feedback',
    status: 'stable',
    tags: ['notification', 'snack', 'toast', 'popup', 'notificação'],
    icon: '🔔',
    route: '/components/toast',
  },
  {
    id: 'spinner',
    name: 'Spinner / Loader',
    description: 'Indicador de carregamento animado para estados assíncronos.',
    category: 'Feedback',
    status: 'stable',
    tags: ['loading', 'spinner', 'async', 'wait', 'carregando'],
    icon: '⏳',
    route: '/components/spinner',
  },
  {
    id: 'progress',
    name: 'Progress',
    description: 'Barras e círculos de progresso com modos determinado, indeterminado e segmentado.',
    category: 'Feedback',
    status: 'stable',
    tags: ['progress', 'bar', 'circle', 'loading', 'stepper', 'progresso', 'upload'],
    icon: '📊',
    route: '/components/progress',
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    description: 'Placeholders animados para indicar conteúdo em carregamento.',
    category: 'Feedback',
    status: 'stable',
    tags: ['skeleton', 'placeholder', 'loading', 'shimmer', 'pulse', 'carregamento'],
    icon: '🦴',
    route: '/components/skeleton',
  },
  // {
  //   id: 'progress',
  //   name: 'Progress Bar',
  //   description: 'Barra de progresso linear e circular para tarefas longas.',
  //   category: 'Feedback',
  //   status: 'stable',
  //   tags: ['progress', 'loading', 'barra', 'progresso', 'percent'],
  //   icon: '📊',
  //   route: '/components/progress',
  // },
  // ── Data Display ──────────────────────────────────────────
  {
    id: 'table',
    name: 'Table',
    description: 'Tabela de dados com ordenação, seleção e paginação integrada.',
    category: 'Data Display',
    status: 'stable',
    tags: ['grid', 'data', 'tabela', 'rows', 'columns', 'sort'],
    icon: '📋',
    route: '/components/table',
  },
  {
    id: 'card',
    name: 'Card',
    description: 'Container de conteúdo com cabeçalho, corpo, rodapé e ações.',
    category: 'Data Display',
    status: 'stable',
    tags: ['container', 'card', 'panel', 'box', 'cartão'],
    icon: '🃏',
    route: '/components/card',
  },
  {
    id: 'avatar',
    name: 'Avatar',
    description: 'Representação visual de usuário com imagem, iniciais ou ícone.',
    category: 'Data Display',
    status: 'stable',
    tags: ['user', 'profile', 'image', 'avatar', 'foto', 'perfil'],
    icon: '👤',
    route: '/components/avatar',
  },

  {
    id: 'tooltip',
    name: 'Tooltip',
    description: 'Dica contextual flutuante ativada por hover ou foco.',
    category: 'Overlay',
    status: 'stable',
    tags: ['hint', 'tip', 'popup', 'hover', 'dica', 'ajuda'],
    icon: '💬',
    route: '/components/tooltip',
  },
  // ── Overlay ───────────────────────────────────────────────
  {
    id: 'modal',
    name: 'Modal / Dialog',
    description: 'Janela de diálogo com backdrop, foco aprisionado e acessibilidade ARIA.',
    category: 'Overlay',
    status: 'stable',
    tags: ['dialog', 'popup', 'modal', 'overlay', 'janela', 'diálogo'],
    icon: '🪟',
    route: '/components/modal',
  },
  // ── Layout ────────────────────────────────────────────────
  {
    id: 'accordion',
    name: 'Accordion',
    description: 'Seções expansíveis/colapsáveis para organização hierárquica.',
    category: 'Layout',
    status: 'stable',
    tags: ['collapse', 'expand', 'accordion', 'faq', 'seção'],
    icon: '🪗',
    route: '/components/accordion',
  },
];

@Injectable({ providedIn: 'root' })
export class ComponentCatalogService {
  private readonly _query = signal('');
  private readonly _selectedCategory = signal<string>('All');

  readonly query = this._query.asReadonly();
  readonly selectedCategory = this._selectedCategory.asReadonly();

  readonly allCategories = computed(() => {
    const cats = ['All', ...new Set(CATALOG.map(c => c.category))];
    return cats;
  });

  readonly filteredComponents = computed(() => {
    const q = this._query().toLowerCase().trim();
    const cat = this._selectedCategory();

    return CATALOG.filter(component => {
      const matchesCategory = cat === 'All' || component.category === cat;
      if (!q) return matchesCategory;

      const matchesSearch =
        component.name.toLowerCase().includes(q) ||
        component.description.toLowerCase().includes(q) ||
        component.tags.some(tag => tag.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  });

  setQuery(q: string): void {
    this._query.set(q);
  }

  setCategory(cat: string): void {
    this._selectedCategory.set(cat);
  }
}
