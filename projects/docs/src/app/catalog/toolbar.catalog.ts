import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const TOOLBAR_CATALOG_ENTRY: ComponentEntry = {
  id: 'toolbar',
  name: 'Toolbar',
  description: 'Ações agrupadas com navegação roving por teclado.',
  category: 'Navigation',
  status: 'beta',
  tags: ['toolbar', 'actions', 'keyboard', 'roving'],
  icon: 'construction',
  route: '/components/toolbar',
};

export const TOOLBAR_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/toolbar',
  usage: `<orc-toolbar label="Ações de edição">
  <button orcToolbarItem type="button">Desfazer</button>
  <button orcToolbarItem type="button">Refazer</button>
</orc-toolbar>`,
  guidance: `Cada ação precisa ser um controle focável e receber orcToolbarItem. Use label para anunciar o grupo e disabled na diretiva para pular uma ação.`,
  variations: [
    {
      label: 'Horizontal',
      description: 'Setas esquerda e direita movem o foco.',
    },
    { label: 'Vertical', description: 'Setas cima e baixo movem o foco.' },
    {
      label: 'Disabled item',
      description: 'Ação desabilitada fica fora da sequência.',
    },
    { label: 'Loop off', description: 'Foco para no primeiro ou último item.' },
  ],
};
