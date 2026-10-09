import type { ResolveFn } from '@angular/router';
import { COMPONENT_API_LOADERS } from '../../generated/component-api.registry.generated';
import type { ComponentApiMember } from '../../models/component-api.model';

/**
 * Peças usadas pelas rotas geradas em
 * `generated/docs-registry/routes.generated.ts`. A página só ativa depois que
 * o DOC, os exemplos e a API da família foram carregados (resolvers), então o
 * template renderiza de forma síncrona — inclusive o `<h1>`.
 */
export const loadComponentPage = () =>
  import('./component-page.component').then((m) => m.ComponentPageComponent);

/** API gerada da família indicada em `data.componentId` (vazia se não houver). */
export const resolveComponentApi: ResolveFn<readonly ComponentApiMember[]> = (
  route,
) => {
  const id = route.data['componentId'] as string;
  const loader = COMPONENT_API_LOADERS[id];
  return loader ? loader() : Promise.resolve([]);
};
