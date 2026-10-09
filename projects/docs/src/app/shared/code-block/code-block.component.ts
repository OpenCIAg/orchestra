import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { IconComponent } from '@ciag/orchestra/icon';
import { docsUi } from '../../i18n/docs-ui';

/** Copia texto para a área de transferência (com fallback sem Clipboard API). */
export async function copyText(document: Document, text: string) {
  const clipboard = document.defaultView?.navigator.clipboard;
  if (clipboard?.writeText) {
    await clipboard.writeText(text);
    return;
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'absolute';
  area.style.left = '-9999px';
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  area.remove();
}

/**
 * Bloco de código da docs: nome do arquivo, botão Copiar com retorno
 * anunciado (aria-live) e rolagem horizontal acessível por teclado.
 */
@Component({
  selector: 'app-code-block',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './code-block.component.html',
  styleUrl: './code-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeBlockComponent {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private resetTimer: ReturnType<typeof setTimeout> | undefined;

  readonly code = input.required<string>();
  /** Nome exibido no cabeçalho (ex.: `examples/basic.example.ts`). */
  readonly filename = input<string>('');
  /** Nome acessível da região rolável. */
  readonly label = input<string>('');

  protected readonly ui = docsUi().page;
  protected readonly copied = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.resetTimer));
  }

  async copy(): Promise<void> {
    try {
      await copyText(this.document, this.code());
      this.copied.set(true);
      clearTimeout(this.resetTimer);
      this.resetTimer = setTimeout(() => this.copied.set(false), 2000);
    } catch {
      this.copied.set(false);
    }
  }
}
