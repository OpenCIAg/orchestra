import type { ComponentEntry } from '../models/component-entry.model';

export const CODE_CATALOG_ENTRY: ComponentEntry = {
  id: 'code',
  name: 'Code',
  description: 'Bloco de código com linguagem, cópia e leitura preservada.',
  category: 'Data Display',
  status: 'beta',
  tags: ['code', 'snippet', 'copy'],
  icon: 'code',
  route: '/components/code',
};
