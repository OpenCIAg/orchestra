import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AvatarColorVariant,
  AvatarItem,
  AvatarShape,
  AvatarSize,
} from './avatar.types';
import { AvatarComponent } from './avatar.component';

@Component({
  selector: 'orc-avatar-group',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  templateUrl: './avatar-group.component.html',
  styleUrl: './avatar-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarGroupComponent {
  // Inputs (Signals API)
  readonly items = input<AvatarItem[]>([]);
  readonly max = input<number>(0);
  readonly size = input<AvatarSize>('md');
  readonly shape = input<AvatarShape>('circular');
  readonly excessCount = input<number>(0);
  readonly excessColorVariant = input<AvatarColorVariant>('default');
  readonly bordered = input<boolean>(true);

  // Sinais computados
  readonly visibleItems = computed(() => {
    const list = this.items();
    const limit = this.max();
    if (limit > 0 && list.length > limit) {
      return list.slice(0, limit);
    }
    return list;
  });

  readonly calculatedExcess = computed(() => {
    if (this.excessCount() > 0) {
      return this.excessCount();
    }
    const limit = this.max();
    const total = this.items().length;
    if (limit > 0 && total > limit) {
      return total - limit;
    }
    return 0;
  });

  readonly excessText = computed(() => {
    const excess = this.calculatedExcess();
    return excess > 0 ? `+${excess}` : '';
  });
}
