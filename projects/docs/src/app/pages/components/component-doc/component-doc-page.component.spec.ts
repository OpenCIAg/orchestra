import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { of } from 'rxjs';
import { ComponentDocPageComponent } from './component-doc-page.component';
import { IconCatalogPreviewComponent } from './icon-catalog-preview.component';
import { MenuFamilyPreviewComponent } from './menu-family-preview.component';

/**
 * The renderer lazy-loads the family's API reference and live example chunks
 * after the route param lands; poll until the preview settles before
 * asserting.
 */
async function renderDoc(componentId: string): Promise<{
  fixture: ComponentFixture<ComponentDocPageComponent>;
  root: HTMLElement;
}> {
  const paramMap = convertToParamMap({ componentId });
  TestBed.configureTestingModule({
    imports: [ComponentDocPageComponent],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { paramMap: of(paramMap), snapshot: { paramMap } },
      },
    ],
  });
  const fixture = TestBed.createComponent(ComponentDocPageComponent);
  fixture.detectChanges();
  await waitForExample(fixture);
  return { fixture, root: fixture.nativeElement as HTMLElement };
}

async function waitForExample(
  fixture: ComponentFixture<ComponentDocPageComponent>,
  timeoutMs = 5_000,
): Promise<void> {
  const start = Date.now();
  for (;;) {
    // Re-run change detection after each macrotask so freshly imported
    // chunks paint before the predicate runs.
    await new Promise((resolve) => setTimeout(resolve, 10));
    fixture.detectChanges();
    const load = fixture.componentInstance.exampleLoad();
    const root = fixture.nativeElement as HTMLElement;
    const notFound = root
      .querySelector('h1')
      ?.textContent?.includes('Componente não encontrado');
    const emptyState = root.querySelector('.empty-preview');
    if (load === 'ready') return;
    if (load === 'none' && (notFound || emptyState)) return;
    if (Date.now() - start > timeoutMs) {
      throw new Error('live example did not settle in time');
    }
  }
}

describe('Data-driven documentation renderer', () => {
  it('renders the hero from the colocated catalog entry', async () => {
    const { fixture, root } = await renderDoc('date-picker');

    const text = root.textContent ?? '';
    expect(root.querySelector('h1')?.textContent).toContain('Date Picker');
    expect(text).toContain('Inputs');
    expect(text).toContain('@ciag/orchestra/date-picker');
    expect(root.querySelector('.status--stable')).not.toBeNull();
    fixture.destroy();
  });

  it('renders API tables from the generated inventory reference', async () => {
    const { fixture, root } = await renderDoc('date-picker');

    const text = root.textContent ?? '';
    for (const binding of [
      'value',
      'dataType',
      'selectionMode',
      'showButtonBar',
      'appendTo',
    ]) {
      expect(text).toContain(binding);
    }
    // The generated tables are grouped per component with its selector.
    expect(text).toContain('DatePickerComponent');
    expect(text).toContain('orc-date-picker');
    expect(root.querySelectorAll('.api-member').length).toBeGreaterThan(0);
    expect(root.querySelectorAll('.api-table tbody tr').length).toBeGreaterThan(
      5,
    );
    fixture.destroy();
  });

  it('renders the authored usage snippet and covered states', async () => {
    const { fixture, root } = await renderDoc('date-picker');

    const text = root.textContent ?? '';
    expect(text).toContain('Quick start');
    expect(text).toContain('label="Data de entrega"');
    expect(text).toContain('Estados cobertos');
    expect(text).toContain('Prefira limites explícitos');
    fixture.destroy();
  });

  it('renders the live example through the lazy registry', async () => {
    const { fixture, root } = await renderDoc('kbd');

    expect(fixture.componentInstance.exampleLoad()).toBe('ready');
    expect(root.querySelector('orc-kbd')).not.toBeNull();
    expect(root.querySelector('doc-kbd-example')).not.toBeNull();
    fixture.destroy();
  });

  it('shows a graceful empty state when no example is authored yet', async () => {
    const { fixture, root } = await renderDoc('fieldset');

    expect(fixture.componentInstance.exampleLoad()).toBe('none');
    const empty = root.querySelector('.empty-preview');
    expect(empty?.textContent).toContain('Exemplo ao vivo ainda não autorado');
    // The generated API reference still covers the family.
    expect(root.querySelectorAll('.api-table').length).toBeGreaterThan(0);
    fixture.destroy();
  });

  it('synthesizes a quick-start snippet when no usage doc is authored', async () => {
    const { fixture, root } = await renderDoc('fieldset');

    const snippet = root.querySelector('.code-card pre code');
    expect(snippet?.textContent).toContain('@ciag/orchestra/fieldset');
    expect(snippet?.textContent).toContain('import {');
    fixture.destroy();
  });

  it('reports a missing component instead of rendering the hero', async () => {
    const { fixture, root } = await renderDoc('not-a-component');

    expect(root.querySelector('h1')?.textContent).toContain(
      'Componente não encontrado',
    );
    expect(root.querySelector('.api-table')).toBeNull();
    fixture.destroy();
  });
  it('mirrors emitted example state into the live inspector', async () => {
    const { fixture, root } = await renderDoc('collapsible');

    const inspector = root.querySelector('.inspector-body pre')?.textContent;
    expect(inspector).toContain('"open"');
    expect(inspector).toContain('controlled');
    fixture.destroy();
  });
});

