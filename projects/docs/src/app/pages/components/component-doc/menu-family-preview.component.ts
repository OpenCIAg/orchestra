import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { CommandMenuComponent } from '@ciag/orchestra/p2-command-components';
import {
  MegaMenuComponent,
  PanelMenuComponent,
  TieredMenuComponent,
} from '@ciag/orchestra/p2-menu-family-components';
import type { CommandItem } from '@ciag/orchestra/p2-command-components';
import type { PrimeMenuItem } from '@ciag/orchestra/p2';

export type MenuFamilyId =
  'tiered-menu' | 'panel-menu' | 'mega-menu' | 'command-menu';

@Component({
  selector: 'app-menu-family-preview',
  standalone: true,
  imports: [
    TieredMenuComponent,
    PanelMenuComponent,
    MegaMenuComponent,
    CommandMenuComponent,
  ],
  templateUrl: './menu-family-preview.component.html',
  styleUrl: './menu-family-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuFamilyPreviewComponent {
  readonly componentId = input.required<MenuFamilyId>();
  readonly stateChange = output<Readonly<Record<string, unknown>>>();

  readonly menuFamilyItems: PrimeMenuItem[] = [
    {
      label: 'Projetos',
      icon: '▦',
      items: [
        { label: 'Design System', value: 'design' },
        { label: 'Documentação', value: 'docs' },
      ],
    },
    {
      label: 'Equipe',
      icon: '♙',
      items: [
        { label: 'Membros', value: 'members' },
        { label: 'Convites', value: 'invites', disabled: true },
      ],
    },
  ];

  readonly megaMenuItems: PrimeMenuItem[] = [
    {
      label: 'Produto',
      items: [
        { label: 'Visão geral', value: 'overview' },
        { label: 'Roadmap', value: 'roadmap' },
      ],
    },
    {
      label: 'Recursos',
      items: [
        { label: 'Componentes', value: 'components' },
        { label: 'Tokens', value: 'tokens' },
      ],
    },
  ];

  readonly commandMenuItems: CommandItem[] = [
    { label: 'Abrir documentação', shortcut: 'G D', keywords: ['docs'] },
    { label: 'Criar projeto', shortcut: 'N P', keywords: ['new'] },
    { label: 'Configurações', shortcut: '⌘ ,', keywords: ['settings'] },
    { label: 'Excluir projeto', disabled: true, keywords: ['delete'] },
  ];

  readonly megaMenuOrientation = signal<'horizontal' | 'vertical'>(
    'horizontal',
  );
  readonly commandMenuQuery = signal('');
  readonly actionMessage = signal('');

  readonly liveState = computed<Readonly<Record<string, unknown>>>(() => {
    const state = this.actionMessage() || 'keyboard-ready';
    switch (this.componentId()) {
      case 'mega-menu':
        return { orientation: this.megaMenuOrientation(), state };
      case 'command-menu':
        return { query: this.commandMenuQuery(), state };
      default:
        return { state };
    }
  });

  private readonly emitState = effect(() => {
    this.stateChange.emit(this.liveState());
  });

  onTieredMenuItem(item: PrimeMenuItem): void {
    this.actionMessage.set(`TieredMenu: ${item.label}`);
  }

  onPanelMenuItem(item: PrimeMenuItem): void {
    this.actionMessage.set(`PanelMenu: ${item.label}`);
  }

  onMegaMenuItem(item: PrimeMenuItem): void {
    this.actionMessage.set(`MegaMenu: ${item.label}`);
  }

  onCommandMenuItem(item: CommandItem): void {
    this.actionMessage.set(`CommandMenu: ${item.label}`);
  }
}
