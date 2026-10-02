import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const DRAWER_CATALOG_ENTRY: ComponentEntry = {
  id: 'drawer',
  name: 'Drawer',
  description: 'Painel lateral ou vertical com backdrop e dismiss.',
  category: 'Overlay',
  status: 'stable',
  tags: ['drawer', 'sheet', 'sidenav'],
  icon: '◧',
  route: '/components/drawer',
};

export const DRAWER_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/drawer',
  usage: `<orc-drawer
  [(open)]="drawerOpen"
  placement="right"
  label="Detalhes"
>
  <p drawer-title>Resumo</p>
  <button drawer-actions>Concluir</button>
</orc-drawer>`,
  guidance: `Use o drawer para conteúdo complementar, não para uma confirmação simples. Preserve um rótulo acessível e ofereça uma ação clara para fechar.`,
  variations: [
    { label: 'Right', description: 'Painel lateral padrão.' },
    {
      label: 'Left / top / bottom',
      description: 'Placement adapta a direção do painel.',
    },
    {
      label: 'Backdrop dismiss',
      description: 'Clique fora fecha quando habilitado.',
    },
    {
      label: 'Persistent',
      description: 'dismissible=false exige fechamento controlado.',
    },
  ],
};
