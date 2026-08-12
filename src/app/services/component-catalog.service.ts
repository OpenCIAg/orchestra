import { Injectable, signal, computed } from '@angular/core';
import { ComponentEntry } from '../models/component-entry.model';

const CATALOG: ComponentEntry[] = [
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
  {
    id: 'sidebar',
    name: 'Sidebar',
    description: 'Menu lateral colapsável com suporte a sub-itens aninhados.',
    category: 'Navigation',
    status: 'beta',
    tags: ['menu', 'nav', 'sidebar', 'lateral', 'drawer'],
    icon: '☰',
    route: '/components/sidebar',
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
  {
    id: 'progress',
    name: 'Progress Bar',
    description: 'Barra de progresso linear e circular para tarefas longas.',
    category: 'Feedback',
    status: 'stable',
    tags: ['progress', 'loading', 'barra', 'progresso', 'percent'],
    icon: '📊',
    route: '/components/progress',
  },
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
    id: 'chip',
    name: 'Chip / Tag',
    description: 'Elemento compacto para categorias, filtros e seleções múltiplas.',
    category: 'Data Display',
    status: 'stable',
    tags: ['tag', 'chip', 'label', 'filter', 'filtro', 'tag'],
    icon: '🏷️',
    route: '/components/chip',
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
  {
    id: 'drawer',
    name: 'Drawer',
    description: 'Painel deslizante lateral para formulários e conteúdo contextual.',
    category: 'Overlay',
    status: 'beta',
    tags: ['panel', 'slide', 'drawer', 'panel', 'lateral', 'painel'],
    icon: '🗂️',
    route: '/components/drawer',
  },
  {
    id: 'popover',
    name: 'Popover',
    description: 'Painel flutuante ancorado a um elemento com conteúdo rico.',
    category: 'Overlay',
    status: 'beta',
    tags: ['floating', 'popup', 'anchor', 'popover', 'flutuante'],
    icon: '🫧',
    route: '/components/popover',
  },
  // ── Layout ────────────────────────────────────────────────
  {
    id: 'divider',
    name: 'Divider',
    description: 'Separador visual horizontal ou vertical com label opcional.',
    category: 'Layout',
    status: 'stable',
    tags: ['separator', 'line', 'divider', 'divisor', 'linha'],
    icon: '➖',
    route: '/components/divider',
  },
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
