import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { VisuallyHiddenComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-visually-hidden-example',
  standalone: true,
  imports: [VisuallyHiddenComponent],
  template: `
    <div class="example-stack">
      <div class="example example--centered">
        <span class="example__label">Assistive text</span>
        <button
          class="doc-button"
          type="button"
          aria-describedby="doc-hidden-help"
          (click)="onAction()"
        >
          Ação visível
        </button>
        <orc-visually-hidden
          ><span id="doc-hidden-help"
            >Esta ação cria um novo componente no projeto.</span
          ></orc-visually-hidden
        >
      </div>
      <p class="example__caption">
        O texto não ocupa espaço visual, mas permanece disponível para
        tecnologias assistivas.
      </p>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisuallyHiddenExampleComponent {
  readonly stateChange = output<Record<string, unknown>>();

  onAction(): void {
    this.stateChange.emit({ state: 'Ação acessível acionada' });
  }
}
