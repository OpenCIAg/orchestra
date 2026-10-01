import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AutocompleteComponent,
  AutocompleteOption,
} from '@ciag/orchestra/autocomplete';
import { CarouselComponent, CarouselItem } from '@ciag/orchestra/carousel';
import {
  ChartComponent,
  type ChartData,
  type ChartType,
} from '@ciag/orchestra/chart';
import { ChipComponent } from '@ciag/orchestra/chip';
import { CollapsibleComponent } from '@ciag/orchestra/collapsible';
import { ColorPickerComponent } from '@ciag/orchestra/color-picker';
import { DatePickerComponent } from '@ciag/orchestra/date-picker';
import { DividerComponent } from '@ciag/orchestra/divider';
import { DrawerComponent } from '@ciag/orchestra/drawer';
import { DropdownComponent, DropdownItem } from '@ciag/orchestra/dropdown';
import { EditorComponent } from '@ciag/orchestra/editor';
import type { EditorAction } from '@ciag/orchestra/editor';
import { FileUploaderComponent } from '@ciag/orchestra/file-uploader';
import { FormComponent, FormSubmitEvent } from '@ciag/orchestra/form';
import { FormFieldComponent } from '@ciag/orchestra/form-field';
import { ImageComponent } from '@ciag/orchestra/image';
import { ListComponent, ListItem } from '@ciag/orchestra/list';
import { MenuComponent } from '@ciag/orchestra/menu';
import type { MenuItem } from '@ciag/orchestra/menu';
import {
  NavigationItemComponent,
  NavigationShellComponent,
} from '@ciag/orchestra/navigation';
import type { NavigationItem } from '@ciag/orchestra/navigation';
import { NumberInputComponent } from '@ciag/orchestra/number-input';
import { OtpInputComponent } from '@ciag/orchestra/otp-input';
import { PopoverComponent } from '@ciag/orchestra/popover';
import {
  ProgressBarComponent,
  ProgressCircleComponent,
} from '@ciag/orchestra/progress';
import {
  RadioButtonComponent,
  RadioGroupComponent,
} from '@ciag/orchestra/radio';
import { ScrollAreaComponent } from '@ciag/orchestra/scroll-area';
import { TabMenuComponent } from '@ciag/orchestra/tab-menu';
import type { TabMenuItem } from '@ciag/orchestra/tab-menu';
import { TerminalComponent, type TerminalLine } from '@ciag/orchestra/terminal';
import { TimelineComponent, TimelineItem } from '@ciag/orchestra/timeline';
import {
  ToolbarComponent,
  ToolbarItemDirective,
} from '@ciag/orchestra/toolbar';
import { TreeNode, TreeViewComponent } from '@ciag/orchestra/tree-view';
import {
  AspectRatioComponent,
  BoxComponent,
  ButtonGroupComponent,
  CalendarComponent,
  CloseButtonComponent,
  CodeComponent,
  ComboboxComponent,
  ContainerComponent,
  ContextMenuComponent,
  DataTableComponent,
  DataViewComponent,
  DateInputComponent,
  EmptyStateComponent,
  FlexComponent,
  FloatingActionButtonComponent,
  GridComponent,
  HoverCardComponent,
  InputGroupComponent,
  KbdComponent,
  LinkComponent,
  ListboxComponent,
  MenubarComponent,
  MultiSelectComponent,
  PortalComponent,
  SegmentedControlComponent,
  SeparatorComponent,
  SpaceComponent,
  SpeedDialComponent,
  SplitterComponent,
  StackComponent,
  TagComponent,
  TagsInputComponent,
  TextComponent,
  TreeComponent,
  TreeSelectComponent,
  TreeTableComponent,
  TypographyComponent,
  VirtualScrollerComponent,
  VisuallyHiddenComponent,
} from '@ciag/orchestra/p2-doc-components';
import {
  CascadeSelectComponent,
  type CascadeOption,
} from '@ciag/orchestra/cascade-select';
import type {
  ContextMenuItem,
  DataTableColumn,
  MenubarItem,
  P2Option,
  SpeedDialAction,
  SplitterPanel,
  TreeTableColumn,
  HierarchyNode,
  TreeSelectNode,
} from '@ciag/orchestra/p2';
import { FooterComponent } from '../../../shared/footer/footer.component';
import {
  MenuFamilyPreviewComponent,
  type MenuFamilyId,
} from './menu-family-preview.component';
import { IconCatalogPreviewComponent } from './icon-catalog-preview.component';

type ApiKind = 'input' | 'model' | 'output' | 'directive';

interface ApiEntry {
  name: string;
  kind: ApiKind;
  type: string;
  defaultValue: string;
  description: string;
}

interface ComponentVariation {
  label: string;
  description: string;
}

interface ComponentDoc {
  id: string;
  name: string;
  category: string;
  status: 'stable' | 'beta';
  description: string;
  packagePath: string;
  usage: string;
  guidance: string;
  variations: readonly ComponentVariation[];
  api: readonly ApiEntry[];
}

const input = (
  name: string,
  type: string,
  defaultValue: string,
  description: string,
): ApiEntry => ({ name, type, defaultValue, description, kind: 'input' });
const model = (
  name: string,
  type: string,
  defaultValue: string,
  description: string,
): ApiEntry => ({ name, type, defaultValue, description, kind: 'model' });
const output = (
  name: string,
  type: string,
  defaultValue: string,
  description: string,
): ApiEntry => ({ name, type, defaultValue, description, kind: 'output' });
const directive = (
  name: string,
  type: string,
  defaultValue: string,
  description: string,
): ApiEntry => ({ name, type, defaultValue, description, kind: 'directive' });

