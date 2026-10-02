import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const DATA_VIEW_CATALOG_ENTRY: ComponentEntry = {
  id: 'data-view',
  name: 'DataView',
  description:
    'Coleção local em grade ou lista com filtro, ordenação controlada e paginação.',
  category: 'Data Display',
  status: 'beta',
  tags: ['data', 'grid', 'list', 'pagination', 'sort'],
  icon: '▦',
  route: '/components/data-view',
};

export const DATA_VIEW_USAGE_DOC: ComponentUsageDoc = {
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
  guidance: `No modo local, value é filtrado, ordenado e paginado no componente. Com lazy=true, o componente não busca nem ordena dados no servidor: o consumidor deve responder a onLazyLoad, atualizar value/totalRecords e decidir a ordenação remota; esta página demonstra apenas o contrato local verificado.`,
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
};
