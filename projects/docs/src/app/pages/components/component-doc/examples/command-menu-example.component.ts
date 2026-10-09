import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MenuFamilyPreviewComponent } from '../menu-family-preview.component';

/** Página genérica antiga: prévia compartilhada da família de menus. */
@Component({
  selector: 'doc-command-menu-example',
  standalone: true,
  imports: [MenuFamilyPreviewComponent],
  template: `<app-menu-family-preview componentId="command-menu" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandMenuExampleComponent {}
