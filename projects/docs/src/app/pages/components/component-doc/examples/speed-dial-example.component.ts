import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';
import {
  SpeedDialComponent,
  SpeedDialAction,
} from '@ciag/orchestra/speed-dial';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-speed-dial-example',
  standalone: true,
  imports: [SpeedDialComponent],
  template: `
    <div style="position: fixed; bottom: 2rem; right: 2rem; z-index: 100;">
      <orc-speed-dial
        [actions]="actions"
        openLabel="Abrir ações"
        closeLabel="Fechar ações"
        (actionSelect)="onActionSelect($event)"
      />
    </div>
    @if (message(); as message) {
      <div
        style="position: fixed; bottom: 6rem; right: 2rem; z-index: 100; background: var(--orc-surface-raised); padding: 0.5rem 1rem; border-radius: var(--orc-radius-md); box-shadow: var(--orc-shadow-md);"
      >
        <code>{{ message }}</code>
      </div>
    }
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeedDialExampleComponent {
  readonly stateChange = output<Record<string, unknown>>();
  readonly message = signal<string | null>(null);
  readonly actions: SpeedDialAction[] = [
    { value: 'note', label: 'Nova nota', icon: '✎' },
    { value: 'task', label: 'Nova tarefa', icon: '✓' },
    { value: 'share', label: 'Compartilhar', icon: '↗' },
  ];

  onActionSelect(action: SpeedDialAction): void {
    this.message.set(`Speed dial: ${action.label}`);
    this.stateChange.emit({ state: `Speed dial: ${action.label}` });
  }
}
