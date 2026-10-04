import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { TabMenuComponent } from '@ciag/orchestra/tab-menu';
import type { TabMenuItem } from '@ciag/orchestra/tab-menu';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-tab-menu-example',
  standalone: true,
  imports: [TabMenuComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Navegação de abas controlada</span>
        <orc-tab-menu
          [model]="items"
          [(activeItem)]="activeItem"
          ariaLabel="Seções do projeto"
          (itemSelect)="onItemSelect($event)"
        />
        <code>activeItem = {{ activeItem()?.label || items[0].label }}</code>
      </div>
      <div class="example example--muted">
        <span class="example__label">Teclado + output</span>
        <p>
          {{ message() || 'Use ← →, Home, End ou ative uma seção.' }}
        </p>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabMenuExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly activeItem = signal<TabMenuItem | undefined>(undefined);
  readonly message = signal('');
  readonly items: TabMenuItem[] = [
    { label: 'Resumo', icon: '▦', value: 'summary' },
    { label: 'Atividade', icon: '◷', value: 'activity' },
    { label: 'Arquivado', icon: '□', value: 'archived', disabled: true },
  ];

  ngOnInit(): void {
    this.emit();
  }

  onItemSelect(item: TabMenuItem): void {
    this.activeItem.set(item);
    this.message.set(`Tab Menu: ${item.label}`);
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({
      active: this.activeItem()?.label ?? this.items[0]?.label,
      state: this.message() || 'keyboard-ready',
    });
  }
}
