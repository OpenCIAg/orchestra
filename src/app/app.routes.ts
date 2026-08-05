import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Orchestra',
  },
  {
    path: 'docs',
    loadComponent: () =>
      import('./pages/docs/docs.component').then(m => m.DocsComponent),
    title: 'Branding Guide — Orchestra',
  },
  {
    path: 'components/otp-input',
    loadComponent: () =>
      import('./pages/components/otp-input/otp-input-page.component').then(
        m => m.OtpInputPageComponent
      ),
    title: 'OTP Input — Orchestra',
  },
  {
    path: 'components/card',
    loadComponent: () =>
      import('./pages/components/card/card-page.component').then(
        m => m.CardPageComponent
      ),
    title: 'Card — Orchestra',
  },
  {
    path: 'components/radio',
    loadComponent: () =>
      import('./pages/components/radio/radio-page.component').then(
        m => m.RadioPageComponent
      ),
    title: 'Radio — Orchestra',
  },
  {
    path: 'components/checkbox',
    loadComponent: () =>
      import('./pages/components/checkbox/checkbox-page.component').then(
        m => m.CheckboxPageComponent
      ),
    title: 'Checkbox — Orchestra',
  },
  {
    path: 'components/switch',
    loadComponent: () =>
      import('./pages/components/switch/switch-page.component').then(
        m => m.SwitchPageComponent
      ),
    title: 'Switch — Orchestra',
  },
  {
    path: 'components/avatar',
    loadComponent: () =>
      import('./pages/components/avatar/avatar-page.component').then(
        m => m.AvatarPageComponent
      ),
    title: 'Avatar — Orchestra',
  },
  {
    path: 'components/accordion',
    loadComponent: () =>
      import('./pages/components/accordion/accordion-page.component').then(
        m => m.AccordionPageComponent
      ),
    title: 'Accordion — Orchestra',
  },
  {
    path: 'components/badge',
    loadComponent: () =>
      import('./pages/components/badge/badge-page.component').then(
        m => m.BadgePageComponent
      ),
    title: 'Badge — Orchestra',
  },
  {
    path: 'components/tabs',
    loadComponent: () =>
      import('./pages/components/tabs/tabs-page.component').then(
        m => m.TabsPageComponent
      ),
    title: 'Tabs — Orchestra',
  },
  {
    path: 'components/breadcrumb',
    loadComponent: () =>
      import('./pages/components/breadcrumb/breadcrumb-page.component').then(
        m => m.BreadcrumbPageComponent
      ),
    title: 'Breadcrumb — Orchestra',
  },
  {
    path: 'components/paginator',
    loadComponent: () =>
      import('./pages/components/paginator/paginator-page.component').then(
        m => m.PaginatorPageComponent
      ),
    title: 'Paginator — Orchestra',
  },
  {
    path: 'components/tooltip',
    loadComponent: () =>
      import('./pages/components/tooltip/tooltip-page.component').then(
        m => m.TooltipPageComponent
      ),
    title: 'Tooltip — Orchestra',
  },
  {
    path: 'components/spinner',
    loadComponent: () =>
      import('./pages/components/spinner/spinner-page.component').then(
        m => m.SpinnerPageComponent
      ),
    title: 'Spinner / Loading — Orchestra',
  },
  {
    path: 'components/skeleton',
    loadComponent: () =>
      import('./pages/components/skeleton/skeleton-page.component').then(
        m => m.SkeletonPageComponent
      ),
    title: 'Skeleton — Orchestra',
  },
  {
    path: 'components/alert',
    loadComponent: () =>
      import('./pages/components/alert/alert-page.component').then(
        m => m.AlertPageComponent
      ),
    title: 'Alert — Orchestra',
  },
  {
    path: 'components/toast',
    loadComponent: () =>
      import('./pages/components/toast/toast-page.component').then(
        m => m.ToastPageComponent
      ),
    title: 'Toast / Notifications — Orchestra',
  },
  {
    path: 'components/progress',
    loadComponent: () =>
      import('./pages/components/progress/progress-page.component').then(
        m => m.ProgressPageComponent
      ),
    title: 'Progress — Orchestra',
  },
  {
    path: 'components/table',
    loadComponent: () =>
      import('./pages/components/table/table-page.component').then(
        m => m.TablePageComponent
      ),
    title: 'Table — Orchestra',
  },
  {
    path: 'components/input',
    loadComponent: () =>
      import('./pages/components/input/input-page.component').then(
        m => m.InputPageComponent
      ),
    title: 'Input & Textarea — Orchestra',
  },
  {
    path: 'components/textarea',
    redirectTo: 'components/input',
    pathMatch: 'full',
  },
  {
    path: 'components/slider',
    loadComponent: () =>
      import('./pages/components/slider/slider-page.component').then(
        m => m.SliderPageComponent
      ),
    title: 'Slider — Orchestra',
  },
  {
    path: '**',
    redirectTo: '',
  },
];

