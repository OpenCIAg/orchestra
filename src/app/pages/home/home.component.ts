import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ComponentCatalogService } from '../../services/component-catalog.service';
import { ComponentEntry } from '../../models/component-entry.model';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterModule, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

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
}
