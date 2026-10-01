import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const DATE_PICKER_CATALOG_ENTRY: ComponentEntry = {
  id: 'date-picker',
  name: 'Date Picker',
  description: 'Seleção de datas em popover com validação e formulários.',
  category: 'Inputs',
  status: 'stable',
  tags: ['date', 'calendar', 'data'],
  icon: '📅',
  route: '/components/date-picker',
};

export const DATE_PICKER_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/date-picker',
  usage: `<orc-date-picker
  label="Data de entrega"
  [(value)]="deliveryDate"
  min="2026-01-01"
  showIcon
  showButtonBar
  showClear
  required
/>`,
  guidance: `Prefira limites explícitos quando a data fizer parte de uma regra de negócio. A mensagem de erro tem prioridade sobre o texto de ajuda.`,
  variations: [
    { label: 'Default', description: 'Campo editável sem mensagem auxiliar.' },
    {
      label: 'Required + helper',
      description: 'Indica obrigatoriedade e orienta o preenchimento.',
    },
    { label: 'Error', description: 'Mensagem de erro com aria-invalid.' },
    { label: 'Disabled', description: 'Valor preservado, sem interação.' },
  ],
};
