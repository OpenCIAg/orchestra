import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';
import { ButtonGroupComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-button-group-example',
  standalone: true,
  imports: [ButtonGroupComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Ações anexadas</span>
        <orc-button-group label="Ações do projeto" [attached]="true">
          <button
            class="doc-button"
            type="button"
            (click)="onAction('Projeto salvo')"
          >
            Salvar
          </button>
          <button
            class="doc-button doc-button--secondary"
            type="button"
            (click)="onAction('Projeto duplicado')"
          >
            Duplicar
          </button>
          <button
            class="doc-button doc-button--secondary"
            type="button"
            (click)="onAction('Mais ações abertas')"
          >
            Mais
          </button>
        </orc-button-group>
      </div>
      <div class="example example--muted">
        <span class="example__label">Orientação</span>
        <p>
          Use <code>orientation="vertical"</code> para grupos em toolbars
          estreitas.
        </p>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonGroupExampleComponent {
  readonly stateChange = output<Record<string, unknown>>();
  readonly message = signal<string | null>(null);

  onAction(message: string): void {
    this.message.set(message);
    this.stateChange.emit({ state: message });
  }
}
