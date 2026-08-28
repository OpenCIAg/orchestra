import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';

export type TagVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'contrast';

@Component({
  selector: 'orc-tag', standalone: true,
  template: `<span class="orc-tag" [class]="'orc-tag orc-tag--' + effectiveVariant() + ' ' + styleClass()" [class.orc-tag--rounded]="rounded()" [attr.aria-disabled]="disabled() || null">@if (icon()) { <span aria-hidden="true">{{ icon() }}</span> }<span>{{ value() ?? label() }}</span>@if (removable()) { <button type="button" [disabled]="disabled()" [attr.aria-label]="removeAriaLabel() || null" (click)="remove($event)">×</button> }</span>`,
  styles: [':host{display:inline-block}.orc-tag{display:inline-flex;align-items:center;gap:.3rem;min-height:1.6rem;padding:.2rem .55rem;border-radius:.35rem;font-size:.8rem;font-weight:600;background:var(--orc-surface-muted,#f1f5f9);color:var(--orc-text-secondary,#475569)}.orc-tag--rounded{border-radius:999px}.orc-tag--primary,.orc-tag--info{background:var(--orc-interactive-soft,#eff6ff);color:var(--orc-interactive-hover,#1d4ed8)}.orc-tag--success{background:var(--orc-status-success-bg,#dcfce7);color:var(--orc-status-success-fg,#166534)}.orc-tag--warning{background:var(--orc-status-warning-bg,#fef3c7);color:var(--orc-status-warning-fg,#92400e)}.orc-tag--danger{background:var(--orc-status-danger-bg,#fee2e2);color:var(--orc-status-danger-fg,#991b1b)}button{border:0;background:transparent;color:inherit;padding:0;font:inherit;cursor:pointer}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagComponent {
  readonly label = input<string | undefined>(undefined); readonly value = input<string | undefined>(undefined); readonly variant = input<TagVariant>('neutral'); readonly severity = input<TagVariant | undefined>(undefined); readonly icon = input(''); readonly rounded = input(false, { transform: booleanAttribute }); readonly removable = input(false, { transform: booleanAttribute }); readonly disabled = input(false, { transform: booleanAttribute }); readonly styleClass = input(''); readonly removeAriaLabel = input<string | undefined>(undefined);
  readonly removed = output<string>(); readonly onRemove = output<{ value: string }>();
  effectiveVariant(): TagVariant { return this.severity() ?? this.variant(); }
  remove(event: Event): void { event.stopPropagation(); if (!this.disabled()) { const value = this.value() ?? this.label() ?? ''; this.removed.emit(value); this.onRemove.emit({ value }); } }
}
