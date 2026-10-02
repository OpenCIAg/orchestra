import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CollapsibleComponent } from '@ciag/orchestra/collapsible';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-collapsible-example',
  standalone: true,
  imports: [CollapsibleComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Aberto + controlado</span>
        <orc-collapsible
          title="Detalhes de implementação"
          summary="aria-expanded"
          [(open)]="open"
        >
          <p class="collapsible-copy">
            O conteúdo pode ser controlado pelo consumidor e recebe uma região
            nomeada.
          </p>
        </orc-collapsible>
        <code>open = {{ open() }}</code>
      </div>
      <div class="example-grid example-grid--two">
        <div class="example">
          <span class="example__label">Lazy</span
          ><orc-collapsible title="Conteúdo lazy" [lazy]="true"
            ><p class="collapsible-copy">
              Só permanece renderizado enquanto aberto.
            </p></orc-collapsible
          >
        </div>
        <div class="example">
          <span class="example__label">Desabilitado</span
          ><orc-collapsible title="Bloqueado" [disabled]="true"
            ><p class="collapsible-copy">
              Este conteúdo não pode ser alternado.
            </p></orc-collapsible
          >
        </div>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly open = signal(true);

  ngOnInit(): void {
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({ open: this.open(), state: 'controlled' });
  }
}
