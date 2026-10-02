import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const DIVIDER_CATALOG_ENTRY: ComponentEntry = {
  id: 'divider',
  name: 'Divider',
  description: 'Separador horizontal ou vertical com rótulo opcional.',
  category: 'Layout',
  status: 'beta',
  tags: ['divider', 'separator', 'layout'],
  icon: '—',
  route: '/components/divider',
};

export const DIVIDER_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/divider',
  usage: `<orc-divider label="Ou" [decorative]="false" />
<orc-divider orientation="vertical" variant="dashed" />`,
  guidance: `Use decorative=false quando o separador organiza a estrutura para tecnologia assistiva. Adicione label apenas quando houver significado para a leitura.`,
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
};
