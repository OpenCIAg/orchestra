import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const COMMAND_MENU_CATALOG_ENTRY: ComponentEntry = {
  id: 'command-menu',
  name: 'CommandMenu',
  description:
    'Paleta pesquisável de comandos com listbox e atalhos de teclado.',
  category: 'Navigation',
  status: 'beta',
  tags: ['command', 'search', 'keyboard', 'listbox'],
  icon: 'keyboard_command_key',
  route: '/components/command-menu',
};

export const COMMAND_MENU_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/p2',
  usage: `<orc-command-menu
  [items]="commands"
  label="Ações do projeto"
  searchAriaLabel="Buscar comandos"
  (itemSelect)="run($event)"
/>`,
  guidance: `O filtro considera label e keywords. ArrowUp/ArrowDown/Home/End movem a opção ativa e Enter seleciona o comando habilitado; itens disabled permanecem visíveis e não são ativados.`,
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
};
