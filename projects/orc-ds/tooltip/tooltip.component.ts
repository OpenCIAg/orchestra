import {
  Component,
  ChangeDetectionStrategy,
  signal,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipPosition, TooltipTheme } from './tooltip.types';

/**
 * @deprecated Internal overlay rendered by `TooltipDirective`. Its state
 * signals are implementation controls rather than Angular inputs, so direct
 * selector usage is not a supported consumer API. Use `TooltipDirective`;
 * retain this export through the compatibility window.
 */
@Component({
  selector: 'orc-tooltip-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent {
  readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly text = signal<string>('');
  readonly theme = signal<TooltipTheme>('dark');
  readonly position = signal<TooltipPosition>('top');
  readonly actualPosition = signal<TooltipPosition>('top');
  readonly fitContent = signal(true);
  readonly visible = signal<boolean>(false);
  readonly id = signal<string>('');
  readonly styleClass = signal<string>('');
}
