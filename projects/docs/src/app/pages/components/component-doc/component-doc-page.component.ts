import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AutocompleteComponent, AutocompleteOption } from '@ciag/orchestra/autocomplete';
import { CarouselComponent, CarouselItem } from '@ciag/orchestra/carousel';
import { ChipComponent } from '@ciag/orchestra/chip';
import { CollapsibleComponent } from '@ciag/orchestra/collapsible';
import { ColorPickerComponent } from '@ciag/orchestra/color-picker';
import { DatePickerComponent } from '@ciag/orchestra/date-picker';
import { DividerComponent } from '@ciag/orchestra/divider';
import { DrawerComponent } from '@ciag/orchestra/drawer';
import { DropdownComponent, DropdownItem } from '@ciag/orchestra/dropdown';
import { FileUploaderComponent } from '@ciag/orchestra/file-uploader';
import { FormComponent, FormSubmitEvent } from '@ciag/orchestra/form';
import { FormFieldComponent } from '@ciag/orchestra/form-field';
import { IconComponent } from '@ciag/orchestra/icon';
import type { IconFamily } from '@ciag/orchestra/icon';
import { ORC_MATERIAL_SYMBOLS } from '@ciag/orchestra/icons';
import { ImageComponent } from '@ciag/orchestra/image';
import { ListComponent, ListItem } from '@ciag/orchestra/list';
import { NumberInputComponent } from '@ciag/orchestra/number-input';
import { OtpInputComponent } from '@ciag/orchestra/otp-input';
import { PopoverComponent } from '@ciag/orchestra/popover';
import { ProgressBarComponent, ProgressCircleComponent } from '@ciag/orchestra/progress';
import { RadioButtonComponent, RadioGroupComponent } from '@ciag/orchestra/radio';
import { ScrollAreaComponent } from '@ciag/orchestra/scroll-area';
import { TimelineComponent, TimelineItem } from '@ciag/orchestra/timeline';
import { ToolbarComponent, ToolbarItemDirective } from '@ciag/orchestra/toolbar';
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
  TypographyComponent,
  VirtualScrollerComponent,
  VisuallyHiddenComponent,
} from '@ciag/orchestra/p2';
import type {
  ContextMenuItem,
  DataTableColumn,
  MenubarItem,
  P2Option,
  SpeedDialAction,
  SplitterPanel,
  TreeSelectNode,
} from '@ciag/orchestra/p2';
import { FooterComponent } from '../../../shared/footer/footer.component';

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

const input = (name: string, type: string, defaultValue: string, description: string): ApiEntry => ({ name, type, defaultValue, description, kind: 'input' });
const model = (name: string, type: string, defaultValue: string, description: string): ApiEntry => ({ name, type, defaultValue, description, kind: 'model' });
const output = (name: string, type: string, defaultValue: string, description: string): ApiEntry => ({ name, type, defaultValue, description, kind: 'output' });
const directive = (name: string, type: string, defaultValue: string, description: string): ApiEntry => ({ name, type, defaultValue, description, kind: 'directive' });

