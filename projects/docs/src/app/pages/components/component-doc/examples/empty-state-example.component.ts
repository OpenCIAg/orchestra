import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { EmptyStateComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-empty-state-example',
  standalone: true,
  imports: [EmptyStateComponent],
  template: `
    <div class="example">
      <span class="example__label">Sem conteúdo</span>
      <orc-empty-state
        title="Nenhum componente salvo"
        description="Crie seu primeiro componente para começar a montar a biblioteca."
        icon="∅"
        actionLabel="Criar componente"
        (action)="onAction()"
      />
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateExampleComponent {
  readonly stateChange = output<Record<string, unknown>>();

  onAction(): void {
    this.stateChange.emit({ state: 'Empty state: ação acionada' });
  }
}
