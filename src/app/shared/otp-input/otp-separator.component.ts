import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otp-separator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="otp-separator" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
        <line x1="6" y1="12" x2="18" y2="12" />
      </svg>
    </div>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .otp-separator {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 36px;
      color: var(--text-secondary);

      svg {
        width: 14px;
        height: 14px;
        opacity: 0.8;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtpSeparatorComponent {}
