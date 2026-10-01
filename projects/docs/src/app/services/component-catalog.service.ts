import { Injectable, computed, signal } from '@angular/core';
import { ComponentEntry } from '../models/component-entry.model';
import { CATALOG_ENTRIES, COMPONENT_USAGE_DOCS } from '../catalog';

/**
 * Loads the colocated per-component catalog modules (src/app/catalog). The
 * data spine is enforced by tools/quality/check-docs-coverage.mjs: every
 * inventoried component family must have a `<id>.catalog.ts` entry and a
 * resolvable documentation route.
 */
@Injectable({ providedIn: 'root' })
export class ComponentCatalogService {
  private readonly _query = signal('');
  private readonly _selectedCategory = signal<string>('All');

  readonly query = this._query.asReadonly();
  readonly selectedCategory = this._selectedCategory.asReadonly();

  private readonly entriesById = new Map<string, ComponentEntry>(
    CATALOG_ENTRIES.map((entry) => [entry.id, entry]),
  );

  readonly allCategories = computed(() => {
    const cats = ['All', ...new Set(CATALOG_ENTRIES.map((c) => c.category))];
    return cats;
  });

  readonly filteredComponents = computed(() => {
    const q = this._query().toLowerCase().trim();
    const cat = this._selectedCategory();

    return CATALOG_ENTRIES.filter((component) => {
      const matchesCategory = cat === 'All' || component.category === cat;
      if (!q) return matchesCategory;

      const matchesSearch =
        component.name.toLowerCase().includes(q) ||
        component.description.toLowerCase().includes(q) ||
        component.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  });

  byId(id: string): ComponentEntry | undefined {
    return this.entriesById.get(id);
  }

  usageDoc(id: string) {
    return COMPONENT_USAGE_DOCS[id];
  }

  setQuery(q: string): void {
    this._query.set(q);
  }

  setCategory(cat: string): void {
    this._selectedCategory.set(cat);
  }
}
