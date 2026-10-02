import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';
import {
  MenubarComponent,
  MenubarItem,
} from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-menubar-example',
  standalone: true,
  imports: [MenubarComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Navegação por setas</span>
        <orc-menubar
          [items]="items"
          label="Navegação do projeto"
          (itemSelect)="onItemSelect($event)"
        />
      </div>
      <p class="example__caption">
        Foque a barra e use <code>←</code>, <code>→</code>, <code>Home</code>,
        <code>End</code> e <code>Enter</code>.
      </p>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenubarExampleComponent {
  readonly stateChange = output<Record<string, unknown>>();
  readonly message = signal<string | null>(null);
  readonly items: MenubarItem[] = [
    { value: 'file', label: 'Arquivo', shortcut: '⌘ F' },
    { value: 'edit', label: 'Editar', shortcut: '⌘ E' },
    { value: 'view', label: 'Visualizar' },
    { value: 'disabled', label: 'Indisponível', disabled: true },
  ];

  onItemSelect(item: MenubarItem): void {
    this.message.set(`Menubar: ${item.label}`);
    this.stateChange.emit({ state: `Menubar: ${item.label}` });
  }
}
