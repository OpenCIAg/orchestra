import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const TIMELINE_CATALOG_ENTRY: ComponentEntry = {
  id: 'timeline',
  name: 'Timeline',
  description: 'Eventos sequenciais com estados, datas e orientação adaptável.',
  category: 'Navigation',
  status: 'beta',
  tags: ['timeline', 'events', 'steps', 'history'],
  icon: '◉',
  route: '/components/timeline',
};

export const TIMELINE_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/timeline',
  usage: `<orc-timeline
  [items]="events"
  orientation="vertical"
  ariaLabel="Histórico do pedido"
  (itemSelect)="openEvent($event)"
/>`,
  guidance: `Use status para comunicar progresso sem depender apenas de cor. Mantenha títulos curtos e datas consistentes dentro da mesma timeline.`,
  variations: [
    {
      label: 'Completed',
      description: 'Evento concluído com marca visual de sucesso.',
    },
    { label: 'Current', description: 'Etapa atual em destaque.' },
    {
      label: 'Pending / error',
      description: 'Próximas etapas ou falhas explícitas.',
    },
    {
      label: 'Horizontal',
      description: 'Linha compacta para fluxos com poucas etapas.',
    },
  ],
};
