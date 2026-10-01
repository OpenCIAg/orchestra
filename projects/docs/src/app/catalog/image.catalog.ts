import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const IMAGE_CATALOG_ENTRY: ComponentEntry = {
  id: 'image',
  name: 'Image',
  description:
    'Imagem com fit, fallback, placeholder e estados de carregamento.',
  category: 'Data Display',
  status: 'beta',
  tags: ['image', 'media', 'fallback', 'visual'],
  icon: '🖼️',
  route: '/components/image',
};

export const IMAGE_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/image',
  usage: `<orc-image
  src="/assets/cover.png"
  fallbackSrc="/assets/fallback.png"
  alt="Capa do projeto"
  fit="cover"
/>`,
  guidance: `Sempre forneça alt. Use fallbackSrc quando uma alternativa real existir; passe placeholder quando quiser uma mensagem explícita para a ausência da imagem.`,
  variations: [
    { label: 'Cover', description: 'Preenche a caixa cortando o excesso.' },
    {
      label: 'Contain',
      description: 'Preserva a imagem inteira dentro da caixa.',
    },
    {
      label: 'Fallback',
      description: 'Tenta uma segunda origem quando a primeira falha.',
    },
    {
      label: 'Placeholder',
      description: 'Estado final quando não há origem válida.',
    },
    {
      label: 'Preview',
      description: 'Abre a imagem em um modal acessível com zoom e rotação.',
    },
  ],
};
