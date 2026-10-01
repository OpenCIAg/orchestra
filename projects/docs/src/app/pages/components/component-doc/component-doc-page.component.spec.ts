import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { of } from 'rxjs';
import { ComponentDocPageComponent } from './component-doc-page.component';
import { IconCatalogPreviewComponent } from './icon-catalog-preview.component';

describe('Chart documentation', () => {
  beforeEach(() => {
    const paramMap = convertToParamMap({ componentId: 'chart' });
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
  });

  it('documents the actual data, selection, accessibility, and compatibility contracts', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const text = root.textContent ?? '';

    expect(root.querySelector('h1')?.textContent).toContain('Chart');
    expect(text).toContain('@ciag/orchestra/chart');
    expect(text).toContain('ChartData');
    expect(text).toContain('ChartDataset[]');
    expect(text).toContain('pointClick');
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

  it('emits selection from a rendered point and updates the live example state', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
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
    fixture.destroy();
  });
});

describe('Kbd documentation', () => {
  beforeEach(() => {
    const paramMap = convertToParamMap({ componentId: 'kbd' });
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
  });

  it('documents the actual keys and ariaLabel inputs without generic placeholder API', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const text = root.textContent ?? '';

    expect(root.querySelector('h1')?.textContent).toContain('Kbd');
    expect(root.querySelector('orc-kbd')).not.toBeNull();
    expect(text).toContain('@ciag/orchestra/kbd');
    expect(text).toContain('string | string[]');
    expect(text).toContain('ariaLabel');
    expect(text).toContain('Page Up');
    expect(text).not.toContain('disabled');
    fixture.destroy();
  });
});

describe('Terminal documentation', () => {
  beforeEach(() => {
    const paramMap = convertToParamMap({ componentId: 'terminal' });
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
  });

  it('documents controlled command/history models, outputs and non-execution semantics', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const text = root.textContent ?? '';

    expect(root.querySelector('h1')?.textContent).toContain('Terminal');
    expect(root.querySelector('orc-terminal')).not.toBeNull();
    expect(root.querySelector('orc-terminal [role="log"]')).not.toBeNull();
    expect(text).toContain('@ciag/orchestra/terminal');
    expect(text).toContain('TerminalLine');
    expect(text).toContain('commandRun');
    expect(text).toContain('onCommand');
    expect(text).toContain('commandChange');
    expect(text).toContain('historyChange');
    expect(text).toContain('does not run');
    fixture.destroy();
  });

  it('submits through the example, reflects model updates and labels app-owned output', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
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
  beforeEach(() => {
    const paramMap = convertToParamMap({ componentId: 'tags-input' });
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
  });

  it('documents the real model, inputs, outputs, and Tab navigation contract', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const text = root.textContent ?? '';

    expect(root.querySelector('h1')?.textContent).toContain('Tags Input');
    expect(root.querySelector('orc-tags-input')).not.toBeNull();
    expect(text).toContain('@ciag/orchestra/tags-input');
    for (const apiName of [
      'value',
      'valueChange',
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
    expect(text).toContain('navegação nativa do foco');
    expect(text).not.toContain(
      'Evento emitido quando o estado controlado muda',
    );
    fixture.destroy();
  });
});

describe('Menu documentation', () => {
  beforeEach(() => {
    const paramMap = convertToParamMap({ componentId: 'menu' });
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
  });

  it('documents the standalone menu contract and renders the orc-menu example', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const text = root.textContent ?? '';

    expect(root.querySelector('h1')?.textContent).toContain('Menu');
    expect(root.querySelector('orc-menu')).not.toBeNull();
    expect(root.querySelector('orc-dropdown')).toBeNull();
    expect(text).toContain('@ciag/orchestra/menu');
    expect(text).toContain('MenuItem[]');
    expect(text).toContain('separator');
    expect(text).toContain('noopener noreferrer');
    expect(text).toContain('disclosures');
    expect(text).toContain('links disabled ficam sem href');
    expect(text).toContain('autoZIndex');
    expect(text).toContain('baseZIndex');
    expect(text).toContain('Compatibilidade (deprecated)');
    expect(text).toContain('transições de abertura não são implementadas');
    expect(text).toContain('transições de fechamento não são implementadas');
    expect(text).toContain('clique fora ou Escape');
    expect(text).toContain('appendTo não faz a anexação');
    expect(text).toContain('onItemClick');
    expect(text).toContain('onFocus');
  });

  it('opens the documented popup, exposes nested items, and reports itemSelect', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
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
  });
});

describe('Cascade Select documentation', () => {
  beforeEach(() => {
    const paramMap = convertToParamMap({ componentId: 'cascade-select' });
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
  });

  it('documents the supported hierarchy, keyboard, and public inputs', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h1')?.textContent).toContain('Cascade Select');
    expect(root.querySelector('orc-cascade-select')).not.toBeNull();
    expect(root.textContent).toContain('@ciag/orchestra/cascade-select');
    expect(root.textContent).toContain('optionSelect');
    expect(root.textContent).toContain('ArrowRight');
    fixture.destroy();
  });

  it('renders levels and updates the documented value when a leaf is selected', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
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
  beforeEach(() => {
    const paramMap = convertToParamMap({ componentId: 'navigation' });
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
  });

  it('discovers the navigation package and renders a real shell preview', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h1')?.textContent).toContain('Navigation Shell');
    expect(root.querySelector('orc-navigation-shell')).not.toBeNull();
    expect(root.querySelector('orc-navigation-item')).not.toBeNull();
    expect(root.textContent).toContain('@ciag/orchestra/navigation');
    expect(root.textContent).toContain('requestClose');
    expect(root.textContent).toContain('NavigationItem');
  });

  it('updates active navigation state when a preview item is activated', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
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
  });
});

