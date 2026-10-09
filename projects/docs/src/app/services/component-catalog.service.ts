import { Injectable, computed, signal } from '@angular/core';
import { CATALOG_ENTRIES, COMPONENT_USAGE_DOCS } from '../catalog';
import { docsUi } from '../i18n/docs-ui';
import type { RegistryEntry } from '../models/component-entry.model';
import {
  FAMILY_GROUP_ORDER,
  type FamilyGroup,
} from '../models/component-page.model';

/** Valor do filtro "todas as categorias". */
export const ALL_GROUPS = 'all';

/** Rótulos das categorias antigas (`category`), ainda exibidos pela página genérica. */
const LEGACY_CATEGORY_LABELS: Record<string, string> = {
  Inputs: 'Entradas',
  Navigation: 'Navegação',
  Feedback: 'Feedback',
  'Data Display': 'Exibição de dados',
  Overlay: 'Overlay',
  Layout: 'Layout',
  Typography: 'Tipografia',
  Utility: 'Utilitários',
};

/** Rótulo pt-BR de um grupo de navegação ou de uma categoria antiga. */
export function categoryLabel(category: string): string {
  if (category === ALL_GROUPS) return 'Todos';
  const groups = docsUi().groups as Record<string, string>;
  return groups[category] ?? LEGACY_CATEGORY_LABELS[category] ?? category;
}

/**
 * Catálogo pesquisável da home e da página genérica antiga. Os dados vêm do
 * registro gerado (`npm run docs:generate-registry`), nunca de listas à mão.
 */
@Injectable({ providedIn: 'root' })
export class ComponentCatalogService {
  private readonly _query = signal('');
  private readonly _selectedCategory = signal<string>(ALL_GROUPS);

  readonly query = this._query.asReadonly();
  readonly selectedCategory = this._selectedCategory.asReadonly();

  private readonly entriesById = new Map<string, RegistryEntry>(
    CATALOG_ENTRIES.map((entry) => [entry.id, entry]),
  );

  /** `all` + os grupos com ao menos uma família, na ordem da navegação. */
  readonly allCategories = computed<string[]>(() => [
    ALL_GROUPS,
    ...FAMILY_GROUP_ORDER.filter((group) =>
      CATALOG_ENTRIES.some((entry) => entry.group === group),
    ),
  ]);

  readonly filteredComponents = computed(() => {
    const q = this._query().toLowerCase().trim();
    const group = this._selectedCategory();

    return CATALOG_ENTRIES.filter((component) => {
      const matchesGroup = group === ALL_GROUPS || component.group === group;
      if (!q) return matchesGroup;

      const matchesSearch =
        component.name.toLowerCase().includes(q) ||
        component.description.toLowerCase().includes(q) ||
        component.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchesGroup && matchesSearch;
    });
  });

  byId(id: string): RegistryEntry | undefined {
    return this.entriesById.get(id);
  }

  usageDoc(id: string) {
    return COMPONENT_USAGE_DOCS[id];
  }

  setQuery(q: string): void {
    this._query.set(q);
  }

  setCategory(cat: FamilyGroup | typeof ALL_GROUPS | string): void {
    this._selectedCategory.set(cat);
  }
}
