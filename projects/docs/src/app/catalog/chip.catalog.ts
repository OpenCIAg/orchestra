import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const CHIP_CATALOG_ENTRY: ComponentEntry = {
  id: 'chip',
  name: 'Chip',
  description:
    'Rótulo compacto selecionável ou removível para filtros e entidades.',
  category: 'Data Display',
  status: 'beta',
  tags: ['chip', 'tag', 'filter', 'pill'],
  icon: '🏷️',
  route: '/components/chip',
};

export const CHIP_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/chip',
  usage: `<orc-chip
  label="Angular"
  variant="primary"
  [selectable]="true"
  [removable]="true"
/>`,
  guidance: `Use chips para atributos compactos, não para ações primárias. Quando removível, trate removed para atualizar a coleção de origem.`,
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
};
