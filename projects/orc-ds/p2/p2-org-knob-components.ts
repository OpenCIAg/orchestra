import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { P2_SHARED_STYLES } from './p2-shared';

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
  template: `<section
    class="orc-org"
    role="tree"
    [attr.aria-label]="label() || null"
  >
    <div class="tree">
      @for (item of flatNodes(); track item.node.key) {
        <article
          class="node"
          [class.disabled]="item.node.disabled"
          [style.margin-left.rem]="item.level * 2.2"
          role="treeitem"
          [attr.aria-level]="item.level + 1"
          [attr.aria-selected]="isSelected(item.node.key)"
          [attr.aria-disabled]="item.node.disabled ? 'true' : null"
          [attr.aria-expanded]="
            item.node.children?.length ? expanded().has(item.node.key) : null
          "
          tabindex="0"
          (click)="select(item.node)"
          (keydown)="onNodeKeydown($event, item.node)"
        >
          <div class="card" [class.selected]="isSelected(item.node.key)">
            @if (item.node.children?.length) {
              <button
                type="button"
                class="expand"
                [disabled]="item.node.disabled || !collapsible()"
                (click)="$event.stopPropagation(); toggle(item.node)"
                (keydown)="$event.stopPropagation()"
                [attr.aria-expanded]="expanded().has(item.node.key)"
                [attr.aria-label]="toggleLabel(item.node)"
              >
                {{ expanded().has(item.node.key) ? '−' : '+' }}
              </button>
            }
            @if (item.node.image) {
              <img [src]="item.node.image" [alt]="item.node.label" />
            }
            <strong>{{ item.node.label }}</strong>
            @if (item.node.subtitle) {
              <small>{{ item.node.subtitle }}</small>
            }
          </div>
        </article>
      }
    </div>
  </section>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-org{width:100%;overflow:auto}.tree{min-width:18rem;padding:1rem}.node{position:relative;padding:.35rem 0}.node:before{content:'';position:absolute;top:-.35rem;left:-1.1rem;width:1px;height:calc(100% + .35rem);background:var(--orc-component-surface-subtle)}.node:first-child:before{top:50%;height:50%}.card{display:grid;gap:.15rem;width:max-content;min-width:10rem;padding:.65rem .8rem;border:1px solid var(--orc-component-border-strong);border-radius:.5rem;background:var(--orc-component-surface);box-shadow:0 2px 6px var(--orc-component-shadow-color);cursor:pointer}.card:hover{border-color:var(--orc-component-interactive);background:var(--orc-component-interactive-soft)}.card img{width:2rem;height:2rem;border-radius:50%;object-fit:cover}.card small{color:var(--orc-component-text-muted)}.node.disabled{opacity:.5}`,
  ],
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

/**
 * Compatibility surface: KnobComponent lives in the canonical
 * `knob` directory; these re-exports keep every p2 entry symbol unchanged.
 */
export { KnobComponent } from '@ciag/orchestra/knob';