const COMPONENT_DOCS: Record<string, ComponentDoc> = {
  'date-picker': {
    id: 'date-picker',
    name: 'Date Picker',
    category: 'Inputs',
    status: 'stable',
    description:
      'Campo de data acessível com calendário em popover, compatível com ControlValueAccessor, limites e mensagens de validação.',
    packagePath: '@ciag/orchestra/date-picker',
    usage: `<orc-date-picker\n  label="Data de entrega"\n  [(value)]="deliveryDate"\n  min="2026-01-01"\n  showIcon\n  showButtonBar\n  showClear\n  required\n/>`,
    guidance:
      'Prefira limites explícitos quando a data fizer parte de uma regra de negócio. A mensagem de erro tem prioridade sobre o texto de ajuda.',
    variations: [
      {
        label: 'Default',
        description: 'Campo editável sem mensagem auxiliar.',
      },
      {
        label: 'Required + helper',
        description: 'Indica obrigatoriedade e orienta o preenchimento.',
      },
      { label: 'Error', description: 'Mensagem de erro com aria-invalid.' },
      { label: 'Disabled', description: 'Valor preservado, sem interação.' },
    ],
    api: [
      model(
        'value',
        'string | Date | (string | Date)[]',
        "''",
        'Data local, data e hora ou horário. dataType define string ou Date; selectionMode usa arrays para seleção múltipla e intervalo. Compatível com ngModel e Reactive Forms.',
      ),
      input(
        'dataType',
        "'string' | 'date'",
        "'string'",
        'Tipo dos valores emitidos pelo componente.',
      ),
      input(
        'selectionMode',
        "'single' | 'multiple' | 'range'",
        "'single'",
        'Seleciona uma data, várias datas ou um intervalo.',
      ),
      input('label', 'string', "''", 'Texto visível associado ao campo.'),
      input('min', 'string', "''", 'Menor data aceita no formato ISO.'),
      input('max', 'string', "''", 'Maior data aceita no formato ISO.'),
      input(
        'helperText',
        'string',
        "''",
        'Texto de apoio exibido quando error está vazio.',
      ),
      input('error', 'string', "''", 'Mensagem de erro e estado inválido.'),
      input('required', 'boolean', 'false', 'Marca o campo como obrigatório.'),
      input(
        'disabled',
        'boolean',
        'false',
        'Desabilita o campo e o calendário.',
      ),
      input(
        'showIcon',
        'boolean',
        'false',
        'Exibe o acionador de calendário integrado ao campo.',
      ),
      input(
        'showButtonBar',
        'boolean',
        'false',
        'Exibe a ação Today no rodapé do calendário.',
      ),
      input(
        'showClear',
        'boolean',
        'false',
        'Exibe a ação Clear no rodapé do calendário.',
      ),
      input(
        'showTime',
        'boolean',
        'false',
        'Inclui controles de horário no calendário.',
      ),
      input(
        'timeOnly',
        'boolean',
        'false',
        'Exibe apenas os controles de horário.',
      ),
      input('showSeconds', 'boolean', 'false', 'Inclui segundos no horário.'),
      input(
        'readonlyInput',
        'boolean',
        'false',
        'Impede digitação; a seleção pelo calendário continua disponível.',
      ),
      input(
        'inline',
        'boolean',
        'false',
        'Mantém o calendário visível no fluxo da página.',
      ),
      input(
        'appendTo',
        "'body' | 'self' | string | HTMLElement",
        'undefined',
        'Define o destino do popup. Por padrão ele preserva a hierarquia e o tema do campo, escapando do recorte de contêineres. Em um modal nativo permanece dentro do dialog para aceitar interação.',
      ),
    ],
  },
  'form-field': {
    id: 'form-field',
    name: 'Form Field',
    category: 'Inputs',
    status: 'stable',
    description:
      'Grupo semântico fieldset/legend para controles projetados, com texto de apoio e erro associados ao grupo.',
    packagePath: '@ciag/orchestra/form-field',
    usage: `<orc-form-field\n  id="project-identity"\n  label="Identificação do projeto"\n  helperText="Use um nome curto"\n  [required]="true"\n>\n  <label for="project-name">Nome do projeto</label>\n  <input id="project-name" type="text" />\n</orc-form-field>`,
    guidance:
      'O label nomeia o grupo fieldset/legend; dê a cada controle projetado seu próprio label nativo ou nome acessível. required é apenas um indicador visual e não altera a validação dos controles projetados. Use error para o estado inválido; helperText é usado como fallback quando não há erro.',
    variations: [
      {
        label: 'Default',
        description: 'Label e controle sem mensagem adicional.',
      },
      {
        label: 'Required',
        description: 'Exibe o indicador de obrigatoriedade.',
      },
      {
        label: 'Helper text',
        description: 'Orienta o usuário sem interromper o fluxo.',
      },
      { label: 'Error', description: 'Mensagem de erro com role=alert.' },
    ],
    api: [
      input(
        'label',
        'string',
        "''",
        'Legenda que nomeia o grupo de controles projetados.',
      ),
      input(
        'id',
        'string | undefined',
        'undefined',
        'Base opcional estável para o grupo, a legenda e a descrição.',
      ),
      input(
        'helperText',
        'string',
        "''",
        'Descrição do grupo quando error não foi informado.',
      ),
      input(
        'error',
        'string',
        "''",
        'Mensagem de erro e descrição do grupo; substitui helperText.',
      ),
      input(
        'required',
        'boolean',
        'false',
        'Exibe o asterisco; não aplica required aos controles projetados.',
      ),
    ],
  },
  editor: {
    id: 'editor',
    name: 'Editor',
    category: 'Inputs',
    status: 'beta',
    description:
      'Editor de texto rico com conteúdo HTML seguro, toolbar configurável e integração a formulários.',
    packagePath: '@ciag/orchestra/editor',
    usage: `<orc-editor
  [(value)]="content"
  [actions]="actions"
  ariaLabel="Descrição do projeto"
  (onTextChange)="onTextChange($event)"
/>`,
    guidance:
      'Use value para conteúdo HTML controlado e actions para configurar a toolbar. O conteúdo é sanitizado antes de entrar no modelo; a formatação usa a API execCommand do navegador e nenhum engine Quill é carregado. O componente implementa ControlValueAccessor para ngModel e Reactive Forms.',
    variations: [
      {
        label: 'Safe formatted content',
        description:
          'Renderiza conteúdo HTML sanitizado com marcação permitida.',
      },
      {
        label: 'Toolbar actions',
        description:
          'Ações configuráveis recebem nomes acessíveis e preservam a seleção.',
      },
      {
        label: 'Controlled value',
        description:
          'value é sincronizado por model e também funciona com ControlValueAccessor.',
      },
      { label: 'Readonly', description: 'Impede edição e oculta a toolbar.' },
    ],
    api: [
      model(
        'value',
        'string',
        "''",
        'Conteúdo HTML controlado, sanitizado antes de ser renderizado; compatível com ngModel e Reactive Forms.',
      ),
      input(
        'placeholder',
        'string | undefined',
        'undefined',
        'Texto exibido quando a superfície está vazia.',
      ),
      input(
        'readonly',
        'boolean',
        'false',
        'Impede a edição e oculta a toolbar.',
      ),
      input(
        'styleClass',
        'string',
        "''",
        'Classe adicional aplicada ao editor.',
      ),
      input(
        'ariaLabel',
        'string | undefined',
        'undefined',
        'Nome acessível do editor e da toolbar.',
      ),
      input(
        'actions',
        'EditorAction[]',
        '[]',
        'Ações da toolbar com command obrigatório e icon e label opcionais.',
      ),
      directive(
        'ControlValueAccessor',
        'ControlValueAccessor',
        '—',
        'Contrato de formulário implementado por writeValue, registerOnChange, registerOnTouched e setDisabledState.',
      ),
      output(
        'blur',
        'string',
        '—',
        'Emite o conteúdo atual quando o editor perde foco.',
      ),
      output(
        'onInit',
        'unknown',
        '—',
        'Emite depois que a superfície editável é inicializada.',
      ),
      output(
        'onTextChange',
        '{ html, text, delta?, source?, editor? }',
        '—',
        'Emite o HTML sanitizado e o texto simples após entrada do usuário.',
      ),
      output(
        'onSelectionChange',
        '{ range, oldRange?, source? }',
        '—',
        'Emite a seleção atual após interação com a superfície.',
      ),
      input(
        'formats',
        'string[] | undefined',
        'undefined',
        '@deprecated Compatibilidade apenas; sem efeito. A formatação usa execCommand do navegador e nenhum engine Quill é carregado.',
      ),
      input(
        'modules',
        'Record<string, unknown> | undefined',
        'undefined',
        '@deprecated Compatibilidade apenas; sem efeito. Módulos Quill não são carregados.',
      ),
      input(
        'bounds',
        'HTMLElement | string | undefined',
        'undefined',
        '@deprecated Compatibilidade apenas; sem efeito. O limite é determinado pela superfície contenteditable.',
      ),
      input(
        'scrollingContainer',
        'HTMLElement | string | undefined',
        'undefined',
        '@deprecated Compatibilidade apenas; sem efeito. A rolagem pertence ao layout que envolve o editor.',
      ),
      input(
        'debug',
        'string | undefined',
        'undefined',
        '@deprecated Compatibilidade apenas; sem efeito. O editor não expõe um canal de debug Quill.',
      ),
    ],
  },
  menu: {
    id: 'menu',
    name: 'Menu',
    category: 'Navigation',
    status: 'stable',
    description:
      'Menu acessível para ações e navegação, com itens controlados, estados visíveis, separadores e submenus aninhados.',
    packagePath: '@ciag/orchestra/menu',
    usage: `<orc-menu\n  [items]="items"\n  [popup]="true"\n  [(visible)]="menuVisible"\n  ariaLabel="Ações do projeto"\n  (itemSelect)="onItemSelect($event)"\n/>`,
    guidance:
      'Use items ou model para fornecer MenuItem. Em um popup, visible controla a apresentação, o clique fora e Escape fecham o menu, e o conteúdo continua renderizado no local declarado porque appendTo não faz a anexação. Trate itemSelect ou onItemClick para executar a ação escolhida. Itens com items abrem submenus e separator cria divisões semânticas.',
    variations: [
      {
        label: 'Inline',
        description: 'Lista de ações renderizada no fluxo da página.',
      },
      {
        label: 'Popup',
        description:
          'Menu controlado por visible; clique fora e Escape fecham o popup, que permanece renderizado no local declarado.',
      },
      {
        label: 'Nested items',
        description: 'Itens com items formam submenus aninhados.',
      },
      {
        label: 'Keyboard navigation',
        description: 'Foco ativo e setas, Home, End e Escape navegam a lista.',
      },
    ],
    api: [
      input(
        'items',
        'MenuItem[]',
        '[]',
        'Itens com label, value, icon, url, target, badge, visible, disabled, separator e items. Links com target="_blank" recebem rel="noopener noreferrer"; pais com items são disclosures, e links disabled ficam sem href.',
      ),
      input(
        'model',
        'MenuItem[] | undefined',
        'undefined',
        'Modelo alternativo de itens; quando informado, tem prioridade sobre items.',
      ),
      input(
        'popup',
        'boolean',
        'false',
        'Ativa o modo popup: o menu só é renderizado quando visible está ativo e permanece no local declarado.',
      ),
      model(
        'visible',
        'boolean',
        'false',
        'Controla a visibilidade do menu popup e pode ser ligado com [(visible)]; clique fora ou Escape também o fecha.',
      ),
      input(
        'id',
        'string | undefined',
        'undefined',
        'Id aplicado ao elemento nav do menu e usado como base para ids de submenus.',
      ),
      input(
        'style',
        'Record<string, any> | null | undefined',
        'undefined',
        'Estilos inline aplicados ao elemento nav do menu.',
      ),
      input(
        'styleClass',
        'string',
        "''",
        'Classes adicionais aplicadas ao elemento nav do menu.',
      ),
      input(
        'autoZIndex',
        'boolean',
        'true',
        'Quando popup, aplica automaticamente baseZIndex + 1 ao z-index do menu.',
      ),
      input(
        'baseZIndex',
        'number',
        '0',
        'Valor base usado para calcular o z-index do menu popup quando autoZIndex está ativo.',
      ),
      input(
        'appendTo',
        'HTMLElement | string | null | undefined',
        'undefined',
        'Compatibilidade (deprecated): não anexa o menu a outro elemento; o popup permanece renderizado no local declarado.',
      ),
      input(
        'showTransitionOptions',
        'string',
        "''",
        'Compatibilidade (deprecated): transições de abertura não são implementadas.',
      ),
      input(
        'hideTransitionOptions',
        'string',
        "''",
        'Compatibilidade (deprecated): transições de fechamento não são implementadas.',
      ),
      input(
        'disabled',
        'boolean',
        'false',
        'Desabilita o menu e impede a ativação dos itens.',
      ),
      input(
        'ariaLabel',
        'string | undefined',
        'undefined',
        'Nome acessível do menu.',
      ),
      input(
        'ariaLabelledBy',
        'string | undefined',
        'undefined',
        'Id do elemento que nomeia o menu.',
      ),
      input('tabindex', 'number', '0', 'Tabindex aplicado ao item ativo.'),
      output('itemSelect', 'MenuItem', '—', 'Emite o item ativado.'),
      output(
        'onItemClick',
        'MenuItem',
        '—',
        'Emite o item ativado como evento de clique.',
      ),
      output('onShow', 'void', '—', 'Emite quando o menu popup é mostrado.'),
      output('onHide', 'void', '—', 'Emite quando o menu popup é ocultado.'),
      output('onFocus', 'Event', '—', 'Emite quando o menu recebe foco.'),
      output('onBlur', 'Event', '—', 'Emite quando o foco deixa o menu.'),
    ],
  },
  drawer: {
    id: 'drawer',
    name: 'Drawer',
    category: 'Overlay',
    status: 'stable',
    description:
      'Painel sobreposto responsivo para conteúdo complementar, com backdrop, Escape e quatro posições de abertura.',
    packagePath: '@ciag/orchestra/drawer',
    usage: `<orc-drawer\n  [(open)]="drawerOpen"\n  placement="right"\n  label="Detalhes"\n>\n  <p drawer-title>Resumo</p>\n  <button drawer-actions>Concluir</button>\n</orc-drawer>`,
    guidance:
      'Use o drawer para conteúdo complementar, não para uma confirmação simples. Preserve um rótulo acessível e ofereça uma ação clara para fechar.',
    variations: [
      { label: 'Right', description: 'Painel lateral padrão.' },
      {
        label: 'Left / top / bottom',
        description: 'Placement adapta a direção do painel.',
      },
      {
        label: 'Backdrop dismiss',
        description: 'Clique fora fecha quando habilitado.',
      },
      {
        label: 'Persistent',
        description: 'dismissible=false exige fechamento controlado.',
      },
    ],
    api: [
      model('open', 'boolean', 'false', 'Controla a visibilidade do painel.'),
      input(
        'placement',
        "'left' | 'right' | 'top' | 'bottom'",
        "'right'",
        'Lado a partir do qual o painel entra.',
      ),
      input('label', 'string', "'Painel lateral'", 'Nome acessível do dialog.'),
      input(
        'closeOnBackdrop',
        'boolean',
        'true',
        'Fecha ao clicar no backdrop.',
      ),
      input(
        'dismissible',
        'boolean',
        'true',
        'Permite fechar por Escape e pelas ações internas.',
      ),
      output('closed', 'void', '—', 'Emite depois que o painel é fechado.'),
    ],
  },
  popover: {
    id: 'popover',
    name: 'Popover',
    category: 'Overlay',
    status: 'stable',
    description:
      'Conteúdo contextual posicionado junto ao gatilho, com abertura controlada, Escape e fechamento ao clicar fora.',
    packagePath: '@ciag/orchestra/popover',
    usage: `<orc-popover placement="bottom" label="Detalhes da conta">\n  <button popover-trigger type="button">Ver detalhes</button>\n  <p>Conteúdo contextual.</p>\n</orc-popover>`,
    guidance:
      'Use para detalhes ou ações relacionadas ao gatilho. Para mensagens curtas acionadas por hover, prefira Tooltip.',
    variations: [
      {
        label: 'Bottom',
        description: 'Placement padrão para conteúdo abaixo do gatilho.',
      },
      {
        label: 'Top / right / left',
        description: 'Posições alternativas para evitar colisões.',
      },
      {
        label: 'Controlled',
        description: 'open pode ser ligado a um estado externo.',
      },
      {
        label: 'Dismiss',
        description: 'Escape e clique externo fecham o conteúdo.',
      },
    ],
    api: [
      model('open', 'boolean', 'false', 'Estado de abertura controlado.'),
      input(
        'placement',
        "'top' | 'right' | 'bottom' | 'left'",
        "'bottom'",
        'Direção do conteúdo em relação ao gatilho.',
      ),
      input(
        'label',
        'string',
        "'Conteúdo adicional'",
        'Nome acessível da região de diálogo.',
      ),
    ],
  },
  list: {
    id: 'list',
    name: 'List',
    category: 'Data Display',
    status: 'stable',
    description:
      'Lista acessível para itens com descrição, seleção simples ou múltipla, estados desabilitados e vazio.',
    packagePath: '@ciag/orchestra/list',
    usage: `<orc-list\n  [items]="projects"\n  selection="single"\n  label="Projetos"\n  (itemSelect)="selectProject($event)"\n/>`,
    guidance:
      'Use ids estáveis nos itens e mantenha a seleção no estado da aplicação. A lista expõe role=listbox e cada item expõe role=option.',
    variations: [
      {
        label: 'No selection',
        description: 'Lista informativa sem aria-selected.',
      },
      { label: 'Single selection', description: 'Uma opção ativa por vez.' },
      {
        label: 'Multiple selection',
        description: 'Expõe aria-multiselectable.',
      },
      {
        label: 'Disabled + empty',
        description: 'Itens indisponíveis e fallback sem resultados.',
      },
    ],
    api: [
      input(
        'items',
        'ListItem[]',
        '[]',
        'Itens com id, label, description, disabled e selected.',
      ),
      input('label', 'string', "'Lista'", 'Nome acessível do listbox.'),
      input(
        'selection',
        "'none' | 'single' | 'multiple'",
        "'none'",
        'Define como a seleção é anunciada.',
      ),
      output(
        'itemSelect',
        'ListItem',
        '—',
        'Emite o item ativado, exceto quando disabled.',
      ),
    ],
  },
  'tree-view': {
    id: 'tree-view',
    name: 'Tree View',
    category: 'Data Display',
    status: 'stable',
    description:
      'Hierarquia expansível com níveis visíveis, navegação por teclado e suporte a nós desabilitados.',
    packagePath: '@ciag/orchestra/tree-view',
    usage: `<orc-tree-view\n  [nodes]="fileTree"\n  label="Arquivos"\n  (nodeSelect)="openNode($event)"\n/>`,
    guidance:
      'Use ids únicos por nó. A expansão é mantida pelo próprio componente; a seleção é emitida para o consumidor decidir o que fazer.',
    variations: [
      {
        label: 'Collapsed',
        description: 'Nós com filhos mostram o controle de expansão.',
      },
      {
        label: 'Expanded',
        description: 'Setas direita e esquerda expandem ou recolhem.',
      },
      {
        label: 'Disabled node',
        description: 'Nó visível que não pode ser ativado.',
      },
      {
        label: 'Keyboard',
        description: 'Enter, Space e setas mantêm a navegação acessível.',
      },
    ],
    api: [
      input(
        'nodes',
        'TreeNode[]',
        '[]',
        'Nós com id, label, children e disabled.',
      ),
      input('label', 'string', "'Árvore'", 'Nome acessível da árvore.'),
      output(
        'nodeSelect',
        'TreeNode',
        '—',
        'Emite o nó ativado por clique, Enter ou Space.',
      ),
    ],
  },
  tree: {
    id: 'tree',
    name: 'Tree',
    category: 'Data Display',
    status: 'beta',
    description:
      'Hierarquia controlada com seleção simples, múltipla ou checkbox, filtro local, expansão e navegação por teclado.',
    packagePath: '@ciag/orchestra/p2',
    usage: `<orc-tree
  [nodes]="nodes"
  [(selected)]="selected"
  selectionMode="checkbox"
  [filter]="true"
  ariaLabel="Estrutura do workspace"
  (nodeSelect)="onNodeSelect($event)"
/>`,
    guidance:
      'Forneça key único por nó. Use selected para controlar a seleção, filter para revelar ramos que contêm correspondências e os eventos nodeSelect/nodeUnselect para reagir às mudanças. Nós com disabled=true não podem ser selecionados nem expandidos. Os inputs de compatibilidade sem implementação não fazem parte deste contrato documentado.',
    variations: [
      { label: 'Single selection', description: 'Seleciona um nó por vez.' },
      {
        label: 'Checkbox',
        description: 'Exibe estados checked e mixed na hierarquia.',
      },
      {
        label: 'Filter',
        description:
          'Filtra labels e campos de data sem perder o caminho hierárquico.',
      },
      {
        label: 'Keyboard',
        description: 'Setas, Home, End, Enter e Space navegam a árvore.',
      },
    ],
    api: [
      input(
        'nodes',
        'HierarchyNode[]',
        '[]',
        'Nós com key, label, data, children e disabled. O campo leaf é mantido apenas para compatibilidade e não ativa carregamento tardio.',
      ),
      model(
        'selected',
        'string | string[] | null',
        'null',
        'Chaves selecionadas no modo single, multiple ou checkbox.',
      ),
      input(
        'label',
        'string | undefined',
        'undefined',
        'Nome acessível da árvore.',
      ),
      input(
        'ariaLabel',
        'string | undefined',
        'undefined',
        'Nome acessível alternativo da árvore.',
      ),
      input(
        'selectionMode',
        "'single' | 'multiple' | 'checkbox'",
        "'single'",
        'Modelo de seleção.',
      ),
      input(
        'propagateSelectionUp',
        'boolean',
        'false',
        'Propaga a seleção dos filhos para os pais.',
      ),
      input(
        'propagateSelectionDown',
        'boolean',
        'false',
        'Propaga a seleção do pai para os descendentes.',
      ),
      input('filter', 'boolean', 'false', 'Exibe o campo de filtro.'),
      model('filterValue', 'string', "''", 'Texto de filtro controlado.'),
      input(
        'filterBy',
        'string',
        "'label'",
        'Campos usados pela filtragem local.',
      ),
      input(
        'filterMode',
        "'lenient' | 'strict'",
        "'lenient'",
        'Modo de correspondência do filtro.',
      ),
      input(
        'emptyText',
        'string | undefined',
        'undefined',
        'Mensagem para árvore sem resultados.',
      ),
      input('loading', 'boolean', 'false', 'Indica carregamento da árvore.'),
      input(
        'style',
        'Record<string, string | number> | undefined',
        'undefined',
        'Estilos inline do container.',
      ),
      input('styleClass', 'string', "''", 'Classe adicional do container.'),
      output('nodeSelect', 'HierarchyNode', '—', 'Emite um nó selecionado.'),
      output('nodeUnselect', 'HierarchyNode', '—', 'Emite um nó desmarcado.'),
      output('nodeExpand', 'HierarchyNode', '—', 'Emite um nó expandido.'),
      output('nodeCollapse', 'HierarchyNode', '—', 'Emite um nó recolhido.'),
      output(
        'selectionChange',
        'string | string[] | null',
        '—',
        'Emite a seleção controlada.',
      ),
    ],
  },
  'tree-table': {
    id: 'tree-table',
    name: 'TreeTable',
    category: 'Data Display',
    status: 'beta',
    description:
      'Treegrid com colunas, seleção, filtro, ordenação e paginação local dos nós de topo.',
    packagePath: '@ciag/orchestra/p2',
    usage: `<orc-tree-table
  [value]="nodes"
  [columns]="columns"
  [(selected)]="selected"
  [filterable]="true"
  [paginator]="true"
  [rows]="10"
  ariaLabel="Estrutura do workspace"
/>`,
    guidance:
      'Use columns com key/header para os campos de data e value com HierarchyNode[]. A tabela mantém role=treegrid, seleção por linha, ordenação de um campo, filtro local e paginação dos nós de topo.',
    variations: [
      {
        label: 'Treegrid',
        description: 'Linhas expandidas preservam aria-level e aria-expanded.',
      },
      {
        label: 'Sortable columns',
        description: 'Ordenação local por uma coluna por vez.',
      },
      {
        label: 'Filterable',
        description: 'Filtro local mantém os ramos correspondentes.',
      },
      {
        label: 'Paginator',
        description: 'Pagina os nós de topo com relatório acessível.',
      },
    ],
    api: [
      input(
        'value',
        'HierarchyNode[]',
        '[]',
        'Nós hierárquicos exibidos na tabela.',
      ),
      input(
        'columns',
        'TreeTableColumn[]',
        '[]',
        'Colunas com key, header e sortable.',
      ),
      model(
        'selected',
        'ReadonlySet<string>',
        'new Set()',
        'Chaves selecionadas nas linhas.',
      ),
      input(
        'selectionMode',
        "'single' | 'multiple' | 'checkbox'",
        "'multiple'",
        'Controle nativo exibido em cada linha.',
      ),
      input(
        'filterable',
        'boolean',
        'false',
        'Exibe o filtro local da árvore.',
      ),
      model('filterValue', 'string', "''", 'Texto de filtro controlado.'),
      input(
        'paginator',
        'boolean',
        'false',
        'Ativa a paginação dos nós de topo.',
      ),
      model(
        'rows',
        'number | undefined',
        'undefined',
        'Quantidade de nós de topo por página.',
      ),
      model('first', 'number', '0', 'Índice do primeiro nó de topo da página.'),
      input(
        'rowsPerPageOptions',
        'number[] | undefined',
        'undefined',
        'Opções do seletor de linhas.',
      ),
      model(
        'sortField',
        'string | undefined',
        'undefined',
        'Campo atualmente ordenado.',
      ),
      model('sortOrder', '1 | -1', '1', 'Direção da ordenação.'),
      input(
        'ariaLabel',
        'string | undefined',
        'undefined',
        'Nome acessível da treegrid.',
      ),
      input('showGridlines', 'boolean', 'false', 'Exibe linhas de grade.'),
      output(
        'nodeSelect',
        'HierarchyNode',
        '—',
        'Emite uma linha selecionada.',
      ),
      output(
        'nodeUnselect',
        'HierarchyNode',
        '—',
        'Emite uma linha desmarcada.',
      ),
      output(
        'onFilter',
        '{ value: string }',
        '—',
        'Emite alterações do filtro.',
      ),
      output('onPage', '{ first, rows }', '—', 'Emite mudanças de página.'),
      output(
        'onSort',
        'TreeTableSortEvent',
        '—',
        'Emite a ordenação aplicada.',
      ),
    ],
  },
  autocomplete: {
    id: 'autocomplete',
    name: 'Autocomplete',
    category: 'Inputs',
    status: 'beta',
    description:
      'Combobox com filtragem local, seleção por teclado, valor controlado e estados de ajuda, erro e desabilitado.',
    packagePath: '@ciag/orchestra/autocomplete',
    usage: `<orc-autocomplete\n  label="Cidade"\n  [options]="cities"\n  [(value)]="city"\n  [minChars]="2"\n  clearable\n/>`,
    guidance:
      'Forneça labels compreensíveis e use minChars quando a lista for grande. O valor emitido é o value da opção, não o texto visível.',
    variations: [
      {
        label: 'Default',
        description: 'Filtra ao digitar e abre a lista ao focar.',
      },
      {
        label: 'minChars',
        description: 'A lista só abre depois do número mínimo de caracteres.',
      },
      { label: 'Error', description: 'Mensagem de erro anunciada pelo campo.' },
      {
        label: 'Disabled / clearable',
        description: 'Bloqueia edição ou permite limpar o valor.',
      },
    ],
    api: [
      input(
        'id',
        'string',
        "''",
        'Id explícito; um id único é gerado quando omitido.',
      ),
      input(
        'name',
        'string',
        "''",
        'Nome para integração com formulários nativos.',
      ),
      input('label', 'string', "''", 'Label visível do combobox.'),
      input(
        'placeholder',
        'string',
        "'Comece a digitar...'",
        'Texto exibido antes da primeira entrada.',
      ),
      input('helperText', 'string', "''", 'Mensagem auxiliar.'),
      input('errorMessage', 'string', "''", 'Mensagem de erro e aria-invalid.'),
      input(
        'options',
        'AutocompleteOption[]',
        '[]',
        'Opções com value, label, description e disabled.',
      ),
      input(
        'minChars',
        'number',
        '0',
        'Quantidade mínima de caracteres para filtrar.',
      ),
      input(
        'clearable',
        'boolean',
        'true',
        'Exibe ação para limpar a seleção.',
      ),
      input('disabled', 'boolean', 'false', 'Desabilita o combobox.'),
      input(
        'required',
        'boolean',
        'false',
        'Marca a entrada como obrigatória.',
      ),
      input(
        'ariaLabel',
        'string',
        "''",
        'Nome acessível alternativo ao label.',
      ),
      model(
        'value',
        'string | null',
        'null',
        'Valor selecionado, sincronizado por model ou ControlValueAccessor.',
      ),
      output(
        'optionSelected',
        'AutocompleteOption',
        '—',
        'Emite a opção escolhida.',
      ),
    ],
  },
  'number-input': {
    id: 'number-input',
    name: 'Number Input',
    category: 'Inputs',
    status: 'beta',
    description:
      'Entrada numérica com controles de incremento, limites, step, precisão, prefixo/sufixo e estados de validação.',
    packagePath: '@ciag/orchestra/number-input',
    usage: `<orc-number-input\n  label="Quantidade"\n  [(value)]="quantity"\n  [min]="1"\n  [max]="100"\n  suffix="itens"\n/>`,
    guidance:
      'Use min, max e step para comunicar a regra ao navegador. precision controla a apresentação e o valor emitido já vem limitado ao intervalo.',
    variations: [
      { label: 'Default', description: 'Entrada com controles − e +.' },
      {
        label: 'Error / success',
        description: 'Estados semânticos para validação.',
      },
      {
        label: 'Readonly',
        description: 'Valor visível sem permitir alteração.',
      },
      { label: 'Disabled', description: 'Entrada e controles bloqueados.' },
    ],
    api: [
      input(
        'id',
        'string',
        "''",
        'Id explícito; um id único é gerado quando omitido.',
      ),
      input('name', 'string', "''", 'Nome para formulários nativos.'),
      input('label', 'string', "''", 'Label visível.'),
      input(
        'placeholder',
        'string',
        "''",
        'Texto de apoio quando o valor está vazio.',
      ),
      input('helperText', 'string', "''", 'Mensagem auxiliar.'),
      input(
        'errorMessage',
        'string',
        "''",
        'Mensagem de erro e estado aria-invalid.',
      ),
      input(
        'status',
        "'default' | 'error' | 'success'",
        "'default'",
        'Tratamento visual do campo.',
      ),
      input('size', "'sm' | 'md' | 'lg'", "'md'", 'Tamanho visual.'),
      input('min', 'number | undefined', 'undefined', 'Menor valor aceito.'),
      input('max', 'number | undefined', 'undefined', 'Maior valor aceito.'),
      input('step', 'number', '1', 'Incremento dos controles e das setas.'),
      input(
        'precision',
        'number | undefined',
        'undefined',
        'Casas decimais usadas na apresentação.',
      ),
      input('prefix', 'string', "''", 'Texto antes do valor.'),
      input('suffix', 'string', "''", 'Texto depois do valor.'),
      input('disabled', 'boolean', 'false', 'Desabilita entrada e controles.'),
      input('readonly', 'boolean', 'false', 'Mantém o valor sem edição.'),
      input(
        'required',
        'boolean',
        'false',
        'Marca a entrada como obrigatória.',
      ),
      input(
        'showControls',
        'boolean',
        'true',
        'Exibe os botões de incremento e decremento.',
      ),
      input(
        'ariaLabel',
        'string',
        "''",
        'Nome acessível alternativo ao label.',
      ),
      model(
        'value',
        'number | null',
        'null',
        'Valor numérico controlado e compatível com formulários.',
      ),
      output(
        'valueChange',
        'number | null',
        '—',
        'Emite o novo valor depois de uma alteração.',
      ),
      output('blur', 'FocusEvent', '—', 'Emite quando a entrada perde o foco.'),
    ],
  },
  'color-picker': {
    id: 'color-picker',
    name: 'Color Picker',
    category: 'Inputs',
    status: 'beta',
    description:
      'Seletor de cor com presets, input nativo, valor hexadecimal e estado controlado para temas e tokens.',
    packagePath: '@ciag/orchestra/color-picker',
    usage: `<orc-color-picker\n  label="Cor de destaque"\n  [(value)]="accent"\n  [presets]="brandColors"\n/>`,
    guidance:
      'O valor válido é hexadecimal de 3 ou 6 dígitos. Para evitar perda de contexto, mantenha a label e use presets alinhados ao sistema de tokens.',
    variations: [
      { label: 'Default', description: 'Trigger com swatch, valor e presets.' },
      {
        label: 'Custom presets',
        description: 'Paleta reduzida ou específica do produto.',
      },
      {
        label: 'No text input',
        description: 'Somente swatch e seletor nativo.',
      },
      {
        label: 'Disabled / clearable',
        description: 'Bloqueia ou remove o valor atual.',
      },
    ],
    api: [
      input(
        'id',
        'string',
        "''",
        'Id explícito; um id único é gerado quando omitido.',
      ),
      input('label', 'string', "''", 'Label visível.'),
      model(
        'value',
        'string',
        "'#1C6AED'",
        'Cor hexadecimal de 3 ou 6 dígitos.',
      ),
      input('size', "'sm' | 'md' | 'lg'", "'md'", 'Tamanho visual do trigger.'),
      input(
        'presets',
        'string[]',
        'brand presets',
        'Cores rápidas disponíveis na paleta.',
      ),
      input('disabled', 'boolean', 'false', 'Desabilita o seletor.'),
      input('clearable', 'boolean', 'true', 'Exibe a ação para remover a cor.'),
      input(
        'showInput',
        'boolean',
        'true',
        'Exibe o campo hexadecimal no painel.',
      ),
      input(
        'ariaLabel',
        'string',
        "'Escolher cor'",
        'Nome acessível do trigger.',
      ),
      output(
        'colorChange',
        'string',
        '—',
        'Emite a nova cor depois de uma seleção.',
      ),
    ],
  },
  chip: {
    id: 'chip',
    name: 'Chip',
    category: 'Data Display',
    status: 'beta',
    description:
      'Rótulo compacto para categorias, filtros e entidades, com variantes semânticas, seleção e remoção.',
    packagePath: '@ciag/orchestra/chip',
    usage: `<orc-chip\n  label="Angular"\n  variant="primary"\n  [selectable]="true"\n  [removable]="true"\n/>`,
    guidance:
      'Use chips para atributos compactos, não para ações primárias. Quando removível, trate removed para atualizar a coleção de origem.',
    variations: [
      {
        label: 'Neutral / primary',
        description: 'Variantes para conteúdo neutro ou ativo.',
      },
      {
        label: 'Success / warning / danger',
        description: 'Estados semânticos para status.',
      },
      { label: 'Selectable', description: 'Toggle controlado por selected.' },
      {
        label: 'Removable / disabled',
        description: 'Ação de remoção ou estado inerte.',
      },
    ],
    api: [
      input('label', 'string', "''", 'Texto principal do chip.'),
      input(
        'value',
        'string | number',
        "''",
        'Valor emitido ao remover; usa label como fallback.',
      ),
      input(
        'variant',
        "'neutral' | 'primary' | 'success' | 'warning' | 'danger'",
        "'neutral'",
        'Cor semântica.',
      ),
      input('size', "'sm' | 'md' | 'lg'", "'md'", 'Tamanho visual.'),
      input(
        'selectable',
        'boolean',
        'false',
        'Transforma o chip em opção alternável.',
      ),
      input('removable', 'boolean', 'false', 'Exibe o botão de remoção.'),
      input('disabled', 'boolean', 'false', 'Bloqueia seleção e remoção.'),
      model('selected', 'boolean', 'false', 'Estado controlado de seleção.'),
      output(
        'removed',
        'string | number',
        '—',
        'Emite value ou label quando o usuário remove o chip.',
      ),
    ],
  },
  collapsible: {
    id: 'collapsible',
    name: 'Collapsible',
    category: 'Layout',
    status: 'beta',
    description:
      'Disclosure controlado para revelar conteúdo progressivamente, com região nomeada, lazy rendering e estado desabilitado.',
    packagePath: '@ciag/orchestra/collapsible',
    usage: `<orc-collapsible\n  title="Detalhes de implementação"\n  summary="Opcional"\n  [(open)]="isOpen"\n  [lazy]="true"\n>\n  Conteúdo progressivo.\n</orc-collapsible>`,
    guidance:
      'Use title para comunicar o conteúdo escondido. lazy evita manter a região renderizada quando fechada; open continua sendo o estado fonte da verdade.',
    variations: [
      { label: 'Closed', description: 'Apenas o trigger é visível.' },
      { label: 'Open', description: 'Região de conteúdo expandida.' },
      { label: 'Lazy', description: 'Remove o conteúdo quando fechado.' },
      {
        label: 'Disabled',
        description: 'Mantém o estado sem permitir toggle.',
      },
    ],
    api: [
      input('id', 'string', "''", 'Id explícito para ids de trigger e região.'),
      input('title', 'string', "''", 'Título do trigger.'),
      input('summary', 'string', "''", 'Texto auxiliar ao lado do título.'),
      model('open', 'boolean', 'false', 'Estado expandido controlado.'),
      input('disabled', 'boolean', 'false', 'Bloqueia a alternância.'),
      input(
        'lazy',
        'boolean',
        'false',
        'Só renderiza o conteúdo enquanto aberto.',
      ),
      output(
        'toggleChange',
        'boolean',
        '—',
        'Emite o novo estado depois de alternar.',
      ),
    ],
  },
  carousel: {
    id: 'carousel',
    name: 'Carousel',
    category: 'Data Display',
    status: 'beta',
    description:
      'Slides navegáveis com indicadores, loop, autoplay e suporte a teclado para conteúdo visual ou editorial.',
    packagePath: '@ciag/orchestra/carousel',
    usage: `<orc-carousel\n  [items]="slides"\n  [(activeIndex)]="currentSlide"\n  [loop]="true"\n  [showIndicators]="true"\n/>`,
    guidance:
      'Forneça alt quando um slide tiver imagem e mantenha poucos slides relacionados. Autoplay deve ser usado com parcimônia e sempre permitir navegação manual.',
    variations: [
      { label: 'Default', description: 'Setas e indicadores visíveis.' },
      {
        label: 'No loop',
        description: 'Desabilita navegação além dos limites.',
      },
      { label: 'Autoplay', description: 'Avança no intervalo configurado.' },
      {
        label: 'Vertical / disabled slide',
        description: 'Muda eixo ou impede um slide específico.',
      },
    ],
    api: [
      input(
        'items',
        'CarouselItem[]',
        '[]',
        'Slides com label, description, image, alt e disabled.',
      ),
      model('activeIndex', 'number', '0', 'Índice do slide ativo.'),
      input(
        'orientation',
        "'horizontal' | 'vertical'",
        "'horizontal'",
        'Eixo de navegação e layout.',
      ),
      input('loop', 'boolean', 'true', 'Volta ao início ao chegar ao fim.'),
      input(
        'autoplay',
        'boolean',
        'false',
        'Avança automaticamente quando há mais de um item.',
      ),
      input(
        'interval',
        'number',
        '5000',
        'Intervalo do autoplay em milissegundos.',
      ),
      input(
        'showArrows',
        'boolean',
        'true',
        'Exibe os controles anterior/próximo.',
      ),
      input(
        'showIndicators',
        'boolean',
        'true',
        'Exibe os indicadores de slide.',
      ),
      input('ariaLabel', 'string', "'Carousel'", 'Nome acessível do conjunto.'),
      output(
        'slideChange',
        '{ index, item }',
        '—',
        'Emite depois de mudar o slide.',
      ),
    ],
  },
  divider: {
    id: 'divider',
    name: 'Divider',
    category: 'Layout',
    status: 'beta',
    description:
      'Separador horizontal ou vertical com estilos solid, dashed e dotted e rótulo opcional.',
    packagePath: '@ciag/orchestra/divider',
    usage: `<orc-divider label="Ou" [decorative]="false" />\n<orc-divider orientation="vertical" variant="dashed" />`,
    guidance:
      'Use decorative=false quando o separador organiza a estrutura para tecnologia assistiva. Adicione label apenas quando houver significado para a leitura.',
    variations: [
      { label: 'Solid', description: 'Regra padrão para separar blocos.' },
      {
        label: 'Dashed / dotted',
        description: 'Tratamentos visuais alternativos.',
      },
      { label: 'Labeled', description: 'Texto centralizado entre as linhas.' },
      {
        label: 'Vertical / inset',
        description: 'Separador de colunas com recuo opcional.',
      },
    ],
    api: [
      input(
        'orientation',
        "'horizontal' | 'vertical'",
        "'horizontal'",
        'Direção do separador.',
      ),
      input(
        'variant',
        "'solid' | 'dashed' | 'dotted'",
        "'solid'",
        'Estilo da linha.',
      ),
      input('label', 'string', "''", 'Texto opcional no centro do separador.'),
      input(
        'inset',
        'boolean',
        'false',
        'Aplica recuo visual nas extremidades.',
      ),
      input(
        'decorative',
        'boolean',
        'true',
        'Quando true, oculta o separador da árvore acessível.',
      ),
      input(
        'ariaLabel',
        'string',
        "''",
        'Nome acessível quando decorative=false e label está vazio.',
      ),
    ],
  },
  image: {
    id: 'image',
    name: 'Image',
    category: 'Data Display',
    status: 'beta',
    description:
      'Imagem com object-fit, fallback, placeholder, loading nativo, raio e eventos de carregamento ou erro.',
    packagePath: '@ciag/orchestra/image',
    usage: `<orc-image\n  src="/assets/cover.png"\n  fallbackSrc="/assets/fallback.png"\n  alt="Capa do projeto"\n  fit="cover"\n/>`,
    guidance:
      'Sempre forneça alt. Use fallbackSrc quando uma alternativa real existir; passe placeholder quando quiser uma mensagem explícita para a ausência da imagem.',
    variations: [
      { label: 'Cover', description: 'Preenche a caixa cortando o excesso.' },
      {
        label: 'Contain',
        description: 'Preserva a imagem inteira dentro da caixa.',
      },
      {
        label: 'Fallback',
        description: 'Tenta uma segunda origem quando a primeira falha.',
      },
      {
        label: 'Placeholder',
        description: 'Estado final quando não há origem válida.',
      },
      {
        label: 'Preview',
        description: 'Abre a imagem em um modal acessível com zoom e rotação.',
      },
    ],
    api: [
      input('src', 'string', "''", 'Origem principal da imagem.'),
      input(
        'srcSet',
        'string | undefined',
        'undefined',
        'Candidatos responsivos da origem principal.',
      ),
      input(
        'sizes',
        'string | undefined',
        'undefined',
        'Tamanhos de slot para selecionar um candidato de srcSet.',
      ),
      input(
        'previewImageSrc',
        'string | undefined',
        'undefined',
        'Origem em maior resolução para a prévia.',
      ),
      input(
        'previewImageSrcSet',
        'string | undefined',
        'undefined',
        'Candidatos responsivos da imagem de prévia.',
      ),
      input(
        'previewImageSizes',
        'string | undefined',
        'undefined',
        'Tamanhos de slot para a imagem de prévia.',
      ),
      input('alt', 'string', "''", 'Texto alternativo para a imagem.'),
      input(
        'fallbackSrc',
        'string',
        "''",
        'Origem alternativa usada depois de um erro.',
      ),
      input(
        'fit',
        "'contain' | 'cover' | 'fill' | 'none' | 'scale-down'",
        "'cover'",
        'Valor de object-fit.',
      ),
      input(
        'width',
        'string | number',
        "''",
        'Largura da figura; números usam pixels.',
      ),
      input(
        'height',
        'string | number',
        "''",
        'Altura da figura; números usam pixels.',
      ),
      input(
        'loading',
        "'eager' | 'lazy'",
        "'lazy'",
        'Estratégia de carregamento nativo.',
      ),
      input(
        'radius',
        "'none' | 'sm' | 'md' | 'lg' | 'full'",
        "'md'",
        'Raio visual da figura.',
      ),
      input(
        'placeholder',
        'string | undefined',
        'undefined',
        'Texto opcional do estado sem origem renderizável.',
      ),
      input(
        'ariaLabel',
        'string | undefined',
        'undefined',
        'Nome acessível da imagem e da prévia; texto em branco usa um nome derivado.',
      ),
      input(
        'zoomOutAriaLabel',
        'string | undefined',
        'undefined',
        'Nome acessível opcional do controle de zoom menos.',
      ),
      input(
        'zoomInAriaLabel',
        'string | undefined',
        'undefined',
        'Nome acessível opcional do controle de zoom mais.',
      ),
      input(
        'rotateLeftAriaLabel',
        'string | undefined',
        'undefined',
        'Nome acessível opcional do controle de rotação à esquerda.',
      ),
      input(
        'rotateRightAriaLabel',
        'string | undefined',
        'undefined',
        'Nome acessível opcional do controle de rotação à direita.',
      ),
      input(
        'closePreviewAriaLabel',
        'string | undefined',
        'undefined',
        'Nome acessível opcional do controle de fechar.',
      ),
      input(
        'preview',
        'boolean',
        'false',
        'Habilita a abertura da prévia em modal.',
      ),
      input('styleClass', 'string', "''", 'Classes adicionais da figura.'),
      input(
        'imageClass',
        'string',
        "''",
        'Classes adicionais do elemento img.',
      ),
      input(
        'imageStyle',
        'Record<string, string | number> | undefined',
        'undefined',
        'Estilos adicionais do elemento img.',
      ),
      input(
        'appendTo',
        'unknown',
        'undefined',
        'Obsoleto: a posição do diálogo nativo não pode ser configurada por esta entrada.',
      ),
      input(
        'showTransitionOptions',
        'string',
        "'150ms cubic-bezier(0, 0, 0.2, 1)'",
        'Obsoleto: a duração da transição segue o CSS fixo do modal.',
      ),
      input(
        'hideTransitionOptions',
        'string',
        "'100ms linear'",
        'Obsoleto: a duração da transição segue o CSS fixo do modal.',
      ),
      output('loaded', 'void', '—', 'Emite quando a origem atual carrega.'),
      output(
        'error',
        'Event',
        '—',
        'Emite quando a origem principal e o fallback falham.',
      ),
      output('onImageError', 'Event', '—', 'Alias compatível de error.'),
      output('onShow', 'void', '—', 'Emite quando a prévia abre.'),
      output('onHide', 'void', '—', 'Emite quando a prévia fecha.'),
    ],
  },
  timeline: {
    id: 'timeline',
    name: 'Timeline',
    category: 'Navigation',
    status: 'beta',
    description:
      'Linha do tempo para eventos sequenciais com datas, ícones, status e orientação vertical ou horizontal.',
    packagePath: '@ciag/orchestra/timeline',
    usage: `<orc-timeline\n  [items]="events"\n  orientation="vertical"\n  ariaLabel="Histórico do pedido"\n  (itemSelect)="openEvent($event)"\n/>`,
    guidance:
      'Use status para comunicar progresso sem depender apenas de cor. Mantenha títulos curtos e datas consistentes dentro da mesma timeline.',
    variations: [
      {
        label: 'Completed',
        description: 'Evento concluído com marca visual de sucesso.',
      },
      { label: 'Current', description: 'Etapa atual em destaque.' },
      {
        label: 'Pending / error',
        description: 'Próximas etapas ou falhas explícitas.',
      },
      {
        label: 'Horizontal',
        description: 'Linha compacta para fluxos com poucas etapas.',
      },
    ],
    api: [
      input(
        'items',
        'TimelineItem[]',
        '[]',
        'Itens com title, description, date, icon, status e id.',
      ),
      input(
        'value',
        'TimelineItem[] | undefined',
        'undefined',
        'Alias de compatibilidade; items tem precedência quando fornecido.',
      ),
      input(
        'orientation',
        "'vertical' | 'horizontal'",
        "'vertical'",
        'Orientação visual.',
      ),
      input(
        'layout',
        "'vertical' | 'horizontal' | undefined",
        'undefined',
        'Alias de compatibilidade para orientation.',
      ),
      input(
        'align',
        "'left' | 'alternate' | 'right'",
        "'alternate'",
        'Alinhamento das etapas no layout vertical.',
      ),
      input(
        'style',
        'Record<string, string> | null',
        'null',
        'Estilos inline aplicados à sequência.',
      ),
      input(
        'styleClass',
        'string',
        "''",
        'Classe adicional aplicada ao container da timeline.',
      ),
      input(
        'ariaLabel',
        'string',
        "'Timeline'",
        'Nome acessível da sequência.',
      ),
      output(
        'itemSelect',
        '{ item, index }',
        '—',
        'Emite quando um item é ativado por clique, Enter ou Space.',
      ),
      output(
        'onItemClick',
        '{ item, index }',
        '—',
        'Alias de compatibilidade do evento itemSelect.',
      ),
    ],
  },
  toolbar: {
    id: 'toolbar',
    name: 'Toolbar',
    category: 'Navigation',
    status: 'beta',
    description:
      'Grupo de ações com roving tabindex e navegação por setas, Home e End.',
    packagePath: '@ciag/orchestra/toolbar',
    usage: `<orc-toolbar label="Ações de edição">\n  <button orcToolbarItem type="button">Desfazer</button>\n  <button orcToolbarItem type="button">Refazer</button>\n</orc-toolbar>`,
    guidance:
      'Cada ação precisa ser um controle focável e receber orcToolbarItem. Use label para anunciar o grupo e disabled na diretiva para pular uma ação.',
    variations: [
      {
        label: 'Horizontal',
        description: 'Setas esquerda e direita movem o foco.',
      },
      { label: 'Vertical', description: 'Setas cima e baixo movem o foco.' },
      {
        label: 'Disabled item',
        description: 'Ação desabilitada fica fora da sequência.',
      },
      {
        label: 'Loop off',
        description: 'Foco para no primeiro ou último item.',
      },
    ],
    api: [
      input(
        'orientation',
        "'horizontal' | 'vertical'",
        "'horizontal'",
        'Direção visual e das setas.',
      ),
      input(
        'label',
        'string',
        "'Toolbar'",
        'Nome acessível do grupo de ações.',
      ),
      input(
        'loop',
        'boolean',
        'true',
        'Volta ao primeiro item ao ultrapassar o último.',
      ),
      directive(
        'orcToolbarItem',
        'attribute directive',
        '—',
        'Registra um controle na sequência roving.',
      ),
      directive(
        'disabled',
        'boolean',
        'false',
        'Na diretiva, remove o item desabilitado da navegação.',
      ),
    ],
  },
  navigation: {
    id: 'navigation',
    name: 'Navigation Shell',
    category: 'Navigation',
    status: 'beta',
    description:
      'Shell responsivo para navegação primária com itens nativos, estado ativo, modo rail e fechamento por Escape.',
    packagePath: '@ciag/orchestra/navigation',
    usage: `<orc-navigation-shell
  [open]="navigationOpen"
  ariaLabel="Navegação principal"
  (requestClose)="navigationOpen = false"
>
  <orc-navigation-item
    [item]="item"
    [active]="item.id === activeId"
    (activated)="activeId = $event.id"
  />
</orc-navigation-shell>`,
    guidance:
      'Use NavigationShell como landmark nomeado e projete NavigationItem para cada destino. Em telas estreitas, open controla o drawer e requestClose responde ao backdrop ou Escape; active apenas marca o item atual.',
    variations: [
      {
        label: 'Open shell',
        description: 'Shell aberto em viewport estreita.',
      },
      {
        label: 'Rail',
        description: 'Largura compacta para navegação persistente.',
      },
      {
        label: 'Active item',
        description: 'Item ativo com aria-current="page".',
      },
      { label: 'Disabled item', description: 'Ação bloqueada sem ativação.' },
    ],
    api: [
      input(
        'open',
        'boolean',
        'false',
        'Apresenta o shell aberto em layouts responsivos.',
      ),
      input('rail', 'boolean', 'false', 'Usa a largura compacta do modo rail.'),
      input(
        'ariaLabel',
        'string',
        "'Primary navigation'",
        'Nome do landmark nav.',
      ),
      input(
        'closeAriaLabel',
        'string',
        "'Close navigation'",
        'Nome do backdrop de fechamento.',
      ),
      output(
        'requestClose',
        'void',
        '—',
        'Emite quando o usuário ativa backdrop ou Escape.',
      ),
      input(
        'item',
        'NavigationItem',
        '—',
        'Item com id, label, href, icon, badge e disabled.',
      ),
      input(
        'active',
        'boolean',
        'false',
        'Marca um NavigationItem como destino atual.',
      ),
      output(
        'activated',
        'NavigationItem',
        '—',
        'Emite o item ativado por clique.',
      ),
    ],
  },
  'tab-menu': {
    id: 'tab-menu',
    name: 'Tab Menu',
    category: 'Navigation',
    status: 'beta',
    description:
      'Navegação horizontal com itens selecionáveis, foco roving, setas, Home/End e suporte a routerLink.',
    packagePath: '@ciag/orchestra/tab-menu',
    usage: `<orc-tab-menu
  [model]="items"
  [(activeItem)]="activeItem"
  ariaLabel="Seções do projeto"
  (itemSelect)="onItemSelect($event)"
/>`,
    guidance:
      'Forneça model com itens visíveis e use activeItem para controlar a seleção. Itens disabled ficam fora da sequência de foco; use routerLink quando a navegação deve ser feita pelo Router.',
    variations: [
      {
        label: 'Controlled selection',
        description: 'activeItem acompanha o estado selecionado.',
      },
      {
        label: 'Keyboard',
        description: 'Setas, Home e End movem o foco entre itens ativos.',
      },
      {
        label: 'Disabled item',
        description: 'Item desabilitado não recebe foco nem ativação.',
      },
      {
        label: 'Scrollable',
        description: 'Itens largos preservam uma linha rolável.',
      },
    ],
    api: [
      input(
        'model',
        'TabMenuItem[]',
        '[]',
        'Itens com label, icon, visible, disabled, command e routerLink.',
      ),
      model(
        'activeItem',
        'TabMenuItem | undefined',
        'undefined',
        'Item atualmente selecionado.',
      ),
      input(
        'scrollable',
        'boolean',
        'false',
        'Permite rolagem horizontal do conjunto de itens.',
      ),
      input(
        'ariaLabel',
        'string | undefined',
        'undefined',
        'Nome acessível do conjunto de tabs.',
      ),
      input(
        'ariaLabelledBy',
        'string | undefined',
        'undefined',
        'Id de um elemento que nomeia o conjunto.',
      ),
      input(
        'style',
        'Record<string, string | number> | undefined',
        'undefined',
        'Estilos inline do menu.',
      ),
      input('styleClass', 'string', "''", 'Classe adicional do menu.'),
      input(
        'popup',
        'boolean',
        'false',
        '@deprecated Compatibilidade; não há gatilho ou estado popup neste componente.',
      ),
      output('itemSelect', 'TabMenuItem', '—', 'Emite o item ativado.'),
    ],
  },
  icon: {
    id: 'icon',
    name: 'Icon',
    category: 'Utility',
    status: 'beta',
    description:
      'Wrapper conciso para os mais de 3.900 Material Symbols do Google Fonts, com família e eixos variáveis controlados por inputs.',
    packagePath: '@ciag/orchestra/icon',
    usage: `import { IconComponent } from '@ciag/orchestra/icon';\n\n<orc-icon\n  name="check_circle"\n  size="md"\n  ariaLabel="Concluído"\n/>`,
    guidance:
      'Ícones decorativos devem permanecer sem ariaLabel. Quando o ícone comunica uma ação ou estado sem texto, forneça um nome acessível. O componente carrega a fonte diretamente do Google Fonts; permita fonts.googleapis.com e fonts.gstatic.com na CSP.',
    variations: [
      {
        label: 'Catalog',
        description:
          'Catálogo completo de Material Symbols Rounded, atualizado a partir dos metadados oficiais do Google.',
      },
      {
        label: 'Families',
        description: 'Outlined, Rounded ou Sharp com o mesmo nome de ligadura.',
      },
      {
        label: 'Sizes',
        description: 'xs, sm, md, lg, xl ou um número em pixels.',
      },
      {
        label: 'Axes',
        description:
          'Fill, weight, grade e opticalSize são controlados sem CSS adicional.',
      },
      {
        label: 'Decorative / labeled',
        description: 'Semântica definida por ariaLabel e title.',
      },
    ],
    api: [
      input(
        'name',
        'string',
        "'circle'",
        'Nome snake_case da ligadura do Google Material Symbols.',
      ),
      input(
        'family',
        "'outlined' | 'rounded' | 'sharp'",
        "'rounded'",
        'Família visual do Material Symbols.',
      ),
      input(
        'size',
        'IconSize | number',
        "'md'",
        'Tamanho semântico ou valor em pixels.',
      ),
      input(
        'fill',
        "'outline' | 'filled'",
        "'outline'",
        'Eixo FILL: 0 para outline e 1 para filled.',
      ),
      input('weight', 'number', '400', 'Eixo wght entre 100 e 700.'),
      input('grade', 'number', '0', 'Eixo GRAD entre -50 e 200.'),
      input(
        'opticalSize',
        "number | 'auto'",
        "'auto'",
        'Eixo opsz entre 20 e 48; auto acompanha o tamanho do texto.',
      ),
      input(
        'ariaLabel',
        'string',
        "''",
        'Nome acessível; vazio mantém o ícone decorativo.',
      ),
      input(
        'title',
        'string',
        "''",
        'Título nativo opcional e fallback do nome acessível.',
      ),
    ],
  },
  'scroll-area': {
    id: 'scroll-area',
    name: 'Scroll Area',
    category: 'Utility',
    status: 'beta',
    description:
      'Viewport com overflow controlado, sombras de direção, scrollbar tematizado e evento de rolagem.',
    packagePath: '@ciag/orchestra/scroll-area',
    usage: `<orc-scroll-area\n  maxHeight="240px"\n  orientation="vertical"\n  label="Notas do projeto"\n>\n  Conteúdo longo...\n</orc-scroll-area>`,
    guidance:
      'Defina maxHeight ou maxWidth para criar o viewport. O conteúdo continua sendo fornecido por ng-content e pode conter qualquer markup.',
    variations: [
      { label: 'Vertical', description: 'Rolagem e sombras no eixo vertical.' },
      {
        label: 'Horizontal',
        description: 'Útil para tabelas ou código extenso.',
      },
      { label: 'Both', description: 'Viewport com os dois eixos.' },
      { label: 'Always visible', description: 'Mantém a scrollbar aparente.' },
    ],
    api: [
      input(
        'orientation',
        "'vertical' | 'horizontal' | 'both'",
        "'vertical'",
        'Eixos que podem rolar.',
      ),
      input(
        'maxHeight',
        'string | number',
        "'240px'",
        'Altura máxima do viewport.',
      ),
      input('maxWidth', 'string | number', "''", 'Largura máxima do viewport.'),
      input(
        'alwaysShowScrollbar',
        'boolean',
        'false',
        'Mantém a scrollbar visível.',
      ),
      input(
        'label',
        'string',
        "'Scrollable content'",
        'Nome acessível do viewport.',
      ),
      output(
        'scrolled',
        '{ top, left }',
        '—',
        'Emite as coordenadas depois de uma rolagem.',
      ),
    ],
  },
  form: {
    id: 'form',
    name: 'Form',
    category: 'Inputs',
    status: 'beta',
    description:
      'Wrapper standalone para formulário com layout, submit validado, reset tipado e estado disabled.',
    packagePath: '@ciag/orchestra/form',
    usage: `<orc-form\n  ariaLabel="Cadastro de projeto"\n  (formSubmit)="save($event)"\n>\n  <input name="project" required />\n  <button type="submit">Salvar</button>\n</orc-form>`,
    guidance:
      'Os controles entram por content projection. formSubmit recebe tentativas válidas e inválidas, e valid informa o resultado. Com novalidate=true (padrão), tentativas inválidas não abrem a UI do navegador; com novalidate=false, o componente chama reportValidity() e mostra a UI nativa sem perder o evento de saída. Um botão formnovalidate ignora essa UI e ainda emite formSubmit com o resultado atual.',
    variations: [
      {
        label: 'Stacked',
        description: 'Layout vertical para formulários padrão.',
      },
      {
        label: 'Inline',
        description: 'Layout compacto para filtros e ações curtas.',
      },
      {
        label: 'Invalid submit',
        description:
          'O modo novalidate padrão reporta valid=false sem abrir a UI nativa.',
      },
      {
        label: 'Disabled / reset',
        description: 'Fieldset bloqueado e evento de reset disponível.',
      },
    ],
    api: [
      input(
        'layout',
        "'stacked' | 'inline'",
        "'stacked'",
        'Layout do fieldset projetado.',
      ),
      input('name', 'string', "''", 'Nome do formulário nativo.'),
      input(
        'ariaLabel',
        'string',
        "'Formulário'",
        'Nome acessível do formulário.',
      ),
      input(
        'disabled',
        'boolean',
        'false',
        'Desabilita todos os controles descendentes.',
      ),
      input(
        'novalidate',
        'boolean',
        'true',
        'True (padrão) reporta valid=false sem UI nativa; false chama reportValidity() para controles inválidos e preserva formSubmit.',
      ),
      output(
        'formSubmit',
        'FormSubmitEvent',
        '—',
        'Emite o SubmitEvent e o resultado valid.',
      ),
      output('formReset', 'void', '—', 'Emite quando o formulário é resetado.'),
    ],
  },
};

