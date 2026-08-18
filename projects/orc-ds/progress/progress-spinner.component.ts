import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'orc-progress-spinner', standalone: true,
  template: `<svg class="orc-progress-spinner" [style.width.px]="size()" [style.height.px]="size()" [style.animation-duration]="animationDuration()" role="progressbar" [attr.aria-label]="ariaLabel()"><circle class="track" cx="50" cy="50" r="40" [attr.stroke-width]="strokeWidth()" [attr.stroke]="fill()" /><circle class="spinner" cx="50" cy="50" r="40" [attr.stroke-width]="strokeWidth()" [attr.stroke]="color()" /></svg>`,
  styles: [`.orc-progress-spinner{display:inline-block;overflow:visible;animation:orc-spin 1.6s linear infinite}.orc-progress-spinner .track{fill:none;opacity:.2}.orc-progress-spinner .spinner{fill:none;stroke-linecap:round;stroke-dasharray:70 180;transform:rotate(-90deg);transform-origin:50% 50%}@keyframes orc-spin{to{transform:rotate(360deg)}}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressSpinnerComponent {
  readonly strokeWidth = input(6); readonly fill = input('currentColor'); readonly color = input('currentColor'); readonly animationDuration = input('1.6s'); readonly size = input(48); readonly ariaLabel = input('Loading'); readonly animation = input<'none' | 'spin'>('spin');
}
