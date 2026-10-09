import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const TREE_CATALOG_ENTRY: ComponentEntry = {
  id: 'tree',
  name: 'Tree',
  description:
    'Hierarquia controlada com seleção, filtro, expansão e navegação por teclado.',
  category: 'Data Display',
  status: 'beta',
  tags: ['tree', 'hierarchy', 'selection', 'filter'],
  icon: 'park',
  route: '/components/tree',
};

export const TREE_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/tree',
  usage: `<orc-tree
  [nodes]="nodes"
  [(selected)]="selected"
  selectionMode="checkbox"
  [filter]="true"
  ariaLabel="Estrutura do workspace"
  (nodeSelect)="onNodeSelect($event)"
/>`,
  guidance: `Forneça key único por nó. Use selected para controlar a seleção, filter para revelar ramos que contêm correspondências e os eventos nodeSelect/nodeUnselect para reagir às mudanças. Nós com disabled=true não podem ser selecionados nem expandidos. Os inputs de compatibilidade sem implementação não fazem parte deste contrato documentado.`,
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
};
