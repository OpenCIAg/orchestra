import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import {
  OrganizationChartComponent,
  OrganizationNode,
} from '@ciag/orchestra/organization-chart';

@Component({
  standalone: true,
  imports: [OrganizationChartComponent],
  template: `
    <orc-organization-chart
      [value]="nodes"
      [selectionMode]="selectionMode"
      label="People"
    />
  `,
})
class OrganizationChartHost {
  selectionMode: 'single' | 'multiple' = 'single';
  readonly nodes: OrganizationNode[] = [
    {
      key: 'root',
      label: 'Root',
      children: [
        { key: 'child', label: 'Child' },
        { key: 'disabled', label: 'Disabled', disabled: true },
      ],
    },
  ];
}

describe('OrganizationChart keyboard and selection contract', () => {
  function createFixture(selectionMode: 'single' | 'multiple' = 'single') {
    const fixture = TestBed.createComponent(OrganizationChartHost);
    fixture.componentInstance.selectionMode = selectionMode;
    fixture.detectChanges();
    return {
      fixture,
      chart: fixture.debugElement.query(
        By.directive(OrganizationChartComponent),
      ).componentInstance as OrganizationChartComponent,
    };
  }

  it('renders semantic treeitem selection and disabled state', () => {
    const { fixture, chart } = createFixture();
    chart.selected.set('root');
    fixture.detectChanges();

    const tree = fixture.nativeElement.querySelector('[role="tree"]');
    const nodes = Array.from(
      fixture.nativeElement.querySelectorAll('[role="treeitem"]'),
    ) as HTMLElement[];

    expect(tree.getAttribute('aria-label')).toBe('People');
    expect(nodes).toHaveSize(1);
    expect(nodes[0].getAttribute('aria-selected')).toBe('true');
    expect(nodes[0].getAttribute('aria-level')).toBe('1');
    expect(nodes[0].tabIndex).toBe(0);
    expect(nodes[0].getAttribute('aria-expanded')).toBe('false');
    expect(nodes[0].querySelector('.expand')?.getAttribute('aria-label')).toBe(
      'Expand Root',
    );

    nodes[0].querySelector<HTMLButtonElement>('.expand')!.click();
    fixture.detectChanges();
    const expandedNodes = Array.from(
      fixture.nativeElement.querySelectorAll('[role="treeitem"]'),
    ) as HTMLElement[];
    expect(expandedNodes).toHaveSize(3);
    expect(expandedNodes[1].getAttribute('aria-disabled')).toBeNull();
    expect(expandedNodes[2].getAttribute('aria-disabled')).toBe('true');
    expect(expandedNodes[2].getAttribute('aria-selected')).toBe('false');
  });

  it('selects nodes from Enter and Space while disabled nodes stay inert', () => {
    const { fixture, chart } = createFixture();
    const selected: Array<string | string[] | null> = [];
    const selectedNodes: string[] = [];
    chart.selectionChange.subscribe((value) => selected.push(value));
    chart.nodeSelect.subscribe((node) => selectedNodes.push(node.key));
    chart.expanded.set(new Set(['root']));
    fixture.detectChanges();

    const nodes = () =>
      Array.from(
        fixture.nativeElement.querySelectorAll('[role="treeitem"]'),
      ) as HTMLElement[];
    nodes()[1].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    fixture.detectChanges();
    expect(chart.selected()).toBe('child');
    expect(selected).toEqual(['child']);
    expect(selectedNodes).toEqual(['child']);

    nodes()[2].dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', bubbles: true }),
    );
    fixture.detectChanges();
    expect(chart.selected()).toBe('child');
    expect(selected).toEqual(['child']);
    expect(selectedNodes).toEqual(['child']);
  });

  it('keeps expansion-button activation separate from selection outputs', () => {
    const { fixture, chart } = createFixture();
    const changes: Array<string | string[] | null> = [];
    const expanded: string[] = [];
    const collapsed: string[] = [];
    chart.selectionChange.subscribe((value) => changes.push(value));
    chart.nodeExpand.subscribe((node) => expanded.push(node.key));
    chart.nodeCollapse.subscribe((node) => collapsed.push(node.key));
    fixture.detectChanges();

    const button = () =>
      fixture.nativeElement.querySelector('.expand') as HTMLButtonElement;
    button().click();
    fixture.detectChanges();
    expect(chart.expanded()).toEqual(new Set(['root']));
    expect(changes).toEqual([]);
    expect(expanded).toEqual(['root']);

    const keydown = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
    });
    button().dispatchEvent(keydown);
    fixture.detectChanges();
    expect(chart.selected()).toBeNull();
    expect(changes).toEqual([]);

    button().click();
    fixture.detectChanges();
    expect(chart.expanded()).toEqual(new Set());
    expect(collapsed).toEqual(['root']);
    expect(changes).toEqual([]);
  });

  it('preserves single and multiple model shapes with one output per selection', () => {
    const { fixture, chart } = createFixture('multiple');
    const changes: Array<string | string[] | null> = [];
    const selected: string[] = [];
    const unselected: string[] = [];
    chart.selectionChange.subscribe((value) => changes.push(value));
    chart.nodeSelect.subscribe((node) => selected.push(node.key));
    chart.nodeUnselect.subscribe((node) => unselected.push(node.key));
    const child = fixture.componentInstance.nodes[0].children![0];

    chart.select(fixture.componentInstance.nodes[0]);
    chart.select(child);
    chart.select(child);
    expect(chart.selected()).toEqual(['root']);
    expect(changes).toEqual([['root'], ['root', 'child'], ['root']]);
    expect(selected).toEqual(['root', 'child']);
    expect(unselected).toEqual(['child']);

    const single = createFixture('single').chart;
    const singleChanges: Array<string | string[] | null> = [];
    single.selectionChange.subscribe((value) => singleChanges.push(value));
    single.selected.set(['root']);
    single.select(single.value()[0]);
    expect(single.selected()).toBeNull();
    expect(singleChanges).toEqual([null]);
  });
});
