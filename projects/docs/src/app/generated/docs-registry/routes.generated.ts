// GERADO — não edite. Fonte: projects/docs/src/app/content/components/
// (formato novo) e os arquivos legacy de catalog/ e pages/components/.
// Regenere com `npm run docs:generate-registry` (tools/docs/generate-registry.mjs).

import type { Routes } from '@angular/router';
import {
  loadComponentPage,
  resolveComponentApi,
} from '../../pages/component-page/component-page.route';

/**
 * Rotas de componentes. Famílias com content/ usam o template único; as
 * páginas antigas escritas à mão continuam até a onda B migrá-las. As
 * demais caem em `components/:componentId` (página genérica antiga).
 */
export const COMPONENT_ROUTES: Routes = [
  {
    path: 'components/button',
    title: 'Button — Orchestra',
    data: {
      componentId: 'button',
      description:
        'Dispara uma ação: enviar um formulário, abrir um diálogo, confirmar uma operação. Tem variantes de ênfase, três tamanhos, ícones e estado de carregamento.',
    },
    loadComponent: loadComponentPage,
    resolve: {
      page: () => import('./pages/button.page.generated').then((m) => m.PAGE),
      api: resolveComponentApi,
    },
  },
  {
    path: 'components/modal',
    title: 'Modal — Orchestra',
    data: {
      componentId: 'modal',
      description:
        'Janela de diálogo sobre a página, com fundo escurecido, foco preso dentro dela e fechamento por Esc. Para decisões e tarefas curtas que pedem atenção total.',
    },
    loadComponent: loadComponentPage,
    resolve: {
      page: () => import('./pages/modal.page.generated').then((m) => m.PAGE),
      api: resolveComponentApi,
    },
  },
  {
    path: 'components/select',
    title: 'Select — Orchestra',
    data: {
      componentId: 'select',
      description:
        'Campo para escolher uma ou várias opções de uma lista fechada. Abre um painel com navegação por teclado, busca opcional e integração com formulários do Angular.',
    },
    loadComponent: loadComponentPage,
    resolve: {
      page: () => import('./pages/select.page.generated').then((m) => m.PAGE),
      api: resolveComponentApi,
    },
  },
  {
    path: 'components/accordion',
    title: 'Accordion — Orchestra',
    loadComponent: () =>
      import('../../pages/components/accordion/accordion-page.component').then(
        (m) => m.AccordionPageComponent,
      ),
  },
  {
    path: 'components/alert',
    title: 'Alert — Orchestra',
    loadComponent: () =>
      import('../../pages/components/alert/alert-page.component').then(
        (m) => m.AlertPageComponent,
      ),
  },
  {
    path: 'components/avatar',
    title: 'Avatar — Orchestra',
    loadComponent: () =>
      import('../../pages/components/avatar/avatar-page.component').then(
        (m) => m.AvatarPageComponent,
      ),
  },
  {
    path: 'components/badge',
    title: 'Badge — Orchestra',
    loadComponent: () =>
      import('../../pages/components/badge/badge-page.component').then(
        (m) => m.BadgePageComponent,
      ),
  },
  {
    path: 'components/breadcrumb',
    title: 'Breadcrumb — Orchestra',
    loadComponent: () =>
      import('../../pages/components/breadcrumb/breadcrumb-page.component').then(
        (m) => m.BreadcrumbPageComponent,
      ),
  },
  {
    path: 'components/card',
    title: 'Card — Orchestra',
    loadComponent: () =>
      import('../../pages/components/card/card-page.component').then(
        (m) => m.CardPageComponent,
      ),
  },
  {
    path: 'components/checkbox',
    title: 'Checkbox — Orchestra',
    loadComponent: () =>
      import('../../pages/components/checkbox/checkbox-page.component').then(
        (m) => m.CheckboxPageComponent,
      ),
  },
  {
    path: 'components/chip-input',
    title: 'Chip Input — Orchestra',
    loadComponent: () =>
      import('../../pages/components/chip-input/chip-input-page.component').then(
        (m) => m.ChipInputPageComponent,
      ),
  },
  {
    path: 'components/file-uploader',
    title: 'File Uploader — Orchestra',
    loadComponent: () =>
      import('../../pages/components/file-uploader/file-uploader-page.component').then(
        (m) => m.FileUploaderPageComponent,
      ),
  },
  {
    path: 'components/galleria',
    title: 'Galleria — Orchestra',
    loadComponent: () =>
      import('../../pages/components/galleria/galleria-page.component').then(
        (m) => m.GalleriaPageComponent,
      ),
  },
  {
    path: 'components/input',
    title: 'Input — Orchestra',
    loadComponent: () =>
      import('../../pages/components/input/input-page.component').then(
        (m) => m.InputPageComponent,
      ),
  },
  {
    path: 'components/order-list',
    title: 'OrderList — Orchestra',
    loadComponent: () =>
      import('../../pages/components/order-list/order-list-page.component').then(
        (m) => m.OrderListPageComponent,
      ),
  },
  {
    path: 'components/otp-input',
    title: 'OTP Input — Orchestra',
    loadComponent: () =>
      import('../../pages/components/otp-input/otp-input-page.component').then(
        (m) => m.OtpInputPageComponent,
      ),
  },
  {
    path: 'components/paginator',
    title: 'Paginator — Orchestra',
    loadComponent: () =>
      import('../../pages/components/paginator/paginator-page.component').then(
        (m) => m.PaginatorPageComponent,
      ),
  },
  {
    path: 'components/pick-list',
    title: 'PickList — Orchestra',
    loadComponent: () =>
      import('../../pages/components/pick-list/pick-list-page.component').then(
        (m) => m.PickListPageComponent,
      ),
  },
  {
    path: 'components/progress',
    title: 'Progress — Orchestra',
    loadComponent: () =>
      import('../../pages/components/progress/progress-page.component').then(
        (m) => m.ProgressPageComponent,
      ),
  },
  {
    path: 'components/radio',
    title: 'Radio — Orchestra',
    loadComponent: () =>
      import('../../pages/components/radio/radio-page.component').then(
        (m) => m.RadioPageComponent,
      ),
  },
  {
    path: 'components/rating',
    title: 'Rating — Orchestra',
    loadComponent: () =>
      import('../../pages/components/rating/rating-page.component').then(
        (m) => m.RatingPageComponent,
      ),
  },
  {
    path: 'components/skeleton',
    title: 'Skeleton — Orchestra',
    loadComponent: () =>
      import('../../pages/components/skeleton/skeleton-page.component').then(
        (m) => m.SkeletonPageComponent,
      ),
  },
  {
    path: 'components/slider',
    title: 'Slider — Orchestra',
    loadComponent: () =>
      import('../../pages/components/slider/slider-page.component').then(
        (m) => m.SliderPageComponent,
      ),
  },
  {
    path: 'components/spinner',
    title: 'Spinner / Loading — Orchestra',
    loadComponent: () =>
      import('../../pages/components/spinner/spinner-page.component').then(
        (m) => m.SpinnerPageComponent,
      ),
  },
  {
    path: 'components/switch',
    title: 'Switch / Toggle — Orchestra',
    loadComponent: () =>
      import('../../pages/components/switch/switch-page.component').then(
        (m) => m.SwitchPageComponent,
      ),
  },
  {
    path: 'components/table',
    title: 'Table — Orchestra',
    loadComponent: () =>
      import('../../pages/components/table/table-page.component').then(
        (m) => m.TablePageComponent,
      ),
  },
  {
    path: 'components/tabs',
    title: 'Tabs — Orchestra',
    loadComponent: () =>
      import('../../pages/components/tabs/tabs-page.component').then(
        (m) => m.TabsPageComponent,
      ),
  },
  {
    path: 'components/toast',
    title: 'Toast / Notifications — Orchestra',
    loadComponent: () =>
      import('../../pages/components/toast/toast-page.component').then(
        (m) => m.ToastPageComponent,
      ),
  },
  {
    path: 'components/tooltip',
    title: 'Tooltip — Orchestra',
    loadComponent: () =>
      import('../../pages/components/tooltip/tooltip-page.component').then(
        (m) => m.TooltipPageComponent,
      ),
  },
];
