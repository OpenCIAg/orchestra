import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { P2_SHARED_STYLES } from '@ciag/orchestra/internal';
@Component({
  selector: 'orc-code',
  standalone: true,
  template: `
    <div class="orc-p2-code">
      <div class="toolbar">
        @if (language()) {
          <span
            class="language"
            [attr.aria-label]="'Language: ' + language()"
            >{{ language() }}</span
          >
        }
        <button type="button" (click)="copy()">
          {{ copied() ? copiedLabel() : copyLabel() }}
        </button>
      </div>
      <pre><code [attr.data-language]="language() || null">{{ code() }}</code></pre>
      <span class="sr-only" aria-live="polite" aria-atomic="true">{{
        copyStatus()
      }}</span>
    </div>
  `,
  styles: [
    P2_SHARED_STYLES +
      `
    :host { display: block; }
    .orc-p2-code { overflow: hidden; border: 1px solid var(--orc-component-code-border); border-radius: .75rem; background: var(--orc-component-code-surface); color: var(--orc-component-code-text); }
    .toolbar { display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding: .45rem .7rem; border-bottom: 1px solid var(--orc-component-code-border); color: var(--orc-component-code-muted); font-size: .75rem; }
    .toolbar button { flex: none; border: 0; border-radius: .35rem; background: var(--orc-component-code-surface-raised); color: var(--orc-component-code-text); padding: .35rem .6rem; font: inherit; cursor: pointer; }
    .toolbar button:focus-visible { outline: 2px solid var(--orc-component-interactive); outline-offset: 2px; }
    pre { max-width: 100%; max-height: 32rem; margin: 0; overflow: auto; padding: 1rem; tab-size: 2; }
    code { font: .82rem/1.6 ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
  `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeComponent {
  readonly code = input('');
  readonly language = input<string | undefined>(undefined);
  readonly copyLabel = input('Copy');
  readonly copiedLabel = input('Copied');
  readonly copyFailedLabel = input('Copy failed');
  readonly copied = signal(false);
  readonly copyStatus = signal('');
  readonly copiedEvent = output<string>();
  readonly copyFailed = output<unknown>();
  private readonly destroyRef = inject(DestroyRef);
  private resetTimer: ReturnType<typeof setTimeout> | undefined;
  private copyAttempt = 0;

  constructor() {
    this.destroyRef.onDestroy(() => this.clearResetTimer());
  }

  async copy(): Promise<void> {
    const attempt = ++this.copyAttempt;
    this.clearResetTimer();
    const value = this.code();
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        throw new Error(
          'Clipboard API is unavailable in this browser context.',
        );
      }
      await navigator.clipboard.writeText(value);
      if (this.destroyRef.destroyed || attempt !== this.copyAttempt) return;
      this.copied.set(true);
      this.copyStatus.set(this.copiedLabel());
      this.copiedEvent.emit(value);
      this.resetTimer = setTimeout(() => {
        this.resetTimer = undefined;
        if (!this.destroyRef.destroyed) {
          this.copied.set(false);
          this.copyStatus.set('');
        }
      }, 1200);
    } catch (error) {
      if (this.destroyRef.destroyed || attempt !== this.copyAttempt) return;
      this.copied.set(false);
      this.copyStatus.set(this.copyFailedLabel());
      this.copyFailed.emit(error);
    }
  }

  private clearResetTimer(): void {
    if (this.resetTimer !== undefined) {
      clearTimeout(this.resetTimer);
      this.resetTimer = undefined;
    }
  }
}
