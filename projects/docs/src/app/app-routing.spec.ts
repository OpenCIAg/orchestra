import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { ComponentCatalogService } from './services/component-catalog.service';

describe('Documentation routes', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] }),
  );

  for (const route of routes.filter(
    (route) => route.loadComponent && !route.path?.includes(':'),
  )) {
    it(`renders and disposes /${route.path} without runtime diagnostics`, async () => {
      const harness = await RouterTestingHarness.create(`/${route.path}`);
      expect(
        harness.routeNativeElement?.querySelector('h1')?.textContent?.trim(),
      )
        .withContext(`Heading for /${route.path}`)
        .toBeTruthy();
      harness.fixture.destroy();
    });
  }

  it('renders the matching heading for every catalog link, including reused dynamic routes', async () => {
    const catalog = TestBed.inject(
      ComponentCatalogService,
    ).filteredComponents();
    const harness = await RouterTestingHarness.create();
    const router = TestBed.inject(Router);
    for (const entry of catalog) {
      const target = entry.route;
      if (!target) continue;
      await harness.navigateByUrl(target);
      const heading = harness.routeNativeElement
        ?.querySelector('h1')
        ?.textContent?.trim();
      expect(heading?.toLocaleLowerCase())
        .withContext(target)
        .toContain(entry.name.toLocaleLowerCase());
      expect(router.url).withContext(target).not.toBe('/');
    }
    harness.fixture.destroy();
  });

  it('routes the Chart catalog entry to its documentation and supported previews', async () => {
    const chartEntry = TestBed.inject(ComponentCatalogService)
      .filteredComponents()
      .find((entry) => entry.id === 'chart');
    expect(chartEntry?.route).toBe('/components/chart');

    const harness = await RouterTestingHarness.create(chartEntry!.route);
    const root = harness.routeNativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent).toContain('Chart');
    expect(root.querySelectorAll('orc-chart svg[role="group"]')).toHaveSize(4);
    expect(root.querySelectorAll('orc-chart [role="status"]')).toHaveSize(4);
    harness.fixture.destroy();
  });

  it('shows a missing-document page for an unknown component and recovers on valid navigation', async () => {
    const harness = await RouterTestingHarness.create(
      '/components/no-such-component',
    );
    expect(
      harness.routeNativeElement?.querySelector('h1')?.textContent,
    ).toContain('Componente não encontrado');
    expect(
      harness.routeNativeElement?.querySelector('orc-date-picker'),
    ).toBeNull();
    await harness.navigateByUrl('/components/date-picker');
    expect(
      harness.routeNativeElement?.querySelector('h1')?.textContent,
    ).toContain('Date Picker');
    expect(
      harness.routeNativeElement?.querySelector('orc-date-picker'),
    ).not.toBeNull();
    harness.fixture.destroy();
  });
});
