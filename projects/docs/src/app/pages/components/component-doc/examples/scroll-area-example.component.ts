import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ScrollAreaComponent } from '@ciag/orchestra/scroll-area';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-scroll-area-example',
  standalone: true,
  imports: [ScrollAreaComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Vertical viewport</span>
        <orc-scroll-area
          maxHeight="150px"
          label="Notas roláveis"
          (scrolled)="onScroll($event)"
        >
          <p>
            O viewport recebe o conteúdo por projection e cria sombras quando
            existe conteúdo acima ou abaixo.
          </p>
          <p>
            Use PageUp e PageDown quando o viewport estiver focado para avançar
            por páginas.
          </p>
          <p>
            O evento scrolled informa top e left para sincronizações externas.
          </p>
        </orc-scroll-area>
        <code>{{ message() }}</code>
      </div>
      <div class="example example--muted">
        <span class="example__label">Horizontal / both</span>
        <p>
          Combine <code>orientation="horizontal"</code> ou
          <code>"both"</code> com maxWidth e maxHeight.
        </p>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollAreaExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly message = signal('Role o conteúdo para emitir scrolled.');

  ngOnInit(): void {
    this.emit();
  }

  onScroll(event: { top: number; left: number }): void {
    this.message.set(
      `top ${Math.round(event.top)}px · left ${Math.round(event.left)}px`,
    );
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({ state: this.message() });
  }
}
