import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const TREE_TABLE_CATALOG_ENTRY: ComponentEntry = {
  id: 'tree-table',
  name: 'TreeTable',
  description:
    'Treegrid com colunas, seleção, filtro, ordenação e paginação local.',
  category: 'Data Display',
  status: 'beta',
  tags: ['tree', 'table', 'treegrid', 'selection'],
  icon: '▤',
  route: '/components/tree-table',
};

export const TREE_TABLE_USAGE_DOC: ComponentUsageDoc = {
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
  guidance: `Use columns com key/header para os campos de data e value com HierarchyNode[]. A tabela mantém role=treegrid, seleção por linha, ordenação de um campo, filtro local e paginação dos nós de topo.`,
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
};