const COMPONENT_DOCS: Record<string, ComponentDoc> = {
  'date-picker': {
    id: 'date-picker', name: 'Date Picker', category: 'Inputs', status: 'stable',
    description: 'Campo de data acessível com calendário em popover, compatível com ControlValueAccessor, limites e mensagens de validação.',
    packagePath: '@ciag/orchestra/date-picker',
    usage: `<orc-date-picker\n  label="Data de entrega"\n  [(value)]="deliveryDate"\n  min="2026-01-01"\n  showIcon\n  showButtonBar\n  showClear\n  required\n/>`,
    guidance: 'Prefira limites explícitos quando a data fizer parte de uma regra de negócio. A mensagem de erro tem prioridade sobre o texto de ajuda.',
    variations: [
      { label: 'Default', description: 'Campo editável sem mensagem auxiliar.' },
      { label: 'Required + helper', description: 'Indica obrigatoriedade e orienta o preenchimento.' },
      { label: 'Error', description: 'Mensagem de erro com aria-invalid.' },
      { label: 'Disabled', description: 'Valor preservado, sem interação.' },
    ],
    api: [
      model('value', 'string', "''", 'Valor no formato ISO yyyy-MM-dd. Também funciona com [(ngModel)] ou Reactive Forms.'),
      input('label', 'string', "''", 'Texto visível associado ao campo.'),
      input('min', 'string', "''", 'Menor data aceita no formato ISO.'),
      input('max', 'string', "''", 'Maior data aceita no formato ISO.'),
      input('helperText', 'string', "''", 'Texto de apoio exibido quando error está vazio.'),
      input('error', 'string', "''", 'Mensagem de erro e estado inválido.'),
      input('required', 'boolean', 'false', 'Marca o campo como obrigatório.'),
      input('disabled', 'boolean', 'false', 'Desabilita o campo e o calendário.'),
      input('showIcon', 'boolean', 'false', 'Exibe o acionador de calendário integrado ao campo.'),
      input('showButtonBar', 'boolean', 'false', 'Exibe a ação Today no rodapé do calendário.'),
      input('showClear', 'boolean', 'false', 'Exibe a ação Clear no rodapé do calendário.'),
    ],
  },
  'form-field': {
    id: 'form-field', name: 'Form Field', category: 'Inputs', status: 'stable',
    description: 'Wrapper semântico para reunir label, controle, ajuda e erro em uma composição de formulário consistente.',
    packagePath: '@ciag/orchestra/form-field',
    usage: `<orc-form-field\n  label="Nome do projeto"\n  helperText="Use um nome curto"\n  [required]="true"\n>\n  <input type="text" />\n</orc-form-field>`,
    guidance: 'Coloque o controle real dentro do wrapper. Use error para o estado inválido; helperText é usado como fallback quando não há erro.',
    variations: [
      { label: 'Default', description: 'Label e controle sem mensagem adicional.' },
      { label: 'Required', description: 'Exibe o indicador de obrigatoriedade.' },
      { label: 'Helper text', description: 'Orienta o usuário sem interromper o fluxo.' },
      { label: 'Error', description: 'Mensagem de erro com role=alert.' },
    ],
    api: [
      input('label', 'string', "''", 'Texto do label renderizado acima do controle.'),
      input('helperText', 'string', "''", 'Mensagem de apoio exibida quando error não foi informado.'),
      input('error', 'string', "''", 'Mensagem de validação; substitui helperText.'),
      input('required', 'boolean', 'false', 'Exibe o asterisco de campo obrigatório.'),
    ],
  },
  menu: {
    id: 'menu', name: 'Menu', category: 'Navigation', status: 'stable',
    description: 'Alias canônico do Dropdown para ações contextuais, com itens desabilitados, perigosos, atalhos e submenus.',
    packagePath: '@ciag/orchestra/menu',
    usage: `<orc-dropdown [items]="items" placement="bottom-start">\n  <button type="button" (click)="menu.toggle()">Ações</button>\n</orc-dropdown>`,
    guidance: 'Menu exporta a mesma implementação de Dropdown. Mantenha o gatilho como um botão e trate itemSelect para executar a ação selecionada.',
    variations: [
      { label: 'Default', description: 'Lista de ações aberta a partir de um botão.' },
      { label: 'Disabled item', description: 'Item visível, mas não acionável.' },
      { label: 'Danger item', description: 'Ação destrutiva com tratamento visual.' },
      { label: 'Keyboard navigation', description: 'Escape, Home, End e setas navegam a lista.' },
    ],
    api: [
      input('items', 'DropdownItem[]', '[]', 'Itens com label, icon, shortcut, disabled, danger, divider, action e children.'),
      input('placement', 'string', "'bottom-start'", 'Posicionamento conectado ao gatilho: bottom-start, bottom-end, top-start ou top-end.'),
      output('itemSelect', 'DropdownItem', '—', 'Emite o item escolhido antes de fechar o menu.'),
    ],
  },
  drawer: {
    id: 'drawer', name: 'Drawer', category: 'Overlay', status: 'stable',
    description: 'Painel sobreposto responsivo para conteúdo complementar, com backdrop, Escape e quatro posições de abertura.',
    packagePath: '@ciag/orchestra/drawer',
    usage: `<orc-drawer\n  [(open)]="drawerOpen"\n  placement="right"\n  label="Detalhes"\n>\n  <p drawer-title>Resumo</p>\n  <button drawer-actions>Concluir</button>\n</orc-drawer>`,
    guidance: 'Use o drawer para conteúdo complementar, não para uma confirmação simples. Preserve um rótulo acessível e ofereça uma ação clara para fechar.',
    variations: [
      { label: 'Right', description: 'Painel lateral padrão.' },
      { label: 'Left / top / bottom', description: 'Placement adapta a direção do painel.' },
      { label: 'Backdrop dismiss', description: 'Clique fora fecha quando habilitado.' },
      { label: 'Persistent', description: 'dismissible=false exige fechamento controlado.' },
    ],
    api: [
      model('open', 'boolean', 'false', 'Controla a visibilidade do painel.'),
      input('placement', "'left' | 'right' | 'top' | 'bottom'", "'right'", 'Lado a partir do qual o painel entra.'),
      input('label', 'string', "'Painel lateral'", 'Nome acessível do dialog.'),
      input('closeOnBackdrop', 'boolean', 'true', 'Fecha ao clicar no backdrop.'),
      input('dismissible', 'boolean', 'true', 'Permite fechar por Escape e pelas ações internas.'),
      output('closed', 'void', '—', 'Emite depois que o painel é fechado.'),
    ],
  },
  popover: {
    id: 'popover', name: 'Popover', category: 'Overlay', status: 'stable',
    description: 'Conteúdo contextual posicionado junto ao gatilho, com abertura controlada, Escape e fechamento ao clicar fora.',
    packagePath: '@ciag/orchestra/popover',
    usage: `<orc-popover placement="bottom" label="Detalhes da conta">\n  <button popover-trigger type="button">Ver detalhes</button>\n  <p>Conteúdo contextual.</p>\n</orc-popover>`,
    guidance: 'Use para detalhes ou ações relacionadas ao gatilho. Para mensagens curtas acionadas por hover, prefira Tooltip.',
    variations: [
      { label: 'Bottom', description: 'Placement padrão para conteúdo abaixo do gatilho.' },
      { label: 'Top / right / left', description: 'Posições alternativas para evitar colisões.' },
      { label: 'Controlled', description: 'open pode ser ligado a um estado externo.' },
      { label: 'Dismiss', description: 'Escape e clique externo fecham o conteúdo.' },
    ],
    api: [
      model('open', 'boolean', 'false', 'Estado de abertura controlado.'),
      input('placement', "'top' | 'right' | 'bottom' | 'left'", "'bottom'", 'Direção do conteúdo em relação ao gatilho.'),
      input('label', 'string', "'Conteúdo adicional'", 'Nome acessível da região de diálogo.'),
    ],
  },
  list: {
    id: 'list', name: 'List', category: 'Data Display', status: 'stable',
    description: 'Lista acessível para itens com descrição, seleção simples ou múltipla, estados desabilitados e vazio.',
    packagePath: '@ciag/orchestra/list',
    usage: `<orc-list\n  [items]="projects"\n  selection="single"\n  label="Projetos"\n  (itemSelect)="selectProject($event)"\n/>`,
    guidance: 'Use ids estáveis nos itens e mantenha a seleção no estado da aplicação. A lista expõe role=listbox e cada item expõe role=option.',
    variations: [
      { label: 'No selection', description: 'Lista informativa sem aria-selected.' },
      { label: 'Single selection', description: 'Uma opção ativa por vez.' },
      { label: 'Multiple selection', description: 'Expõe aria-multiselectable.' },
      { label: 'Disabled + empty', description: 'Itens indisponíveis e fallback sem resultados.' },
    ],
    api: [
      input('items', 'ListItem[]', '[]', 'Itens com id, label, description, disabled e selected.'),
      input('label', 'string', "'Lista'", 'Nome acessível do listbox.'),
      input('selection', "'none' | 'single' | 'multiple'", "'none'", 'Define como a seleção é anunciada.'),
      output('itemSelect', 'ListItem', '—', 'Emite o item ativado, exceto quando disabled.'),
    ],
  },
  'tree-view': {
    id: 'tree-view', name: 'Tree View', category: 'Data Display', status: 'stable',
    description: 'Hierarquia expansível com níveis visíveis, navegação por teclado e suporte a nós desabilitados.',
    packagePath: '@ciag/orchestra/tree-view',
    usage: `<orc-tree-view\n  [nodes]="fileTree"\n  label="Arquivos"\n  (nodeSelect)="openNode($event)"\n/>`,
    guidance: 'Use ids únicos por nó. A expansão é mantida pelo próprio componente; a seleção é emitida para o consumidor decidir o que fazer.',
    variations: [
      { label: 'Collapsed', description: 'Nós com filhos mostram o controle de expansão.' },
      { label: 'Expanded', description: 'Setas direita e esquerda expandem ou recolhem.' },
      { label: 'Disabled node', description: 'Nó visível que não pode ser ativado.' },
      { label: 'Keyboard', description: 'Enter, Space e setas mantêm a navegação acessível.' },
    ],
    api: [
      input('nodes', 'TreeNode[]', '[]', 'Nós com id, label, children e disabled.'),
      input('label', 'string', "'Árvore'", 'Nome acessível da árvore.'),
      output('nodeSelect', 'TreeNode', '—', 'Emite o nó ativado por clique, Enter ou Space.'),
    ],
  },
  autocomplete: {
    id: 'autocomplete', name: 'Autocomplete', category: 'Inputs', status: 'beta',
    description: 'Combobox com filtragem local, seleção por teclado, valor controlado e estados de ajuda, erro e desabilitado.',
    packagePath: '@ciag/orchestra/autocomplete',
    usage: `<orc-autocomplete\n  label="Cidade"\n  [options]="cities"\n  [(value)]="city"\n  [minChars]="2"\n  clearable\n/>`,
    guidance: 'Forneça labels compreensíveis e use minChars quando a lista for grande. O valor emitido é o value da opção, não o texto visível.',
    variations: [
      { label: 'Default', description: 'Filtra ao digitar e abre a lista ao focar.' },
      { label: 'minChars', description: 'A lista só abre depois do número mínimo de caracteres.' },
      { label: 'Error', description: 'Mensagem de erro anunciada pelo campo.' },
      { label: 'Disabled / clearable', description: 'Bloqueia edição ou permite limpar o valor.' },
    ],
    api: [
      input('id', 'string', "''", 'Id explícito; um id único é gerado quando omitido.'),
      input('name', 'string', "''", 'Nome para integração com formulários nativos.'),
      input('label', 'string', "''", 'Label visível do combobox.'),
      input('placeholder', 'string', "'Comece a digitar...'", 'Texto exibido antes da primeira entrada.'),
      input('helperText', 'string', "''", 'Mensagem auxiliar.'),
      input('errorMessage', 'string', "''", 'Mensagem de erro e aria-invalid.'),
      input('options', 'AutocompleteOption[]', '[]', 'Opções com value, label, description e disabled.'),
      input('minChars', 'number', '0', 'Quantidade mínima de caracteres para filtrar.'),
      input('clearable', 'boolean', 'true', 'Exibe ação para limpar a seleção.'),
      input('disabled', 'boolean', 'false', 'Desabilita o combobox.'),
      input('required', 'boolean', 'false', 'Marca a entrada como obrigatória.'),
      input('ariaLabel', 'string', "''", 'Nome acessível alternativo ao label.'),
      model('value', 'string | null', 'null', 'Valor selecionado, sincronizado por model ou ControlValueAccessor.'),
      output('optionSelected', 'AutocompleteOption', '—', 'Emite a opção escolhida.'),
    ],
  },
  'number-input': {
    id: 'number-input', name: 'Number Input', category: 'Inputs', status: 'beta',
    description: 'Entrada numérica com controles de incremento, limites, step, precisão, prefixo/sufixo e estados de validação.',
    packagePath: '@ciag/orchestra/number-input',
    usage: `<orc-number-input\n  label="Quantidade"\n  [(value)]="quantity"\n  [min]="1"\n  [max]="100"\n  suffix="itens"\n/>`,
    guidance: 'Use min, max e step para comunicar a regra ao navegador. precision controla a apresentação e o valor emitido já vem limitado ao intervalo.',
    variations: [
      { label: 'Default', description: 'Entrada com controles − e +.' },
      { label: 'Error / success', description: 'Estados semânticos para validação.' },
      { label: 'Readonly', description: 'Valor visível sem permitir alteração.' },
      { label: 'Disabled', description: 'Entrada e controles bloqueados.' },
    ],
    api: [
      input('id', 'string', "''", 'Id explícito; um id único é gerado quando omitido.'),
      input('name', 'string', "''", 'Nome para formulários nativos.'),
      input('label', 'string', "''", 'Label visível.'),
      input('placeholder', 'string', "''", 'Texto de apoio quando o valor está vazio.'),
      input('helperText', 'string', "''", 'Mensagem auxiliar.'),
      input('errorMessage', 'string', "''", 'Mensagem de erro e estado aria-invalid.'),
      input('status', "'default' | 'error' | 'success'", "'default'", 'Tratamento visual do campo.'),
      input('size', "'sm' | 'md' | 'lg'", "'md'", 'Tamanho visual.'),
      input('min', 'number | undefined', 'undefined', 'Menor valor aceito.'),
      input('max', 'number | undefined', 'undefined', 'Maior valor aceito.'),
      input('step', 'number', '1', 'Incremento dos controles e das setas.'),
      input('precision', 'number | undefined', 'undefined', 'Casas decimais usadas na apresentação.'),
      input('prefix', 'string', "''", 'Texto antes do valor.'),
      input('suffix', 'string', "''", 'Texto depois do valor.'),
      input('disabled', 'boolean', 'false', 'Desabilita entrada e controles.'),
      input('readonly', 'boolean', 'false', 'Mantém o valor sem edição.'),
      input('required', 'boolean', 'false', 'Marca a entrada como obrigatória.'),
      input('showControls', 'boolean', 'true', 'Exibe os botões de incremento e decremento.'),
      input('ariaLabel', 'string', "''", 'Nome acessível alternativo ao label.'),
      model('value', 'number | null', 'null', 'Valor numérico controlado e compatível com formulários.'),
      output('valueChange', 'number | null', '—', 'Emite o novo valor depois de uma alteração.'),
      output('blur', 'FocusEvent', '—', 'Emite quando a entrada perde o foco.'),
    ],
  },
  'color-picker': {
    id: 'color-picker', name: 'Color Picker', category: 'Inputs', status: 'beta',
    description: 'Seletor de cor com presets, input nativo, valor hexadecimal e estado controlado para temas e tokens.',
    packagePath: '@ciag/orchestra/color-picker',
    usage: `<orc-color-picker\n  label="Cor de destaque"\n  [(value)]="accent"\n  [presets]="brandColors"\n/>`,
    guidance: 'O valor válido é hexadecimal de 3 ou 6 dígitos. Para evitar perda de contexto, mantenha a label e use presets alinhados ao sistema de tokens.',
    variations: [
      { label: 'Default', description: 'Trigger com swatch, valor e presets.' },
      { label: 'Custom presets', description: 'Paleta reduzida ou específica do produto.' },
      { label: 'No text input', description: 'Somente swatch e seletor nativo.' },
      { label: 'Disabled / clearable', description: 'Bloqueia ou remove o valor atual.' },
    ],
    api: [
      input('id', 'string', "''", 'Id explícito; um id único é gerado quando omitido.'),
      input('label', 'string', "''", 'Label visível.'),
      model('value', 'string', "'#1C6AED'", 'Cor hexadecimal de 3 ou 6 dígitos.'),
      input('size', "'sm' | 'md' | 'lg'", "'md'", 'Tamanho visual do trigger.'),
      input('presets', 'string[]', 'brand presets', 'Cores rápidas disponíveis na paleta.'),
      input('disabled', 'boolean', 'false', 'Desabilita o seletor.'),
      input('clearable', 'boolean', 'true', 'Exibe a ação para remover a cor.'),
      input('showInput', 'boolean', 'true', 'Exibe o campo hexadecimal no painel.'),
      input('ariaLabel', 'string', "'Escolher cor'", 'Nome acessível do trigger.'),
      output('colorChange', 'string', '—', 'Emite a nova cor depois de uma seleção.'),
    ],
  },
  chip: {
    id: 'chip', name: 'Chip', category: 'Data Display', status: 'beta',
    description: 'Rótulo compacto para categorias, filtros e entidades, com variantes semânticas, seleção e remoção.',
    packagePath: '@ciag/orchestra/chip',
    usage: `<orc-chip\n  label="Angular"\n  variant="primary"\n  [selectable]="true"\n  [removable]="true"\n/>`,
    guidance: 'Use chips para atributos compactos, não para ações primárias. Quando removível, trate removed para atualizar a coleção de origem.',
    variations: [
      { label: 'Neutral / primary', description: 'Variantes para conteúdo neutro ou ativo.' },
      { label: 'Success / warning / danger', description: 'Estados semânticos para status.' },
      { label: 'Selectable', description: 'Toggle controlado por selected.' },
      { label: 'Removable / disabled', description: 'Ação de remoção ou estado inerte.' },
    ],
    api: [
      input('label', 'string', "''", 'Texto principal do chip.'),
      input('value', 'string | number', "''", 'Valor emitido ao remover; usa label como fallback.'),
      input('variant', "'neutral' | 'primary' | 'success' | 'warning' | 'danger'", "'neutral'", 'Cor semântica.'),
      input('size', "'sm' | 'md' | 'lg'", "'md'", 'Tamanho visual.'),
      input('selectable', 'boolean', 'false', 'Transforma o chip em opção alternável.'),
      input('removable', 'boolean', 'false', 'Exibe o botão de remoção.'),
      input('disabled', 'boolean', 'false', 'Bloqueia seleção e remoção.'),
      model('selected', 'boolean', 'false', 'Estado controlado de seleção.'),
      output('removed', 'string | number', '—', 'Emite value ou label quando o usuário remove o chip.'),
    ],
  },
  collapsible: {
    id: 'collapsible', name: 'Collapsible', category: 'Layout', status: 'beta',
    description: 'Disclosure controlado para revelar conteúdo progressivamente, com região nomeada, lazy rendering e estado desabilitado.',
    packagePath: '@ciag/orchestra/collapsible',
    usage: `<orc-collapsible\n  title="Detalhes de implementação"\n  summary="Opcional"\n  [(open)]="isOpen"\n  [lazy]="true"\n>\n  Conteúdo progressivo.\n</orc-collapsible>`,
    guidance: 'Use title para comunicar o conteúdo escondido. lazy evita manter a região renderizada quando fechada; open continua sendo o estado fonte da verdade.',
    variations: [
      { label: 'Closed', description: 'Apenas o trigger é visível.' },
      { label: 'Open', description: 'Região de conteúdo expandida.' },
      { label: 'Lazy', description: 'Remove o conteúdo quando fechado.' },
      { label: 'Disabled', description: 'Mantém o estado sem permitir toggle.' },
    ],
    api: [
      input('id', 'string', "''", 'Id explícito para ids de trigger e região.'),
      input('title', 'string', "''", 'Título do trigger.'),
      input('summary', 'string', "''", 'Texto auxiliar ao lado do título.'),
      model('open', 'boolean', 'false', 'Estado expandido controlado.'),
      input('disabled', 'boolean', 'false', 'Bloqueia a alternância.'),
      input('lazy', 'boolean', 'false', 'Só renderiza o conteúdo enquanto aberto.'),
      output('toggleChange', 'boolean', '—', 'Emite o novo estado depois de alternar.'),
    ],
  },
  carousel: {
    id: 'carousel', name: 'Carousel', category: 'Data Display', status: 'beta',
    description: 'Slides navegáveis com indicadores, loop, autoplay e suporte a teclado para conteúdo visual ou editorial.',
    packagePath: '@ciag/orchestra/carousel',
    usage: `<orc-carousel\n  [items]="slides"\n  [(activeIndex)]="currentSlide"\n  [loop]="true"\n  [showIndicators]="true"\n/>`,
    guidance: 'Forneça alt quando um slide tiver imagem e mantenha poucos slides relacionados. Autoplay deve ser usado com parcimônia e sempre permitir navegação manual.',
    variations: [
      { label: 'Default', description: 'Setas e indicadores visíveis.' },
      { label: 'No loop', description: 'Desabilita navegação além dos limites.' },
      { label: 'Autoplay', description: 'Avança no intervalo configurado.' },
      { label: 'Vertical / disabled slide', description: 'Muda eixo ou impede um slide específico.' },
    ],
    api: [
      input('items', 'CarouselItem[]', '[]', 'Slides com label, description, image, alt e disabled.'),
      model('activeIndex', 'number', '0', 'Índice do slide ativo.'),
      input('orientation', "'horizontal' | 'vertical'", "'horizontal'", 'Eixo de navegação e layout.'),
      input('loop', 'boolean', 'true', 'Volta ao início ao chegar ao fim.'),
      input('autoplay', 'boolean', 'false', 'Avança automaticamente quando há mais de um item.'),
      input('interval', 'number', '5000', 'Intervalo do autoplay em milissegundos.'),
      input('showArrows', 'boolean', 'true', 'Exibe os controles anterior/próximo.'),
      input('showIndicators', 'boolean', 'true', 'Exibe os indicadores de slide.'),
      input('ariaLabel', 'string', "'Carousel'", 'Nome acessível do conjunto.'),
      output('slideChange', '{ index, item }', '—', 'Emite depois de mudar o slide.'),
    ],
  },
  divider: {
    id: 'divider', name: 'Divider', category: 'Layout', status: 'beta',
    description: 'Separador horizontal ou vertical com estilos solid, dashed e dotted e rótulo opcional.',
    packagePath: '@ciag/orchestra/divider',
    usage: `<orc-divider label="Ou" [decorative]="false" />\n<orc-divider orientation="vertical" variant="dashed" />`,
    guidance: 'Use decorative=false quando o separador organiza a estrutura para tecnologia assistiva. Adicione label apenas quando houver significado para a leitura.',
    variations: [
      { label: 'Solid', description: 'Regra padrão para separar blocos.' },
      { label: 'Dashed / dotted', description: 'Tratamentos visuais alternativos.' },
      { label: 'Labeled', description: 'Texto centralizado entre as linhas.' },
      { label: 'Vertical / inset', description: 'Separador de colunas com recuo opcional.' },
    ],
    api: [
      input('orientation', "'horizontal' | 'vertical'", "'horizontal'", 'Direção do separador.'),
      input('variant', "'solid' | 'dashed' | 'dotted'", "'solid'", 'Estilo da linha.'),
      input('label', 'string', "''", 'Texto opcional no centro do separador.'),
      input('inset', 'boolean', 'false', 'Aplica recuo visual nas extremidades.'),
      input('decorative', 'boolean', 'true', 'Quando true, oculta o separador da árvore acessível.'),
      input('ariaLabel', 'string', "''", 'Nome acessível quando decorative=false e label está vazio.'),
    ],
  },
  image: {
    id: 'image', name: 'Image', category: 'Data Display', status: 'beta',
    description: 'Imagem com object-fit, fallback, placeholder, loading nativo, raio e eventos de carregamento ou erro.',
    packagePath: '@ciag/orchestra/image',
    usage: `<orc-image\n  src="/assets/cover.png"\n  fallbackSrc="/assets/fallback.png"\n  alt="Capa do projeto"\n  fit="cover"\n/>`,
    guidance: 'Sempre forneça alt. Use fallbackSrc quando uma alternativa real existir; caso contrário, deixe o placeholder comunicar a ausência da imagem.',
    variations: [
      { label: 'Cover', description: 'Preenche a caixa cortando o excesso.' },
      { label: 'Contain', description: 'Preserva a imagem inteira dentro da caixa.' },
      { label: 'Fallback', description: 'Tenta uma segunda origem quando a primeira falha.' },
      { label: 'Placeholder', description: 'Estado final quando não há origem válida.' },
    ],
    api: [
      input('src', 'string', "''", 'Origem principal da imagem.'),
      input('alt', 'string', "''", 'Texto alternativo para a imagem.'),
      input('fallbackSrc', 'string', "''", 'Origem alternativa usada depois de um erro.'),
      input('fit', "'contain' | 'cover' | 'fill' | 'none' | 'scale-down'", "'cover'", 'Valor de object-fit.'),
      input('width', 'string | number', "''", 'Largura da figura.'),
      input('height', 'string | number', "''", 'Altura da figura.'),
      input('loading', "'eager' | 'lazy'", "'lazy'", 'Estratégia de carregamento nativo.'),
      input('radius', "'none' | 'sm' | 'md' | 'lg' | 'full'", "'md'", 'Raio visual da figura.'),
      input('placeholder', 'string', "'Imagem indisponível'", 'Texto do estado sem origem renderizável.'),
      input('ariaLabel', 'string', "''", 'Nome acessível alternativo ao alt.'),
      output('loaded', 'void', '—', 'Emite quando a origem atual carrega.'),
      output('error', 'Event', '—', 'Emite quando a origem principal e o fallback falham.'),
    ],
  },
  timeline: {
    id: 'timeline', name: 'Timeline', category: 'Navigation', status: 'beta',
    description: 'Linha do tempo para eventos sequenciais com datas, ícones, status e orientação vertical ou horizontal.',
    packagePath: '@ciag/orchestra/timeline',
    usage: `<orc-timeline\n  [items]="events"\n  orientation="vertical"\n  ariaLabel="Histórico do pedido"\n  (itemSelect)="openEvent($event)"\n/>`,
    guidance: 'Use status para comunicar progresso sem depender apenas de cor. Mantenha títulos curtos e datas consistentes dentro da mesma timeline.',
    variations: [
      { label: 'Completed', description: 'Evento concluído com marca visual de sucesso.' },
      { label: 'Current', description: 'Etapa atual em destaque.' },
      { label: 'Pending / error', description: 'Próximas etapas ou falhas explícitas.' },
      { label: 'Horizontal', description: 'Linha compacta para fluxos com poucas etapas.' },
    ],
    api: [
      input('items', 'TimelineItem[]', '[]', 'Itens com title, description, date, icon, status e id.'),
      input('orientation', "'vertical' | 'horizontal'", "'vertical'", 'Orientação visual.'),
      input('ariaLabel', 'string', "'Timeline'", 'Nome acessível da sequência.'),
      output('itemSelect', '{ item, index }', '—', 'Emite quando um item é ativado por clique, Enter ou Space.'),
    ],
  },
  toolbar: {
    id: 'toolbar', name: 'Toolbar', category: 'Navigation', status: 'beta',
    description: 'Grupo de ações com roving tabindex e navegação por setas, Home e End.',
    packagePath: '@ciag/orchestra/toolbar',
    usage: `<orc-toolbar label="Ações de edição">\n  <button orcToolbarItem type="button">Desfazer</button>\n  <button orcToolbarItem type="button">Refazer</button>\n</orc-toolbar>`,
    guidance: 'Cada ação precisa ser um controle focável e receber orcToolbarItem. Use label para anunciar o grupo e disabled na diretiva para pular uma ação.',
    variations: [
      { label: 'Horizontal', description: 'Setas esquerda e direita movem o foco.' },
      { label: 'Vertical', description: 'Setas cima e baixo movem o foco.' },
      { label: 'Disabled item', description: 'Ação desabilitada fica fora da sequência.' },
      { label: 'Loop off', description: 'Foco para no primeiro ou último item.' },
    ],
    api: [
      input('orientation', "'horizontal' | 'vertical'", "'horizontal'", 'Direção visual e das setas.'),
      input('label', 'string', "'Toolbar'", 'Nome acessível do grupo de ações.'),
      input('loop', 'boolean', 'true', 'Volta ao primeiro item ao ultrapassar o último.'),
      directive('orcToolbarItem', 'attribute directive', '—', 'Registra um controle na sequência roving.'),
      directive('disabled', 'boolean', 'false', 'Na diretiva, remove o item desabilitado da navegação.'),
    ],
  },
  icon: {
    id: 'icon', name: 'Icon', category: 'Utility', status: 'beta',
    description: 'Wrapper conciso para os mais de 3.900 Material Symbols do Google Fonts, com família e eixos variáveis controlados por inputs.',
    packagePath: '@ciag/orchestra/icon',
    usage: `import { IconComponent } from '@ciag/orchestra/icon';\n\n<orc-icon\n  name="check_circle"\n  size="md"\n  ariaLabel="Concluído"\n/>`,
    guidance: 'Ícones decorativos devem permanecer sem ariaLabel. Quando o ícone comunica uma ação ou estado sem texto, forneça um nome acessível. O componente carrega a fonte diretamente do Google Fonts; permita fonts.googleapis.com e fonts.gstatic.com na CSP.',
    variations: [
      { label: 'Catalog', description: 'Catálogo completo de Material Symbols Rounded, atualizado a partir dos metadados oficiais do Google.' },
      { label: 'Families', description: 'Outlined, Rounded ou Sharp com o mesmo nome de ligadura.' },
      { label: 'Sizes', description: 'xs, sm, md, lg, xl ou um número em pixels.' },
      { label: 'Axes', description: 'Fill, weight, grade e opticalSize são controlados sem CSS adicional.' },
      { label: 'Decorative / labeled', description: 'Semântica definida por ariaLabel e title.' },
    ],
    api: [
      input('name', 'string', "'circle'", 'Nome snake_case da ligadura do Google Material Symbols.'),
      input('family', "'outlined' | 'rounded' | 'sharp'", "'rounded'", 'Família visual do Material Symbols.'),
      input('size', "IconSize | number", "'md'", 'Tamanho semântico ou valor em pixels.'),
      input('fill', "'outline' | 'filled'", "'outline'", 'Eixo FILL: 0 para outline e 1 para filled.'),
      input('weight', 'number', '400', 'Eixo wght entre 100 e 700.'),
      input('grade', 'number', '0', 'Eixo GRAD entre -50 e 200.'),
      input('opticalSize', "number | 'auto'", "'auto'", 'Eixo opsz entre 20 e 48; auto acompanha o tamanho do texto.'),
      input('ariaLabel', 'string', "''", 'Nome acessível; vazio mantém o ícone decorativo.'),
      input('title', 'string', "''", 'Título nativo opcional e fallback do nome acessível.'),
    ],
  },
  'scroll-area': {
    id: 'scroll-area', name: 'Scroll Area', category: 'Utility', status: 'beta',
    description: 'Viewport com overflow controlado, sombras de direção, scrollbar tematizado e evento de rolagem.',
    packagePath: '@ciag/orchestra/scroll-area',
    usage: `<orc-scroll-area\n  maxHeight="240px"\n  orientation="vertical"\n  label="Notas do projeto"\n>\n  Conteúdo longo...\n</orc-scroll-area>`,
    guidance: 'Defina maxHeight ou maxWidth para criar o viewport. O conteúdo continua sendo fornecido por ng-content e pode conter qualquer markup.',
    variations: [
      { label: 'Vertical', description: 'Rolagem e sombras no eixo vertical.' },
      { label: 'Horizontal', description: 'Útil para tabelas ou código extenso.' },
      { label: 'Both', description: 'Viewport com os dois eixos.' },
      { label: 'Always visible', description: 'Mantém a scrollbar aparente.' },
    ],
    api: [
      input('orientation', "'vertical' | 'horizontal' | 'both'", "'vertical'", 'Eixos que podem rolar.'),
      input('maxHeight', 'string | number', "'240px'", 'Altura máxima do viewport.'),
      input('maxWidth', 'string | number', "''", 'Largura máxima do viewport.'),
      input('alwaysShowScrollbar', 'boolean', 'false', 'Mantém a scrollbar visível.'),
      input('label', 'string', "'Scrollable content'", 'Nome acessível do viewport.'),
      output('scrolled', '{ top, left }', '—', 'Emite as coordenadas depois de uma rolagem.'),
    ],
  },
  form: {
    id: 'form', name: 'Form', category: 'Inputs', status: 'beta',
    description: 'Wrapper standalone para formulário com layout, submit validado, reset tipado e estado disabled.',
    packagePath: '@ciag/orchestra/form',
    usage: `<orc-form\n  ariaLabel="Cadastro de projeto"\n  (formSubmit)="save($event)"\n>\n  <input name="project" required />\n  <button type="submit">Salvar</button>\n</orc-form>`,
    guidance: 'Os controles entram por content projection. formSubmit informa se a validação nativa passou; use novalidate=false apenas quando quiser manter a UI nativa do navegador.',
    variations: [
      { label: 'Stacked', description: 'Layout vertical para formulários padrão.' },
      { label: 'Inline', description: 'Layout compacto para filtros e ações curtas.' },
      { label: 'Invalid submit', description: 'Impede o fluxo e reporta a validação nativa.' },
      { label: 'Disabled / reset', description: 'Fieldset bloqueado e evento de reset disponível.' },
    ],
    api: [
      input('layout', "'stacked' | 'inline'", "'stacked'", 'Layout do fieldset projetado.'),
      input('name', 'string', "''", 'Nome do formulário nativo.'),
      input('ariaLabel', 'string', "'Formulário'", 'Nome acessível do formulário.'),
      input('disabled', 'boolean', 'false', 'Desabilita todos os controles descendentes.'),
      input('novalidate', 'boolean', 'true', 'Controla o atributo novalidate do formulário.'),
      output('formSubmit', 'FormSubmitEvent', '—', 'Emite o SubmitEvent e o resultado valid.'),
      output('formReset', 'void', '—', 'Emite quando o formulário é resetado.'),
    ],
  },
};

