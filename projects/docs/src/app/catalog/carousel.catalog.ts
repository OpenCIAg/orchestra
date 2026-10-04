import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const CAROUSEL_CATALOG_ENTRY: ComponentEntry = {
  id: 'carousel',
  name: 'Carousel',
  description: 'Slides navegáveis com indicadores, loop e suporte a teclado.',
  category: 'Data Display',
  status: 'beta',
  tags: ['carousel', 'slider', 'slides', 'content'],
  icon: 'view_carousel',
  route: '/components/carousel',
};

export const CAROUSEL_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/carousel',
  usage: `<orc-carousel
  [items]="slides"
  [(activeIndex)]="currentSlide"
  [loop]="true"
  [showIndicators]="true"
/>`,
  guidance: `Forneça alt quando um slide tiver imagem e mantenha poucos slides relacionados. Autoplay deve ser usado com parcimônia e sempre permitir navegação manual.`,
  variations: [
    { label: 'Default', description: 'Setas e indicadores visíveis.' },
    { label: 'No loop', description: 'Desabilita navegação além dos limites.' },
    { label: 'Autoplay', description: 'Avança no intervalo configurado.' },
    {
      label: 'Vertical / disabled slide',
      description: 'Muda eixo ou impede um slide específico.',
    },
  ],
};
