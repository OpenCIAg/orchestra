import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { EditorComponent } from '@ciag/orchestra/editor';
import type { EditorAction } from '@ciag/orchestra/editor';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-editor-example',
  standalone: true,
  imports: [EditorComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Safe formatted content</span>
        <orc-editor
          [(value)]="content"
          [actions]="actions"
          ariaLabel="Descrição do projeto"
          placeholder="Escreva uma descrição"
          (onInit)="onInit()"
          (onTextChange)="onTextChange($event)"
          (blur)="onBlur($event)"
        />
      </div>
      <div class="example-grid example-grid--two">
        <div class="example example--muted">
          <span class="example__label">CVA / model state</span>
          <code>value = {{ content() }}</code>
          <p>
            {{ initialized() ? 'Inicializado via onInit.' : 'Inicializando…' }}
          </p>
        </div>
        <div class="example example--muted">
          <span class="example__label">Text change</span>
          <p data-testid="editor-text-state">
            {{ textChange() }}
          </p>
        </div>
      </div>
      <p class="example__caption">
        A formatação usa a API <code>execCommand</code> do navegador; nenhum
        engine Quill é carregado.
      </p>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly content = signal(
    '<p><strong>Safe content</strong> for the project brief.</p>',
  );
  readonly textChange = signal('Nenhuma alteração de texto ainda.');
  readonly initialized = signal(false);
  readonly actions: EditorAction[] = [
    { command: 'bold', icon: 'B', label: 'Negrito' },
    { command: 'italic', icon: 'I', label: 'Itálico' },
    { command: 'underline', icon: 'U', label: 'Sublinhado' },
  ];

  ngOnInit(): void {
    this.emit();
  }

  onInit(): void {
    this.initialized.set(true);
    this.emit();
  }

  onTextChange(event: { html: string; text: string }): void {
    this.textChange.set(event.text || 'Texto vazio.');
    this.emit();
  }

  onBlur(value: string): void {
    this.stateChange.emit({
      state: `Editor desfocado: ${value.length} caracteres`,
    });
  }

  private emit(): void {
    this.stateChange.emit({
      value: this.content(),
      text: this.textChange(),
      state: this.initialized() ? 'initialized' : 'initializing',
    });
  }
}
