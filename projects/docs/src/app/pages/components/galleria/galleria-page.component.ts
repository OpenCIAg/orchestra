import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { GalleriaComponent } from '@ciag/orchestra/p2';
import type { GalleryImage } from '@ciag/orchestra/p2';
import { FooterComponent } from '../../../shared/footer/footer.component';

const svg = (color: string): string =>
  `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="640" height="360"%3E%3Crect width="640" height="360" fill="${color}"/%3E%3C/svg%3E`;

@Component({
  selector: 'app-galleria-page',
  standalone: true,
  imports: [RouterModule, GalleriaComponent, FooterComponent],
  templateUrl: './galleria-page.component.html',
  styleUrl: './galleria-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleriaPageComponent {
  readonly images: GalleryImage[] = [
    { src: svg('%231C6AED'), alt: 'Paisagem azul', title: 'Paisagem azul' },
    { src: svg('%2316A34A'), alt: 'Paisagem verde', title: 'Paisagem verde' },
    { src: svg('%23B45309'), alt: 'Paisagem âmbar', title: 'Paisagem âmbar' },
  ];
  readonly activeIndex = signal(0);
  readonly visible = signal(true);
  readonly fullScreen = signal(false);
  readonly activeTitle = computed(
    () =>
      this.images[this.activeIndex()]?.title ?? 'Nenhuma imagem selecionada',
  );

  openPreview(): void {
    this.visible.set(true);
    this.fullScreen.set(true);
  }

  recordImageChange(event: { index: number }): void {
    this.activeIndex.set(event.index);
  }
}
