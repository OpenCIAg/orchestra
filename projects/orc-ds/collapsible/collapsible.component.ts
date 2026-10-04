import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  booleanAttribute,
  computed,
  effect,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

let nextCollapsibleId = 0;

@Component({
  selector: 'orc-collapsible',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './collapsible.component.html',
  styleUrl: './collapsible.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleComponent {
  private readonly uniqueId = `orc-collapsible-${++nextCollapsibleId}`;
  readonly id = input('');
  readonly title = input('');
  readonly summary = input('');
  readonly open = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Controls whether the content region is initially omitted. Angular still
   * instantiates ordinary projected children eagerly; use lazyContent when
   * child creation must be deferred until the first open.
   */
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly lazyContent = input<TemplateRef<unknown> | null>(null);
  readonly toggleChange = output<boolean>();
  readonly effectiveId = computed(() => this.id() || this.uniqueId);
  readonly triggerId = computed(() => `${this.effectiveId()}-trigger`);
  readonly contentId = computed(() => `${this.effectiveId()}-content`);
  private readonly hasOpened = signal(false);
  readonly shouldRenderContent = computed(
    () => !this.lazy() || this.open() || this.hasOpened(),
  );
  readonly triggerAriaLabel = computed(() =>
    this.title().trim() || this.summary().trim() ? null : 'Collapsible section',
  );

  constructor() {
    effect(() => {
      if (this.open()) this.hasOpened.set(true);
    });
  }

  toggle(): void {
    if (this.disabled()) return;
    this.open.update((value) => !value);
    this.toggleChange.emit(this.open());
  }
}
