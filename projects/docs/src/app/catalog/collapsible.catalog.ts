import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const COLLAPSIBLE_CATALOG_ENTRY: ComponentEntry = {
  id: 'collapsible',
  name: 'Collapsible',
  description: 'Conteúdo progressivo com região nomeada e estado controlado.',
  category: 'Layout',
  status: 'beta',
  tags: ['collapse', 'expand', 'disclosure'],
  icon: 'keyboard_arrow_down',
  route: '/components/collapsible',
};

export const COLLAPSIBLE_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/collapsible',
  usage: `<orc-collapsible
  title="Detalhes de implementação"
  summary="Opcional"
  [(open)]="isOpen"
  [lazy]="true"
>
  Conteúdo progressivo.
</orc-collapsible>`,
  guidance: `Use title para comunicar o conteúdo escondido. lazy evita manter a região renderizada quando fechada; open continua sendo o estado fonte da verdade.`,
  variations: [
    { label: 'Closed', description: 'Apenas o trigger é visível.' },
    { label: 'Open', description: 'Região de conteúdo expandida.' },
    { label: 'Lazy', description: 'Remove o conteúdo quando fechado.' },
    { label: 'Disabled', description: 'Mantém o estado sem permitir toggle.' },
  ],
};
