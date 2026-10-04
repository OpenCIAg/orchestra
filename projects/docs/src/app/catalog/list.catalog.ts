import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const LIST_CATALOG_ENTRY: ComponentEntry = {
  id: 'list',
  name: 'List',
  description: 'Lista acessível com estados de seleção e vazio.',
  category: 'Data Display',
  status: 'stable',
  tags: ['list', 'selection', 'empty'],
  icon: 'format_list_bulleted',
  route: '/components/list',
};

export const LIST_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/list',
  usage: `<orc-list
  [items]="projects"
  selection="single"
  label="Projetos"
  (itemSelect)="selectProject($event)"
/>`,
  guidance: `Use ids estáveis nos itens e mantenha a seleção no estado da aplicação. A lista expõe role=listbox e cada item expõe role=option.`,
  variations: [
    {
      label: 'No selection',
      description: 'Lista informativa sem aria-selected.',
    },
    { label: 'Single selection', description: 'Uma opção ativa por vez.' },
    { label: 'Multiple selection', description: 'Expõe aria-multiselectable.' },
    {
      label: 'Disabled + empty',
      description: 'Itens indisponíveis e fallback sem resultados.',
    },
  ],
};
