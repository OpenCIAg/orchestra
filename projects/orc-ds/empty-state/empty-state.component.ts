import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'orc-empty-state',
  standalone: true,
  template: `<section
    class="orc-empty-state orc-p2-empty-state"
    role="region"
    [attr.aria-label]="accessibleName()"
  >
    <div class="orc-empty-state__icon icon" aria-hidden="true">
      {{ visibleIcon() }}
    </div>
    @if (visibleTitle()) {
      <h2>{{ visibleTitle() }}</h2>
    }
    @if (visibleDescription()) {
      <p>{{ visibleDescription() }}</p>
    }
    @if (actionLabel()) {
      <button
        type="button"
        [attr.aria-label]="actionAccessibleName()"
        (click)="emitAction()"
      >
        {{ actionLabel() }}
      </button>
    }
    <ng-content />
  </section>`,
  styles: [
    ':host{display:block}.orc-empty-state{display:grid;justify-items:center;gap:.6rem;padding:3rem 1.5rem;border:1px dashed var(--orc-border-strong,#cbd5e1);border-radius:.75rem;text-align:center;color:var(--orc-text,#0f172a)}.orc-empty-state__icon{font-size:2rem}.orc-empty-state h2,.orc-empty-state p{margin:0}.orc-empty-state p{max-width:36rem;color:var(--orc-text-muted,#64748b)}button{border:0;border-radius:.5rem;padding:.55rem .85rem;background:var(--orc-interactive,#2563eb);color:var(--orc-on-interactive,#fff);font:inherit;cursor:pointer}',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly title = input<string | undefined>(undefined);
  readonly description = input<string | undefined>(undefined);
  readonly icon = input('∅');
  readonly actionLabel = input<string, string | undefined>('', {
    transform: (value) => value?.trim() ?? '',
  });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly actionAriaLabel = input<string | undefined>(undefined);
  readonly action = output<void>();

  readonly visibleTitle = computed(() => this.title()?.trim() ?? '');
  readonly visibleDescription = computed(
    () => this.description()?.trim() ?? '',
  );
  readonly visibleIcon = computed(() => this.icon()?.trim() || '∅');
  readonly accessibleName = computed(
    () => this.ariaLabel()?.trim() || this.visibleTitle() || 'Empty state',
  );
  readonly actionAccessibleName = computed(
    () => this.actionAriaLabel()?.trim() || this.actionLabel(),
  );

  emitAction(): void {
    if (this.actionLabel()) this.action.emit();
  }
}
