import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'orc-empty-state', standalone: true,
  template: `<section class="orc-empty-state" [attr.aria-label]="title()"><div class="orc-empty-state__icon" aria-hidden="true">{{ icon() }}</div><h2>{{ title() }}</h2>@if (description()) { <p>{{ description() }}</p> }@if (actionLabel()) { <button type="button" (click)="action.emit()">{{ actionLabel() }}</button> }<ng-content /></section>`,
  styles: [':host{display:block}.orc-empty-state{display:grid;justify-items:center;gap:.6rem;padding:3rem 1.5rem;border:1px dashed var(--orc-border-strong,#cbd5e1);border-radius:.75rem;text-align:center;color:var(--orc-text,#0f172a)}.orc-empty-state__icon{font-size:2rem}.orc-empty-state h2,.orc-empty-state p{margin:0}.orc-empty-state p{max-width:36rem;color:var(--orc-text-muted,#64748b)}button{border:0;border-radius:.5rem;padding:.55rem .85rem;background:var(--orc-interactive,#2563eb);color:var(--orc-on-interactive,#fff);font:inherit;cursor:pointer}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent { readonly title = input<string | undefined>(undefined); readonly description = input<string | undefined>(undefined); readonly icon = input('∅'); readonly actionLabel = input<string | undefined>(undefined); readonly action = output<void>(); }
