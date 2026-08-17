import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'orc-breadcrumb-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb-item.component.html',
  styleUrl: './breadcrumb-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'orc-breadcrumb-item-host',
    '[class.orc-breadcrumb-item--active]': 'active()',
    '[class.orc-breadcrumb-item--disabled]': 'disabled()',
  },
})
export class BreadcrumbItemComponent {
  // Inputs (Signals API)
  readonly label = input<string>('');
  readonly routerLink = input<string | any[] | undefined>(undefined);
  readonly href = input<string | undefined>(undefined);
  readonly active = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly icon = input<string | undefined>(undefined);

  // Outputs (Signals API)
  readonly itemClick = output<MouseEvent>();

  // Determine if item has an active link
  readonly hasLink = computed(() => {
    return !this.active() && !this.disabled() && (!!this.routerLink() || !!this.href());
  });

  handleClick(event: MouseEvent): void {
    if (this.disabled() || this.active()) {
      event.preventDefault();
      return;
    }
    this.itemClick.emit(event);
  }
}
