import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, IconButtonComponent } from '@ciag/orchestra/button';
import { InputComponent, TextareaComponent } from '@ciag/orchestra/input';
import { CheckboxComponent } from '@ciag/orchestra/checkbox';
import { CardComponent, CardHeaderComponent, CardBodyComponent, CardFooterComponent } from '@ciag/orchestra/card';
import { BadgeComponent } from '@ciag/orchestra/badge';
import { AvatarComponent, AvatarGroupComponent, AvatarItem } from '@ciag/orchestra/avatar';
import { AlertComponent } from '@ciag/orchestra/alert';
import { ProgressBarComponent, ProgressCircleComponent } from '@ciag/orchestra/progress';
import { BreadcrumbComponent } from '@ciag/orchestra/breadcrumb';
import { TabComponent, TabGroupComponent } from '@ciag/orchestra/tabs';
import { TimelineComponent, TimelineItem } from '@ciag/orchestra/timeline';
import { SwitchComponent } from '@ciag/orchestra/switch';
import { SelectComponent, OptionComponent } from '@ciag/orchestra/select';
import { SliderComponent } from '@ciag/orchestra/slider';
import { RatingComponent } from '@ciag/orchestra/rating';
import { ChipComponent } from '@ciag/orchestra/chip';
import { DividerComponent } from '@ciag/orchestra/divider';
import { AccordionComponent, AccordionItemComponent } from '@ciag/orchestra/accordion';
import { ModalComponent } from '@ciag/orchestra/modal';
import { LoadingSpinnerComponent } from '@ciag/orchestra/spinner';
import { SkeletonComponent } from '@ciag/orchestra/skeleton';
import { ToolbarComponent, ToolbarItemDirective } from '@ciag/orchestra/toolbar';

type Page = 'overview' | 'projects' | 'team' | 'reports' | 'settings';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonComponent, IconButtonComponent, InputComponent, TextareaComponent,
    CheckboxComponent, CardComponent, CardHeaderComponent, CardBodyComponent, CardFooterComponent,
    BadgeComponent, AvatarComponent, AvatarGroupComponent, AlertComponent, ProgressBarComponent,
    ProgressCircleComponent, BreadcrumbComponent, TabComponent, TabGroupComponent,
    TimelineComponent, SwitchComponent, SelectComponent, OptionComponent, SliderComponent,
    RatingComponent, ChipComponent, DividerComponent, AccordionComponent, AccordionItemComponent,
    ModalComponent, LoadingSpinnerComponent, SkeletonComponent, ToolbarComponent, ToolbarItemDirective,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly loggedIn = signal(false);
  readonly page = signal<Page>('overview');
  readonly mobileNavOpen = signal(false);
  readonly modalOpen = signal(false);
  readonly toastVisible = signal(true);
  readonly darkMode = signal(false);
  readonly loading = signal(false);
  loginEmail = '';
  loginPassword = '';
  reportName = '';
  reportNote = '';
  projectName = '';
  projectDescription = '';
  reportType: string | number | null = null;
  projectOwner: string | number | null = null;

  readonly navItems: { id: Page; label: string; icon: string; hint?: string }[] = [
    { id: 'overview', label: 'Overview', icon: '⌂' },
    { id: 'projects', label: 'Projects', icon: '◫', hint: '12' },
    { id: 'team', label: 'Team', icon: '◎' },
    { id: 'reports', label: 'Reports', icon: '⌁' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
  ];

  readonly team: AvatarItem[] = [
    { initials: 'AM', name: 'Ana Martins', colorVariant: 'primary', status: 'online' },
    { initials: 'JR', name: 'João Rocha', colorVariant: 'purple', status: 'busy' },
    { initials: 'LC', name: 'Lia Costa', colorVariant: 'orange', status: 'away' },
    { initials: 'MN', name: 'Maya Nunes', colorVariant: 'cyan', status: 'online' },
  ];

  readonly timeline: TimelineItem[] = [
    { title: 'Discovery approved', description: 'Scope aligned with stakeholders', date: 'Aug 12', status: 'completed' },
    { title: 'Design system rollout', description: 'Components ready for review', date: 'Aug 16', status: 'current' },
    { title: 'Engineering handoff', description: 'Implementation sprint starts', date: 'Aug 21', status: 'pending' },
  ];

  readonly rows = [
    { name: 'Merchant Portal', owner: 'Ana Martins', status: 'On track', progress: 82, due: 'Aug 24' },
    { name: 'Revenue Intelligence', owner: 'João Rocha', status: 'At risk', progress: 64, due: 'Aug 29' },
    { name: 'Customer Identity', owner: 'Lia Costa', status: 'On track', progress: 91, due: 'Sep 02' },
    { name: 'Mobile Checkout', owner: 'Maya Nunes', status: 'Planning', progress: 28, due: 'Sep 18' },
  ];

  login(): void {
    this.loading.set(true);
    window.setTimeout(() => {
      this.loading.set(false);
      this.loggedIn.set(true);
    }, 450);
  }

  navigate(page: Page): void {
    this.page.set(page);
    this.mobileNavOpen.set(false);
  }

  toggleTheme(enabled: boolean): void {
    this.darkMode.set(enabled);
    document.documentElement.dataset['theme'] = enabled ? 'dark' : 'light';
  }

  signOut(): void {
    this.loggedIn.set(false);
    this.page.set('overview');
    this.loginPassword = '';
  }

  get pageTitle(): string {
    return this.navItems.find((item) => item.id === this.page())?.label ?? 'Overview';
  }
}
