import type { ComponentEntry } from '../models/component-entry.model';

export const INPUT_CATALOG_ENTRY: ComponentEntry = {
  id: 'input',
  name: 'Input',
  description:
    'Campo de texto para captura de dados do usuário com suporte a máscaras e validação.',
  category: 'Inputs',
  status: 'stable',
  tags: ['text', 'form', 'campo', 'formulário', 'entry'],
  icon: '✏️',
  route: '/components/input',
};
