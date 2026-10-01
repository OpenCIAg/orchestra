import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const POPOVER_CATALOG_ENTRY: ComponentEntry = {
  id: 'popover',
  name: 'Popover',
  description: 'Conteúdo contextual posicionado junto ao gatilho.',
  category: 'Overlay',
  status: 'stable',
  tags: ['popover', 'overlay', 'context'],
  icon: '💭',
  route: '/components/popover',
};

export const POPOVER_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/popover',
  usage: `<orc-popover placement="bottom" label="Detalhes da conta">
  <button popover-trigger type="button">Ver detalhes</button>
  <p>Conteúdo contextual.</p>
</orc-popover>`,
  guidance: `Use para detalhes ou ações relacionadas ao gatilho. Para mensagens curtas acionadas por hover, prefira Tooltip.`,
  variations: [
    {
      label: 'Bottom',
      description: 'Placement padrão para conteúdo abaixo do gatilho.',
    },
    {
      label: 'Top / right / left',
      description: 'Posições alternativas para evitar colisões.',
    },
    {
      label: 'Controlled',
      description: 'open pode ser ligado a um estado externo.',
    },
    {
      label: 'Dismiss',
      description: 'Escape e clique externo fecham o conteúdo.',
    },
  ],
};
