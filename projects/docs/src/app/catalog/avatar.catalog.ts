import type { ComponentEntry } from '../models/component-entry.model';

export const AVATAR_CATALOG_ENTRY: ComponentEntry = {
  id: 'avatar',
  name: 'Avatar',
  description: 'Representação visual de usuário com imagem, iniciais ou ícone.',
  category: 'Data Display',
  status: 'stable',
  tags: ['user', 'profile', 'image', 'avatar', 'foto', 'perfil'],
  icon: 'person',
  route: '/components/avatar',
};