const P2_DOC_SEEDS: Record<string, readonly [string, string, string]> = {
  'button-group': ['Button Group', 'Utility', 'Agrupa ações relacionadas em uma composição acessível.'],
  calendar: ['Calendar', 'Data Display', 'Calendário controlado para seleção e navegação por datas.'],
  code: ['Code', 'Data Display', 'Bloco de código com linguagem e cópia para a área de transferência.'],
  combobox: ['Combobox', 'Inputs', 'Entrada pesquisável com seleção, teclado e estados vazios.'],
  dropdown: ['Dropdown', 'Utility', 'Menu de ações posicionado junto ao gatilho.'],
  'file-upload': ['File Upload', 'Inputs', 'Alias canônico para upload com seleção e drag-and-drop.'],
  grid: ['Grid', 'Layout', 'Layout responsivo em colunas com largura mínima configurável.'],
  kbd: ['Kbd', 'Typography', 'Representação visual de teclas e atalhos.'],
  link: ['Link', 'Typography', 'Link semântico com estados de foco, desabilitado e externo.'],
  menubar: ['Menubar', 'Navigation', 'Barra de menus com navegação por setas e atalhos.'],
  splitter: ['Splitter', 'Layout', 'Estrutura de painéis redimensionáveis em orientação horizontal ou vertical.'],
  tag: ['Tag', 'Data Display', 'Rótulo semântico removível para entidades e filtros.'],
  typography: ['Typography', 'Typography', 'Primitiva tipográfica com escala, peso e truncamento.'],
  'aspect-ratio': ['Aspect Ratio', 'Layout', 'Mantém uma proporção previsível para conteúdo responsivo.'],
  container: ['Container', 'Layout', 'Container centralizado com largura máxima e padding.'],
  'floating-action-button': ['Floating Action Button', 'Utility', 'Ação primária flutuante com estado estendido e loading.'],
  'hover-card': ['Hover Card', 'Data Display', 'Conteúdo contextual aberto por hover ou foco.'],
  portal: ['Portal', 'Utility', 'Ponto de composição para conteúdo que pode ser movido pelo consumidor.'],
  'segmented-control': ['Segmented Control', 'Utility', 'Seleção compacta entre opções mutuamente exclusivas.'],
  separator: ['Separator', 'Layout', 'Separador visual e semântico para seções de conteúdo.'],
  stack: ['Stack', 'Layout', 'Primitiva flexível para empilhar elementos com alinhamento previsível.'],
  'visually-hidden': ['Visually Hidden', 'Utility', 'Conteúdo disponível para tecnologias assistivas sem ocupar espaço visual.'],
  box: ['Box', 'Layout', 'Primitiva de superfície para padding, margem, fundo e raio.'],
  'close-button': ['Close Button', 'Utility', 'Ação compacta e nomeada para fechar overlays e mensagens.'],
  'context-menu': ['Context Menu', 'Navigation', 'Menu acionado pelo botão direito com posição contextual.'],
  'data-table': ['Data Table', 'Data Display', 'Tabela acessível com ordenação, seleção, loading e estado vazio.'],
  'date-input': ['Date Input', 'Inputs', 'Campo de data nativo com limites e integração a formulários.'],
  'empty-state': ['Empty State', 'Feedback', 'Mensagem de ausência de dados com ação opcional.'],
  flex: ['Flex', 'Layout', 'Primitiva flexível para direção, alinhamento, gap e wrapping.'],
  'input-group': ['Input Group', 'Inputs', 'Composição de controle com prefixo e sufixo semântico.'],
  listbox: ['Listbox', 'Data Display', 'Lista selecionável com modo simples ou múltiplo e teclado.'],
  'multi-select': ['Multi Select', 'Inputs', 'Seleção múltipla com lista de opções e valores controlados.'],
  space: ['Space', 'Layout', 'Utilitário de espaçamento em linha ou coluna.'],
  'speed-dial': ['Speed Dial', 'Utility', 'Ações secundárias agrupadas a partir de um gatilho flutuante.'],
  'tags-input': ['Tags Input', 'Inputs', 'Campo de tags com sugestões, remoção e integração a formulários.'],
  text: ['Text', 'Typography', 'Primitiva textual com escala, tom muted e truncamento.'],
  'tree-select': ['Tree Select', 'Inputs', 'Seleção em uma hierarquia expansível.'],
  'virtual-scroller': ['Virtual Scroller', 'Utility', 'Viewport eficiente para listas grandes com overscan e range.'],
};

