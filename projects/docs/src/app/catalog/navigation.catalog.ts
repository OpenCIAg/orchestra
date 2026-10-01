import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const NAVIGATION_CATALOG_ENTRY: ComponentEntry = {
  id: 'navigation',
  name: 'Navigation Shell',
  description:
    'Shell de navegação responsivo com itens nativos, estado ativo e fechamento por Escape.',
  category: 'Navigation',
  status: 'beta',
  tags: ['navigation', 'sidebar', 'shell', 'keyboard'],
  icon: '☰',
  route: '/components/navigation',
};

export const NAVIGATION_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/navigation',
  usage: `<orc-navigation-shell
  [open]="navigationOpen"
  ariaLabel="Navegação principal"
  (requestClose)="navigationOpen = false"
>
  <orc-navigation-item
    [item]="item"
    [active]="item.id === activeId"
    (activated)="activeId = $event.id"
  />
</orc-navigation-shell>`,
  guidance: `Use NavigationShell como landmark nomeado e projete NavigationItem para cada destino. Em telas estreitas, open controla o drawer e requestClose responde ao backdrop ou Escape; active apenas marca o item atual.`,
  variations: [
    { label: 'Open shell', description: 'Shell aberto em viewport estreita.' },
    {
      label: 'Rail',
      description: 'Largura compacta para navegação persistente.',
    },
    {
      label: 'Active item',
      description: 'Item ativo com aria-current="page".',
    },
    { label: 'Disabled item', description: 'Ação bloqueada sem ativação.' },
  ],
};
