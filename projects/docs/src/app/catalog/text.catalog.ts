import type { ComponentEntry } from '../models/component-entry.model';

export const TEXT_CATALOG_ENTRY: ComponentEntry = {
  id: 'text',
  name: 'Text',
  description: 'Primitiva textual com escala, tom muted e truncamento.',
  category: 'Typography',
  status: 'beta',
  tags: ['text', 'typography', 'copy'],
  icon: 'text_fields',
  route: '/components/text',
};
