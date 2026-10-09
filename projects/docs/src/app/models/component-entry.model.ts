import type { FamilyGroup } from './component-page.model';

/** Categoria do catálogo antigo (`catalog/<id>.catalog.ts`), em transição. */
export type ComponentCategory =
  | 'Inputs'
  | 'Navigation'
  | 'Feedback'
  | 'Data Display'
  | 'Overlay'
  | 'Layout'
  | 'Typography'
  | 'Utility';

export type ComponentStatus = 'stable' | 'beta' | 'experimental' | 'deprecated';

/**
 * Entrada do catálogo como escrita à mão no formato antigo. O registro
 * gerado (`generated/docs-registry/catalog.generated.ts`) completa `group` e
 * `source`; famílias no formato novo vêm de `content/components/<id>/`.
 */
export interface ComponentEntry {
  id: string;
  name: string;
  description: string;
  /** Só no formato antigo; o formato novo usa `group`. */
  category?: ComponentCategory;
  status: ComponentStatus;
  tags: string[];
  icon: string; // Material Symbol name, rendered by <orc-icon>
  route?: string;
}

/** Entrada do registro gerado: catálogo + grupo de navegação + origem. */
export interface RegistryEntry extends ComponentEntry {
  readonly group: FamilyGroup;
  /** `content`: página nova (template único); `legacy`: página antiga. */
  readonly source: 'content' | 'legacy';
  readonly route: string;
}
