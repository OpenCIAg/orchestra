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
import { P2_SHARED_VARS } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-terminal',
  standalone: true,
  templateUrl: './terminal.component.html',
  styles: [P2_SHARED_VARS],
  styleUrl: './terminal.component.scss',
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