const P2_DOC_SEEDS: Record<string, readonly [string, string, string]> = {
  'button-group': [
    'Button Group',
    'Utility',
    'Agrupa ações relacionadas em uma composição acessível.',
  ],
  calendar: [
    'Calendar',
    'Data Display',
    'Calendário controlado para seleção e navegação por datas.',
  ],
  chart: [
    'Chart',
    'Data Display',
    'Gráficos SVG acessíveis para comparar séries e distribuições.',
  ],
  'cascade-select': [
    'Cascade Select',
    'Inputs',
    'Seleciona opções hierárquicas em níveis, com filtro, teclado e estado controlado.',
  ],
  code: [
    'Code',
    'Data Display',
    'Bloco de código com linguagem e cópia para a área de transferência.',
  ],
  combobox: [
    'Combobox',
    'Inputs',
    'Entrada pesquisável com seleção, teclado e estados vazios.',
  ],
  dropdown: [
    'Dropdown',
    'Utility',
    'Menu plano de ações posicionado junto ao gatilho; use TieredMenu para submenus.',
  ],
  'file-upload': [
    'File Upload',
    'Inputs',
    'Alias canônico para upload com seleção e drag-and-drop.',
  ],
  grid: [
    'Grid',
    'Layout',
    'Layout responsivo em colunas com largura mínima configurável.',
  ],
  kbd: ['Kbd', 'Typography', 'Representação visual de teclas e atalhos.'],
  terminal: [
    'Terminal',
    'Utility',
    'Prompt controlado que mantém histórico e emite comandos para o consumidor.',
  ],
  link: [
    'Link',
    'Typography',
    'Link semântico com estados de foco, desabilitado e externo.',
  ],
  menubar: [
    'Menubar',
    'Navigation',
    'Barra de menus com navegação por setas e atalhos.',
  ],
  'tiered-menu': [
    'TieredMenu',
    'Navigation',
    'Menu hierárquico com submenus, foco roving e navegação por teclado.',
  ],
  'panel-menu': [
    'PanelMenu',
    'Navigation',
    'Menu em painéis expansíveis com seleção e navegação por teclado.',
  ],
  'mega-menu': [
    'MegaMenu',
    'Navigation',
    'Menu agrupado em colunas com orientação horizontal ou vertical.',
  ],
  'command-menu': [
    'CommandMenu',
    'Navigation',
    'Paleta pesquisável de comandos com listbox e atalhos de teclado.',
  ],
  splitter: [
    'Splitter',
    'Layout',
    'Estrutura de painéis redimensionáveis em orientação horizontal ou vertical.',
  ],
  tag: [
    'Tag',
    'Data Display',
    'Rótulo semântico removível para entidades e filtros.',
  ],
  typography: [
    'Typography',
    'Typography',
    'Primitiva tipográfica com escala, peso e truncamento.',
  ],
  'aspect-ratio': [
    'Aspect Ratio',
    'Layout',
    'Mantém uma proporção previsível para conteúdo responsivo.',
  ],
  container: [
    'Container',
    'Layout',
    'Container centralizado com largura máxima e padding.',
  ],
  'floating-action-button': [
    'Floating Action Button',
    'Utility',
    'Ação primária flutuante com estado estendido e loading.',
  ],
  'hover-card': [
    'Hover Card',
    'Data Display',
    'Conteúdo contextual aberto por hover ou foco.',
  ],
  portal: [
    'Portal',
    'Utility',
    'Ponto de composição para conteúdo que pode ser movido pelo consumidor.',
  ],
  'segmented-control': [
    'Segmented Control',
    'Utility',
    'Seleção compacta entre opções mutuamente exclusivas.',
  ],
  separator: [
    'Separator',
    'Layout',
    'Separador visual e semântico para seções de conteúdo.',
  ],
  stack: [
    'Stack',
    'Layout',
    'Primitiva flexível para empilhar elementos com alinhamento previsível.',
  ],
  'visually-hidden': [
    'Visually Hidden',
    'Utility',
    'Conteúdo disponível para tecnologias assistivas sem ocupar espaço visual.',
  ],
  box: [
    'Box',
    'Layout',
    'Primitiva de superfície para padding, margem, fundo e raio.',
  ],
  'close-button': [
    'Close Button',
    'Utility',
    'Ação compacta e nomeada para fechar overlays e mensagens.',
  ],
  'context-menu': [
    'Context Menu',
    'Navigation',
    'Menu acionado pelo botão direito com posição contextual.',
  ],
  'data-table': [
    'Data Table',
    'Data Display',
    'Tabela acessível com ordenação, seleção, loading e estado vazio.',
  ],
  'data-view': [
    'DataView',
    'Data Display',
    'Coleção local em grade ou lista com filtro, ordenação controlada e paginação.',
  ],
  'date-input': [
    'Date Input',
    'Inputs',
    'Campo de data nativo com limites e integração a formulários.',
  ],
  'empty-state': [
    'Empty State',
    'Feedback',
    'Mensagem de ausência de dados com ação opcional.',
  ],
  flex: [
    'Flex',
    'Layout',
    'Primitiva flexível para direção, alinhamento, gap e wrapping.',
  ],
  'input-group': [
    'Input Group',
    'Inputs',
    'Composição de controle com prefixo e sufixo semântico.',
  ],
  listbox: [
    'Listbox',
    'Data Display',
    'Lista selecionável com modo simples ou múltiplo e teclado.',
  ],
  'multi-select': [
    'Multi Select',
    'Inputs',
    'Seleção múltipla com lista de opções e valores controlados.',
  ],
  space: ['Space', 'Layout', 'Utilitário de espaçamento em linha ou coluna.'],
  'speed-dial': [
    'Speed Dial',
    'Utility',
    'Ações secundárias agrupadas a partir de um gatilho flutuante.',
  ],
  'tags-input': [
    'Tags Input',
    'Inputs',
    'Campo de tags com sugestões, remoção e integração a formulários.',
  ],
  text: [
    'Text',
    'Typography',
    'Primitiva textual com escala, tom muted e truncamento.',
  ],
  'tree-select': [
    'Tree Select',
    'Inputs',
    'Seleção em uma hierarquia expansível.',
  ],
  'virtual-scroller': [
    'Virtual Scroller',
    'Utility',
    'Viewport eficiente para listas grandes com overscan e range.',
  ],
};

