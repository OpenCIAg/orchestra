import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';
import { DropdownComponent, DropdownItem } from '@ciag/orchestra/dropdown';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-dropdown-example',
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <div class="example-stack">
      <div class="example example--centered">
        <span class="example__label">Ações posicionadas</span>
        <orc-dropdown #dropdown [items]="items" placement="bottom-start">
          <button class="doc-button" type="button" (click)="dropdown.toggle()">
            Ações <span aria-hidden="true">⌄</span>
          </button>
        </orc-dropdown>
      </div>
      <p class="example__caption">
        O gatilho permanece um botão nativo; o menu gerencia foco, Escape e
        posicionamento. Este é um menu plano; use TieredMenu para ações
        hierárquicas.
      </p>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownExampleComponent {
  readonly stateChange = output<Record<string, unknown>>();
  readonly message = signal<string | null>(null);
  readonly items: DropdownItem[] = [
    { id: 'edit', label: 'Editar', shortcut: 'E' },
    { id: 'share', label: 'Compartilhar' },
    { id: 'divider', label: '', divider: true },
    { id: 'delete', label: 'Excluir projeto', danger: true },
  ];
}
