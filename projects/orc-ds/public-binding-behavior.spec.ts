import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { BreadcrumbItemData } from './breadcrumb/breadcrumb.types';
import { TimelineComponent } from './timeline/timeline.component';
import {
  DataViewComponent,
  MenuComponent,
  PrimeMenuItem,
} from './p2/p2-advanced-components';
import {
  MegaMenuComponent,
  PanelMenuComponent,
} from './p2/p2-menu-family-components';
import { SpeedDialComponent } from './p2/p2-overlay-components';
import {
  OrderListComponent,
  PickListComponent,
} from './p2/p2-list-gallery-components';
import { SplitButtonComponent } from './p2/p2-primeng-gap-components';
import { TerminalComponent } from './p2/p2-input-gap-components';
import {
  HierarchyNode,
  TreeComponent,
  TreeTableComponent,
  TreeTableColumn,
} from './p2/p2-hierarchical-components';
import { P2Option } from './p2/p2-shared';
import { TimelineItem } from './timeline/timeline.types';
import {
  blurElement,
  focusElement,
} from '../../tools/quality/test-focus-events';

type TransferPayload = {
  items: P2Option[];
  source: P2Option[];
  target: P2Option[];
};
type SelectionSnapshot = {
  source: ReadonlySet<string>;
  target: ReadonlySet<string>;
};

@Component({
  standalone: true,
  imports: [MenuComponent],
  template: `<orc-menu
    [model]="items"
    (itemSelect)="canonical.push($event)"
    (onItemClick)="alias.push($event)"
  />`,
})
class MenuConsumer {
  items: PrimeMenuItem[] = [{ label: 'Open' }];
  canonical: PrimeMenuItem[] = [];
  alias: PrimeMenuItem[] = [];
}

@Component({
  standalone: true,
  imports: [SplitButtonComponent],
  template: `<orc-split-button
    label="Save"
    expandAriaLabel="More"
    (primaryClick)="primary.push($event)"
    (onClick)="clickAlias.push($event)"
    (dropdownClick)="dropdown.push($event)"
    (onDropdownClick)="dropdownAlias.push($event)"
  />`,
})
class SplitButtonConsumer {
  primary: Event[] = [];
  clickAlias: Event[] = [];
  dropdown: Event[] = [];
  dropdownAlias: Event[] = [];
}

@Component({
  standalone: true,
  imports: [TerminalComponent],
  template: `<orc-terminal
    #terminal
    (commandRun)="canonical.push($event)"
    (onCommand)="alias.push($event)"
  />`,
})
class TerminalConsumer {
  @ViewChild('terminal') terminal!: TerminalComponent;
  canonical: string[] = [];
  alias: string[] = [];
}

@Component({
  standalone: true,
  imports: [BreadcrumbComponent],
  template: `<orc-breadcrumb
    [items]="items"
    (itemClick)="canonical.push($event)"
    (onItemClick)="alias.push($event)"
  />`,
})
class BreadcrumbConsumer {
  items = [{ label: 'Home' }, { label: 'Current' }];
  canonical: Array<{ item: BreadcrumbItemData; index: number }> = [];
  alias: Array<{ item: BreadcrumbItemData; index: number }> = [];
}

@Component({
  standalone: true,
  imports: [PickListComponent],
  template: `<orc-pick-list
    #pick
    [source]="source"
    [target]="target"
    filterBy="label"
    [disabled]="disabled"
    moveToTargetLabel="Move selected"
    moveToSourceLabel="Move selected back"
    (onMoveToTarget)="selectedForward.push($event)"
    (onMoveToSource)="selectedBack.push($event)"
    (onMoveAllToTarget)="allForward.push($event)"
    (onMoveAllToSource)="allBack.push($event)"
    (selectionChange)="selectionSnapshots.push($event)"
  />`,
})
class PickListConsumer {
  @ViewChild('pick') pick!: PickListComponent<P2Option>;
  source: P2Option[] = [
    { value: 'a', label: 'Alpha' },
    { value: 'locked', label: 'Locked', disabled: true },
    { value: 'b', label: 'Beta' },
  ];
  target: P2Option[] = [{ value: 'c', label: 'Gamma' }];
  selectedForward: TransferPayload[] = [];
  selectedBack: TransferPayload[] = [];
  allForward: TransferPayload[] = [];
  allBack: TransferPayload[] = [];
  selectionSnapshots: SelectionSnapshot[] = [];
  disabled = false;
}

