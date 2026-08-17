import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, model, output } from '@angular/core';

let nextCollapsibleId = 0;

@Component({
  selector: 'orc-collapsible',
  standalone: true,
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
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly toggleChange = output<boolean>();
  readonly effectiveId = computed(() => this.id() || this.uniqueId);
  readonly triggerId = computed(() => `${this.effectiveId()}-trigger`);
  readonly contentId = computed(() => `${this.effectiveId()}-content`);

  toggle(): void {
    if (this.disabled()) return;
    this.open.update(value => !value);
    this.toggleChange.emit(this.open());
  }
}