const P2_COMPONENT_DOCS: Record<string, ComponentDoc> = Object.entries(
  P2_DOC_SEEDS,
).reduce(
  (docs, [id, [name, category, description]]) => {
    const selector = id === 'file-upload' ? 'orc-file-uploader' : `orc-${id}`;
    docs[id] = {
      id,
      name,
      category,
      status: 'beta',
      description,
      packagePath: `@ciag/orchestra/${id}`,
      usage: `<${selector}\n  aria-label="${name}"\n/>`,
      guidance:
        'Use a API controlada, mantenha o nome acessível explícito e valide teclado, foco visível, estados vazios e responsividade antes de publicar.',
      variations: [
        {
          label: 'Default',
          description: 'Composição base com tokens semânticos.',
        },
        {
          label: 'Keyboard + focus',
          description:
            'Interação por teclado e foco visível fazem parte do contrato.',
        },
        {
          label: 'Disabled / loading',
          description:
            'Estados de bloqueio permanecem anunciados e previsíveis.',
        },
        {
          label: 'Responsive',
          description:
            'A composição preserva legibilidade em larguras menores.',
        },
      ],
      api: [
        input(
          'label',
          'string',
          "''",
          'Nome acessível ou texto de apoio do componente.',
        ),
        input(
          'disabled',
          'boolean',
          'false',
          'Desabilita a interação quando aplicável.',
        ),
        output(
          'change',
          'unknown',
          '—',
          'Evento emitido quando o estado controlado muda, quando aplicável.',
        ),
      ],
    };
    return docs;
  },
  {} as Record<string, ComponentDoc>,
);