describe('Chart documentation', () => {
  it('documents the actual data, selection, accessibility, and compatibility contracts', async () => {
    const { fixture, root } = await renderDoc('chart');
    const text = root.textContent ?? '';

    expect(root.querySelector('h1')?.textContent).toContain('Chart');
    expect(text).toContain('@ciag/orchestra/chart');
    expect(text).toContain('ChartData');
    expect(text).toContain('onDataSelect');
    expect(text).toContain('ariaLabelledBy');
    expect(text).toContain('Compatibility values');
    for (const type of ['scatter', 'bubble', 'polarArea', 'radar']) {
      expect(text).toContain(type);
      expect(text).toContain(`Unsupported chart type: ${type}`);
    }

    const renderedCharts = Array.from(
      root.querySelectorAll<HTMLElement>('orc-chart'),
    );
    expect(renderedCharts).toHaveSize(8);
    expect(root.querySelectorAll('orc-chart svg[role="group"]')).toHaveSize(4);
    expect(root.querySelectorAll('orc-chart [role="status"]')).toHaveSize(4);
    expect(
      root.querySelector(
        'orc-chart svg[aria-label="Receita trimestral por equipe, barras"]',
      ),
    ).not.toBeNull();
    fixture.destroy();
  });

  it('emits selection from a rendered point and updates the live example state', async () => {
    const { fixture, root } = await renderDoc('chart');
    const point = root.querySelector(
      'orc-chart[type="bar"] [role="button"]',
    ) as SVGElement;

    expect(point).not.toBeNull();
    expect(point.getAttribute('aria-label')).toContain('Q1');
    point.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(
      root.querySelector('[data-testid="chart-selection-state"]')?.textContent,
    ).toContain('Chart: ponto 1, dataset 1');
    expect(root.querySelector('.inspector-body pre')?.textContent).toContain(
      'Chart: ponto 1',
    );
    fixture.destroy();
  });
});

describe('Kbd documentation', () => {
  it('documents the actual keys and ariaLabel inputs without generic placeholder API', async () => {
    const { fixture, root } = await renderDoc('kbd');
    const text = root.textContent ?? '';

    expect(root.querySelector('h1')?.textContent).toContain('Kbd');
    expect(root.querySelector('orc-kbd')).not.toBeNull();
    expect(text).toContain('@ciag/orchestra/kbd');
    expect(text).toContain('string | string[]');
    expect(text).toContain('ariaLabel');
    expect(text).not.toContain('disabled');
    fixture.destroy();
  });
});

