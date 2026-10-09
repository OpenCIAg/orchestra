import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MenuFamilyPreviewComponent } from '../menu-family-preview.component';

/** Página genérica antiga: prévia compartilhada da família de menus. */
@Component({
  selector: 'doc-panel-menu-example',
  standalone: true,
  imports: [MenuFamilyPreviewComponent],
  template: `<app-menu-family-preview componentId="panel-menu" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelMenuExampleComponent {}