P2_COMPONENT_DOCS['tags-input'] = {
  id: 'tags-input',
  name: 'Tags Input',
  category: 'Inputs',
  status: 'beta',
  description:
    'Campo de tags controlado ou integrado a formulários, com sugestões, limites, separadores e remoção acessível.',
  packagePath: '@ciag/orchestra/tags-input',
  usage: `<orc-tags-input
  label="Tecnologias"
  [(value)]="technologies"
  [suggestions]="technologySuggestions"
  separator=","
  [maxTags]="8"
  removeAriaLabel="Remover tag"
  showClear
  clearAriaLabel="Limpar todas as tags"
/>`,
  guidance:
    'Enter confirma o rascunho; separator pode confirmar uma tecla e também define como texto colado é dividido. Sem separator, o paste reconhece vírgulas e quebras de linha. addOnTab confirma sem cancelar a navegação nativa por Tab; addOnBlur confirma quando o campo perde foco. max substitui maxTags quando ambos são definidos; maxLength limita cada tag. Duplicatas são ignoradas sem diferenciar maiúsculas/minúsculas por padrão. removeAriaLabel habilita os botões de remoção e showClear com clearAriaLabel habilita Limpar. Sugestões são correspondências por substring e mostram até oito opções. O nome acessível vem de label ou ariaLabel.',
  variations: [
    {
      label: 'Controlled value',
      description:
        'value/valueChange oferece binding e integra com [(ngModel)] e Reactive Forms.',
    },
    {
      label: 'Suggestions',
      description:
        'Setas percorrem as sugestões; Enter aceita a opção ativa e Escape fecha a lista.',
    },
    {
      label: 'Limits and duplicates',
      description:
        'maxTags/max e maxLength limitam a coleção e o tamanho de cada tag.',
    },
    {
      label: 'Paste and separators',
      description:
        'Texto colado é dividido por separadores configurados ou, por padrão, vírgulas e linhas.',
    },
    {
      label: 'Keyboard navigation',
      description:
        'addOnTab adiciona o rascunho e mantém a navegação nativa para o próximo controle.',
    },
  ],
  api: [
    model(
      'value',
      'string[]',
      '[]',
      'Coleção controlada de tags; também compatível com ControlValueAccessor, ngModel e Reactive Forms.',
    ),
    input('label', 'string', "''", 'Rótulo visível associado ao campo.'),
    input(
      'placeholder',
      'string | undefined',
      'undefined',
      'Placeholder mostrado quando não há tags.',
    ),
    input('helperText', 'string', "''", 'Texto de apoio abaixo do controle.'),
    input(
      'suggestions',
      'string[]',
      '[]',
      'Sugestões filtradas por substring, com até oito opções.',
    ),
    input(
      'maxTags',
      'number | undefined',
      'undefined',
      'Limite de tags; ignorado quando max está definido.',
    ),
    input(
      'max',
      'number | undefined',
      'undefined',
      'Alias de limite que tem precedência sobre maxTags.',
    ),
    input(
      'maxLength',
      'number | undefined',
      'undefined',
      'Comprimento máximo de cada tag; valores numéricos em atributos são convertidos.',
    ),
    input(
      'disabled',
      'boolean',
      'false',
      'Desabilita entrada, remoção e limpeza; o estado disabled do CVA também é respeitado.',
    ),
    input(
      'allowDuplicate',
      'boolean',
      'false',
      'Permite adicionar tags repetidas.',
    ),
    input(
      'caseSensitiveDuplication',
      'boolean',
      'false',
      'Distingue maiúsculas/minúsculas ao verificar duplicatas.',
    ),
    input(
      'addOnTab',
      'boolean',
      'false',
      'Confirma o rascunho em Tab sem cancelar a navegação nativa do foco.',
    ),
    input(
      'addOnBlur',
      'boolean',
      'false',
      'Confirma o rascunho quando o input perde foco.',
    ),
    input(
      'separator',
      'string | RegExp | undefined',
      'undefined',
      'Tecla que confirma uma tag e delimitador para tokens colados; sem valor, paste usa vírgulas e quebras de linha.',
    ),
    input(
      'showClear',
      'boolean',
      'false',
      'Solicita o botão de limpar; também requer valor e clearAriaLabel.',
    ),
    input(
      'removeAriaLabel',
      'string | undefined',
      'undefined',
      'Nome acessível que habilita os botões de remover tag.',
    ),
    input(
      'clearAriaLabel',
      'string | undefined',
      'undefined',
      'Nome acessível necessário para mostrar o botão de limpar.',
    ),
    input(
      'styleClass',
      'string',
      "''",
      'Classe CSS adicional aplicada ao container.',
    ),
    input(
      'style',
      'Record<string, string | number> | undefined',
      'undefined',
      'Estilos inline do container.',
    ),
    input(
      'inputId',
      'string | undefined',
      'undefined',
      'ID explícito do input; um ID único é gerado se omitido.',
    ),
    input(
      'ariaLabel',
      'string',
      "''",
      'Nome acessível alternativo quando não há label visível.',
    ),
    output(
      'valueChange',
      'string[]',
      '—',
      'Saída implícita de model; emitida quando o valor é alterado pelo componente.',
    ),
    output(
      'tagAdded',
      'string',
      '—',
      'Tag adicionada depois de validações de duplicata e limites.',
    ),
    output('tagRemoved', 'string', '—', 'Valor da tag removida.'),
    output(
      'onAdd',
      '{ value: string }',
      '—',
      'Payload de compatibilidade para uma tag adicionada.',
    ),
    output(
      'onRemove',
      '{ value: string; index: number }',
      '—',
      'Payload de compatibilidade para uma tag removida.',
    ),
    output('onFocus', 'Event', '—', 'Evento de foco do input.'),
    output(
      'onBlur',
      'Event',
      '—',
      'Evento de blur do input; o CVA marca touched quando o foco sai do controle composto.',
    ),
    output(
      'onChipClick',
      '{ value: string; index: number; originalEvent: Event }',
      '—',
      'Clique no conteúdo de uma tag.',
    ),
    output('onClear', 'Event', '—', 'Evento emitido ao limpar todas as tags.'),
  ],
};

