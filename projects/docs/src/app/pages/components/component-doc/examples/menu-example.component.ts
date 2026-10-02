import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { MenuComponent } from '@ciag/orchestra/menu';
import type { MenuItem } from '@ciag/orchestra/menu';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-menu-example',
  standalone: true,
  imports: [MenuComponent],
  template: `
    <div class="example-stack">
      <div class="example example--centered">
        <span class="example__label">Popup menu</span>
        <button
          class="doc-button"
          type="button"
          [attr.aria-expanded]="visible()"
          (click)="popup.toggle()"
        >
          Ações <span aria-hidden="true">⌄</span>
        </button>
        <orc-menu
          #popup
          [items]="items"
          [popup]="true"
          [(visible)]="visible"
          ariaLabel="Ações do projeto"
          (itemSelect)="onItemSelect($event)"
        />
      </div>
      <div class="example-grid example-grid--two">
        <div class="example example--muted">
          <span class="example__label">Nested items</span>
          <p>
            Itens com <code>items</code> abrem submenus;
            <code>separator</code> divide grupos de ações.
          </p>
        </div>
        <div class="example example--muted">
          <span class="example__label">Active focus</span>
          <p>
            Setas, Home, End e Escape movem o foco ativo e fecham o popup quando
            necessário.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly visible = signal(false);
  readonly message = signal('');
  readonly items: MenuItem[] = [
    { label: 'Editar projeto', value: 'edit', icon: '✎' },
    { label: 'Compartilhar', value: 'share', icon: '↗' },
    { label: '', separator: true },
    {
      label: 'Mais ações',
      items: [
        { label: 'Duplicar', value: 'duplicate' },
        { label: 'Arquivar', value: 'archive', disabled: true },
      ],
    },
  ];

  ngOnInit(): void {
    this.emit();
  }

  onItemSelect(item: MenuItem): void {
    this.message.set(`Menu: ${item.label}`);
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({
      visible: this.visible(),
      state: this.message() || 'keyboard-ready',
    });
  }
}
