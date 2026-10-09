import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CATALOG_ENTRIES } from '../../catalog';
import { docsUi } from '../../i18n/docs-ui';
import type { RegistryEntry } from '../../models/component-entry.model';
import {
  FAMILY_GROUP_ORDER,
  type FamilyGroup,
} from '../../models/component-page.model';

export interface SidebarGroup {
  readonly id: FamilyGroup;
  readonly label: string;
  readonly entries: readonly RegistryEntry[];
}

/** Agrupa o registro pela ordem de navegação; nomes em ordem alfabética. */
export function groupRegistry(
  entries: readonly RegistryEntry[],
): SidebarGroup[] {
  const labels = docsUi().groups;
  return FAMILY_GROUP_ORDER.map((id) => ({
    id,
    label: labels[id],
    entries: entries
      .filter((entry) => entry.group === id)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
  })).filter((group) => group.entries.length > 0);
}

/**
 * Navegação lateral gerada do registro. Em telas estreitas vira um
 * `<details>` recolhível acima do conteúdo.
 */
@Component({
  selector: 'app-docs-sidebar',
  standalone: true,
  imports: [NgTemplateOutlet, RouterLink, RouterLinkActive],
  templateUrl: './docs-sidebar.component.html',
  styleUrl: './docs-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsSidebarComponent {
  /** Família da página atual (abre o grupo dela no modo recolhível). */
  readonly currentId = input<string>('');

  protected readonly ui = docsUi();
  protected readonly groups = groupRegistry(CATALOG_ENTRIES);
  protected readonly currentName = computed(
    () =>
      CATALOG_ENTRIES.find((entry) => entry.id === this.currentId())?.name ??
      '',
  );
}