P2_COMPONENT_DOCS['chart'] = {
  id: 'chart',
  name: 'Chart',
  category: 'Data Display',
  status: 'beta',
  description:
    'Componente standalone de gráficos SVG com seleção de pontos, legenda e estrutura acessível para os tipos de barra, linha, pizza e rosca.',
  packagePath: '@ciag/orchestra/chart',
  usage: `<orc-chart
  type="bar"
  [data]="chartData"
  ariaLabel="Receita por trimestre"
  (onDataSelect)="handlePointSelection($event)"
/>`,
  guidance:
    'Os tipos bar, line, pie e doughnut renderizam SVG. scatter, bubble, polarArea e radar permanecem no ChartType por compatibilidade, mas exibem apenas um status de tipo não suportado; eles não renderizam dados. data usa labels e datasets numéricos. Os pontos renderizados são focáveis, recebem nomes acessíveis com rótulo e valor, e aceitam setas, Home, End, Enter e Space. Plugins e responsive são inputs deprecated de compatibilidade e não são executados; o dimensionamento usa width/height e os estilos do host.',
  variations: [
    {
      label: 'Bar',
      description: 'Compara valores categóricos em uma ou mais séries.',
    },
    {
      label: 'Line',
      description: 'Mostra a sequência dos valores com pontos selecionáveis.',
    },
    {
      label: 'Pie / doughnut',
      description: 'Apresenta fatias baseadas no primeiro dataset.',
    },
    {
      label: 'Compatibility types',
      description:
        'scatter, bubble, polarArea e radar são aceitos pelo tipo público, mas exibem o status de não suportado.',
    },
  ],
  api: [
    input(
      'type',
      'ChartType',
      "'bar'",
      "Tipos atualmente renderizados: 'bar', 'line', 'pie' e 'doughnut'. 'scatter', 'bubble', 'polarArea' e 'radar' são valores de compatibilidade e mostram status de não suportado.",
    ),
    input(
      'data',
      'ChartData',
      '{ labels: [], datasets: [] }',
      'Objeto { labels: string[], datasets: ChartDataset[] }. Cada dataset usa data: number[] e pode definir label, backgroundColor (string ou string[]) e borderColor. Pie e doughnut leem somente o primeiro dataset.',
    ),
    input('width', 'string | undefined', 'undefined', 'Largura CSS do host.'),
    input('height', 'string', "'260px'", 'Altura CSS do host.'),
    input('styleClass', 'string', "''", 'Classe CSS aplicada ao host.'),
    input(
      'ariaLabel',
      'string | undefined',
      'undefined',
      "Nome acessível do grupo SVG; o padrão é 'Chart' quando ariaLabelledBy não é informado.",
    ),
    input(
      'ariaLabelledBy',
      'string | undefined',
      'undefined',
      'ID do texto que nomeia o grupo SVG; tem precedência sobre o nome padrão.',
    ),
    input(
      'plugins',
      'any[]',
      '[]',
      'Deprecated, somente por compatibilidade; plugins não são executados.',
    ),
    input(
      'responsive',
      'boolean',
      'true',
      'Deprecated, somente por compatibilidade; o input não controla o layout SVG.',
    ),
    output(
      'pointClick',
      'number',
      '—',
      'Índice do ponto ou da fatia selecionada dentro do dataset.',
    ),
    output(
      'onDataSelect',
      '{ index: number; originalEvent?: Event; datasetIndex?: number }',
      '—',
      'Seleção com índice do ponto/fatia e índice do dataset quando aplicável.',
    ),
  ],
};

P2_COMPONENT_DOCS['kbd'] = {
  id: 'kbd',
  name: 'Kbd',
  category: 'Typography',
  status: 'beta',
  description:
    'Representação semântica e compacta de uma tecla ou combinação de teclas.',
  packagePath: '@ciag/orchestra/kbd',
  usage: `<orc-kbd [keys]="['Ctrl', 'Shift', 'P']" ariaLabel="Control Shift P" />`,
  guidance:
    'Uma string em keys é separada por sinais de mais ou espaços em branco. Passe um array para preservar nomes de tecla com espaços, como Page Up. ariaLabel substitui o nome acessível quando contém texto não vazio; o componente não captura eventos de teclado.',
  variations: [
    {
      label: 'Default chord',
      description: 'O padrão mostra a combinação ⌘ K em tokens separados.',
    },
    {
      label: 'Delimited string',
      description: 'Strings podem separar teclas com espaço ou +.',
    },
    {
      label: 'Explicit keys',
      description:
        'Arrays mantêm cada item em um token, incluindo nomes com espaço.',
    },
    {
      label: 'Accessible name',
      description:
        'ariaLabel fornece uma leitura natural opcional para a combinação.',
    },
  ],
  api: [
    input(
      'keys',
      'string | string[]',
      "'⌘ K'",
      'String dividida por + ou whitespace; array para controlar tokens individuais e preservar nomes de teclas com espaço.',
    ),
    input(
      'ariaLabel',
      'string',
      "''",
      'Nome acessível opcional aplicado ao elemento kbd; valores em branco são omitidos.',
    ),
  ],
};

P2_COMPONENT_DOCS['terminal'] = {
  id: 'terminal',
  name: 'Terminal',
  category: 'Utility',
  status: 'beta',
  description:
    'Prompt standalone com histórico controlado e eventos para encaminhar comandos ao consumidor; não executa comandos do sistema.',
  packagePath: '@ciag/orchestra/terminal',
  usage: `<orc-terminal
  prompt="ops> "
  [(command)]="command"
  [(history)]="history"
  (commandRun)="handleCommand($event)"
  ariaLabel="Operations console"
  commandAriaLabel="Terminal command"
/>`,
  guidance:
    'Enter envia o formulário nativo. submit(event) ignora comandos apenas com whitespace; comandos aceitos são aparados, adicionados a history e emitidos em commandRun e onCommand. O componente não invoca shell nem produz a saída do comando: atualize history com um objeto TerminalLine { command, output? }. O histórico acompanha novas linhas quando o viewport já está no fim e preserva a posição de quem está lendo entradas anteriores. A região usa role=log e aria-live=polite; configure os dois nomes acessíveis para o contexto da aplicação.',
  variations: [
    {
      label: 'Welcome + custom prompt',
      description: 'Mensagem de boas-vindas e prompt fornecidos pelo app.',
    },
    {
      label: 'Controlled models',
      description: 'command e history podem ser ligados ao estado consumidor.',
    },
    {
      label: 'Command output',
      description: 'Cada TerminalLine pode incluir output renderizado em pre.',
    },
    {
      label: 'History follow',
      description:
        'Novas linhas são acompanhadas quando o leitor já está no fim do histórico.',
    },
    {
      label: 'Accessible names',
      description: 'A região, o histórico e o campo de comando têm nomes.',
    },
  ],
  api: [
    input('prompt', 'string', "'$ '", 'Prompt visual para cada linha.'),
    input(
      'welcomeMessage',
      'string | undefined',
      'undefined',
      'Mensagem inicial exibida antes do histórico.',
    ),
    input(
      'styleClass',
      'string',
      "''",
      'Classes adicionais aplicadas à região do terminal.',
    ),
    input(
      'ariaLabel',
      'string | undefined',
      'undefined',
      "Nome acessível da região; padrão 'Terminal'. Overrides somente com whitespace também usam o padrão.",
    ),
    input(
      'commandAriaLabel',
      'string | undefined',
      'undefined',
      "Nome acessível do campo de entrada; padrão 'Terminal command'.",
    ),
    model(
      'command',
      'string',
      "''",
      'Texto controlável do campo; commandChange notifica alterações, incluindo o valor limpo após envio.',
    ),
    model(
      'history',
      'TerminalLine[]',
      '[]',
      'Linhas { command: string; output?: string }; historyChange notifica novas entradas.',
    ),
    output(
      'commandRun',
      'string',
      '—',
      'Comando aparado enviado pelo formulário.',
    ),
    output(
      'onCommand',
      'string',
      '—',
      'Alias de compatibilidade que emite o mesmo comando de commandRun.',
    ),
  ],
};

P2_COMPONENT_DOCS['data-view'] = {
  id: 'data-view',
  name: 'DataView',
  category: 'Data Display',
  status: 'beta',
  description:
    'Coleção controlada em grade ou lista com filtro local, ordenação por campo e paginação baseada nos dados fornecidos.',
  packagePath: '@ciag/orchestra/p2',
  usage: `<orc-data-view
  [value]="items"
  [filterBy]="'name'"
  [(sortField)]="sortField"
  [(sortOrder)]="sortOrder"
  [paginator]="true"
  [rows]="12"
  (onPage)="loadPage($event)"
/>`,
  guidance:
    'No modo local, value é filtrado, ordenado e paginado no componente. Com lazy=true, o componente não busca nem ordena dados no servidor: o consumidor deve responder a onLazyLoad, atualizar value/totalRecords e decidir a ordenação remota; esta página demonstra apenas o contrato local verificado.',
  variations: [
    { label: 'Grid', description: 'Cards em grade responsiva.' },
    { label: 'List', description: 'Itens em uma coluna.' },
    {
      label: 'Local filter',
      description: 'Filtro por um campo dos dados fornecidos.',
    },
    {
      label: 'Local pagination',
      description: 'Paginator limita os itens visíveis e expõe onPage.',
    },
  ],
  api: [
    input(
      'value',
      'T[]',
      '[]',
      'Dados exibidos e processados localmente quando lazy é false.',
    ),
    model(
      'layout',
      "'list' | 'grid'",
      "'grid'",
      'Alterna a apresentação em lista ou grade.',
    ),
    input('header', 'string', "''", 'Título opcional da coleção.'),
    input(
      'itemTemplate',
      'TemplateRef',
      'null',
      'Template projetado para cada item.',
    ),
    input(
      'trackBy',
      '(index, item) => unknown',
      'undefined',
      'Chave de rastreamento dos itens.',
    ),
    input(
      'filterBy',
      'string | undefined',
      'undefined',
      'Campo usado pelo filtro local.',
    ),
    model('filterValue', 'string', "''", 'Texto de filtro controlado.'),
    input(
      'filterAriaLabel',
      'string | undefined',
      'undefined',
      'Nome acessível do filtro.',
    ),
    input(
      'filterLocale',
      'string | undefined',
      'undefined',
      'Locale usado para normalizar o filtro.',
    ),
    input('paginator', 'boolean', 'false', 'Ativa o paginator.'),
    input(
      'rows',
      'number',
      '10',
      'Quantidade de itens por página no modo local.',
    ),
    model('first', 'number', '0', 'Índice do primeiro item da página.'),
    input(
      'rowsPerPageOptions',
      'number[] | undefined',
      'undefined',
      'Opções de tamanho da página.',
    ),
    input(
      'totalRecords',
      'number | undefined',
      'undefined',
      'Total remoto usado quando lazy é true.',
    ),
    input(
      'lazy',
      'boolean',
      'false',
      'Desativa o recorte local e delega carregamento ao consumidor via onLazyLoad.',
    ),
    input(
      'lazyLoadOnInit',
      'boolean',
      'false',
      'Emite onLazyLoad no primeiro ciclo quando lazy é true.',
    ),
    model(
      'sortField',
      'string | undefined',
      'undefined',
      'Campo local ordenado; não afirma ordenação remota.',
    ),
    model('sortOrder', '1 | -1', '1', 'Direção da ordenação local.'),
    input('loading', 'boolean', 'false', 'Exibe estado de carregamento.'),
    output('onPage', '{ first, rows }', '—', 'Emite mudanças do paginator.'),
    output(
      'onLazyLoad',
      '{ first, rows }',
      '—',
      'Emite limites de carregamento quando lazy está ativo.',
    ),
    output(
      'onSort',
      '{ sortField, sortOrder }',
      '—',
      'Emite quando sortBy é chamado pelo consumidor.',
    ),
    output(
      'onLayoutChange',
      "'list' | 'grid'",
      '—',
      'Emite mudança de layout.',
    ),
  ],
};

P2_COMPONENT_DOCS['tiered-menu'] = {
  id: 'tiered-menu',
  name: 'TieredMenu',
  category: 'Navigation',
  status: 'beta',
  description:
    'Menu hierárquico com um nível de submenu, itens desabilitados e foco roving.',
  packagePath: '@ciag/orchestra/p2',
  usage: `<orc-tiered-menu
  [items]="items"
  ariaLabel="Navegação do projeto"
  (itemSelect)="onSelect($event)"
/>`,
  guidance:
    'Use items ou model para fornecer a árvore. ArrowUp/ArrowDown/Home/End navegam no nível atual; ArrowRight abre o submenu e ArrowLeft/Escape retorna ao item pai. A implementação renderiza apenas um nível de filhos; níveis mais profundos permanecem fora do contrato verificado.',
  variations: [
    {
      label: 'Inline',
      description: 'Menu visível com hierarquia e foco roving.',
    },
    {
      label: 'Popup',
      description: 'Use popup e visible para controlar a abertura.',
    },
    {
      label: 'Disabled',
      description: 'Itens desabilitados não recebem foco nem seleção.',
    },
  ],
  api: [
    input(
      'items',
      'PrimeMenuItem[]',
      '[]',
      'Itens de raiz e seus filhos diretos.',
    ),
    input(
      'model',
      'PrimeMenuItem[] | undefined',
      'undefined',
      'Alias controlado para items.',
    ),
    input(
      'ariaLabel',
      'string | undefined',
      'undefined',
      'Nome acessível do menu.',
    ),
    input('disabled', 'boolean', 'false', 'Desabilita foco e ativação.'),
    input('popup', 'boolean', 'false', 'Controla se o menu usa o modo popup.'),
    model(
      'visible',
      'boolean',
      'false',
      'Visibilidade controlada no modo popup.',
    ),
    output(
      'itemSelect',
      'PrimeMenuItem',
      '—',
      'Emite quando um item folha é selecionado.',
    ),
    output(
      'onItemClick',
      'PrimeMenuItem',
      '—',
      'Alias de compatibilidade para seleção de item.',
    ),
  ],
};

P2_COMPONENT_DOCS['panel-menu'] = {
  id: 'panel-menu',
  name: 'PanelMenu',
  category: 'Navigation',
  status: 'beta',
  description:
    'Menu em painéis expansíveis com seleção, estado aberto controlado e navegação por teclado.',
  packagePath: '@ciag/orchestra/p2',
  usage: `<orc-panel-menu
  [items]="items"
  ariaLabel="Seções do projeto"
  (itemSelect)="onSelect($event)"
/>`,
  guidance:
    'Enter/Space alternam painéis; ArrowUp/ArrowDown/Home/End percorrem a árvore renderizada; ArrowRight abre e ArrowLeft/Escape fecha e retorna ao pai. O contrato atual renderiza a raiz e um nível de filhos.',
  variations: [
    {
      label: 'Single open',
      description: 'O padrão fecha o painel anterior ao abrir outro.',
    },
    {
      label: 'Multiple',
      description: 'Use multiple para manter vários painéis abertos.',
    },
    {
      label: 'Disabled',
      description: 'Itens desabilitados ficam fora do foco e da seleção.',
    },
  ],
  api: [
    input(
      'items',
      'PrimeMenuItem[]',
      '[]',
      'Itens de raiz e seus filhos diretos.',
    ),
    input(
      'model',
      'PrimeMenuItem[] | undefined',
      'undefined',
      'Alias controlado para items.',
    ),
    input(
      'ariaLabel',
      'string | undefined',
      'undefined',
      'Nome acessível do menu.',
    ),
    input(
      'multiple',
      'boolean',
      'false',
      'Permite manter mais de um painel aberto.',
    ),
    input('disabled', 'boolean', 'false', 'Desabilita foco e ativação.'),
    model(
      'open',
      'ReadonlySet<PrimeMenuItem>',
      'new Set()',
      'Painéis abertos controlados.',
    ),
    output(
      'itemSelect',
      'PrimeMenuItem',
      '—',
      'Emite quando um item folha é selecionado.',
    ),
    output(
      'onItemExpand',
      'PrimeMenuItem',
      '—',
      'Emite ao expandir um painel.',
    ),
    output(
      'onItemCollapse',
      'PrimeMenuItem',
      '—',
      'Emite ao recolher um painel.',
    ),
  ],
};

P2_COMPONENT_DOCS['mega-menu'] = {
  id: 'mega-menu',
  name: 'MegaMenu',
  category: 'Navigation',
  status: 'beta',
  description:
    'Menu agrupado em colunas com orientação horizontal ou vertical e foco roving.',
  packagePath: '@ciag/orchestra/p2',
  usage: `<orc-mega-menu
  [items]="groups"
  orientation="horizontal"
  ariaLabel="Navegação principal"
  (itemSelect)="onSelect($event)"
/>`,
  guidance:
    'Cada grupo expõe itens folha. ArrowRight/ArrowLeft (ou ArrowDown/ArrowUp no modo vertical), Home e End movem o foco entre itens habilitados; itemSelect e onItemClick informam a ativação.',
  variations: [
    {
      label: 'Horizontal',
      description: 'Grupos em colunas e navegação lateral.',
    },
    {
      label: 'Vertical',
      description: 'Grupos empilhados e navegação vertical.',
    },
    {
      label: 'Disabled',
      description: 'Grupos e itens desabilitados não são navegáveis.',
    },
  ],
  api: [
    input('items', 'PrimeMenuItem[]', '[]', 'Grupos com seus itens folha.'),
    input(
      'model',
      'PrimeMenuItem[] | undefined',
      'undefined',
      'Alias controlado para items.',
    ),
    input(
      'orientation',
      "'horizontal' | 'vertical'",
      "'horizontal'",
      'Eixo da navegação e do layout.',
    ),
    input(
      'ariaLabel',
      'string | undefined',
      'undefined',
      'Nome acessível da barra de menus.',
    ),
    input('disabled', 'boolean', 'false', 'Desabilita foco e ativação.'),
    output(
      'itemSelect',
      'PrimeMenuItem',
      '—',
      'Emite quando um item é selecionado.',
    ),
    output(
      'onItemClick',
      'PrimeMenuItem',
      '—',
      'Alias de compatibilidade para seleção de item.',
    ),
  ],
};

