import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';
import { LinkComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-link-example',
  standalone: true,
  imports: [LinkComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Semantic links</span>
        <div class="popover-row">
          <orc-link
            href="#preview"
            [underline]="true"
            (activated)="$event.preventDefault(); onActivate()"
            >Abrir detalhes</orc-link
          >
          <orc-link href="#preview" target="_blank">Abrir em nova aba</orc-link>
          <orc-link href="#preview" [disabled]="true"
            >Link desabilitado</orc-link
          >
        </div>
      </div>
      @if (message(); as message) {
        <code>{{ message }}</code>
      }
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkExampleComponent {
  readonly stateChange = output<Record<string, unknown>>();
  readonly message = signal<string | null>(null);

  onActivate(): void {
    this.message.set('Link ativado');
    this.stateChange.emit({ state: 'Link ativado' });
  }
}
