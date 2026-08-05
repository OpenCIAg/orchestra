import {
  Component,
  ChangeDetectionStrategy,
  signal,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipPosition, TooltipTheme } from './tooltip.types';

@Component({
  selector: 'app-tooltip-overlay',
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
  readonly visible = signal<boolean>(false);
  readonly id = signal<string>('');
}
