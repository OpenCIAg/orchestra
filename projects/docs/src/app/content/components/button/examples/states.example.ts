import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from '@ciag/orchestra/button';

@Component({
  selector: 'doc-button-states-example',
  imports: [ButtonComponent],
  template: `
    <orc-button [loading]="sending()" (click)="send()">
      {{ sending() ? 'Enviando…' : 'Enviar relatório' }}
    </orc-button>
    <orc-button variant="secondary" disabled>Sem permissão</orc-button>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonStatesExampleComponent {
  readonly sending = signal(false);

  send(): void {
    this.sending.set(true);
    // Simula uma requisição de 1,5 s.
    setTimeout(() => this.sending.set(false), 1500);
  }
}
