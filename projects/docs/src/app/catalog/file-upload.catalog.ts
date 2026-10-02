import type { ComponentEntry } from '../models/component-entry.model';

export const FILE_UPLOAD_CATALOG_ENTRY: ComponentEntry = {
  id: 'file-upload',
  name: 'File Upload',
  description: 'Alias canônico para upload com seleção e drag-and-drop.',
  category: 'Inputs',
  status: 'beta',
  tags: ['file', 'upload', 'drop'],
  icon: '↑',
  route: '/components/file-upload',
};
