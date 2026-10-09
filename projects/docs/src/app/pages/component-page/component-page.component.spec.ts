import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { COMPONENT_PAGE_LOADERS } from '../../generated/docs-registry/pages.generated';
import { SECTION_IDS } from './component-page.component';

describe('Template único de página de componente', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] }),
  );

  for (const id of Object.keys(COMPONENT_PAGE_LOADERS)) {
    it(`renderiza /components/${id} com todas as seções e exemplos`, async () => {
      const page = await COMPONENT_PAGE_LOADERS[id]();
      const harness = await RouterTestingHarness.create(`/components/${id}`);
      const root = harness.routeNativeElement as HTMLElement;

      expect(root.querySelector('h1')?.textContent?.trim()).toBe(page.doc.name);
      for (const section of Object.values(SECTION_IDS)) {
        expect(root.querySelector(`#${section}`))
          .withContext(section)
          .not.toBeNull();
      }
      expect(root.querySelectorAll('.example').length).toBe(
        page.examples.length,
      );
      // O código exibido é exatamente o arquivo-fonte do exemplo.
      const sources = [...root.querySelectorAll('.example__code pre code')].map(
        (code) => code.textContent,
      );
      expect(sources).toEqual(page.examples.map((example) => example.source));
      // A prévia ao vivo renderiza o componente do exemplo.
      for (const example of page.examples) {
        const preview = root.querySelector(
          `#${example.slug}-panel-preview`,
        ) as HTMLElement;
        expect(preview.children.length)
          .withContext(example.slug)
          .toBeGreaterThan(0);
      }
      expect(root.querySelector('.doc__badge--experimental') !== null).toBe(
        page.doc.status === 'experimental',
      );
      expect(
        root.querySelectorAll('app-docs-sidebar a').length,
      ).toBeGreaterThan(0);
      harness.fixture.destroy();
    });
  }

  it('alterna Prévia/Código pelo clique e pelas setas (padrão Tabs)', async () => {
    const harness = await RouterTestingHarness.create('/components/button');
    const root = harness.routeNativeElement as HTMLElement;
    const codeTab = root.querySelector<HTMLButtonElement>('#basic-tab-code')!;
    const previewTab =
      root.querySelector<HTMLButtonElement>('#basic-tab-preview')!;
    const codePanel = root.querySelector<HTMLElement>('#basic-panel-code')!;

    expect(previewTab.getAttribute('aria-selected')).toBe('true');
    expect(codePanel.hidden).toBeTrue();

    codeTab.click();
    harness.detectChanges();
    expect(codeTab.getAttribute('aria-selected')).toBe('true');
    expect(codeTab.tabIndex).toBe(0);
    expect(previewTab.tabIndex).toBe(-1);
    expect(codePanel.hidden).toBeFalse();

    codeTab.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
    );
    harness.detectChanges();
    expect(previewTab.getAttribute('aria-selected')).toBe('true');
    expect(codePanel.hidden).toBeTrue();
    harness.fixture.destroy();
  });
});
