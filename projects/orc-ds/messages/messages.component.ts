import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';
import { ORC_SHARED_STYLES } from '@ciag/orchestra/internal';

export interface MessageItem {
  severity?: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';
  summary?: string;
  detail?: string;
  id?: string | number;
  closable?: boolean;
}

@Component({
  selector: 'orc-messages',
  standalone: true,
  template: `
    <section
      class="p-messages p-component orc-messages"
      [class]="'p-messages p-component orc-messages ' + styleClass()"
      [attr.aria-label]="ariaLabel() || 'Messages'"
      [attr.aria-live]="ariaLive()"
      data-pc-name="messages"
    >
      @for (message of messages(); track message) {
        <div
          class="p-message p-component message"
          [class]="
            'p-message p-component message p-message-' +
            (message.severity || 'info') +
            ' severity-' +
            (message.severity || 'info')
          "
          [attr.role]="messageRole(message)"
          [attr.data-pc-severity]="message.severity || 'info'"
        >
          <div class="message-content">
            @if (message.summary) {
              <strong>{{ message.summary }}</strong>
            }
            @if (message.detail) {
              <span>{{ message.detail }}</span>
            }
          </div>
          @if (closable() && message.closable !== false) {
            <button
              type="button"
              [attr.aria-label]="closeLabel() || 'Dismiss message'"
              (click)="remove($index)"
            >
              <span aria-hidden="true">×</span>
            </button>
          }
        </div>
      }
    </section>
  `,
  styles: [
    ORC_SHARED_STYLES +
      `.orc-messages{display:grid;gap:.6rem;width:100%}.message{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;padding:.7rem .85rem;border:1px solid var(--orc-component-border-strong);border-radius:.5rem;background:var(--orc-component-interactive-soft);color:var(--orc-component-status-info-fg)}.message-content{display:grid;gap:.15rem;min-width:0}.message span{color:inherit}.message button{display:grid;place-items:center;flex:0 0 auto;min-width:2rem;min-height:2rem;padding:.2rem;border:0;border-radius:.25rem;background:transparent;color:inherit;font-size:1.1rem;line-height:1}.message button:hover{background:color-mix(in srgb,currentColor 10%,transparent)}.severity-success{background:var(--orc-component-status-success-bg);color:var(--orc-component-status-success-fg);border-color:var(--orc-component-status-success-border)}.severity-warn{background:var(--orc-component-status-warning-bg);color:var(--orc-component-status-warning-fg);border-color:var(--orc-component-status-warning-border)}.severity-error{background:var(--orc-component-status-danger-bg);color:var(--orc-component-status-danger-fg);border-color:var(--orc-component-status-danger-border)}.severity-secondary{background:var(--orc-component-surface-muted);color:var(--orc-component-text-secondary);border-color:var(--orc-component-border)}.severity-contrast{background:var(--orc-component-text);color:var(--orc-component-surface);border-color:var(--orc-component-text)}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesComponent {
  readonly messages = model<MessageItem[]>([]);
  readonly closable = input(true, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLive = input<'polite' | 'assertive'>('polite');
  readonly closeLabel = input<string | undefined>(undefined);
  readonly styleClass = input('');
  readonly messageClose = output<MessageItem>();
  readonly clear = output<void>();

  messageRole(message: MessageItem): 'alert' | 'status' {
    return message.severity === 'error' || message.severity === 'warn'
      ? 'alert'
      : 'status';
  }

  remove(index: number): void {
    const message = this.messages()[index];
    if (!message) return;

    this.messages.update((items) =>
      items.filter((_, itemIndex) => itemIndex !== index),
    );
    this.messageClose.emit(message);
  }

  clearMessages(): void {
    this.messages.set([]);
    this.clear.emit();
  }
}