describe('Terminal documentation', () => {
  it('documents controlled command/history models, outputs and non-execution semantics', async () => {
    const { fixture, root } = await renderDoc('terminal');
    const text = root.textContent ?? '';

    expect(root.querySelector('h1')?.textContent).toContain('Terminal');
    expect(root.querySelector('orc-terminal')).not.toBeNull();
    expect(root.querySelector('orc-terminal [role="log"]')).not.toBeNull();
    expect(text).toContain('@ciag/orchestra/terminal');
    expect(text).toContain('TerminalLine');
    expect(text).toContain('commandRun');
    expect(text).toContain('welcomeMessage');
    expect(text).toContain('does not run');
    fixture.destroy();
  });

  it('submits through the example, reflects model updates and labels app-owned output', async () => {
    const { fixture, root } = await renderDoc('terminal');
    const input = root.querySelector('orc-terminal input') as HTMLInputElement;
    input.value = 'status';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    (
      root.querySelector('orc-terminal form') as HTMLFormElement
    ).requestSubmit();
    fixture.detectChanges();

    expect(
      root.querySelector('[data-testid="terminal-action-state"]')?.textContent,
    ).toContain('Terminal command received: status');
    expect(root.querySelector('orc-terminal .history')?.textContent).toContain(
      'status',
    );
    expect(root.querySelector('orc-terminal .history')?.textContent).toContain(
      'Handled by the demo page; no shell was run.',
    );
    fixture.destroy();
  });
});

describe('TagsInput documentation', () => {
  it('documents the real model, inputs, outputs, and Tab navigation contract', async () => {
    const { fixture, root } = await renderDoc('tags-input');
    const text = root.textContent ?? '';

    expect(root.querySelector('h1')?.textContent).toContain('Tags Input');
    expect(root.querySelector('orc-tags-input')).not.toBeNull();
    expect(text).toContain('@ciag/orchestra/tags-input');
    for (const apiName of [
      'value',
      'suggestions',
      'maxTags',
      'maxLength',
      'addOnTab',
      'separator',
      'removeAriaLabel',
      'tagAdded',
      'onRemove',
      'onClear',
    ]) {
      expect(text).toContain(apiName);
    }
    expect(
      root.querySelector('[data-testid="tags-input-tab-example"]'),
    ).not.toBeNull();
    fixture.destroy();
  });
});

describe('Menu documentation', () => {
  it('documents the standalone menu contract and renders the orc-menu example', async () => {
    const { root } = await renderDoc('menu');
    const text = root.textContent ?? '';

    expect(root.querySelector('h1')?.textContent).toContain('Menu');
    expect(root.querySelector('orc-menu')).not.toBeNull();
    expect(root.querySelector('orc-dropdown')).toBeNull();
    expect(text).toContain('@ciag/orchestra/menu');
    expect(text).toContain('MenuItem[]');
    expect(text).toContain('separator');
    expect(text).toContain('autoZIndex');
    expect(text).toContain('baseZIndex');
    expect(text).toContain('onItemClick');
    expect(text).toContain('onFocus');
  });

  it('opens the documented popup, exposes nested items, and reports itemSelect', async () => {
    const { fixture, root } = await renderDoc('menu');
    const trigger = root.querySelector(
      '.example--centered .doc-button',
    ) as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();

    const menu = root.querySelector('orc-menu nav[role="menu"]') as HTMLElement;
    expect(menu).not.toBeNull();
    expect(menu.querySelector('[role="menuitem"]')?.textContent).toContain(
      'Editar projeto',
    );
    expect(menu.textContent).toContain('Mais ações');
    expect(menu.textContent).toContain('Duplicar');
    expect(
      menu.querySelector('[role="menuitem"][disabled]')?.textContent,
    ).toContain('Arquivar');

    (
      Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]')).find(
        (item) => item.textContent?.includes('Compartilhar'),
      ) as HTMLElement
    ).click();
    fixture.detectChanges();
    expect(root.textContent).toContain('Menu: Compartilhar');
    fixture.destroy();
  });
});

