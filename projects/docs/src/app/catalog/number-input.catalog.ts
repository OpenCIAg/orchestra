import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const NUMBER_INPUT_CATALOG_ENTRY: ComponentEntry = {
  id: 'number-input',
  name: 'Number Input',
  description: 'Entrada numérica com incremento, limites e precisão.',
  category: 'Inputs',
  status: 'beta',
  tags: ['number', 'stepper', 'input', 'quantity'],
  icon: '123',
  route: '/components/number-input',
};

export const NUMBER_INPUT_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/number-input',
  usage: `<orc-number-input
  label="Quantidade"
  [(value)]="quantity"
  [min]="1"
  [max]="100"
  suffix="itens"
/>`,
  guidance: `Use min, max e step para comunicar a regra ao navegador. precision controla a apresentação e o valor emitido já vem limitado ao intervalo.`,
  variations: [
    { label: 'Default', description: 'Entrada com controles − e +.' },
    {
      label: 'Error / success',
      description: 'Estados semânticos para validação.',
    },
    { label: 'Readonly', description: 'Valor visível sem permitir alteração.' },
    { label: 'Disabled', description: 'Entrada e controles bloqueados.' },
  ],
};
