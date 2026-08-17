import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  BreadcrumbComponent,
  BreadcrumbItemComponent,
  BreadcrumbItemData,
  BreadcrumbSeparator,
  BreadcrumbVariant,
} from '@ciag/orchestra/breadcrumb';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-breadcrumb-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    BreadcrumbComponent,
    BreadcrumbItemComponent,
    FooterComponent,
  ],
  templateUrl: './breadcrumb-page.component.html',
  styleUrl: './breadcrumb-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbPageComponent {
  // ── Playground Signals ────────────────────────────────────
  readonly playgroundVariant = signal<BreadcrumbVariant>('default');
  readonly playgroundSeparator = signal<BreadcrumbSeparator>('chevron');
  readonly playgroundMaxItems = signal<number | undefined>(undefined);
  readonly clickedItem = signal<string | null>(null);

  readonly playgroundItems: BreadcrumbItemData[] = [
    { label: 'Home', icon: 'home' },
    { label: 'Projetos' },
    { label: 'Design System' },
    { label: 'Componentes' },
    { label: 'Breadcrumb' },
  ];

  // ── Figma Showcase Demos (Node 382:5375) ──────────────────
  readonly figmaDefaultItems: BreadcrumbItemData[] = [
    { label: 'Home' },
    { label: 'Componentes' },
    { label: 'Breadcrumb' },
  ];

  readonly figmaUnderlinedItems: BreadcrumbItemData[] = [
    { label: 'Home' },
    { label: 'Componentes' },
    { label: 'Breadcrumb' },
  ];

  onItemClick(event: { item: BreadcrumbItemData; index: number }): void {
    this.clickedItem.set(`Clicou em: "${event.item.label}" (posição ${event.index + 1})`);
    setTimeout(() => this.clickedItem.set(null), 3000);
  }
}