@Component({
  standalone: true,
  imports: [PickListComponent],
  template: `<orc-pick-list [source]="source" [target]="target" />`,
})
class DefaultPickListConsumer {
  source: P2Option[] = [{ value: 'a', label: 'Alpha' }];
  target: P2Option[] = [{ value: 'b', label: 'Beta' }];
}

@Component({
  standalone: true,
  imports: [PickListComponent],
  template: `<orc-pick-list
    [source]="source"
    [target]="target"
    filterBy="label"
    [disabled]="disabled"
  />`,
})
class DisabledPickListConsumer {
  source: P2Option[] = [
    { value: 'locked', label: 'Locked', disabled: true },
    { value: 'b', label: 'Beta' },
  ];
  target: P2Option[] = [{ value: 'c', label: 'Gamma' }];
  disabled = true;
}

@Component({
  standalone: true,
  imports: [DataViewComponent],
  template: `<orc-data-view
      #view
      (onLayoutChange)="canonical.push($event)"
      (onChangeLayout)="alias.push($event)"
    /><button type="button" (click)="view.setLayout('list')">List</button>`,
})
class DataViewConsumer {
  @ViewChild('view') view!: DataViewComponent;
  canonical: Array<'list' | 'grid'> = [];
  alias: Array<'list' | 'grid'> = [];
}

