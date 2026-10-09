/**
 * Ponto de entrada do catálogo. NÃO liste famílias aqui: o catálogo é gerado
 * por `npm run docs:generate-registry` a partir de
 * `src/app/content/components/<id>/` (formato novo) e dos `<id>.catalog.ts`
 * antigos ainda não migrados. Veja docs/overhaul/GUIA-DOCS.md.
 */
export {
  CATALOG_ENTRIES,
  COMPONENT_USAGE_DOCS,
} from '../generated/docs-registry/catalog.generated';
