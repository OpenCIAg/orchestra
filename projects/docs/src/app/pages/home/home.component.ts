import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { BadgeStatus, BadgeComponent } from '@ciag/orchestra/badge';
import { ButtonComponent } from '@ciag/orchestra/button';
import { KbdComponent } from '@ciag/orchestra/kbd';
import { IconComponent } from '@ciag/orchestra/icon';
import {
  ComponentCatalogService,
  categoryLabel,
} from '../../services/component-catalog.service';
import type {
  ComponentEntry,
  RegistryEntry,
} from '../../models/component-entry.model';
import { FAMILY_GROUP_ORDER } from '../../models/component-page.model';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ScrollTopComponent } from '@ciag/orchestra/scroll-top';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule,
    FooterComponent,
    BadgeComponent,
    ButtonComponent,
    KbdComponent,
    IconComponent,
    ScrollTopComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  protected readonly catalog = inject(ComponentCatalogService);

  /** Os quatro princípios da biblioteca (detalhes em /primeiros-passos). */
  protected readonly principles = [
    {
      icon: 'palette',
      title: 'Identidade',
      text: 'Cores, tipografia e tokens da CIAg em todos os componentes.',
    },
    {
      icon: 'extension',
      title: 'Composição',
      text: 'Slots e tokens CSS no lugar de dezenas de inputs de configuração.',
    },
    {
      icon: 'code',
      title: 'Angular idiomático',
      text: 'Signals, OnPush, formulários nativos e CDK para overlays e foco.',
    },
    {
      icon: 'speed',
      title: 'Performance',
      text: 'Um entry point por família: você só carrega o que importa.',
    },
  ] as const;

  protected readonly searchValue = this.catalog.query;
  protected readonly isFocused = signal(false);
  protected readonly hoveredId = signal<string | null>(null);

  protected readonly categories = this.catalog.allCategories;

  protected readonly categoryLabel = categoryLabel;
  protected readonly results = this.catalog.filteredComponents;

  protected readonly hasQuery = computed(
    () => this.searchValue().trim().length > 0,
  );

  protected readonly resultCount = computed(() => this.results().length);

  /** Resultados agrupados na ordem da navegação lateral. */
  protected readonly groupedEntries = computed(() =>
    FAMILY_GROUP_ORDER.map(
      (group) =>
        [
          group,
          this.results()
            .filter((entry) => entry.group === group)
            .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
        ] as [string, RegistryEntry[]],
    ).filter(([, entries]) => entries.length > 0),
  );

  protected onSearch(value: string): void {
    this.catalog.setQuery(value);
  }

  @HostListener('document:keydown', ['$event'])
  protected focusSearch(event: KeyboardEvent): void {
    if (
      event.key !== '/' ||
      event.defaultPrevented ||
      event.isComposing ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    )
      return;
    const target = event.composedPath()[0];
    if (
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        target.closest('input, textarea, select, [role="textbox"]'))
    )
      return;
    event.preventDefault();
    this.searchInputRef?.nativeElement.focus();
  }

  protected clearSearch(): void {
    this.catalog.setQuery('');
    this.searchInputRef?.nativeElement.focus();
  }

  protected selectCategory(cat: string): void {
    this.catalog.setCategory(cat);
  }

  protected setHovered(id: string | null): void {
    this.hoveredId.set(id);
  }

  protected trackById(_: number, item: ComponentEntry): string {
    return item.id;
  }

  protected trackByCategory(
    _: number,
    entry: [string, ComponentEntry[]],
  ): string {
    return entry[0];
  }

  protected getStatusLabel(status: ComponentEntry['status']): string {
    const map: Record<ComponentEntry['status'], string> = {
      stable: 'Estável',
      beta: 'Beta',
      experimental: 'Experimental',
      deprecated: 'Descontinuado',
    };
    return map[status];
  }

  protected getStatusBadge(status: ComponentEntry['status']): BadgeStatus {
    const map: Record<ComponentEntry['status'], BadgeStatus> = {
      stable: 'success',
      beta: 'pending',
      experimental: 'info',
      deprecated: 'inactive',
    };
    return map[status];
  }
}
