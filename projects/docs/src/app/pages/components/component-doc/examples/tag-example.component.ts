import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';
import { TagComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-tag-example',
  standalone: true,
  imports: [TagComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Variants</span>
        <div class="chip-row">
          <orc-tag label="Neutral" /><orc-tag
            label="Primary"
            variant="primary"
          /><orc-tag label="Success" variant="success" /><orc-tag
            label="Warning"
            variant="warning"
          /><orc-tag label="Danger" variant="danger" />
        </div>
      </div>
      <div class="example example--centered">
        <orc-tag
          label="Filtro ativo"
          variant="primary"
          [removable]="true"
          (removed)="onRemoved($event)"
        />
        @if (message(); as message) {
          <code>{{ message }}</code>
        }
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagExampleComponent {
  readonly stateChange = output<Record<string, unknown>>();
  readonly message = signal<string | null>(null);

  onRemoved(label: string): void {
    this.message.set(`Tag removida: ${label}`);
    this.stateChange.emit({ state: `Tag removida: ${label}` });
  }
}
