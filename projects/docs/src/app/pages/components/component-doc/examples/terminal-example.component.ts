import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { TerminalComponent, type TerminalLine } from '@ciag/orchestra/terminal';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-terminal-example',
  standalone: true,
  imports: [TerminalComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Prompt e histórico controlados</span>
        <orc-terminal
          prompt="ops> "
          welcomeMessage="Demo console · commands are handled by this page only."
          [(command)]="command"
          [(history)]="history"
          ariaLabel="Console de operações de demonstração"
          commandAriaLabel="Demo command"
          (commandRun)="onCommandRun($event)"
        />
        <code
          >command = {{ command() || "''" }} · history =
          {{ history().length }} lines</code
        >
        <p data-testid="terminal-action-state">
          {{ message() }}
        </p>
      </div>
      <div class="example example--muted">
        <span class="example__label">O consumidor executa comandos</span>
        <p>
          Enter appends the submitted command and emits
          <code>commandRun</code>. The component does not run a shell command;
          the consumer owns execution and any output added to
          <code>history</code>.
        </p>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerminalExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly command = signal('');
  readonly history = signal<TerminalLine[]>([
    {
      command: 'help',
      output: 'Available demo commands: help, status',
    },
  ]);
  readonly message = signal('Nenhuma ação emitida ainda.');

  ngOnInit(): void {
    this.emit();
  }

  onCommandRun(command: string): void {
    this.history.update((history) => {
      const lastIndex = history.length - 1;
      if (lastIndex < 0 || history[lastIndex]?.command !== command) {
        return history;
      }
      return history.map((line, index) =>
        index === lastIndex
          ? { ...line, output: 'Handled by the demo page; no shell was run.' }
          : line,
      );
    });
    this.message.set(`Terminal command received: ${command}`);
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({
      command: this.command(),
      history: this.history(),
      state: this.message(),
    });
  }
}
