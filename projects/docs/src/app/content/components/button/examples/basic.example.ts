import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from '@ciag/orchestra/button';

@Component({
  selector: 'doc-button-basic-example',
  imports: [ButtonComponent],
  template: `
    <orc-button (click)="saves.set(saves() + 1)">Salvar alterações</orc-button>
    <p class="hint" aria-live="polite">Salvo {{ saves() }} vez(es).</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
    .hint {
      margin: 0;
      font-size: 0.875rem;
      color: var(--orc-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonBasicExampleComponent {
  readonly saves = signal(0);
}