describe('Tab Menu documentation', () => {
  beforeEach(() => {
    const paramMap = convertToParamMap({ componentId: 'tab-menu' });
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
  });

  it('discovers the tab menu package and renders its real controls', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h1')?.textContent).toContain('Tab Menu');
    expect(root.querySelector('orc-tab-menu')).not.toBeNull();
    expect(root.querySelector('[role="tablist"]')).not.toBeNull();
    expect(root.textContent).toContain('@ciag/orchestra/tab-menu');
    expect(root.textContent).toContain('activeItem');
  });

  it('updates the controlled active item and output state', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const activity = Array.from(
      root.querySelectorAll<HTMLElement>('[role="tab"]'),
    ).find((item) => item.textContent?.includes('Atividade'));

    expect(activity).toBeDefined();
    activity!.click();
    fixture.detectChanges();

    expect(root.textContent).toContain('activeItem = Atividade');
    expect(root.textContent).toContain('Tab Menu: Atividade');
    expect(activity?.getAttribute('aria-selected')).toBe('true');
  });
});

describe('Tree documentation', () => {
  beforeEach(() => {
    const paramMap = convertToParamMap({ componentId: 'tree' });
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
  });

  it('discovers Tree with a supported selection/filter preview', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h1')?.textContent).toContain('Tree');
    expect(root.querySelector('orc-tree [role="tree"]')).not.toBeNull();
    expect(
      root.querySelector('orc-tree input[type="text"], orc-tree input'),
    ).not.toBeNull();
    expect(root.textContent).toContain('@ciag/orchestra/p2');
    expect(root.textContent).toContain('HierarchyNode[]');
    expect(root.textContent).toContain(
      'O campo leaf é mantido apenas para compatibilidade e não ativa carregamento tardio.',
    );
    expect(root.textContent).not.toContain('virtualScrollItemSize');
  });

  it('updates the controlled Tree selection and action state', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
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
  });
});

describe('TreeTable documentation', () => {
  beforeEach(() => {
    const paramMap = convertToParamMap({ componentId: 'tree-table' });
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
  });

  it('discovers TreeTable with a real treegrid and supported API', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

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
  });

  it('updates TreeTable selection and reports the selected node', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const checkbox = root.querySelector(
      'orc-tree-table tbody input[type="checkbox"]',
    ) as HTMLInputElement;

    expect(checkbox).not.toBeNull();
    checkbox.click();
    fixture.detectChanges();

    expect(root.textContent).toContain('TreeTable: Workspace');
    expect(root.textContent).toContain('selected rows = 1');
  });
});

describe('DataView documentation', () => {
  beforeEach(() => {
    const paramMap = convertToParamMap({ componentId: 'data-view' });
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
  });

  it('discovers DataView and documents the local/lazy boundary', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const text = root.textContent ?? '';

    expect(root.querySelector('h1')?.textContent).toContain('DataView');
    expect(root.querySelector('orc-data-view')).not.toBeNull();
    expect(root.querySelector('orc-data-view orc-paginator')).not.toBeNull();
    expect(text).toContain('@ciag/orchestra/p2');
    expect(text).toContain('local');
    expect(text).toContain('onLazyLoad');
    expect(text).toContain('totalRecords');
    expect(text).toContain('ordenação remota');
  });

  it('updates local sorting, layout and pagination through the preview controls', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

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
  });
});

describe('TieredMenu documentation', () => {
  beforeEach(() => {
    const paramMap = convertToParamMap({ componentId: 'tiered-menu' });
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
  });

  it('opens a submenu and reports a selected child', async () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
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
  });
});

describe('PanelMenu documentation', () => {
  beforeEach(() => {
    const paramMap = convertToParamMap({ componentId: 'panel-menu' });
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
  });

  it('expands a panel and reports a selected child', async () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
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
  });
});

describe('MegaMenu documentation', () => {
  beforeEach(() => {
    const paramMap = convertToParamMap({ componentId: 'mega-menu' });
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
  });

  it('switches orientation and reports a selected item', async () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
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
  });
});

describe('CommandMenu documentation', () => {
  beforeEach(() => {
    const paramMap = convertToParamMap({ componentId: 'command-menu' });
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
  });

  it('filters commands and selects the enabled result', async () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
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
  });
});

describe('Menu family defer boundary', () => {
  beforeEach(() => {
    const paramMap = convertToParamMap({ componentId: 'date-picker' });
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
  });

  it('does not render the deferred menu preview for unrelated routes', async () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('app-menu-family-preview'),
    ).toBeNull();
  });
});

describe('Icon documentation defer boundary', () => {
  beforeEach(() => {
    const paramMap = convertToParamMap({ componentId: 'icon' });
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
  });

  it('renders the deferred catalog and filters by search, family, and fill controls', async () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
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
  });

  it('uses the legacy copy fallback when clipboard permission is unavailable', async () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const component = fixture.debugElement.query(
      By.directive(IconCatalogPreviewComponent),
    ).componentInstance as IconCatalogPreviewComponent;
    const copy = spyOn(document, 'execCommand').and.returnValue(true);

    await component.copyIconDeclaration('calendar');

    expect(copy).toHaveBeenCalledWith('copy');
  });
});

describe('Icon defer boundary on unrelated routes', () => {
  it('does not render the icon catalog on date-picker documentation', async () => {
    const paramMap = convertToParamMap({ componentId: 'date-picker' });
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
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('app-icon-catalog-preview'),
    ).toBeNull();
  });
});
