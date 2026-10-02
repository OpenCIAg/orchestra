import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  SplitterComponent,
  SplitterPanel,
} from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-splitter-example',
  standalone: true,
  imports: [SplitterComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Tamanhos dos painéis</span>
        <orc-splitter
          [panels]="panels"
          [(sizes)]="sizes"
          label="Editor dividido"
        />
      </div>
      <div class="popover-row">
        <button
          class="doc-button doc-button--secondary"
          type="button"
          (click)="resize(-10)"
        >
          − Navegação</button
        ><button
          class="doc-button doc-button--secondary"
          type="button"
          (click)="resize(10)"
        >
          + Navegação</button
        ><code>sizes = {{ sizes().join(' / ') }}%</code>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitterExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly sizes = signal<number[]>([42, 58]);
  readonly panels: SplitterPanel[] = [
    { id: 'navigation', label: 'Navegação' },
    { id: 'content', label: 'Conteúdo' },
  ];

  ngOnInit(): void {
    this.emit();
  }

  resize(delta: number): void {
    const left = this.sizes()[0] ?? 50;
    const nextLeft = Math.max(20, Math.min(80, left + delta));
    this.sizes.set([nextLeft, 100 - nextLeft]);
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({ sizes: this.sizes(), state: 'panel layout' });
  }
}
