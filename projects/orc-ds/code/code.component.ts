import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { P2_SHARED_VARS } from '@ciag/orchestra/internal';
@Component({
  selector: 'orc-code',
  standalone: true,
  templateUrl: './code.component.html',
  styles: [P2_SHARED_VARS],
  styleUrl: './code.component.scss',
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
