import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const TREE_VIEW_CATALOG_ENTRY: ComponentEntry = {
  id: 'tree-view',
  name: 'Tree View',
  description: 'Hierarquia expansível com navegação por teclado.',
  category: 'Data Display',
  status: 'stable',
  tags: ['tree', 'hierarchy', 'expand'],
  icon: '🌳',
  route: '/components/tree-view',
};

export const TREE_VIEW_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/tree-view',
  usage: `<orc-tree-view
  [nodes]="fileTree"
  label="Arquivos"
  (nodeSelect)="openNode($event)"
/>`,
  guidance: `Use ids únicos por nó. A expansão é mantida pelo próprio componente; a seleção é emitida para o consumidor decidir o que fazer.`,
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
};
