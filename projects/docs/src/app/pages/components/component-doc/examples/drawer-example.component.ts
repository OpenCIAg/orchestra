import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { DrawerComponent } from '@ciag/orchestra/drawer';
import { ButtonComponent } from '@ciag/orchestra/button';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-drawer-example',
  standalone: true,
  imports: [DrawerComponent, ButtonComponent],
  template: `
    <div class="example-stack">
      <div class="example example--centered">
        <span class="example__label">Gaveta à direita</span>
        <orc-button (click)="open.set(true)">Abrir painel</orc-button>
        <orc-drawer
          [(open)]="open"
          placement="right"
          label="Detalhes do projeto"
        >
          <div drawer-title>
            <strong>Detalhes do projeto</strong>
            <p class="drawer-copy">
              Backdrop, Escape e ação de fechamento fazem parte do comportamento
              padrão.
            </p>
          </div>
          <div drawer-actions>
            <orc-button variant="secondary" (click)="open.set(false)">
              Concluir
            </orc-button>
          </div>
        </orc-drawer>
      </div>
      <div class="example-grid example-grid--three">
        <div class="state-note">
          <strong>placement</strong><span>left · top · bottom</span>
        </div>
        <div class="state-note">
          <strong>closeOnBackdrop</strong><span>true por padrão</span>
        </div>
        <div class="state-note">
          <strong>dismissible</strong><span>Escape habilitado</span>
        </div>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly open = signal(false);

  ngOnInit(): void {
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({ open: this.open(), placement: 'right' });
  }
}