P2_COMPONENT_DOCS['command-menu'] = {
  id: 'command-menu',
  name: 'CommandMenu',
  category: 'Navigation',
  status: 'beta',
  description:
    'Paleta pesquisável com combobox, listbox, atalhos e seleção de comandos.',
  packagePath: '@ciag/orchestra/p2',
  usage: `<orc-command-menu
  [items]="commands"
  label="Ações do projeto"
  searchAriaLabel="Buscar comandos"
  (itemSelect)="run($event)"
/>`,
  guidance:
    'O filtro considera label e keywords. ArrowUp/ArrowDown/Home/End movem a opção ativa e Enter seleciona o comando habilitado; itens disabled permanecem visíveis e não são ativados.',
  variations: [
    { label: 'Search', description: 'Filtra comandos por texto e keywords.' },
    {
      label: 'Keyboard',
      description: 'Combobox e listbox expõem estado ativo ao teclado.',
    },
    {
      label: 'Empty',
      description: 'emptyText comunica quando não há resultados.',
    },
  ],
  api: [
    input(
      'items',
      'CommandItem[]',
      '[]',
      'Comandos, atalhos e keywords disponíveis.',
    ),
    model('query', 'string', "''", 'Texto de filtro controlado.'),
    model('activeIndex', 'number', '0', 'Índice controlado da opção ativa.'),
    input(
      'label',
      'string | undefined',
      'undefined',
      'Nome acessível do diálogo de comandos.',
    ),
    input(
      'placeholder',
      'string | undefined',
      'undefined',
      'Texto de placeholder do campo.',
    ),
    input(
      'searchAriaLabel',
      'string | undefined',
      'undefined',
      'Nome acessível da busca.',
    ),
    input(
      'emptyText',
      'string | undefined',
      'undefined',
      'Mensagem para resultados vazios.',
    ),
    output(
      'itemSelect',
      'CommandItem',
      '—',
      'Emite quando um comando habilitado é selecionado.',
    ),
  ],
};

P2_COMPONENT_DOCS['cascade-select'] = {
  ...P2_COMPONENT_DOCS['cascade-select'],
  packagePath: '@ciag/orchestra/cascade-select',
  usage: `<orc-cascade-select
  [options]="destinations"
  [(value)]="selectedDestination"
  label="Destino"
  placeholder="Escolha um destino"
  [filter]="true"
/>`,
  guidance:
    'Use valores únicos nas folhas. As setas para a direita e para a esquerda avançam entre níveis; Escape fecha o painel e devolve o foco ao acionador.',
  variations: [
    {
      label: 'Hierarquia controlada',
      description:
        'A seleção em cada nível permanece visível e value contém o valor da folha.',
    },
    {
      label: 'Filtro',
      description:
        'Filtra as opções apresentadas em cada nível sem alterar o valor controlado.',
    },
    {
      label: 'Disabled / loading',
      description:
        'Opções e acionadores indisponíveis não aceitam seleção durante bloqueio ou carregamento.',
    },
    {
      label: 'Small / large',
      description: 'Ajusta a densidade do acionador e das opções.',
    },
  ],
  api: [
    input(
      'options',
      'CascadeOption[]',
      '[]',
      'Opções aninhadas; cada folha deve ter um value único.',
    ),
    model(
      'value',
      'string | null',
      'null',
      'Valor da opção folha selecionada; compatível com ngModel e Reactive Forms.',
    ),
    input(
      'label',
      'string',
      'undefined',
      'Nome acessível e nome das listas por nível.',
    ),
    input(
      'placeholder',
      'string',
      'undefined',
      'Texto exibido quando não existe valor selecionado.',
    ),
    input(
      'optionLabel',
      'string',
      'undefined',
      'Nome da propriedade usada como rótulo em opções customizadas.',
    ),
    input(
      'optionValue',
      'string',
      'undefined',
      'Nome da propriedade usada como valor em opções customizadas.',
    ),
    input(
      'optionDisabled',
      'string',
      'undefined',
      'Nome da propriedade usada para desabilitar opções.',
    ),
    input(
      'filter',
      'boolean',
      'false',
      'Exibe um campo para filtrar as opções do painel.',
    ),
    input(
      'loading',
      'boolean',
      'false',
      'Bloqueia seleção e anuncia o estado de carregamento.',
    ),
    input(
      'disabled',
      'boolean',
      'false',
      'Desabilita o controle; o estado do CVA também é respeitado.',
    ),
    input(
      'readonly',
      'boolean',
      'false',
      'Impede alteração sem remover o acionador da navegação.',
    ),
    input(
      'showClear',
      'boolean',
      'false',
      'Exibe a ação para limpar um valor selecionado.',
    ),
    input(
      'size',
      "'small' | 'large'",
      'undefined',
      'Ajusta o espaçamento do acionador e das opções.',
    ),
    input(
      'variant',
      "'outlined' | 'filled'",
      'undefined',
      'Escolhe a superfície do acionador.',
    ),
    output(
      'optionSelect',
      'CascadeOption',
      '—',
      'Emite a opção folha selecionada.',
    ),
    output(
      'onChange',
      '{ value: string | null }',
      '—',
      'Emite quando o valor selecionado muda.',
    ),
    output('onShow', 'void', '—', 'Emite quando o painel abre.'),
    output('onHide', 'void', '—', 'Emite quando o painel fecha.'),
    output('onClear', 'void', '—', 'Emite quando a seleção é limpa.'),
  ],
};

const ALL_COMPONENT_DOCS: Record<string, ComponentDoc> = {
  ...COMPONENT_DOCS,
  ...P2_COMPONENT_DOCS,
};