const P2_COMPONENT_DOCS: Record<string, ComponentDoc> = Object.entries(P2_DOC_SEEDS).reduce((docs, [id, [name, category, description]]) => {
  const selector = id === 'file-upload' ? 'orc-file-uploader' : `orc-${id}`;
  docs[id] = {
    id,
    name,
    category,
    status: 'beta',
    description,
    packagePath: `@ciag/orchestra/${id}`,
    usage: `<${selector}\n  aria-label="${name}"\n/>`,
    guidance: 'Use a API controlada, mantenha o nome acessível explícito e valide teclado, foco visível, estados vazios e responsividade antes de publicar.',
    variations: [
      { label: 'Default', description: 'Composição base com tokens semânticos.' },
      { label: 'Keyboard + focus', description: 'Interação por teclado e foco visível fazem parte do contrato.' },
      { label: 'Disabled / loading', description: 'Estados de bloqueio permanecem anunciados e previsíveis.' },
      { label: 'Responsive', description: 'A composição preserva legibilidade em larguras menores.' },
    ],
    api: [
      input('label', 'string', "''", 'Nome acessível ou texto de apoio do componente.'),
      input('disabled', 'boolean', 'false', 'Desabilita a interação quando aplicável.'),
      output('change', 'unknown', '—', 'Evento emitido quando o estado controlado muda, quando aplicável.'),
    ],
  };
  return docs;
}, {} as Record<string, ComponentDoc>);

