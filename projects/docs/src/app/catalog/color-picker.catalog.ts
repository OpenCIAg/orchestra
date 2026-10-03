import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const COLOR_PICKER_CATALOG_ENTRY: ComponentEntry = {
  id: 'color-picker',
  name: 'Color Picker',
  description:
    'Seleção de cores com campo nativo, presets e valor hexadecimal.',
  category: 'Inputs',
  status: 'beta',
  tags: ['color', 'picker', 'palette', 'hex'],
  icon: 'palette',
  route: '/components/color-picker',
};

export const COLOR_PICKER_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/color-picker',
  usage: `<orc-color-picker
  label="Cor de destaque"
  [(value)]="accent"
  [presets]="brandColors"
/>`,
  guidance: `O valor válido é hexadecimal de 3 ou 6 dígitos. Para evitar perda de contexto, mantenha a label e use presets alinhados ao sistema de tokens.`,
  variations: [
    { label: 'Default', description: 'Trigger com swatch, valor e presets.' },
    {
      label: 'Custom presets',
      description: 'Paleta reduzida ou específica do produto.',
    },
    { label: 'No text input', description: 'Somente swatch e seletor nativo.' },
    {
      label: 'Disabled / clearable',
      description: 'Bloqueia ou remove o valor atual.',
    },
  ],
};