describe('Cascade Select documentation', () => {
  it('documents the supported hierarchy, keyboard, and public inputs', async () => {
    const { fixture, root } = await renderDoc('cascade-select');

    expect(root.querySelector('h1')?.textContent).toContain('Cascade Select');
    expect(root.querySelector('orc-cascade-select')).not.toBeNull();
    expect(root.textContent).toContain('@ciag/orchestra/cascade-select');
    expect(root.textContent).toContain('optionSelect');
    expect(root.textContent).toContain('ArrowRight');
    fixture.destroy();
  });

  it('renders levels and updates the documented value when a leaf is selected', async () => {
    const { fixture, root } = await renderDoc('cascade-select');
    const trigger = root.querySelector(
      'orc-cascade-select .trigger',
    ) as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();
    const platform = Array.from(
      root.querySelectorAll<HTMLButtonElement>('button[role="option"]'),
    ).find((button) => button.textContent?.includes('Platform'));
    expect(platform).toBeDefined();
    platform!.click();
    fixture.detectChanges();

    const web = Array.from(
      root.querySelectorAll<HTMLButtonElement>('button[role="option"]'),
    ).find((button) => button.textContent?.includes('Web'));
    expect(web).toBeDefined();
    web!.click();
    fixture.detectChanges();

    expect(
      root.querySelector('[data-testid="cascade-selection-state"]')
        ?.textContent,
    ).toContain('web');
    fixture.destroy();
  });
});

describe('Navigation documentation', () => {
  it('discovers the navigation package and renders a real shell preview', async () => {
    const { fixture, root } = await renderDoc('navigation');

    expect(root.querySelector('h1')?.textContent).toContain('Navigation Shell');
    expect(root.querySelector('orc-navigation-shell')).not.toBeNull();
    expect(root.querySelector('orc-navigation-item')).not.toBeNull();
    expect(root.textContent).toContain('@ciag/orchestra/navigation');
    expect(root.textContent).toContain('requestClose');
    expect(root.textContent).toContain('NavigationItem');
    fixture.destroy();
  });

  it('updates active navigation state when a preview item is activated', async () => {
    const { fixture, root } = await renderDoc('navigation');
    const activity = Array.from(
      root.querySelectorAll<HTMLButtonElement>('.orc-navigation-item'),
    ).find((item) => item.textContent?.includes('Atividade'));

    expect(activity).toBeDefined();
    activity!.click();
    fixture.detectChanges();

    expect(
      Array.from(root.querySelectorAll('code')).some((code) =>
        code.textContent?.includes('activity'),
      ),
    ).toBeTrue();
    expect(root.textContent).toContain('Navegação: Atividade');
    fixture.destroy();
  });
});

describe('Tab Menu documentation', () => {
  it('discovers the tab menu package and renders its real controls', async () => {
    const { fixture, root } = await renderDoc('tab-menu');

    expect(root.querySelector('h1')?.textContent).toContain('Tab Menu');
    expect(root.querySelector('orc-tab-menu')).not.toBeNull();
    expect(root.querySelector('[role="tablist"]')).not.toBeNull();
    expect(root.textContent).toContain('@ciag/orchestra/tab-menu');
    expect(root.textContent).toContain('activeItem');
    fixture.destroy();
  });

  it('updates the controlled active item and output state', async () => {
    const { fixture, root } = await renderDoc('tab-menu');
    const activity = Array.from(
      root.querySelectorAll<HTMLElement>('[role="tab"]'),
    ).find((item) => item.textContent?.includes('Atividade'));

    expect(activity).toBeDefined();
    activity!.click();
    fixture.detectChanges();

    expect(root.textContent).toContain('activeItem = Atividade');
    expect(root.textContent).toContain('Tab Menu: Atividade');
    expect(activity?.getAttribute('aria-selected')).toBe('true');
    fixture.destroy();
  });
});

describe('Tree documentation', () => {
  it('discovers Tree with a supported selection/filter preview', async () => {
    const { fixture, root } = await renderDoc('tree');

    expect(root.querySelector('h1')?.textContent).toContain('Tree');
    expect(root.querySelector('orc-tree [role="tree"]')).not.toBeNull();
    expect(
      root.querySelector('orc-tree input[type="text"], orc-tree input'),
    ).not.toBeNull();
    expect(root.textContent).toContain('HierarchyNode');
    expect(root.textContent).not.toContain('virtualScrollItemSize');
    fixture.destroy();
  });

  it('updates the controlled Tree selection and action state', async () => {
    const { fixture, root } = await renderDoc('tree');
    (root.querySelector('orc-tree .toggle') as HTMLButtonElement).click();
    fixture.detectChanges();
    (root.querySelectorAll('orc-tree .toggle')[1] as HTMLButtonElement).click();
    fixture.detectChanges();
    const packages = Array.from(
      root.querySelectorAll<HTMLButtonElement>('orc-tree .label'),
    ).find((button) => button.textContent?.includes('Pacotes'));

    expect(packages).toBeDefined();
    packages!.click();
    fixture.detectChanges();

    expect(root.textContent).toContain('Tree: Pacotes');
    expect(root.textContent).toContain('packages');
    fixture.destroy();
  });
});

