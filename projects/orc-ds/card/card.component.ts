import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'orc-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  clickable = input(false, { transform: booleanAttribute });
  selected = input(false, { transform: booleanAttribute });
  variant = input<'simple' | 'dashboard'>('simple');
  readonly flush = input(false, { transform: booleanAttribute });
  readonly media = input(false, { transform: booleanAttribute });
  readonly padding = input<string | number | undefined>(undefined);
  readonly clip = input(false, { transform: booleanAttribute });
  header = input<string | undefined>(undefined);
  subheader = input<string | undefined>(undefined);
  styleClass = input('');
  style = input<Record<string, string | number> | undefined>(undefined);
  ariaLabel = input('');

  cardClick = output<void>();
  onClickEvent = output<MouseEvent>();

  onClick(): void {
    if (this.clickable()) {
      this.cardClick.emit();
    }
  }

  onCardClick(event: MouseEvent): void {
    if (!this.clickable() || this.isNestedInteractive(event)) return;
    this.activate(event);
  }

  onPrimaryClick(event: MouseEvent): void {
    if (!this.clickable()) return;
    this.activate(event);
  }

  private activate(event: MouseEvent): void {
    this.onClick();
    this.onClickEvent.emit(event);
  }

  private isNestedInteractive(event: Event): boolean {
    const target = event.target;
    const current = event.currentTarget;
    const ownerDocument =
      (current as { ownerDocument?: Document | null } | null)?.ownerDocument ??
      (target as { ownerDocument?: Document | null } | null)?.ownerDocument;
    const ElementConstructor = ownerDocument?.defaultView?.Element;
    if (
      !ElementConstructor ||
      !(target instanceof ElementConstructor) ||
      !(current instanceof ElementConstructor)
    ) {
      return false;
    }
    const selector =
      'a,button,input,select,textarea,[role="button"],[role="link"],[role="checkbox"],[role="radio"],[role="slider"],[role="combobox"],[role="switch"],[role="tab"],[role="menuitem"],[tabindex]';
    const path = event.composedPath();
    const boundary = path.slice(0, Math.max(path.indexOf(current), 0));
    return boundary.some(
      (node) => node instanceof ElementConstructor && node.matches(selector),
    );
  }
}
