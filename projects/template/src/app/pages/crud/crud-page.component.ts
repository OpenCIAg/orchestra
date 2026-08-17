import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatorComponent } from '@ciag/orchestra/paginator';
import { InputComponent, TextareaComponent } from '@ciag/orchestra/input';
import { SelectComponent, SelectOption } from '@ciag/orchestra/select';
import { ButtonComponent } from '@ciag/orchestra/button';
import { BadgeComponent } from '@ciag/orchestra/badge';
import { ModalComponent } from '@ciag/orchestra/modal';
import { SwitchComponent } from '@ciag/orchestra/switch';
import { SliderComponent } from '@ciag/orchestra/slider';
import { RatingComponent } from '@ciag/orchestra/rating';
import { ChipInputComponent } from '@ciag/orchestra/chip-input';
import { ToastService } from '@ciag/orchestra/toast';

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  status: 'active' | 'draft' | 'archived';
  tags: string[];
}

@Component({
  selector: 'app-crud-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PaginatorComponent,
    InputComponent,
    TextareaComponent,
    SelectComponent,
    ButtonComponent,
    BadgeComponent,
    ModalComponent,
    SwitchComponent,
    SliderComponent,
    RatingComponent,
    ChipInputComponent,
  ],
  templateUrl: './crud-page.component.html',
  styleUrl: './crud-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrudPageComponent {
  private readonly toastService = inject(ToastService);

  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('all');
  readonly onlyInStock = signal<boolean>(false);
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(5);

  readonly isModalOpen = signal<boolean>(false);
  readonly modalMode = signal<'create' | 'edit'>('create');

  readonly formId = signal<string>('');
  readonly formName = signal<string>('');
  readonly formCategory = signal<string>('Tecnologia');
  readonly formPrice = signal<number>(299);
  readonly formStock = signal<number>(45);
  readonly formRating = signal<number>(4.5);
  readonly formTags = signal<string[]>(['Lançamento', 'Bestseller']);
  readonly formDescription = signal<string>('Equipamento de alta precisão com suporte avançado.');

  readonly categoryOptions: SelectOption[] = [
    { label: 'Todas as categorias', value: 'all' },
    { label: 'Tecnologia', value: 'Tecnologia' },
    { label: 'Serviços', value: 'Serviços' },
    { label: 'Equipamentos', value: 'Equipamentos' },
  ];

  readonly products = signal<ProductItem[]>([
    { id: 'PRD-001', name: 'MacBook Pro M3 Max', category: 'Tecnologia', price: 24999, stock: 12, rating: 5, status: 'active', tags: ['Hardware', 'Premium'] },
    { id: 'PRD-002', name: 'Monitor 4K Studio Display', category: 'Equipamentos', price: 11499, stock: 8, rating: 4, status: 'active', tags: ['Display'] },
    { id: 'PRD-003', name: 'Licença Enterprise Cloud', category: 'Serviços', price: 4500, stock: 999, rating: 5, status: 'active', tags: ['SaaS', 'Cloud'] },
    { id: 'PRD-004', name: 'Teclado Mecânico Ergonômico', category: 'Equipamentos', price: 1250, stock: 0, rating: 4, status: 'draft', tags: ['Periféricos'] },
    { id: 'PRD-005', name: 'Servidor Rack 2U Dell', category: 'Tecnologia', price: 38900, stock: 3, rating: 5, status: 'active', tags: ['Infra'] },
    { id: 'PRD-006', name: 'Consultoria de Arquitetura', category: 'Serviços', price: 15000, stock: 5, rating: 5, status: 'active', tags: ['Consulting'] },
    { id: 'PRD-007', name: 'Hub USB-C Thunderbolt 4', category: 'Equipamentos', price: 890, stock: 35, rating: 3, status: 'archived', tags: ['Acessórios'] },
  ]);

  readonly filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    const stockOnly = this.onlyInStock();

    return this.products().filter((p) => {
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      const matchesCategory = cat === 'all' || p.category === cat;
      const matchesStock = !stockOnly || p.stock > 0;
      return matchesQuery && matchesCategory && matchesStock;
    });
  });

  readonly paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredProducts().slice(start, start + this.pageSize());
  });

  openCreateModal(): void {
    this.modalMode.set('create');
    this.formId.set(`PRD-00${this.products().length + 1}`);
    this.formName.set('');
    this.formPrice.set(999);
    this.formStock.set(20);
    this.formRating.set(4);
    this.formTags.set(['Novo']);
    this.isModalOpen.set(true);
  }

  openEditModal(item: ProductItem): void {
    this.modalMode.set('edit');
    this.formId.set(item.id);
    this.formName.set(item.name);
    this.formCategory.set(item.category);
    this.formPrice.set(item.price);
    this.formStock.set(item.stock);
    this.formRating.set(item.rating);
    this.formTags.set([...item.tags]);
    this.isModalOpen.set(true);
  }

  saveProduct(): void {
    if (!this.formName()) {
      this.toastService.error('O nome do produto é obrigatório.');
      return;
    }

    if (this.modalMode() === 'create') {
      const newProduct: ProductItem = {
        id: this.formId(),
        name: this.formName(),
        category: this.formCategory(),
        price: Number(this.formPrice()),
        stock: Number(this.formStock()),
        rating: this.formRating(),
        status: 'active',
        tags: this.formTags(),
      };
      this.products.update((list) => [newProduct, ...list]);
      this.toastService.success(`Produto ${newProduct.name} cadastrado com sucesso!`);
    } else {
      this.products.update((list) =>
        list.map((p) =>
          p.id === this.formId()
            ? {
                ...p,
                name: this.formName(),
                category: this.formCategory(),
                price: Number(this.formPrice()),
                stock: Number(this.formStock()),
                rating: this.formRating(),
                tags: this.formTags(),
              }
            : p
        )
      );
      this.toastService.success('Alterações salvas com sucesso!');
    }

    this.isModalOpen.set(false);
  }

  deleteProduct(item: ProductItem): void {
    this.products.update((list) => list.filter((p) => p.id !== item.id));
    this.toastService.info(`Produto ${item.name} removido.`);
  }

  onChipsUpdated(newChips: string[]): void {
    this.formTags.set(newChips);
  }
}
