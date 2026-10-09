import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MenuFamilyPreviewComponent } from '../menu-family-preview.component';

/** Página genérica antiga: prévia compartilhada da família de menus. */
@Component({
  selector: 'doc-tiered-menu-example',
  standalone: true,
  imports: [MenuFamilyPreviewComponent],
  template: `<app-menu-family-preview componentId="tiered-menu" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TieredMenuExampleComponent {}
