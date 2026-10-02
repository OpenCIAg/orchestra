import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const KBD_CATALOG_ENTRY: ComponentEntry = {
  id: 'kbd',
  name: 'Kbd',
  description: 'Representação visual de teclas e atalhos.',
  category: 'Typography',
  status: 'beta',
  tags: ['keyboard', 'shortcut', 'kbd'],
  icon: '⌘',
  route: '/components/kbd',
};

export const KBD_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/kbd',
  usage: `<orc-kbd [keys]="['Ctrl', 'Shift', 'P']" ariaLabel="Control Shift P" />`,
  guidance: `Uma string em keys é separada por sinais de mais ou espaços em branco. Passe um array para preservar nomes de tecla com espaços, como Page Up. ariaLabel substitui o nome acessível quando contém texto não vazio; o componente não captura eventos de teclado.`,
  variations: [
    {
      label: 'Default chord',
      description: 'O padrão mostra a combinação ⌘ K em tokens separados.',
    },
    {
      label: 'Delimited string',
      description: 'Strings podem separar teclas com espaço ou +.',
    },
    {
      label: 'Explicit keys',
      description:
        'Arrays mantêm cada item em um token, incluindo nomes com espaço.',
    },
    {
      label: 'Accessible name',
      description:
        'ariaLabel fornece uma leitura natural opcional para a combinação.',
    },
  ],
};
