import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, IconButtonComponent, ButtonVariant, ButtonSize } from '@ciag/orchestra/button';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-button-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonComponent,
    IconButtonComponent,
    FooterComponent,
  ],
  templateUrl: './button-page.component.html',
  styleUrl: './button-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonPageComponent {
  // Playground signals for standard Button
  readonly playgroundText = signal<string>('Confirmar Ação');
  readonly playgroundVariant = signal<ButtonVariant>('primary');
  readonly playgroundSize = signal<ButtonSize>('md');
  readonly playgroundDisabled = signal<boolean>(false);
  readonly playgroundLoading = signal<boolean>(false);
  readonly playgroundFullWidth = signal<boolean>(false);
  readonly playgroundIconOnly = signal<boolean>(false);
  readonly playgroundIconLeft = signal<string>('');
  readonly playgroundIconRight = signal<string>('');

  // Playground signals for IconButton
  readonly iconPlaygroundVariant = signal<ButtonVariant>('primary');
  readonly iconPlaygroundSize = signal<ButtonSize>('md');
  readonly iconPlaygroundDisabled = signal<boolean>(false);
  readonly iconPlaygroundLoading = signal<boolean>(false);

  // SVG helper strings
  readonly checkIconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.333 4L5.9997 11.3333L2.66638 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  readonly arrowIconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.33301 8H12.6663M12.6663 8L7.99967 3.33331M12.6663 8L7.99967 12.6666" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  readonly searchIconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 14L11.1 11.1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  readonly trashIconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4H14M5.33333 4V2.66667C5.33333 2.31304 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31304 1.33333 6.66667 1.33333H9.33333C9.68696 1.33333 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31304 10.6667 2.66667V4M12.6667 4V13.3333C12.6667 13.6869 12.5262 14.0261 12.2761 14.2761C12.0261 14.5262 11.6869 14.6667 11.3333 14.6667H4.66667C4.31304 14.6667 3.97391 14.5262 3.72386 14.2761C3.47381 14.0261 3.33333 13.6869 3.33333 13.3333V4H12.6667Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  readonly clickCount = signal<number>(0);

  onButtonClick(): void {
    this.clickCount.update(c => c + 1);
  }

  resetClicks(): void {
    this.clickCount.set(0);
  }
}
