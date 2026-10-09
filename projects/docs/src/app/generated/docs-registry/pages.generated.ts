// GERADO — não edite. Fonte: projects/docs/src/app/content/components/
// (formato novo) e os arquivos legacy de catalog/ e pages/components/.
// Regenere com `npm run docs:generate-registry` (tools/docs/generate-registry.mjs).

import type { ComponentPageLoader } from '../../models/component-page.model';

/** Uma entrada por diretório em content/components/. */
export const COMPONENT_PAGE_LOADERS: Readonly<
  Record<string, ComponentPageLoader>
> = {
  button: () => import('./pages/button.page.generated').then((m) => m.PAGE),
  modal: () => import('./pages/modal.page.generated').then((m) => m.PAGE),
  select: () => import('./pages/select.page.generated').then((m) => m.PAGE),
};
