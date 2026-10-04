import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';
import {
  ContextMenuComponent,
  ContextMenuItem,
} from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-context-menu-example',
  standalone: true,
  imports: [ContextMenuComponent],
  template: `
    <div class="example-stack">
      <div class="example example--centered">
        <span class="example__label">Ações de contexto</span>
        <orc-context-menu [items]="items" (itemSelect)="onItemSelect($event)"
          ><span>Botão direito aqui</span></orc-context-menu
        >
        <p class="example__caption">Clique com o botão direito nesta área.</p>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuExampleComponent {
  readonly stateChange = output<Record<string, unknown>>();
  readonly message = signal<string | null>(null);
  readonly items: ContextMenuItem[] = [
    { value: 'rename', label: 'Renomear', shortcut: 'R' },
    { value: 'duplicate', label: 'Duplicar', shortcut: 'D' },
    { value: 'delete', label: 'Excluir', shortcut: '⌫', danger: true },
  ];

  onItemSelect(item: ContextMenuItem): void {
    this.message.set(`Context menu: ${item.label}`);
    this.stateChange.emit({ state: `Context menu: ${item.label}` });
  }
}
