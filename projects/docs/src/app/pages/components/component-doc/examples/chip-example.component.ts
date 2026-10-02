import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ChipComponent } from '@ciag/orchestra/chip';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-chip-example',
  standalone: true,
  imports: [ChipComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Variantes</span>
        <div class="chip-row">
          <orc-chip label="Neutral" />
          <orc-chip label="Primary" variant="primary" />
          <orc-chip label="Success" variant="success" />
          <orc-chip label="Warning" variant="warning" />
          <orc-chip label="Danger" variant="danger" />
        </div>
      </div>
      <div class="example-grid example-grid--three">
        <div class="example">
          <span class="example__label">Selecionável</span>
          <orc-chip
            label="Filtro ativo"
            variant="primary"
            [selectable]="true"
            [(selected)]="chipSelected"
          />
          <code>selected = {{ chipSelected() }}</code>
        </div>
        <div class="example">
          <span class="example__label">Removível</span>
          <orc-chip
            label="Angular"
            value="angular"
            [removable]="true"
            (removed)="onRemoved($event)"
          />
          @if (removedChip(); as removed) {
            <code>removed = {{ removed }}</code>
          }
        </div>
        <div class="example">
          <span class="example__label">Desabilitado</span>
          <orc-chip
            label="Indisponível"
            variant="neutral"
            [selectable]="true"
            [removable]="true"
            [disabled]="true"
          />
        </div>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly chipSelected = signal(true);
  readonly removedChip = signal('');

  ngOnInit(): void {
    this.emit();
  }

  onRemoved(value: string | number): void {
    this.removedChip.set(String(value));
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({
      selected: this.chipSelected(),
      removed: this.removedChip() || null,
    });
  }
}
