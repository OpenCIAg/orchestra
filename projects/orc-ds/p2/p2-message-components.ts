import { booleanAttribute, ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { P2_SHARED_STYLES } from './p2-shared';

export interface P2Message { severity?: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast'; summary?: string; detail?: string; id?: string | number; closable?: boolean; }

@Component({
  selector: 'orc-messages', standalone: true,
  template: `<section class="p-messages p-component orc-messages" [class]="'p-messages p-component orc-messages ' + styleClass()" [attr.aria-label]="ariaLabel() || null" [attr.aria-live]="ariaLive()" data-pc-name="messages">@for (message of messages(); track message.id ?? $index) { <article class="p-message p-component message" [class]="'p-message p-component message p-message-' + (message.severity || 'info') + ' severity-' + (message.severity || 'info')" [attr.role]="messageRole(message)" [attr.data-pc-severity]="message.severity || 'info'"><div>@if (message.summary) { <strong>{{ message.summary }}</strong> } @if (message.detail) { <span>{{ message.detail }}</span> }</div>@if (closable() && message.closable !== false && closeLabel()) { <button type="button" [attr.aria-label]="closeLabel()" (click)="remove($index)">×</button> }</article> }</section>`,
  styles: [P2_SHARED_STYLES + `.orc-messages{display:grid;gap:.6rem;width:100%}.message{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;padding:.7rem .85rem;border:1px solid var(--orc-component-border-strong);border-radius:.5rem;background:var(--orc-component-interactive-soft);color:var(--orc-component-status-info-fg)}.message>div{display:grid;gap:.15rem}.message span{color:inherit}.message button{border:0;background:transparent;color:inherit;font-size:1.1rem}.severity-success{background:var(--orc-component-status-success-bg);color:var(--orc-component-status-success-fg);border-color:var(--orc-component-status-success-border)}.severity-warn{background:var(--orc-component-status-warning-bg);color:var(--orc-component-status-warning-fg);border-color:var(--orc-component-status-warning-border)}.severity-error{background:var(--orc-component-status-danger-bg);color:var(--orc-component-status-danger-fg);border-color:var(--orc-component-status-danger-border)}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesComponent {
  readonly messages = model<P2Message[]>([]);
  readonly closable = input(true, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLive = input<'polite' | 'assertive'>('polite');
  readonly closeLabel = input<string | undefined>(undefined);
  readonly styleClass = input('');
  readonly messageClose = output<P2Message>();
  readonly clear = output<void>();
  messageRole(message: P2Message): 'alert' | 'status' { return message.severity === 'error' || message.severity === 'warn' ? 'alert' : 'status'; }
  remove(index: number): void { const message = this.messages()[index]; if (!message) return; this.messages.update(items => items.filter((_, i) => i !== index)); this.messageClose.emit(message); }
  clearMessages(): void { this.messages.set([]); this.clear.emit(); }
}
