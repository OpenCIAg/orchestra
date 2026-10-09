import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconCatalogPreviewComponent } from '../icon-catalog-preview.component';

/** Página genérica antiga: busca no catálogo de ícones Material Symbols. */
@Component({
  selector: 'doc-icon-example',
  standalone: true,
  imports: [IconCatalogPreviewComponent],
  template: `<app-icon-catalog-preview />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconExampleComponent {}
