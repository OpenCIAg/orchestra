import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  NavigationItemComponent,
  NavigationShellComponent,
} from '@ciag/orchestra/navigation';
import type { NavigationItem } from '@ciag/orchestra/navigation';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-navigation-example',
  standalone: true,
  imports: [NavigationItemComponent, NavigationShellComponent],
  template: `
    <div class="example-stack">
      <div class="example example--centered">
        <span class="example__label">Navegação responsiva</span>
        <button
          class="doc-button"
          type="button"
          [attr.aria-expanded]="open()"
          (click)="toggleOpen()"
        >
          {{ open() ? 'Fechar navegação' : 'Abrir navegação' }}
        </button>
        <orc-navigation-shell
          [open]="open()"
          [rail]="false"
          ariaLabel="Navegação do projeto"
          (requestClose)="open.set(false)"
        >
          <strong navigation-logo>Orchestra</strong>
          @for (item of items; track item.id) {
            <orc-navigation-item
              [item]="item"
              [active]="activeId() === item.id"
              (activated)="onItemActivated($event)"
            />
          }
          <small navigation-footer>Workspace</small>
        </orc-navigation-shell>
      </div>
      <div class="example-grid example-grid--two">
        <div class="example example--muted">
          <span class="example__label">Estado controlado</span>
          <code>open = {{ open() }}</code>
          <code>active = {{ activeId() }}</code>
        </div>
        <div class="example example--muted">
          <span class="example__label">Interação</span>
          <p>
            {{ message() || 'Selecione um item ou use Escape.' }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly open = signal(true);
  readonly activeId = signal('overview');
  readonly message = signal('');
  readonly items: NavigationItem[] = [
    { id: 'overview', label: 'Visão geral', icon: '⌂', badge: 3 },
    { id: 'activity', label: 'Atividade', icon: '◷' },
    { id: 'settings', label: 'Configurações', icon: '⚙', disabled: true },
  ];

  ngOnInit(): void {
    this.emit();
  }

  toggleOpen(): void {
    this.open.update((value) => !value);
  }

  onItemActivated(item: NavigationItem): void {
    this.activeId.set(item.id);
    this.message.set(`Navegação: ${item.label}`);
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({
      open: this.open(),
      active: this.activeId(),
      state: this.message() || 'navigation-ready',
    });
  }
}
