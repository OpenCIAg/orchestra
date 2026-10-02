import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';
import { FloatingActionButtonComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-floating-action-button-example',
  standalone: true,
  imports: [FloatingActionButtonComponent],
  template: `
    <div class="example-stack">
      <div class="example example--centered">
        <span class="example__label">Ação primária</span>
        <orc-floating-action-button
          [extended]="true"
          label="Novo componente"
          icon="＋"
          ariaLabel="Criar componente"
          (clicked)="onClick()"
        />
        @if (message(); as message) {
          <code>{{ message }}</code>
        }
      </div>
      <p class="example__caption">
        Use a versão estendida quando o contexto exigir uma ação textual
        persistente.
      </p>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatingActionButtonExampleComponent {
  readonly stateChange = output<Record<string, unknown>>();
  readonly message = signal<string | null>(null);

  onClick(): void {
    this.message.set('FAB acionado');
    this.stateChange.emit({ state: 'FAB acionado' });
  }
}
