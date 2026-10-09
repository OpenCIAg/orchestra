import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

interface Segment {
  readonly code: boolean;
  readonly text: string;
}

/** Divide `texto com \`código\`` em segmentos (sem HTML, sem innerHTML). */
export function splitInlineCode(text: string): Segment[] {
  return text
    .split(/(`[^`]+`)/g)
    .filter((part) => part.length > 0)
    .map((part) =>
      part.startsWith('`') && part.endsWith('`') && part.length > 1
        ? { code: true, text: part.slice(1, -1) }
        : { code: false, text: part },
    );
}

/** Renderiza um texto da docs em que trechos entre crases viram `<code>`. */
@Component({
  selector: 'app-doc-text',
  standalone: true,
  // O texto vai em <ng-container>: os nós só de espaço em volta são removidos
  // pelo compilador, e o texto em volta do `<code>` fica intacto.
  template: `@for (segment of segments(); track $index) {
    @if (segment.code) {
      <code class="doc-code">{{ segment.text }}</code>
    } @else {
      <ng-container>{{ segment.text }}</ng-container>
    }
  }`,
  styles: `
    :host {
      display: inline;
    }
    .doc-code {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 0.875em;
      padding: 0.1em 0.25em;
      border-radius: 0.3rem;
      background: var(--orc-surface-muted);
      color: var(--orc-text);
      overflow-wrap: anywhere;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocTextComponent {
  readonly text = input.required<string>();
  protected readonly segments = computed(() => splitInlineCode(this.text()));
}
