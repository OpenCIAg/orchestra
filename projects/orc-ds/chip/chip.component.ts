import { ChangeDetectionStrategy, Component, booleanAttribute, input, model, output } from '@angular/core';
import { ChipSize, ChipVariant } from './chip.types';

@Component({
  selector: 'orc-chip',
  standalone: true,
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipComponent {
  readonly label = input('');
  readonly value = input<string | number>('');
  readonly variant = input<ChipVariant>('neutral');
  readonly size = input<ChipSize>('md');
  readonly selectable = input(false, { transform: booleanAttribute });
  readonly removable = input(false, { transform: booleanAttribute });
  readonly icon = input<string | undefined>(undefined);
  readonly image = input<string | undefined>(undefined);
  readonly removeIcon = input('×');
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly selected = model(false);
  readonly removed = output<string | number>();
  readonly onRemove = output<Event>();

  toggle(): void {
    if (!this.disabled() && this.selectable()) this.selected.update(value => !value);
  }
  remove(event: Event): void {
    event.stopPropagation();
    if (!this.disabled()) { this.removed.emit(this.value() || this.label()); this.onRemove.emit(event); }
  }
}
