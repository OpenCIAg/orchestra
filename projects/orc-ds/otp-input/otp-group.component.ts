import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'orc-otp-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="otp-group">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }
    .otp-group {
      display: flex;
      gap: 4px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtpGroupComponent {}
