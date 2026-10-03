import type { ComponentEntry } from '../models/component-entry.model';

export const FILE_UPLOADER_CATALOG_ENTRY: ComponentEntry = {
  id: 'file-uploader',
  name: 'File Uploader',
  description:
    'Componente de envio de arquivos com suporte a arrastar e soltar (drag and drop).',
  category: 'Inputs',
  status: 'stable',
  tags: ['file', 'upload', 'drag', 'drop', 'arquivo', 'envio'],
  icon: 'upload_file',
  route: '/components/file-uploader',
};