describe('TreeTable documentation', () => {
  it('discovers TreeTable with a real treegrid and supported API', async () => {
    const { fixture, root } = await renderDoc('tree-table');

    expect(root.querySelector('h1')?.textContent).toContain('TreeTable');
    expect(
      root.querySelector('orc-tree-table [role="treegrid"]'),
    ).not.toBeNull();
    expect(
      root.querySelector('orc-tree-table input[type="search"]'),
    ).not.toBeNull();
    expect(root.textContent).toContain('TreeTableColumn[]');
    expect(root.textContent).toContain('onSort');
    expect(root.textContent).not.toContain('virtualScrollItemSize');
    fixture.destroy();
  });

  it('updates TreeTable selection and reports the selected node', async () => {
    const { fixture, root } = await renderDoc('tree-table');
    const checkbox = root.querySelector(
      'orc-tree-table tbody input[type="checkbox"]',
    ) as HTMLInputElement;

    expect(checkbox).not.toBeNull();
    checkbox.click();
    fixture.detectChanges();

    expect(root.textContent).toContain('TreeTable: Workspace');
    expect(root.textContent).toContain('selected rows = 1');
    fixture.destroy();
  });
});

describe('DataView documentation', () => {
  it('discovers DataView and documents the local/lazy boundary', async () => {
    const { fixture, root } = await renderDoc('data-view');
    const text = root.textContent ?? '';

    expect(root.querySelector('h1')?.textContent).toContain('DataView');
    expect(root.querySelector('orc-data-view')).not.toBeNull();
    expect(root.querySelector('orc-data-view orc-paginator')).not.toBeNull();
    expect(text).toContain('onLazyLoad');
    expect(text).toContain('totalRecords');
    expect(text).toContain('ordenação remota');
    fixture.destroy();
  });

  it('updates local sorting, layout and pagination through the preview controls', async () => {
    const { fixture, root } = await renderDoc('data-view');

    const sortDescending = Array.from(root.querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Nome Z–A'),
    ) as HTMLButtonElement;
    sortDescending.click();
    fixture.detectChanges();
    fixture.detectChanges();
    expect(root.querySelector('orc-data-view article')?.textContent).toContain(
      'Tree',
    );
    expect(root.textContent).toContain('sort = name / -1');

    const listButton = Array.from(root.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Lista',
    ) as HTMLButtonElement;
    listButton.click();
    fixture.detectChanges();
    expect(root.querySelector('orc-data-view .content')?.classList).toContain(
      'list',
    );

    const next = root.querySelector(
      'orc-data-view .orc-paginator__btn--next',
    ) as HTMLButtonElement;
    next.click();
    fixture.detectChanges();
    expect(root.textContent).toContain('first = 2');
    expect(root.textContent).toContain('DataView: página a partir de 3');
    fixture.destroy();
  });
});

