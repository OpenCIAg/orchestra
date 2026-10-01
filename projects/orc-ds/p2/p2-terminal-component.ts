import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { P2_SHARED_STYLES } from './p2-shared';

@Component({
  selector: 'orc-terminal',
  standalone: true,
  template: `<section
    class="orc-terminal"
    [class]="'orc-terminal ' + styleClass()"
    [attr.aria-label]="ariaLabel()?.trim() || 'Terminal'"
  >
    @if (welcomeMessage()) {
      <p class="welcome">{{ welcomeMessage() }}</p>
    }
    <div
      #historyViewport
      class="history"
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
      aria-label="Terminal history"
    >
      @for (line of history(); track $index) {
        <div>
          <span class="prompt">{{ prompt() }}</span
          >{{ line.command }}
          @if (line.output) {
            <pre>{{ line.output }}</pre>
          }
        </div>
      }
    </div>
    <form (submit)="submit($event)">
      <span class="prompt">{{ prompt() }}</span
      ><input
        [value]="command()"
        (input)="command.set($any($event.target).value)"
        autocomplete="off"
        [attr.aria-label]="commandAriaLabel()?.trim() || 'Terminal command'"
      />
    </form>
  </section>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-terminal{display:block;padding:.8rem;border-radius:.6rem;background:var(--orc-component-code-surface);color:var(--orc-component-code-text);font: .85rem/1.5 ui-monospace,monospace}.welcome{margin:0 0 .5rem;color:var(--orc-component-code-muted)}.history{max-height:18rem;overflow:auto}.prompt{color:var(--orc-component-code-accent)}.history pre{margin:.15rem 0 .5rem;white-space:pre-wrap;color:var(--orc-component-code-muted)}.orc-terminal form{display:flex;gap:.3rem}.orc-terminal input{min-width:0;flex:1;border:0;outline:0;background:transparent;color:inherit;font:inherit}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerminalComponent {
  private readonly historyViewport =
    viewChild<ElementRef<HTMLDivElement>>('historyViewport');
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  readonly prompt = input('$ ');
  readonly welcomeMessage = input<string | undefined>(undefined);
  readonly styleClass = input('');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly commandAriaLabel = input<string | undefined>(undefined);
  readonly command = model('');
  readonly history = model<TerminalLine[]>([]);
  readonly commandRun = output<string>();
  readonly onCommand = output<string>();

  constructor() {
    effect(() => {
      this.history();
      const viewport = this.historyViewport()?.nativeElement;
      if (!viewport) return;

      const distanceFromBottom =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      const shouldFollow = distanceFromBottom <= 1;
      afterNextRender(
        () => {
          if (this.destroyRef.destroyed || !shouldFollow) return;
          viewport.scrollTop = viewport.scrollHeight;
        },
        { injector: this.injector },
      );
    });
  }

  submit(event: Event): void {
    event.preventDefault();
    const value = this.command().trim();
    if (!value) return;
    this.history.update((lines) => [...lines, { command: value }]);
    this.command.set('');
    this.commandRun.emit(value);
    this.onCommand.emit(value);
  }
}
export interface TerminalLine {
  command: string;
  output?: string;
}