const ALL_COMPONENT_DOCS: Record<string, ComponentDoc> = { ...COMPONENT_DOCS, ...P2_COMPONENT_DOCS };

@Component({
  selector: 'app-component-doc-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FooterComponent,
    AutocompleteComponent,
    CarouselComponent,
    ChipComponent,
    CollapsibleComponent,
    ColorPickerComponent,
    DatePickerComponent,
    DividerComponent,
    DrawerComponent,
    DropdownComponent,
    FileUploaderComponent,
    FormComponent,
    FormFieldComponent,
    IconComponent,
    ImageComponent,
    ListComponent,
    NumberInputComponent,
    OtpInputComponent,
    PopoverComponent,
    ProgressBarComponent,
    ProgressCircleComponent,
    RadioButtonComponent,
    RadioGroupComponent,
    ScrollAreaComponent,
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

  readonly componentId = this.route.snapshot.paramMap.get('componentId') ?? 'date-picker';
  readonly doc = ALL_COMPONENT_DOCS[this.componentId] ?? COMPONENT_DOCS['date-picker'];

  readonly dateValue = signal('2026-08-17');
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
  readonly iconSymbols = ORC_MATERIAL_SYMBOLS;
  readonly iconQuery = signal('');
  readonly iconFill = signal<'outline' | 'filled'>('outline');
  readonly iconFamily = signal<IconFamily>('rounded');
  readonly filteredIconMetadata = computed(() => {
    const query = this.iconQuery().trim().toLowerCase();
    return ORC_MATERIAL_SYMBOLS
      .filter((entry) => !query || entry.name.includes(query) || (entry.tags ?? []).some((tag) => tag.toLowerCase().includes(query)))
      .slice(0, 48);
  });

  iconDeclaration(name: string): string {
    const fill = this.iconFill() === 'filled' ? ' fill="filled"' : '';
    const family = this.iconFamily() === 'rounded' ? '' : ` family="${this.iconFamily()}"`;
    return `<orc-icon name="${name}"${family}${fill} ariaLabel="${name}" />`;
  }

  async copyIconDeclaration(name: string): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(this.iconDeclaration(name));
    } catch {
      // Clipboard access can be unavailable outside a secure browser context.
    }
  }

  readonly cities: AutocompleteOption[] = [
    { value: 'sp', label: 'São Paulo', description: 'Brasil' },
    { value: 'rj', label: 'Rio de Janeiro', description: 'Brasil' },
    { value: 'lisbon', label: 'Lisboa', description: 'Portugal' },
    { value: 'madrid', label: 'Madrid', description: 'Espanha', disabled: true },
  ];

  readonly menuItems: DropdownItem[] = [
    { id: 'edit', label: 'Editar', shortcut: 'E' },
    { id: 'share', label: 'Compartilhar' },
    { id: 'divider', label: '', divider: true },
    { id: 'delete', label: 'Excluir projeto', danger: true },
  ];

  readonly listItems = signal<ListItem[]>([
    { id: 'design', label: 'Design System', description: '12 componentes', selected: true },
    { id: 'docs', label: 'Documentação', description: 'Em revisão' },
    { id: 'archive', label: 'Arquivo antigo', disabled: true },
  ]);

  readonly emptyList: ListItem[] = [];

  readonly treeNodes: TreeNode[] = [
    { id: 'workspace', label: 'Workspace', children: [
      { id: 'apps', label: 'Aplicações', children: [{ id: 'docs-app', label: 'Docs' }] },
      { id: 'packages', label: 'Pacotes' },
    ] },
    { id: 'settings', label: 'Configurações', disabled: true },
  ];

  readonly slides: CarouselItem[] = [
    { id: 'one', label: 'Composição', description: 'Combine estados sem perder clareza.' },
    { id: 'two', label: 'Acessibilidade', description: 'Teclado e semântica fazem parte da API.' },
    { id: 'three', label: 'Escala', description: 'Tokens consistentes em qualquer produto.' },
    { id: 'four', label: 'Indisponível', description: 'Este slide demonstra um item disabled.', disabled: true },
  ];

  readonly timelineItems: TimelineItem[] = [
    { id: 'done', title: 'Definição', description: 'Requisitos alinhados.', date: 'Concluído', status: 'completed', icon: '✓' },
    { id: 'current', title: 'Implementação', description: 'Componente em uso.', date: 'Atual', status: 'current', icon: '2' },
    { id: 'next', title: 'Revisão', description: 'Acessibilidade e testes.', date: 'Próximo', status: 'pending', icon: '3' },
    { id: 'error', title: 'Publicação', description: 'Aguardando correção.', date: 'Bloqueado', status: 'error', icon: '!' },
  ];

  readonly imageSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="640" height="320" viewBox="0 0 640 320"%3E%3Crect width="640" height="320" rx="24" fill="%231C6AED"/%3E%3Ccircle cx="520" cy="70" r="140" fill="%231CEDB9" fill-opacity=".75"/%3E%3Ccircle cx="85" cy="285" r="150" fill="%236A1CED" fill-opacity=".65"/%3E%3Ctext x="48" y="178" fill="white" font-family="Arial,sans-serif" font-size="48" font-weight="700"%3EOrchestra%3C/text%3E%3C/svg%3E';
  readonly colorPresets = ['#1C6AED', '#0406AB', '#FF6A1C', '#1CEDB9'];

  readonly p2CalendarValue = signal('2026-08-17');
  readonly p2ComboboxValue = signal<string | null>('angular');
  readonly p2DateInputValue = signal('2026-08-17');
  readonly p2ListboxValue = signal<string | null>('design');
  readonly p2MultiSelectValue = signal<string[]>(['tokens', 'a11y']);
  readonly p2SegmentedValue = signal<string | null>('all');
  readonly p2TagsValue = signal<string[]>(['Angular', 'A11y']);
  readonly p2TreeSelectValue = signal<string | null>(null);
  readonly p2OtpValue = signal('314159');
  readonly p2RadioValue = signal('design');
  readonly p2ProgressValue = signal(72);
  readonly p2SplitterSizes = signal<number[]>([42, 58]);
  readonly p2SelectedRows = signal<Record<string, unknown>[]>([]);
  readonly p2ActionMessage = signal('Nenhuma ação emitida ainda.');
  readonly p2VirtualRange = signal({ start: 0, end: 0 });

  readonly p2Options: P2Option<string>[] = [
    { value: 'angular', label: 'Angular', description: 'Framework principal' },
    { value: 'react', label: 'React', description: 'Ecossistema de UI' },
    { value: 'vue', label: 'Vue', description: 'Aplicações progressivas' },
    { value: 'legacy', label: 'Legacy', description: 'Opção indisponível', disabled: true },
  ];

  readonly p2SegmentedOptions: P2Option<string>[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativos' },
    { value: 'archived', label: 'Arquivados' },
  ];

  readonly p2TreeSelectNodes: TreeSelectNode[] = [
    { value: 'workspace', label: 'Workspace', children: [
      { value: 'apps', label: 'Aplicações', children: [
        { value: 'docs', label: 'Docs' },
        { value: 'admin', label: 'Admin' },
      ] },
      { value: 'packages', label: 'Pacotes' },
    ] },
    { value: 'settings', label: 'Configurações', disabled: true },
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
    { id: 'calendar', name: 'Calendar', category: 'Data Display', status: 'Ready' },
    { id: 'combobox', name: 'Combobox', category: 'Inputs', status: 'Beta' },
    { id: 'data-table', name: 'Data Table', category: 'Data Display', status: 'Ready' },
    { id: 'tree-select', name: 'Tree Select', category: 'Inputs', status: 'Beta' },
  ];

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
      case 'date-picker': return { value: this.dateValue(), state: 'controlled' };
      case 'autocomplete': return { value: this.selectedCity(), state: 'selected value' };
      case 'number-input': return { value: this.quantity(), state: 'bounded 1–10' };
      case 'color-picker': return { value: this.accent(), state: 'hexadecimal' };
      case 'chip': return { selected: this.chipSelected(), removed: this.removedChip() || null };
      case 'collapsible': return { open: this.collapsibleOpen(), state: 'controlled' };
      case 'carousel': return { activeIndex: this.carouselIndex(), total: this.slides.length };
      case 'drawer': return { open: this.drawerOpen(), placement: 'right' };
      case 'list': return { selected: this.selectedListItem(), items: this.listItems().length };
      case 'tree-view': return { selected: this.selectedTreeNode(), state: 'keyboard-ready' };
      case 'timeline': return { selected: this.selectedTimelineItem(), state: 'event sequence' };
      case 'form': return { submit: this.formMessage() || 'not submitted' };
      case 'image': return { state: this.imageMessage() };
      case 'scroll-area': return { state: this.scrollMessage() };
      case 'calendar': return { value: this.p2CalendarValue(), state: 'controlled calendar' };
      case 'combobox': return { value: this.p2ComboboxValue(), options: this.p2Options.length };
      case 'date-input': return { value: this.p2DateInputValue(), state: 'native date input' };
      case 'listbox': return { value: this.p2ListboxValue(), state: 'keyboard-ready listbox' };
      case 'multi-select': return { values: this.p2MultiSelectValue(), state: 'multiple selection' };
      case 'tags-input': return { tags: this.p2TagsValue(), state: 'controlled tags' };
      case 'tree-select': return { value: this.p2TreeSelectValue(), state: 'hierarchical selection' };
      case 'segmented-control': return { value: this.p2SegmentedValue(), state: 'exclusive selection' };
      case 'otp-input': return { value: this.p2OtpValue(), state: 'verification code' };
      case 'radio': return { value: this.p2RadioValue(), state: 'exclusive selection' };
      case 'progress': return { value: this.p2ProgressValue(), state: 'determinate' };
      case 'data-table': return { selected: this.p2SelectedRows().length, rows: this.p2TableRows.length };
      case 'virtual-scroller': return { range: this.p2VirtualRange(), total: this.p2VirtualItems.length };
      case 'splitter': return { sizes: this.p2SplitterSizes(), state: 'panel layout' };
      case 'code':
      case 'link':
      case 'tag':
      case 'menubar':
      case 'context-menu':
      case 'speed-dial':
      case 'empty-state':
      case 'close-button':
      case 'floating-action-button': return { state: this.p2ActionMessage() };
      default: return { state: 'interactive preview', component: this.doc.name };
    }
  };

  selectListItem(item: ListItem): void {
    this.selectedListItem.set(item.id);
    this.listItems.update(items => items.map(current => ({ ...current, selected: current.id === item.id })));
  }

  selectTreeNode(node: TreeNode): void { this.selectedTreeNode.set(node.id); }

  selectTimelineItem(event: { item: TimelineItem; index: number }): void {
    this.selectedTimelineItem.set(String(event.item.id ?? event.index));
  }

  removeChip(value: string | number): void { this.removedChip.set(String(value)); }

  onFormSubmit(result: FormSubmitEvent): void {
    this.formMessage.set(result.valid ? 'Formulário válido.' : 'Revise os campos obrigatórios.');
  }

  onFormReset(): void { this.formMessage.set('Formulário resetado.'); }

  onImageLoad(): void { this.imageMessage.set('Imagem carregada.'); }

  onImageError(): void { this.imageMessage.set('Origem e fallback falharam.'); }

  onScroll(event: { top: number; left: number }): void {
    this.scrollMessage.set(`top ${Math.round(event.top)}px · left ${Math.round(event.left)}px`);
  }

  onP2Action(message: string): void { this.p2ActionMessage.set(message); }

  onCodeCopied(code: string): void {
    this.p2ActionMessage.set(`Código copiado · ${code.split('\n')[0]}`);
  }

  onMenubarItem(item: MenubarItem): void { this.onP2Action(`Menubar: ${item.label}`); }

  onContextMenuItem(item: ContextMenuItem): void { this.onP2Action(`Context menu: ${item.label}`); }

  onSpeedDialAction(action: SpeedDialAction): void { this.onP2Action(`Speed dial: ${action.label}`); }

  onTagRemoved(label: string): void {
    this.onP2Action(`Tag removida: ${label}`);
  }

  onDataTableRow(row: Record<string, unknown>): void {
    this.onP2Action(`Linha selecionada: ${String(row['name'] ?? row['id'])}`);
  }

  onEmptyStateAction(): void { this.onP2Action('Empty state: ação acionada'); }

  onVirtualRange(range: { start: number; end: number }): void { this.p2VirtualRange.set(range); }

  onOtpCompleted(value: string): void { this.onP2Action(`OTP concluído: ${value}`); }

  advanceProgress(): void { this.p2ProgressValue.update(value => value >= 100 ? 20 : value + 10); }

  resizeSplitter(delta: number): void {
    const left = this.p2SplitterSizes()[0] ?? 50;
    const nextLeft = Math.max(20, Math.min(80, left + delta));
    this.p2SplitterSizes.set([nextLeft, 100 - nextLeft]);
  }

  getStatusLabel(status: ComponentDoc['status']): string { return status === 'stable' ? 'Stable' : 'Beta'; }

  getApiKindLabel(kind: ApiKind): string {
    return { input: 'input', model: 'model', output: 'output', directive: 'directive' }[kind];
  }
}
