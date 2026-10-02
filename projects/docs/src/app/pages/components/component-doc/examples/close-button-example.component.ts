import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';
import { CloseButtonComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-close-button-example',
  standalone: true,
  imports: [CloseButtonComponent],
  template: `
    <div class="example-stack">
      <div class="example example--centered">
        <span class="example__label">Dismiss action</span>
        <div class="state-note">
          <strong>Mensagem</strong
          ><span>Feche este aviso com o botão acessível.</span
          ><orc-close-button
            ariaLabel="Fechar mensagem"
            size="lg"
            (close)="onClose()"
          />
        </div>
        @if (message(); as message) {
          <code>{{ message }}</code>
        }
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseButtonExampleComponent {
  readonly stateChange = output<Record<string, unknown>>();
  readonly message = signal<string | null>(null);

  onClose(): void {
    this.message.set('Close button acionado');
    this.stateChange.emit({ state: 'Close button acionado' });
  }
}
