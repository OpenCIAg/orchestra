import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { BadgeStatus, BadgeComponent } from '@ciag/orchestra/badge';
import { ButtonComponent } from '@ciag/orchestra/button';
import { KbdComponent } from '@ciag/orchestra/kbd';
import { ComponentCatalogService } from '../../services/component-catalog.service';
import { ComponentEntry } from '../../models/component-entry.model';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, FooterComponent, BadgeComponent, ButtonComponent, KbdComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  protected readonly catalog = inject(ComponentCatalogService);

  protected readonly searchValue = signal('');
  protected readonly isFocused = signal(false);
  protected readonly hoveredId = signal<string | null>(null);

  protected readonly categories = this.catalog.allCategories;
  protected readonly results = this.catalog.filteredComponents;

  protected readonly hasQuery = computed(() => this.searchValue().trim().length > 0);

  protected readonly resultCount = computed(() => this.results().length);

  protected readonly groupedResults = computed(() => {
    const map = new Map<string, ComponentEntry[]>();
    for (const comp of this.results()) {
      const list = map.get(comp.category) ?? [];
      list.push(comp);
      map.set(comp.category, list);
    }
    return map;
  });

  protected readonly groupedEntries = computed(() =>
    Array.from(this.groupedResults().entries())
  );

  ngAfterViewInit(): void {
    // Auto-focus search on load
    setTimeout(() => this.searchInputRef?.nativeElement.focus(), 200);
  }

  protected onSearch(value: string): void {
    this.searchValue.set(value);
    this.catalog.setQuery(value);
  }

  protected clearSearch(): void {
    this.searchValue.set('');
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

  protected trackByCategory(_: number, entry: [string, ComponentEntry[]]): string {
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