describe('public output bindings', () => {
  it('registers every supported compatibility output in Angular metadata', () => {
    const expected: Array<[unknown, string]> = [
      [MenuComponent, 'onItemClick'],
      [PanelMenuComponent, 'onNodeSelect'],
      [PanelMenuComponent, 'onNodeExpand'],
      [PanelMenuComponent, 'onNodeCollapse'],
      [MegaMenuComponent, 'onItemClick'],
      [DataViewComponent, 'onChangeLayout'],
      [SpeedDialComponent, 'onVisibleChange'],
      [OrderListComponent, 'onReorder'],
      [TerminalComponent, 'onCommand'],
      [TreeComponent, 'onNodeSelect'],
      [TreeComponent, 'onNodeUnselect'],
      [TreeComponent, 'onNodeExpand'],
      [TreeComponent, 'onNodeCollapse'],
      [TreeTableComponent, 'onNodeSelect'],
      [TreeTableComponent, 'onNodeUnselect'],
      [TimelineComponent, 'onItemClick'],
      [BreadcrumbComponent, 'onItemClick'],
      [SplitButtonComponent, 'onClick'],
      [SplitButtonComponent, 'onDropdownClick'],
      [PickListComponent, 'onMoveAllToTarget'],
      [PickListComponent, 'onMoveAllToSource'],
    ];
    for (const [type, name] of expected) {
      const outputs = (type as { ɵcmp?: { outputs?: Record<string, string> } })
        .ɵcmp?.outputs;
      expect(outputs?.[name]).toBe(name);
    }
  });

  it('binds Menu aliases through a real consumer click exactly once with the same item', () => {
    const fixture = TestBed.createComponent(MenuConsumer);
    fixture.detectChanges();
    const command = fixture.componentInstance.items[0];
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(fixture.componentInstance.canonical).toEqual([command]);
    expect(fixture.componentInstance.alias).toEqual([command]);
    expect(fixture.componentInstance.canonical[0]).toBe(
      fixture.componentInstance.alias[0],
    );
  });

  it('binds SplitButton aliases through native primary and dropdown actions', () => {
    const fixture = TestBed.createComponent(SplitButtonConsumer);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();
    buttons[1].click();
    expect(fixture.componentInstance.primary).toHaveSize(1);
    expect(fixture.componentInstance.clickAlias).toHaveSize(1);
    expect(fixture.componentInstance.clickAlias[0]).toBe(
      fixture.componentInstance.primary[0],
    );
    expect(fixture.componentInstance.dropdown).toHaveSize(1);
    expect(fixture.componentInstance.dropdownAlias).toHaveSize(1);
    expect(fixture.componentInstance.dropdownAlias[0]).toBe(
      fixture.componentInstance.dropdown[0],
    );
  });

  it('binds Terminal and Breadcrumb aliases through consumer DOM events', () => {
    const terminal = TestBed.createComponent(TerminalConsumer);
    terminal.detectChanges();
    terminal.componentInstance.terminal.command.set('help');
    terminal.detectChanges();
    const submit = terminal.nativeElement.querySelector('form');
    submit.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    expect(terminal.componentInstance.canonical).toEqual(['help']);
    expect(terminal.componentInstance.alias).toEqual(['help']);

    const breadcrumb = TestBed.createComponent(BreadcrumbConsumer);
    breadcrumb.detectChanges();
    const link = breadcrumb.nativeElement.querySelector(
      '.orc-breadcrumb__link',
    ) as HTMLElement;
    link.click();
    expect(breadcrumb.componentInstance.canonical).toHaveSize(1);
    expect(breadcrumb.componentInstance.alias).toHaveSize(1);
    expect(breadcrumb.componentInstance.canonical[0]).toBe(
      breadcrumb.componentInstance.alias[0],
    );
    expect(breadcrumb.componentInstance.canonical[0].item.label).toBe('Home');
  });

  it('keeps canonical programmatic subscriptions while fanning out all same-event aliases', () => {
    const panel = TestBed.createComponent(PanelMenuComponent);
    const parent = { label: 'Parent', items: [{ label: 'Child' }] };
    panel.componentRef.setInput('model', [parent]);
    const expanded: unknown[] = [];
    const expandedAlias: unknown[] = [];
    panel.componentInstance.onItemExpand.subscribe((value) =>
      expanded.push(value),
    );
    panel.componentInstance.onNodeExpand.subscribe((value) =>
      expandedAlias.push(value),
    );
    panel.componentInstance.toggle(parent);
    expect(expanded).toEqual([parent]);
    expect(expandedAlias).toEqual([parent]);

    const dataView = TestBed.createComponent(DataViewConsumer);
    dataView.detectChanges();
    (
      dataView.nativeElement.querySelector('button') as HTMLButtonElement
    ).click();
    expect(dataView.componentInstance.canonical).toEqual(['list']);
    expect(dataView.componentInstance.alias).toEqual(['list']);

    const tree = TestBed.createComponent(TreeComponent);
    const node = { key: 'one', label: 'One' };
    const selected: unknown[] = [];
    const selectedAlias: unknown[] = [];
    tree.componentInstance.nodeSelect.subscribe((value) =>
      selected.push(value),
    );
    tree.componentInstance.onNodeSelect.subscribe((value) =>
      selectedAlias.push(value),
    );
    tree.componentInstance.select(node);
    expect(selected).toEqual([node]);
    expect(selectedAlias).toEqual([node]);
  });

  it('covers each repaired output branch through configured DOM interactions', () => {
    const parent: PrimeMenuItem = {
      label: 'Parent',
      items: [{ label: 'Child' }],
    };
    const panel = TestBed.createComponent(PanelMenuComponent);
    panel.componentRef.setInput('model', [parent]);
    const panelExpand: PrimeMenuItem[] = [];
    const panelExpandAlias: PrimeMenuItem[] = [];
    const panelCollapse: PrimeMenuItem[] = [];
    const panelCollapseAlias: PrimeMenuItem[] = [];
    const panelSelect: PrimeMenuItem[] = [];
    const panelSelectAlias: PrimeMenuItem[] = [];
    panel.componentInstance.onItemExpand.subscribe((value) =>
      panelExpand.push(value),
    );
    panel.componentInstance.onNodeExpand.subscribe((value) =>
      panelExpandAlias.push(value),
    );
    panel.componentInstance.onItemCollapse.subscribe((value) =>
      panelCollapse.push(value),
    );
    panel.componentInstance.onNodeCollapse.subscribe((value) =>
      panelCollapseAlias.push(value),
    );
    panel.componentInstance.itemSelect.subscribe((value) =>
      panelSelect.push(value),
    );
    panel.componentInstance.onNodeSelect.subscribe((value) =>
      panelSelectAlias.push(value),
    );
    panel.detectChanges();
    let panelButton = panel.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    panelButton.click();
    panel.detectChanges();
    panelButton = panel.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    panelButton.click();
    panel.detectChanges();
    panelButton.click();
    panel.detectChanges();
    (
      panel.nativeElement.querySelector('.children button') as HTMLButtonElement
    ).click();
    expect(panelExpand).toHaveSize(2);
    expect(
      panelExpandAlias.every((value, index) => value === panelExpand[index]),
    ).toBeTrue();
    expect(panelCollapse).toHaveSize(1);
    expect(panelCollapseAlias).toHaveSize(1);
    expect(panelCollapseAlias[0]).toBe(panelCollapse[0]);
    expect(panelSelect).toHaveSize(1);
    expect(panelSelectAlias).toHaveSize(1);
    expect(panelSelectAlias[0]).toBe(panelSelect[0]);

    const megaItem: PrimeMenuItem = { label: 'Dashboard' };
    const mega = TestBed.createComponent(MegaMenuComponent);
    mega.componentRef.setInput('model', [{ label: 'Main', items: [megaItem] }]);
    const megaSelected: PrimeMenuItem[] = [];
    const megaAlias: PrimeMenuItem[] = [];
    mega.componentInstance.itemSelect.subscribe((value) =>
      megaSelected.push(value),
    );
    mega.componentInstance.onItemClick.subscribe((value) =>
      megaAlias.push(value),
    );
    mega.detectChanges();
    (mega.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(megaSelected).toHaveSize(1);
    expect(megaAlias).toHaveSize(1);
    expect(megaAlias[0]).toBe(megaSelected[0]);

    const dataView = TestBed.createComponent(DataViewConsumer);
    dataView.detectChanges();
    (
      dataView.nativeElement.querySelector('button') as HTMLButtonElement
    ).click();
    expect(dataView.componentInstance.canonical).toEqual(['list']);
    expect(dataView.componentInstance.alias).toEqual(['list']);

    const speedDial = TestBed.createComponent(SpeedDialComponent);
    const visibility: boolean[] = [];
    const visibilityAliases: boolean[] = [];
    speedDial.componentInstance.visibleChange.subscribe((value) =>
      visibility.push(value),
    );
    speedDial.componentInstance.onVisibleChange.subscribe((value) =>
      visibilityAliases.push(value),
    );
    speedDial.detectChanges();
    const speedTrigger = speedDial.nativeElement.querySelector(
      '.trigger',
    ) as HTMLButtonElement;
    speedTrigger.click();
    speedTrigger.click();
    expect(visibility).toEqual([true, false]);
    expect(visibilityAliases).toEqual(visibility);

    const orderList = TestBed.createComponent(OrderListComponent<string>);
    orderList.componentRef.setInput('value', ['one', 'two']);
    orderList.componentRef.setInput('moveUpLabel', 'Move up');
    orderList.componentInstance.selectedIndex.set(1);
    const reordered: Array<{ value: string[]; direction: 'up' | 'down' }> = [];
    const reorderAliases: Array<{ value: string[]; direction: 'up' | 'down' }> =
      [];
    orderList.componentInstance.reorder.subscribe((value) =>
      reordered.push(value),
    );
    orderList.componentInstance.onReorder.subscribe((value) =>
      reorderAliases.push(value),
    );
    orderList.detectChanges();
    (
      orderList.nativeElement.querySelector(
        'button[aria-label="Move up"]',
      ) as HTMLButtonElement
    ).click();
    expect(reordered).toHaveSize(1);
    expect(reorderAliases).toHaveSize(1);
    expect(reorderAliases[0]).toBe(reordered[0]);

    const treeNode: HierarchyNode<Record<string, unknown>> = {
      key: 'root',
      label: 'Root',
      children: [{ key: 'child', label: 'Child' }],
    };
    const tree = TestBed.createComponent(
      TreeComponent<Record<string, unknown>>,
    );
    tree.componentRef.setInput('nodes', [treeNode]);
    const treeExpand: Array<HierarchyNode<Record<string, unknown>>> = [];
    const treeExpandAliases: Array<HierarchyNode<Record<string, unknown>>> = [];
    const treeCollapse: Array<HierarchyNode<Record<string, unknown>>> = [];
    const treeCollapseAliases: Array<HierarchyNode<Record<string, unknown>>> =
      [];
    const treeSelect: Array<HierarchyNode<Record<string, unknown>>> = [];
    const treeSelectAliases: Array<HierarchyNode<Record<string, unknown>>> = [];
    const treeUnselect: Array<HierarchyNode<Record<string, unknown>>> = [];
    const treeUnselectAliases: Array<HierarchyNode<Record<string, unknown>>> =
      [];
    tree.componentInstance.nodeExpand.subscribe((value) =>
      treeExpand.push(value),
    );
    tree.componentInstance.onNodeExpand.subscribe((value) =>
      treeExpandAliases.push(value),
    );
    tree.componentInstance.nodeCollapse.subscribe((value) =>
      treeCollapse.push(value),
    );
    tree.componentInstance.onNodeCollapse.subscribe((value) =>
      treeCollapseAliases.push(value),
    );
    tree.componentInstance.nodeSelect.subscribe((value) =>
      treeSelect.push(value),
    );
    tree.componentInstance.onNodeSelect.subscribe((value) =>
      treeSelectAliases.push(value),
    );
    tree.componentInstance.nodeUnselect.subscribe((value) =>
      treeUnselect.push(value),
    );
    tree.componentInstance.onNodeUnselect.subscribe((value) =>
      treeUnselectAliases.push(value),
    );
    tree.detectChanges();
    (tree.nativeElement.querySelector('.toggle') as HTMLButtonElement).click();
    tree.detectChanges();
    (tree.nativeElement.querySelector('.toggle') as HTMLButtonElement).click();
    tree.detectChanges();
    const treeLabel = tree.nativeElement.querySelector(
      '.label',
    ) as HTMLButtonElement;
    treeLabel.click();
    treeLabel.click();
    expect(treeExpand).toHaveSize(1);
    expect(treeExpandAliases).toHaveSize(1);
    expect(treeExpandAliases[0]).toBe(treeExpand[0]);
    expect(treeCollapse).toHaveSize(1);
    expect(treeCollapseAliases).toHaveSize(1);
    expect(treeCollapseAliases[0]).toBe(treeCollapse[0]);
    expect(treeSelect).toHaveSize(1);
    expect(treeSelectAliases).toHaveSize(1);
    expect(treeSelectAliases[0]).toBe(treeSelect[0]);
    expect(treeUnselect).toHaveSize(1);
    expect(treeUnselectAliases).toHaveSize(1);
    expect(treeUnselectAliases[0]).toBe(treeUnselect[0]);

    const treeTable = TestBed.createComponent(
      TreeTableComponent<Record<string, unknown>>,
    );
    const tableNode: HierarchyNode<Record<string, unknown>> = {
      key: 'row',
      label: 'Row',
    };
    treeTable.componentRef.setInput('value', [tableNode]);
    treeTable.componentRef.setInput('columns', [] as TreeTableColumn[]);
    const tableSelect: Array<HierarchyNode<Record<string, unknown>>> = [];
    const tableAliases: Array<HierarchyNode<Record<string, unknown>>> = [];
    const tableUnselect: Array<HierarchyNode<Record<string, unknown>>> = [];
    const tableUnselectAliases: Array<HierarchyNode<Record<string, unknown>>> =
      [];
    treeTable.componentInstance.nodeSelect.subscribe((value) =>
      tableSelect.push(value),
    );
    treeTable.componentInstance.onNodeSelect.subscribe((value) =>
      tableAliases.push(value),
    );
    treeTable.componentInstance.nodeUnselect.subscribe((value) =>
      tableUnselect.push(value),
    );
    treeTable.componentInstance.onNodeUnselect.subscribe((value) =>
      tableUnselectAliases.push(value),
    );
    treeTable.detectChanges();
    const checkbox = treeTable.nativeElement.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    expect(tableSelect).toHaveSize(1);
    expect(tableAliases).toHaveSize(1);
    expect(tableAliases[0]).toBe(tableSelect[0]);
    expect(tableUnselect).toHaveSize(1);
    expect(tableUnselectAliases).toHaveSize(1);
    expect(tableUnselectAliases[0]).toBe(tableUnselect[0]);

    const timeline = TestBed.createComponent(TimelineComponent);
    const timelineItem: TimelineItem = { title: 'Milestone' };
    timeline.componentRef.setInput('items', [timelineItem]);
    const timelineSelected: Array<{ item: TimelineItem; index: number }> = [];
    const timelineAliases: Array<{ item: TimelineItem; index: number }> = [];
    timeline.componentInstance.itemSelect.subscribe((value) =>
      timelineSelected.push(value),
    );
    timeline.componentInstance.onItemClick.subscribe((value) =>
      timelineAliases.push(value),
    );
    timeline.detectChanges();
    (
      timeline.nativeElement.querySelector('.orc-timeline__item') as HTMLElement
    ).click();
    expect(timelineAliases[0]).toBe(timelineSelected[0]);
  });

  it('supports PickList selected and all transfers as distinct consumer events', () => {
    const fixture = TestBed.createComponent(PickListConsumer);
    fixture.detectChanges();
    const sourceOptions = fixture.nativeElement.querySelectorAll(
      '.list-pane:first-child li[role="option"]',
    );
    sourceOptions[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect([...fixture.componentInstance.pick.sourceSelected()]).toEqual(['a']);
    sourceOptions[1].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect([...fixture.componentInstance.pick.sourceSelected()]).toEqual(['a']);
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelector(
        'button[aria-label="Move selected"]',
      ) as HTMLButtonElement
    ).click();
    expect(fixture.componentInstance.selectedForward.length).toBe(1);
    expect(
      fixture.componentInstance.selectedForward[0].items.map(
        (item) => item.value,
      ),
    ).toEqual(['a']);
    expect(fixture.componentInstance.allForward.length).toBe(0);
    expect(fixture.componentInstance.pick.sourceSelected().size).toBe(0);

    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector(
        'button[aria-label="Move all to target"]',
      ) as HTMLButtonElement
    ).click();
    expect(fixture.componentInstance.allForward.length).toBe(1);
    expect(
      fixture.componentInstance.allForward[0].items.map((item) => item.value),
    ).toEqual(['b']);
    expect(
      fixture.componentInstance.pick.source().map((item) => item.value),
    ).toEqual(['locked']);
    expect(
      fixture.componentInstance.pick.target().map((item) => item.value),
    ).toEqual(['c', 'a', 'b']);

    fixture.detectChanges();
    const targetOptions = fixture.nativeElement.querySelectorAll(
      '.list-pane:last-child li[role="option"]',
    );
    targetOptions[0].click();
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector(
        'button[aria-label="Move selected back"]',
      ) as HTMLButtonElement
    ).click();
    expect(fixture.componentInstance.selectedBack.length).toBe(1);
    expect(
      fixture.componentInstance.selectedBack[0].items.map((item) => item.value),
    ).toEqual(['c']);

    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector(
        'button[aria-label="Move all to source"]',
      ) as HTMLButtonElement
    ).click();
    expect(fixture.componentInstance.allBack.length).toBe(1);
    expect(
      fixture.componentInstance.allBack[0].items.map((item) => item.value),
    ).toEqual(['a', 'b']);
    expect(fixture.componentInstance.selectionSnapshots.length).toBe(6);
    expect([
      ...fixture.componentInstance.selectionSnapshots.at(-1)!.source,
    ]).toEqual([]);
    expect([
      ...fixture.componentInstance.selectionSnapshots.at(-1)!.target,
    ]).toEqual([]);
    expect(fixture.componentInstance.pick.target()).toEqual([]);
  });

  it('keeps PickList all actions disabled for empty or disabled-only lists and ignores filters', () => {
    const fixture = TestBed.createComponent(PickListConsumer);
    fixture.componentInstance.source = [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ];
    fixture.componentInstance.target = [];
    fixture.detectChanges();
    const sourceFilter = fixture.nativeElement.querySelector(
      '.list-pane:first-child input',
    ) as HTMLInputElement;
    sourceFilter.value = 'Alpha';
    sourceFilter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector(
        'button[aria-label="Move all to target"]',
      ) as HTMLButtonElement
    ).click();
    expect(fixture.componentInstance.allForward.length).toBe(1);
    expect(
      fixture.componentInstance.allForward[0].items.map((item) => item.value),
    ).toEqual(['a', 'b']);

    fixture.componentInstance.source = [
      { value: 'locked', label: 'Locked', disabled: true },
    ];
    fixture.detectChanges();
    const allForward = fixture.nativeElement.querySelector(
      'button[aria-label="Move all to target"]',
    ) as HTMLButtonElement;
    expect(allForward.disabled).toBeTrue();
    allForward.click();
    expect(fixture.componentInstance.pick.source()).toEqual([
      { value: 'locked', label: 'Locked', disabled: true },
    ]);
    const snapshotsBeforeNoOp =
      fixture.componentInstance.selectionSnapshots.length;
    fixture.componentInstance.pick.sourceSelected.set(new Set(['locked']));
    fixture.detectChanges();
    expect(fixture.componentInstance.pick.sourceSelected().size).toBe(0);
    (
      fixture.nativeElement.querySelector(
        'button[aria-label="Move selected"]',
      ) as HTMLButtonElement
    ).click();
    expect(fixture.componentInstance.selectionSnapshots.length).toBe(
      snapshotsBeforeNoOp,
    );
  });

  it('provides named selected controls in the default configuration', () => {
    const fixture = TestBed.createComponent(DefaultPickListConsumer);
    fixture.detectChanges();
    const buttons = [
      ...fixture.nativeElement.querySelectorAll('button'),
    ] as HTMLButtonElement[];
    expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual([
      'Move selected to target',
      'Move all to target',
      'Move selected to source',
      'Move all to source',
    ]);
    expect(buttons[0].disabled).toBeTrue();
    expect(buttons[1].disabled).toBeFalse();
    expect(buttons[2].disabled).toBeTrue();
    expect(buttons[3].disabled).toBeFalse();
  });

  it('uses one roving entry per pane and skips disabled or filtered options', async () => {
    const fixture = TestBed.createComponent(PickListConsumer);
    fixture.detectChanges();
    const sourceList = fixture.nativeElement.querySelector(
      '.list-pane:first-child ul',
    ) as HTMLUListElement;
    const sourceOptions = [
      ...sourceList.querySelectorAll<HTMLElement>('[role="option"]'),
    ];
    expect(sourceList.getAttribute('aria-multiselectable')).toBe('true');
    expect(sourceOptions.map((option) => option.tabIndex)).toEqual([0, -1, -1]);

    focusElement(sourceOptions[0]);
    sourceOptions[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    await Promise.resolve();
    expect(document.activeElement).toBe(sourceOptions[2]);
    expect(sourceOptions.map((option) => option.tabIndex)).toEqual([-1, -1, 0]);

    sourceOptions[2].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Home',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    await Promise.resolve();
    expect(document.activeElement).toBe(sourceOptions[0]);
    sourceOptions[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(sourceOptions[0].getAttribute('aria-selected')).toBe('true');

    const sourceFilter = fixture.nativeElement.querySelector(
      '.list-pane:first-child input',
    ) as HTMLInputElement;
    sourceFilter.value = 'Beta';
    sourceFilter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await Promise.resolve();
    const filtered = [
      ...sourceList.querySelectorAll<HTMLElement>('[role="option"]'),
    ];
    expect(filtered).toHaveSize(1);
    expect(filtered[0].textContent).toContain('Beta');
    expect(filtered[0].tabIndex).toBe(0);
    expect(document.activeElement).toBe(filtered[0]);

    focusElement(sourceFilter);
    fixture.componentInstance.pick.source.set([
      { value: 'replacement', label: 'Replacement' },
    ]);
    fixture.detectChanges();
    await Promise.resolve();
    expect(document.activeElement).toBe(sourceFilter);

    expect(fixture.componentInstance.pick.sourceSelected().size).toBe(0);
    expect(fixture.componentInstance.selectionSnapshots.length).toBe(1);
  });

  it('disables filters, options, and keyboard behavior as one widget', () => {
    const fixture = TestBed.createComponent(DisabledPickListConsumer);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(
      '.orc-pick-list',
    ) as HTMLElement;
    const sourceFilter = root.querySelector(
      '.list-pane:first-child input',
    ) as HTMLInputElement;
    const sourceOptions = [
      ...root.querySelectorAll<HTMLElement>(
        '.list-pane:first-child [role="option"]',
      ),
    ];
    expect(root.getAttribute('aria-disabled')).toBe('true');
    expect(sourceFilter.disabled).toBeTrue();
    expect(sourceOptions.map((option) => option.tabIndex)).toEqual([-1, -1]);
    expect(
      sourceOptions.every(
        (option) => option.getAttribute('aria-disabled') === 'true',
      ),
    ).toBeTrue();
    const key = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    sourceOptions[0].dispatchEvent(key);
    expect(key.defaultPrevented).toBeFalse();

    fixture.componentInstance.disabled = false;
    fixture.detectChanges();
    const enabledOptions = [
      ...root.querySelectorAll<HTMLElement>(
        '.list-pane:first-child [role="option"]',
      ),
    ];
    expect(sourceFilter.disabled).toBeFalse();
    expect(enabledOptions.map((option) => option.tabIndex)).toEqual([-1, 0]);
  });

  it('syncs the roving cursor to focus and cancels stale requests on destroy', async () => {
    const fixture = TestBed.createComponent(PickListConsumer);
    fixture.detectChanges();
    const options = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '.list-pane:first-child [role="option"]',
      ),
    ];
    focusElement(options[2]);
    expect(fixture.componentInstance.pick.sourceFocusValue()).toBe('b');
    const arrow = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      bubbles: true,
      cancelable: true,
    });
    options[2].dispatchEvent(arrow);
    fixture.destroy();
    await Promise.resolve();
    expect(document.activeElement).not.toBe(options[0]);
  });

  it('uses the configured focus ring token for focused options', () => {
    const fixture = TestBed.createComponent(DefaultPickListConsumer);
    fixture.detectChanges();
    const option = fixture.nativeElement.querySelector(
      '.list-pane:first-child [role="option"]',
    ) as HTMLElement;
    focusElement(option);
    const style = getComputedStyle(option);
    expect(style.outlineStyle).toBe('solid');
    expect(style.outlineColor).not.toBe('');
  });

  it('moves physical focus after rendered roving updates and skips disabled options', async () => {
    const fixture = TestBed.createComponent(PickListConsumer);
    fixture.componentInstance.source = [
      { value: 'a', label: 'Alpha' },
      { value: 'locked', label: 'Locked', disabled: true },
      { value: 'b', label: 'Beta' },
      { value: 'c', label: 'Charlie' },
    ];
    fixture.detectChanges();

    const options = () => [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '.list-pane:first-child [role="option"]',
      ),
    ];
    const dispatch = (option: HTMLElement, key: 'ArrowDown' | 'ArrowUp') => {
      option.dispatchEvent(
        new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          cancelable: true,
        }),
      );
      fixture.detectChanges();
    };

    focusElement(options()[0]);
    dispatch(options()[0], 'ArrowDown');
    await Promise.resolve();
    expect(options()[2].tabIndex).toBe(0);
    expect(document.activeElement).toBe(options()[2]);

    dispatch(options()[2], 'ArrowDown');
    await Promise.resolve();
    expect(options()[3].tabIndex).toBe(0);
    expect(document.activeElement).toBe(options()[3]);

    dispatch(options()[3], 'ArrowUp');
    await Promise.resolve();
    expect(options()[2].tabIndex).toBe(0);
    expect(document.activeElement).toBe(options()[2]);
  });

  it('does not run stale focus requests across disable, blur, or external focus', async () => {
    const fixture = TestBed.createComponent(PickListConsumer);
    fixture.detectChanges();
    const pick = fixture.componentInstance.pick;
    const sourceOptions = () => [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '.list-pane:first-child [role="option"]',
      ),
    ];
    const targetOptions = () => [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '.list-pane:last-child [role="option"]',
      ),
    ];

    const source = sourceOptions();
    focusElement(source[0]);
    source[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    await Promise.resolve();
    expect(document.activeElement).not.toBe(source[2]);
    expect(
      sourceOptions().every((option) => option.tabIndex === -1),
    ).toBeTrue();

    fixture.componentInstance.disabled = false;
    pick.target.set([
      { value: 'c', label: 'Gamma' },
      { value: 'd', label: 'Delta' },
    ]);
    fixture.detectChanges();
    const target = targetOptions();
    focusElement(target[0]);
    target[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    pick.target.set([
      { value: 'c', label: 'Gamma' },
      { value: 'd', label: 'Delta', disabled: true },
    ]);
    fixture.detectChanges();
    await Promise.resolve();
    expect(document.activeElement).toBe(targetOptions()[0]);
    expect(targetOptions()[1].getAttribute('aria-disabled')).toBe('true');

    blurElement(targetOptions()[0]);
    await Promise.resolve();
    pick.target.set([{ value: 'new', label: 'New' }]);
    fixture.detectChanges();
    await Promise.resolve();
    expect(document.activeElement).toBe(document.body);

    const external = document.createElement('button');
    document.body.appendChild(external);
    try {
      const current = sourceOptions()[0];
      focusElement(current);
      focusElement(external);
      pick.source.set([{ value: 'external-update', label: 'External update' }]);
      fixture.detectChanges();
      await Promise.resolve();
      expect(document.activeElement).toBe(external);
    } finally {
      external.remove();
    }

    pick.source.set([
      { value: 'owned', label: 'Owned' },
      { value: 'neighbor', label: 'Neighbor' },
    ]);
    fixture.detectChanges();
    const owned = sourceOptions()[0];
    focusElement(owned);
    pick.source.set([{ value: 'neighbor', label: 'Neighbor' }]);
    fixture.detectChanges();
    await Promise.resolve();
    expect(document.activeElement).toBe(sourceOptions()[0]);
  });
});
