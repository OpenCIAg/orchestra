import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { ORC_SHARED_VARS } from '@ciag/orchestra/internal';
export interface OrganizationNode {
  key: string;
  label: string;
  subtitle?: string;
  image?: string;
  children?: OrganizationNode[];
  disabled?: boolean;
}
interface FlatOrganizationNode {
  node: OrganizationNode;
  level: number;
  last: boolean;
}

@Component({
  selector: 'orc-organization-chart',
  standalone: true,
  templateUrl: './organization-chart.component.html',
  styles: [ORC_SHARED_VARS],
  styleUrl: './organization-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationChartComponent {
  readonly value = input<OrganizationNode[]>([]);
  readonly label = input<string | undefined>(undefined);
  readonly toggleChildrenLabel = input<string | undefined>(undefined);
  readonly selectionMode = input<'single' | 'multiple'>('single');
  readonly collapsible = input(true, { transform: booleanAttribute });
  readonly selected = model<string | string[] | null>(null);
  readonly expanded = model<ReadonlySet<string>>(new Set());
  readonly nodeSelect = output<OrganizationNode>();
  readonly nodeUnselect = output<OrganizationNode>();
  readonly nodeExpand = output<OrganizationNode>();
  readonly nodeCollapse = output<OrganizationNode>();
  readonly selectionChange = output<string | string[] | null>();
  readonly flatNodes = computed<FlatOrganizationNode[]>(() => {
    const result: FlatOrganizationNode[] = [];
    const visit = (nodes: OrganizationNode[], level: number): void => {
      nodes.forEach((node, index) => {
        result.push({ node, level, last: index === nodes.length - 1 });
        if (node.children?.length && this.expanded().has(node.key))
          visit(node.children, level + 1);
      });
    };
    visit(this.value(), 0);
    return result;
  });
  isSelected(key: string): boolean {
    const selected = this.selected();
    return Array.isArray(selected) ? selected.includes(key) : selected === key;
  }
  toggleLabel(node: OrganizationNode): string {
    return (
      this.toggleChildrenLabel() ||
      `${this.expanded().has(node.key) ? 'Collapse' : 'Expand'} ${node.label}`
    );
  }
  onNodeKeydown(event: KeyboardEvent, node: OrganizationNode): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.select(node);
  }
  toggle(node: OrganizationNode): void {
    if (!this.collapsible() || !node.children?.length || node.disabled) return;
    const next = new Set(this.expanded());
    const open = next.has(node.key);
    if (open) next.delete(node.key);
    else next.add(node.key);
    this.expanded.set(next);
    (open ? this.nodeCollapse : this.nodeExpand).emit(node);
  }
  select(node: OrganizationNode): void {
    if (node.disabled) return;
    const current = this.selected();
    const next =
      this.selectionMode() === 'single'
        ? this.isSelected(node.key)
          ? null
          : node.key
        : (() => {
            const values = Array.isArray(current)
              ? [...current]
              : current
                ? [current]
                : [];
            const index = values.indexOf(node.key);
            if (index >= 0) values.splice(index, 1);
            else values.push(node.key);
            return values;
          })();
    this.selected.set(next);
    this.selectionChange.emit(next);
    (this.isSelected(node.key) ? this.nodeSelect : this.nodeUnselect).emit(
      node,
    );
  }
}
