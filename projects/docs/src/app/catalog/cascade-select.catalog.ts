import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const CASCADE_SELECT_CATALOG_ENTRY: ComponentEntry = {
  id: 'cascade-select',
  name: 'Cascade Select',
  description:
    'Seleciona opções hierárquicas em níveis com filtro e navegação por teclado.',
  category: 'Inputs',
  status: 'beta',
  tags: ['cascade', 'select', 'hierarchy', 'tree', 'filter'],
  icon: 'account_tree',
  route: '/components/cascade-select',
};

export const CASCADE_SELECT_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/cascade-select',
  usage: `<orc-cascade-select
  [options]="destinations"
  [(value)]="selectedDestination"
  label="Destino"
  placeholder="Escolha um destino"
  [filter]="true"
/>`,
  guidance: `Use valores únicos nas folhas. As setas para a direita e para a esquerda avançam entre níveis; Escape fecha o painel e devolve o foco ao acionador.`,
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
};