describe('Menu family previews', () => {
  it('opens a tiered submenu and reports a selected child', async () => {
    const { fixture, root } = await renderDoc('tiered-menu');
    expect(root.querySelector('app-menu-family-preview')).not.toBeNull();
    const menu = root.querySelector(
      'orc-tiered-menu nav[role="menu"]',
    ) as HTMLElement;
    expect(menu.getAttribute('aria-label')).toContain('hierárquica');
    (menu.querySelector('[role="menuitem"]') as HTMLElement).click();
    fixture.detectChanges();
    expect(menu.querySelector('.submenu:not(.submenu-hidden)')).not.toBeNull();
    (menu.querySelector('.submenu [role="menuitem"]') as HTMLElement).click();
    fixture.detectChanges();
    expect(root.textContent).toContain('TieredMenu: Design System');
    fixture.destroy();
  });

  it('expands a panel and reports a selected child', async () => {
    const { fixture, root } = await renderDoc('panel-menu');
    const menu = root.querySelector('orc-panel-menu') as HTMLElement;
    expect(
      menu.querySelector('[role="tree"]')?.getAttribute('aria-label'),
    ).toContain('Seções');
    (menu.querySelector('[role="treeitem"]') as HTMLElement).click();
    fixture.detectChanges();
    expect(menu.querySelector('.children')).not.toBeNull();
    (menu.querySelector('.children [role="treeitem"]') as HTMLElement).click();
    fixture.detectChanges();
    expect(root.textContent).toContain('PanelMenu: Design System');
    fixture.destroy();
  });

  it('switches orientation and reports a selected item', async () => {
    const { fixture, root } = await renderDoc('mega-menu');
    const vertical = Array.from(root.querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Vertical'),
    ) as HTMLButtonElement;
    vertical.click();
    fixture.detectChanges();
    const menu = root.querySelector(
      'orc-mega-menu nav[role="menubar"]',
    ) as HTMLElement;
    expect(menu.classList).toContain('vertical');
    (menu.querySelector('[data-mega-item]') as HTMLElement).click();
    fixture.detectChanges();
    expect(root.textContent).toContain('MegaMenu: Visão geral');
    fixture.destroy();
  });

  it('filters commands and selects the enabled result', async () => {
    const { fixture, root } = await renderDoc('command-menu');
    const search = root.querySelector(
      'orc-command-menu input[role="combobox"]',
    ) as HTMLInputElement;
    search.value = 'config';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const option = root.querySelector(
      'orc-command-menu [role="option"]',
    ) as HTMLElement;
    expect(option.textContent).toContain('Configurações');
    option.click();
    fixture.detectChanges();
    expect(root.textContent).toContain('CommandMenu: Configurações');
    fixture.destroy();
  });

  it('does not render the menu preview for unrelated routes', async () => {
    const { fixture, root } = await renderDoc('date-picker');
    expect(root.querySelector('app-menu-family-preview')).toBeNull();
    expect(
      fixture.debugElement.query(By.directive(MenuFamilyPreviewComponent)),
    ).toBeNull();
    fixture.destroy();
  });
});

describe('Icon catalog preview', () => {
  it('renders the deferred catalog and filters by search, family, and fill controls', async () => {
    const { fixture, root } = await renderDoc('icon');

    const preview = root.querySelector('app-icon-catalog-preview');
    expect(preview).not.toBeNull();
    const search = root.querySelector(
      'input[type="search"]',
    ) as HTMLInputElement;
    search.value = 'calendar';
    search.dispatchEvent(new Event('input'));
    const selects = root.querySelectorAll('select');
    (selects[0] as HTMLSelectElement).value = 'outlined';
    selects[0].dispatchEvent(new Event('change'));
    (selects[1] as HTMLSelectElement).value = 'filled';
    selects[1].dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(root.querySelector('.icon-catalog-item')?.textContent).toContain(
      'calendar',
    );
    const component = fixture.debugElement.query(
      By.directive(IconCatalogPreviewComponent),
    ).componentInstance as IconCatalogPreviewComponent;
    expect(component.iconFamily()).toBe('outlined');
    expect(component.iconFill()).toBe('filled');
    expect(
      component
        .filteredIconMetadata()
        .every(
          (entry) =>
            entry.name.includes('calendar') ||
            entry.tags?.some((tag) => tag.includes('calendar')),
        ),
    ).toBeTrue();
    fixture.destroy();
  });

  it('uses the legacy copy fallback when clipboard permission is unavailable', async () => {
    const { fixture } = await renderDoc('icon');
    const component = fixture.debugElement.query(
      By.directive(IconCatalogPreviewComponent),
    ).componentInstance as IconCatalogPreviewComponent;
    const copy = spyOn(document, 'execCommand').and.returnValue(true);

    await component.copyIconDeclaration('calendar');

    expect(copy).toHaveBeenCalledWith('copy');
    fixture.destroy();
  });

  it('does not render the icon catalog on other documentation pages', async () => {
    const { root } = await renderDoc('date-picker');
    expect(root.querySelector('app-icon-catalog-preview')).toBeNull();
  });
});
