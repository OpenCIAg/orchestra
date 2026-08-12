import {
  Component,
  ChangeDetectionStrategy,
  model,
  input,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarState } from './sidebar.types';
import { IconButtonComponent } from '../button/icon-button.component';

@Component({
  selector: 'app-sidebar, orc-sidebar',
  standalone: true,
  imports: [CommonModule, IconButtonComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  // Define if it is expanded, collapsed or responsive (drawer)
  readonly state = model<SidebarState>('expanded');
  
  // Custom accessible label for the navigation
  readonly ariaLabel = input<string>('Navegação Principal');

  readonly isExpanded = computed(() => this.state() === 'expanded');
  readonly isCollapsed = computed(() => this.state() === 'collapsed');

  // SVGs for the toggle button
  readonly chevronLeftIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`;
  readonly chevronRightIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;

  toggleState(): void {
    if (this.state() === 'expanded') {
      this.state.set('collapsed');
    } else if (this.state() === 'collapsed') {
      this.state.set('expanded');
    }
  }
}