@Component({
  selector: 'app-component-doc-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FooterComponent,
    AutocompleteComponent,
    CarouselComponent,
    ChartComponent,
    CascadeSelectComponent,
    ChipComponent,
    CollapsibleComponent,
    ColorPickerComponent,
    DatePickerComponent,
    DividerComponent,
    DrawerComponent,
    DropdownComponent,
    EditorComponent,
    MenuComponent,
    MenuFamilyPreviewComponent,
    FileUploaderComponent,
    FormComponent,
    FormFieldComponent,
    IconCatalogPreviewComponent,
    ImageComponent,
    ListComponent,
    NumberInputComponent,
    NavigationItemComponent,
    NavigationShellComponent,
    OtpInputComponent,
    PopoverComponent,
    ProgressBarComponent,
    ProgressCircleComponent,
    RadioButtonComponent,
    RadioGroupComponent,
    ScrollAreaComponent,
    TabMenuComponent,
    TerminalComponent,
    TimelineComponent,
    ToolbarComponent,
    ToolbarItemDirective,
    TreeViewComponent,
    AspectRatioComponent,
    BoxComponent,
    ButtonGroupComponent,
    CalendarComponent,
    CloseButtonComponent,
    CodeComponent,
    ComboboxComponent,
    ContainerComponent,
    ContextMenuComponent,
    DataTableComponent,
    DataViewComponent,
    DateInputComponent,
    EmptyStateComponent,
    FlexComponent,
    FloatingActionButtonComponent,
    GridComponent,
    HoverCardComponent,
    InputGroupComponent,
    KbdComponent,
    LinkComponent,
    ListboxComponent,
    MenubarComponent,
    MultiSelectComponent,
    PortalComponent,
    SegmentedControlComponent,
    SeparatorComponent,
    SpaceComponent,
    SpeedDialComponent,
    SplitterComponent,
    StackComponent,
    TagComponent,
    TagsInputComponent,
    TextComponent,
    TreeSelectComponent,
    TreeComponent,
    TreeTableComponent,
    TypographyComponent,
    VirtualScrollerComponent,
    VisuallyHiddenComponent,
  ],
  templateUrl: './component-doc-page.component.html',
  styleUrl: './component-doc-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentDocPageComponent {
  private readonly route = inject(ActivatedRoute);

  private readonly routeParams = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  get componentId(): string {
    return this.routeParams().get('componentId') ?? 'date-picker';
  }
  get doc(): ComponentDoc | undefined {
    return ALL_COMPONENT_DOCS[this.componentId];
  }

  readonly dateValue = signal('2026-08-17');
  readonly dateTimeValue = signal('2026-08-17T13:20:00');
  readonly timeValue = signal('13:20');
  readonly selectedCity = signal<string | null>(null);
  readonly quantity = signal<number | null>(4);
  readonly accent = signal('#1C6AED');
  readonly chipSelected = signal(true);
  readonly collapsibleOpen = signal(true);
  readonly carouselIndex = signal(0);
  readonly drawerOpen = signal(false);
  readonly selectedListItem = signal<string | null>('design');
  readonly selectedTreeNode = signal<string | null>(null);
  readonly selectedTimelineItem = signal<string | null>(null);
  readonly formMessage = signal('');
  readonly imageMessage = signal('Aguardando carregamento.');
  readonly scrollMessage = signal('Role o conteúdo para emitir scrolled.');
  readonly removedChip = signal('');
  readonly cities: AutocompleteOption[] = [
    { value: 'sp', label: 'São Paulo', description: 'Brasil' },
    { value: 'rj', label: 'Rio de Janeiro', description: 'Brasil' },
    { value: 'lisbon', label: 'Lisboa', description: 'Portugal' },
    {
      value: 'madrid',
      label: 'Madrid',
      description: 'Espanha',
      disabled: true,
    },
  ];

  readonly menuItems: DropdownItem[] = [
    { id: 'edit', label: 'Editar', shortcut: 'E' },
    { id: 'share', label: 'Compartilhar' },
    { id: 'divider', label: '', divider: true },
    { id: 'delete', label: 'Excluir projeto', danger: true },
  ];

  readonly menuComponentItems: MenuItem[] = [
    { label: 'Editar projeto', value: 'edit', icon: '✎' },
    { label: 'Compartilhar', value: 'share', icon: '↗' },
    { label: '', separator: true },
    {
      label: 'Mais ações',
      items: [
        { label: 'Duplicar', value: 'duplicate' },
        { label: 'Arquivar', value: 'archive', disabled: true },
      ],
    },
  ];
  readonly menuVisible = signal(false);
  readonly menuFamilyState = signal<Readonly<Record<string, unknown>>>({
    state: 'keyboard-ready',
  });
  readonly menuFamilyComponentId = computed<MenuFamilyId>(() => {
    const id = this.componentId;
    return this.isMenuFamilyComponent(id) ? id : 'tiered-menu';
  });
  readonly navigationOpen = signal(true);
  readonly navigationActiveId = signal('overview');
  readonly navigationItems: NavigationItem[] = [
    { id: 'overview', label: 'Visão geral', icon: '⌂', badge: 3 },
    { id: 'activity', label: 'Atividade', icon: '◷' },
    { id: 'settings', label: 'Configurações', icon: '⚙', disabled: true },
  ];
  readonly tabMenuActiveItem = signal<TabMenuItem | undefined>(undefined);
  readonly tabMenuItems: TabMenuItem[] = [
    { label: 'Resumo', icon: '▦', value: 'summary' },
    { label: 'Atividade', icon: '◷', value: 'activity' },
    { label: 'Arquivado', icon: '□', value: 'archived', disabled: true },
  ];

  readonly editorContent = signal(
    '<p><strong>Safe content</strong> for the project brief.</p>',
  );
  readonly editorTextChange = signal('Nenhuma alteração de texto ainda.');
  readonly editorInitialized = signal(false);
  readonly editorActions: EditorAction[] = [
    { command: 'bold', icon: 'B', label: 'Negrito' },
    { command: 'italic', icon: 'I', label: 'Itálico' },
    { command: 'underline', icon: 'U', label: 'Sublinhado' },
  ];

  readonly listItems = signal<ListItem[]>([
    {
      id: 'design',
      label: 'Design System',
      description: '12 componentes',
      selected: true,
    },
    { id: 'docs', label: 'Documentação', description: 'Em revisão' },
    { id: 'archive', label: 'Arquivo antigo', disabled: true },
  ]);

  readonly emptyList: ListItem[] = [];

  readonly treeNodes: TreeNode[] = [
    {
      id: 'workspace',
      label: 'Workspace',
      children: [
        {
          id: 'apps',
          label: 'Aplicações',
          children: [{ id: 'docs-app', label: 'Docs' }],
        },
        { id: 'packages', label: 'Pacotes' },
      ],
    },
    { id: 'settings', label: 'Configurações', disabled: true },
  ];
  readonly p2Hierarchy: HierarchyNode[] = [
    {
      key: 'workspace',
      label: 'Workspace',
      data: { owner: 'Platform' },
      children: [
        {
          key: 'apps',
          label: 'Aplicações',
          data: { owner: 'Web' },
          children: [
            { key: 'docs', label: 'Docs', data: { owner: 'Web' } },
            { key: 'admin', label: 'Admin', data: { owner: 'Platform' } },
          ],
        },
        { key: 'packages', label: 'Pacotes', data: { owner: 'Design' } },
      ],
    },
    { key: 'settings', label: 'Configurações', data: { owner: 'Platform' } },
    {
      key: 'archive',
      label: 'Arquivo',
      data: { owner: 'Legacy' },
      disabled: true,
    },
  ];
  readonly p2TreeSelected = signal<string | string[] | null>('workspace');
  readonly p2TreeTableSelected = signal<ReadonlySet<string>>(new Set());
  readonly p2TreeTableColumns: TreeTableColumn[] = [
    { key: 'owner', header: 'Responsável', sortable: true },
  ];

  readonly slides: CarouselItem[] = [
    {
      id: 'one',
      label: 'Composição',
      description: 'Combine estados sem perder clareza.',
    },
    {
      id: 'two',
      label: 'Acessibilidade',
      description: 'Teclado e semântica fazem parte da API.',
    },
    {
      id: 'three',
      label: 'Escala',
      description: 'Tokens consistentes em qualquer produto.',
    },
    {
      id: 'four',
      label: 'Indisponível',
      description: 'Este slide demonstra um item disabled.',
      disabled: true,
    },
  ];

  readonly timelineItems: TimelineItem[] = [
    {
      id: 'done',
      title: 'Definição',
      description: 'Requisitos alinhados.',
      date: 'Concluído',
      status: 'completed',
      icon: '✓',
    },
    {
      id: 'current',
      title: 'Implementação',
      description: 'Componente em uso.',
      date: 'Atual',
      status: 'current',
      icon: '2',
    },
    {
      id: 'next',
      title: 'Revisão',
      description: 'Acessibilidade e testes.',
      date: 'Próximo',
      status: 'pending',
      icon: '3',
    },
    {
      id: 'error',
      title: 'Publicação',
      description: 'Aguardando correção.',
      date: 'Bloqueado',
      status: 'error',
      icon: '!',
    },
  ];

  readonly imageSrc =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="640" height="320" viewBox="0 0 640 320"%3E%3Crect width="640" height="320" rx="24" fill="%231C6AED"/%3E%3Ccircle cx="520" cy="70" r="140" fill="%231CEDB9" fill-opacity=".75"/%3E%3Ccircle cx="85" cy="285" r="150" fill="%236A1CED" fill-opacity=".65"/%3E%3Ctext x="48" y="178" fill="white" font-family="Arial,sans-serif" font-size="48" font-weight="700"%3EOrchestra%3C/text%3E%3C/svg%3E';
  readonly colorPresets = ['#1C6AED', '#0406AB', '#FF6A1C', '#1CEDB9'];

  readonly p2CalendarValue = signal('2026-08-17');
  readonly p2ComboboxValue = signal<string | null>('angular');
  readonly p2DateInputValue = signal('2026-08-17');
  readonly p2ListboxValue = signal<string | null>('design');
  readonly p2MultiSelectValue = signal<string[]>(['tokens', 'a11y']);
  readonly p2SegmentedValue = signal<string | null>('all');
  readonly p2TagsValue = signal<string[]>(['Angular', 'A11y']);
  readonly p2TagsTabValue = signal<string[]>([]);
  readonly p2TreeSelectValue = signal<string | null>(null);
  readonly p2OtpValue = signal('314159');
  readonly p2RadioValue = signal('design');
  readonly p2ProgressValue = signal(72);
  readonly p2SplitterSizes = signal<number[]>([42, 58]);
  readonly p2SelectedRows = signal<Record<string, unknown>[]>([]);
  readonly p2ActionMessage = signal('Nenhuma ação emitida ainda.');
  readonly terminalCommand = signal('');
  readonly terminalHistory = signal<TerminalLine[]>([
    {
      command: 'help',
      output: 'Available demo commands: help, status',
    },
  ]);
  readonly chartExampleData: ChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Platform',
        data: [12, 19, 15, 25],
        backgroundColor: ['#1c6aed', '#174fc4', '#557fea', '#103b99'],
        borderColor: '#174fc4',
      },
      {
        label: 'Services',
        data: [8, 11, 18, 14],
        backgroundColor: ['#1cedb9', '#12bd94', '#62e8c4', '#098b6d'],
        borderColor: '#098b6d',
      },
    ],
  };
  readonly chartCompatibilityTypes: readonly ChartType[] = [
    'scatter',
    'bubble',
    'polarArea',
    'radar',
  ];
  readonly p2VirtualRange = signal({ start: 0, end: 0 });

  readonly p2Options: P2Option<string>[] = [
    { value: 'angular', label: 'Angular', description: 'Framework principal' },
    { value: 'react', label: 'React', description: 'Ecossistema de UI' },
    { value: 'vue', label: 'Vue', description: 'Aplicações progressivas' },
    {
      value: 'legacy',
      label: 'Legacy',
      description: 'Opção indisponível',
      disabled: true,
    },
  ];

  readonly p2SegmentedOptions: P2Option<string>[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativos' },
    { value: 'archived', label: 'Arquivados' },
  ];

  readonly p2TreeSelectNodes: TreeSelectNode[] = [
    {
      value: 'workspace',
      label: 'Workspace',
      children: [
        {
          value: 'apps',
          label: 'Aplicações',
          children: [
            { value: 'docs', label: 'Docs' },
            { value: 'admin', label: 'Admin' },
          ],
        },
        { value: 'packages', label: 'Pacotes' },
      ],
    },
    { value: 'settings', label: 'Configurações', disabled: true },
  ];

  readonly cascadeSelection = signal<string | null>(null);
  readonly cascadeOptions: CascadeOption[] = [
    {
      value: 'platform',
      label: 'Platform',
      children: [
        { value: 'web', label: 'Web' },
        { value: 'mobile', label: 'Mobile' },
      ],
    },
    {
      value: 'design',
      label: 'Design',
      children: [
        { value: 'tokens', label: 'Tokens' },
        { value: 'components', label: 'Components' },
      ],
    },
  ];

  readonly p2MenubarItems: MenubarItem[] = [
    { value: 'file', label: 'Arquivo', shortcut: '⌘ F' },
    { value: 'edit', label: 'Editar', shortcut: '⌘ E' },
    { value: 'view', label: 'Visualizar' },
    { value: 'disabled', label: 'Indisponível', disabled: true },
  ];

  readonly p2ContextMenuItems: ContextMenuItem[] = [
    { value: 'rename', label: 'Renomear', shortcut: 'R' },
    { value: 'duplicate', label: 'Duplicar', shortcut: 'D' },
    { value: 'delete', label: 'Excluir', shortcut: '⌫', danger: true },
  ];

  readonly p2SpeedDialActions: SpeedDialAction[] = [
    { value: 'note', label: 'Nova nota', icon: '✎' },
    { value: 'task', label: 'Nova tarefa', icon: '✓' },
    { value: 'share', label: 'Compartilhar', icon: '↗' },
  ];

  readonly p2SplitterPanels: SplitterPanel[] = [
    { id: 'navigation', label: 'Navegação' },
    { id: 'content', label: 'Conteúdo' },
  ];

  readonly p2TableColumns: DataTableColumn[] = [
    { key: 'name', header: 'Componente', sortable: true },
    { key: 'category', header: 'Categoria', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
  ];

  readonly p2TableRows: Record<string, unknown>[] = [
    {
      id: 'calendar',
      name: 'Calendar',
      category: 'Data Display',
      status: 'Ready',
    },
    { id: 'combobox', name: 'Combobox', category: 'Inputs', status: 'Beta' },
    {
      id: 'cascade-select',
      name: 'Cascade Select',
      category: 'Inputs',
      status: 'Beta',
    },
    {
      id: 'data-table',
      name: 'Data Table',
      category: 'Data Display',
      status: 'Ready',
    },
    {
      id: 'tree-select',
      name: 'Tree Select',
      category: 'Inputs',
      status: 'Beta',
    },
  ];
  readonly dataViewItems = [
    {
      id: 'calendar',
      name: 'Calendar',
      category: 'Data Display',
      owner: 'Platform',
    },
    { id: 'combobox', name: 'Combobox', category: 'Inputs', owner: 'Forms' },
    {
      id: 'data-table',
      name: 'Data Table',
      category: 'Data Display',
      owner: 'Tables',
    },
    { id: 'tree', name: 'Tree', category: 'Data Display', owner: 'Hierarchy' },
    { id: 'tooltip', name: 'Tooltip', category: 'Overlay', owner: 'Feedback' },
  ];
  readonly dataViewLayout = signal<'grid' | 'list'>('grid');
  readonly dataViewFirst = signal(0);
  readonly dataViewSortField = signal<string | undefined>(undefined);
  readonly dataViewSortOrder = signal<1 | -1>(1);
  readonly dataViewFilter = signal('');

  readonly p2VirtualItems = Array.from({ length: 80 }, (_, index) => ({
    id: index + 1,
    label: `Virtual item ${String(index + 1).padStart(2, '0')}`,
    status: index % 3 === 0 ? 'review' : 'ready',
  }));

  readonly p2CodeExample = `const selected = signal('angular');

<orc-combobox
  [options]="options"
  [(value)]="selected"
/>`;

  readonly liveState = () => {
    switch (this.componentId) {
      case 'date-picker':
        return { value: this.dateValue(), state: 'controlled' };
      case 'chart':
        return { state: this.p2ActionMessage() };
      case 'terminal':
        return {
          command: this.terminalCommand(),
          history: this.terminalHistory(),
          state: this.p2ActionMessage(),
        };
      case 'autocomplete':
        return { value: this.selectedCity(), state: 'selected value' };
      case 'number-input':
        return { value: this.quantity(), state: 'bounded 1–10' };
      case 'color-picker':
        return { value: this.accent(), state: 'hexadecimal' };
      case 'chip':
        return {
          selected: this.chipSelected(),
          removed: this.removedChip() || null,
        };
      case 'collapsible':
        return { open: this.collapsibleOpen(), state: 'controlled' };
      case 'carousel':
        return { activeIndex: this.carouselIndex(), total: this.slides.length };
      case 'drawer':
        return { open: this.drawerOpen(), placement: 'right' };
      case 'menu':
        return {
          visible: this.menuVisible(),
          state: this.p2ActionMessage() || 'keyboard-ready',
        };
      case 'tiered-menu':
      case 'panel-menu':
      case 'mega-menu':
      case 'command-menu':
        return this.menuFamilyState();
      case 'navigation':
        return {
          open: this.navigationOpen(),
          active: this.navigationActiveId(),
          state: this.p2ActionMessage() || 'navigation-ready',
        };
      case 'tab-menu':
        return {
          active:
            this.tabMenuActiveItem()?.label ?? this.tabMenuItems[0]?.label,
          state: this.p2ActionMessage() || 'keyboard-ready',
        };
      case 'editor':
        return {
          value: this.editorContent(),
          text: this.editorTextChange(),
          state: this.editorInitialized() ? 'initialized' : 'initializing',
        };
      case 'list':
        return {
          selected: this.selectedListItem(),
          items: this.listItems().length,
        };
      case 'tree-view':
        return { selected: this.selectedTreeNode(), state: 'keyboard-ready' };
      case 'tree':
        return {
          selected: this.p2TreeSelected(),
          state: this.p2ActionMessage() || 'keyboard-ready',
        };
      case 'tree-table':
        return {
          selected: this.p2TreeTableSelected().size,
          state: this.p2ActionMessage() || 'treegrid-ready',
        };
      case 'timeline':
        return {
          selected: this.selectedTimelineItem(),
          state: 'event sequence',
        };
      case 'form':
        return { submit: this.formMessage() || 'not submitted' };
      case 'image':
        return { state: this.imageMessage() };
      case 'scroll-area':
        return { state: this.scrollMessage() };
      case 'calendar':
        return { value: this.p2CalendarValue(), state: 'controlled calendar' };
      case 'combobox':
        return {
          value: this.p2ComboboxValue(),
          options: this.p2Options.length,
        };
      case 'date-input':
        return { value: this.p2DateInputValue(), state: 'native date input' };
      case 'listbox':
        return {
          value: this.p2ListboxValue(),
          state: 'keyboard-ready listbox',
        };
      case 'multi-select':
        return {
          values: this.p2MultiSelectValue(),
          state: 'multiple selection',
        };
      case 'tags-input':
        return { tags: this.p2TagsValue(), state: 'controlled tags' };
      case 'tree-select':
        return {
          value: this.p2TreeSelectValue(),
          state: 'hierarchical selection',
        };
      case 'cascade-select':
        return {
          value: this.cascadeSelection(),
          state: 'hierarchical selection',
        };
      case 'segmented-control':
        return { value: this.p2SegmentedValue(), state: 'exclusive selection' };
      case 'otp-input':
        return { value: this.p2OtpValue(), state: 'verification code' };
      case 'radio':
        return { value: this.p2RadioValue(), state: 'exclusive selection' };
      case 'progress':
        return { value: this.p2ProgressValue(), state: 'determinate' };
      case 'data-table':
        return {
          selected: this.p2SelectedRows().length,
          rows: this.p2TableRows.length,
        };
      case 'data-view':
        return {
          layout: this.dataViewLayout(),
          first: this.dataViewFirst(),
          sort: this.dataViewSortOrder() === 1 ? 'ascending' : 'descending',
          filter: this.dataViewFilter(),
        };
      case 'virtual-scroller':
        return {
          range: this.p2VirtualRange(),
          total: this.p2VirtualItems.length,
        };
      case 'splitter':
        return { sizes: this.p2SplitterSizes(), state: 'panel layout' };
      case 'code':
      case 'link':
      case 'tag':
      case 'menubar':
      case 'context-menu':
      case 'speed-dial':
      case 'empty-state':
      case 'close-button':
      case 'floating-action-button':
        return { state: this.p2ActionMessage() };
      default:
        return { state: 'interactive preview', component: this.doc?.name };
    }
  };

  selectListItem(item: ListItem): void {
    this.selectedListItem.set(item.id);
    this.listItems.update((items) =>
      items.map((current) => ({
        ...current,
        selected: current.id === item.id,
      })),
    );
  }

  selectTreeNode(node: TreeNode): void {
    this.selectedTreeNode.set(node.id);
  }

  onP2TreeNode(node: HierarchyNode): void {
    this.onP2Action(`Tree: ${node.label}`);
  }

  onP2TreeTableNode(node: HierarchyNode): void {
    this.onP2Action(`TreeTable: ${node.label}`);
  }

  selectTimelineItem(event: { item: TimelineItem; index: number }): void {
    this.selectedTimelineItem.set(String(event.item.id ?? event.index));
  }

  removeChip(value: string | number): void {
    this.removedChip.set(String(value));
  }

  onFormSubmit(result: FormSubmitEvent): void {
    this.formMessage.set(
      result.valid ? 'Formulário válido.' : 'Revise os campos obrigatórios.',
    );
  }

  onFormReset(): void {
    this.formMessage.set('Formulário resetado.');
  }

  onImageLoad(): void {
    this.imageMessage.set('Imagem carregada.');
  }

  onImageError(): void {
    this.imageMessage.set('Origem e fallback falharam.');
  }

  onScroll(event: { top: number; left: number }): void {
    this.scrollMessage.set(
      `top ${Math.round(event.top)}px · left ${Math.round(event.left)}px`,
    );
  }

  onP2Action(message: string): void {
    this.p2ActionMessage.set(message);
  }

  onChartDataSelect(selection: { index: number; datasetIndex?: number }): void {
    this.onP2Action(
      `Chart: ponto ${selection.index + 1}, dataset ${
        (selection.datasetIndex ?? 0) + 1
      }`,
    );
  }

  onTerminalCommand(command: string): void {
    this.terminalHistory.update((history) => {
      const lastIndex = history.length - 1;
      if (lastIndex < 0 || history[lastIndex]?.command !== command) {
        return history;
      }
      return history.map((line, index) =>
        index === lastIndex
          ? { ...line, output: 'Handled by the demo page; no shell was run.' }
          : line,
      );
    });
    this.onP2Action(`Terminal command received: ${command}`);
  }

  onCodeCopied(code: string): void {
    this.p2ActionMessage.set(`Código copiado · ${code.split('\n')[0]}`);
  }

  onMenubarItem(item: MenubarItem): void {
    this.onP2Action(`Menubar: ${item.label}`);
  }

  onContextMenuItem(item: ContextMenuItem): void {
    this.onP2Action(`Context menu: ${item.label}`);
  }

  onMenuItem(item: MenuItem): void {
    this.onP2Action(`Menu: ${item.label}`);
  }

  isMenuFamilyComponent(id = this.componentId): id is MenuFamilyId {
    return (
      id === 'tiered-menu' ||
      id === 'panel-menu' ||
      id === 'mega-menu' ||
      id === 'command-menu'
    );
  }

  onMenuFamilyState(state: Readonly<Record<string, unknown>>): void {
    this.menuFamilyState.set(state);
  }

  onNavigationItem(item: NavigationItem): void {
    this.navigationActiveId.set(item.id);
    this.onP2Action(`Navegação: ${item.label}`);
  }

  onTabMenuItem(item: TabMenuItem): void {
    this.tabMenuActiveItem.set(item);
    this.onP2Action(`Tab Menu: ${item.label}`);
  }

  onEditorInit(): void {
    this.editorInitialized.set(true);
  }

  onEditorTextChange(event: { html: string; text: string }): void {
    this.editorTextChange.set(event.text || 'Texto vazio.');
  }

  onEditorBlur(value: string): void {
    this.onP2Action(`Editor desfocado: ${value.length} caracteres`);
  }

  onSpeedDialAction(action: SpeedDialAction): void {
    this.onP2Action(`Speed dial: ${action.label}`);
  }

  onTagRemoved(label: string): void {
    this.onP2Action(`Tag removida: ${label}`);
  }

  onDataTableRow(row: Record<string, unknown>): void {
    this.onP2Action(`Linha selecionada: ${String(row['name'] ?? row['id'])}`);
  }

  sortDataView(order: 1 | -1): void {
    this.dataViewSortField.set('name');
    this.dataViewSortOrder.set(order);
    this.dataViewFirst.set(0);
    this.onP2Action(
      `DataView: nome ${order === 1 ? 'crescente' : 'decrescente'}`,
    );
  }

  onDataViewPage(event: { first: number; rows: number }): void {
    this.dataViewFirst.set(event.first);
    this.onP2Action(`DataView: página a partir de ${event.first + 1}`);
  }

  onDataViewLayout(layout: 'list' | 'grid'): void {
    this.dataViewLayout.set(layout);
    this.onP2Action(`DataView: layout ${layout}`);
  }

  onEmptyStateAction(): void {
    this.onP2Action('Empty state: ação acionada');
  }

  onVirtualRange(range: { start: number; end: number }): void {
    this.p2VirtualRange.set(range);
  }

  onOtpCompleted(value: string): void {
    this.onP2Action(`OTP concluído: ${value}`);
  }

  advanceProgress(): void {
    this.p2ProgressValue.update((value) => (value >= 100 ? 20 : value + 10));
  }

  resizeSplitter(delta: number): void {
    const left = this.p2SplitterSizes()[0] ?? 50;
    const nextLeft = Math.max(20, Math.min(80, left + delta));
    this.p2SplitterSizes.set([nextLeft, 100 - nextLeft]);
  }

  getStatusLabel(status: ComponentDoc['status']): string {
    return status === 'stable' ? 'Stable' : 'Beta';
  }

  getApiKindLabel(kind: ApiKind): string {
    return {
      input: 'input',
      model: 'model',
      output: 'output',
      directive: 'directive',
    }[kind];
  }
}
