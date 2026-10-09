import { Routes } from '@angular/router';
import { COMPONENT_ROUTES } from './generated/docs-registry/routes.generated';

/**
 * Rotas do site. As rotas de componentes NÃO são escritas aqui: vêm de
 * `COMPONENT_ROUTES`, gerado por `npm run docs:generate-registry` a partir
 * de `content/components/<id>/` e das páginas antigas ainda não migradas.
 * Famílias sem página própria caem em `components/:componentId` (página
 * genérica antiga) durante a transição.
 */
export const routes: Routes = [
  {
    path: 'components/p0-foundations',
    redirectTo: 'components/date-picker',
    pathMatch: 'full',
  },
  {
    path: 'components/p1-core',
    redirectTo: 'components/autocomplete',
    pathMatch: 'full',
  },
  {
    path: 'components/p2-expansion',
    redirectTo: 'components/button-group',
    pathMatch: 'full',
  },
  {
    path: 'components/textarea',
    redirectTo: 'components/input',
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'Orchestra Design System — componentes Angular da CIAg',
    data: {
      description:
        'Componentes Angular da CIAg: acessíveis, em pt-BR, com Signals, tokens CSS e exemplos ao vivo.',
    },
  },
  {
    path: 'primeiros-passos',
    loadComponent: () =>
      import('./pages/getting-started/getting-started.component').then(
        (m) => m.GettingStartedComponent,
      ),
    title: 'Primeiros passos — Orchestra',
    data: {
      description:
        'Instalação, estilos em CSS puro, rótulos em pt-BR com provideOrcLabels e os princípios da Orchestra.',
    },
  },
  {
    path: 'testing/overlay-matrix',
    loadComponent: () =>
      import('./pages/testing/overlay-matrix-page.component').then(
        (m) => m.OverlayMatrixPageComponent,
      ),
    title: 'Testes internos — Matriz de overlays',
  },
  {
    path: 'docs',
    loadComponent: () =>
      import('./pages/docs/docs.component').then((m) => m.DocsComponent),
    title: 'Fundamentos — Orchestra Design System',
    data: {
      description:
        'Fundamentos do Orchestra Design System: tokens, tipografia, acessibilidade e princípios de marca.',
    },
  },
  ...COMPONENT_ROUTES,
  {
    path: 'components/:componentId',
    loadComponent: () =>
      import('./pages/components/component-doc/component-doc-page.component').then(
        (m) => m.ComponentDocPageComponent,
      ),
    title: 'API do Componente — Orchestra',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
