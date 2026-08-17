import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import { P2_SHARED_STYLES } from './p2-shared';

export interface HierarchyNode<T = Record<string, unknown>> {
  key: string;
  label: string;
  data?: T;
  children?: HierarchyNode<T>[];
  leaf?: boolean;
  disabled?: boolean;
}
interface FlatHierarchyNode<T> { node: HierarchyNode<T>; level: number; }

@Component({
  selector: 'orc-tree', standalone: true,
  template: `<div class="orc-tree" role="tree" [attr.aria-label]="label()">@for (item of visibleNodes(); track item.node.key) { <div class="tree-row" role="treeitem" [attr.aria-level]="item.level" [attr.aria-expanded]="item.node.children?.length ? expanded().has(item.node.key) : null" [class.selected]="selected() === item.node.key" [class.disabled]="item.node.disabled" [style.padding-left.rem]=".5 + item.level * 1.1"><button type="button" class="toggle" [disabled]="!item.node.children?.length" (click)="toggle(item.node)">{{ item.node.children?.length ? (expanded().has(item.node.key) ? '▾' : '▸') : '·' }}</button><button type="button" class="label" [disabled]="item.node.disabled" (click)="select(item.node)">{{ item.node.label }}</button></div> }</div>`,
  styles: [P2_SHARED_STYLES + `.orc-tree{width:100%;border:1px solid #e2e8f0;border-radius:.5rem;background:#fff;color:#0f172a}.tree-row{display:flex;align-items:center;min-height:2.25rem}.tree-row.selected{background:#eff6ff}.tree-row.disabled{opacity:.55}.toggle,.label{border:0;background:transparent}.toggle{width:1.5rem}.label{flex:1;padding:.4rem;text-align:left}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeComponent<T = Record<string, unknown>> {
  readonly nodes = input<HierarchyNode<T>[]>([]); readonly label = input('Tree'); readonly selected = model<string | null>(null); readonly expanded = signal<ReadonlySet<string>>(new Set()); readonly nodeSelect = output<HierarchyNode<T>>(); readonly nodeExpand = output<HierarchyNode<T>>();
  readonly visibleNodes = computed<FlatHierarchyNode<T>[]>(() => { const result: FlatHierarchyNode<T>[] = []; const visit = (nodes: HierarchyNode<T>[], level: number): void => { for (const node of nodes) { result.push({ node, level }); if (node.children?.length && this.expanded().has(node.key)) visit(node.children, level + 1); } }; visit(this.nodes(), 1); return result; });
  toggle(node: HierarchyNode<T>): void { if (!node.children?.length) return; this.expanded.update(current => { const next = new Set(current); if (next.has(node.key)) next.delete(node.key); else next.add(node.key); return next; }); this.nodeExpand.emit(node); }
  select(node: HierarchyNode<T>): void { if (node.disabled) return; this.selected.set(node.key); this.nodeSelect.emit(node); }
}

export interface TreeTableColumn { key: string; header: string; }
@Component({
  selector: 'orc-tree-table', standalone: true,
  template: `<div class="orc-tree-table" [attr.aria-label]="label()"><table><thead><tr><th scope="col">{{ treeColumnHeader() }}</th>@for (column of columns(); track column.key) { <th scope="col">{{ column.header }}</th> }</tr></thead><tbody>@for (item of visibleNodes(); track item.node.key) { <tr [class.selected]="selected().has(item.node.key)" [style.background]="selected().has(item.node.key) ? '#eff6ff' : null"><td [style.padding-left.rem]=".5 + item.level * 1.1"><button type="button" class="toggle" [disabled]="!item.node.children?.length" (click)="toggle(item)">{{ item.node.children?.length ? (expanded().has(item.node.key) ? '▾' : '▸') : '·' }}</button><input type="checkbox" [checked]="selected().has(item.node.key)" [disabled]="item.node.disabled" (change)="select(item, ($any($event.target)).checked)" /><span>{{ item.node.label }}</span></td>@for (column of columns(); track column.key) { <td>{{ cellValue(item.node, column.key) }}</td> }</tr> } @empty { <tr><td [attr.colspan]="columns().length + 1">{{ emptyText() }}</td></tr> }</tbody></table></div>`,
  styles: [P2_SHARED_STYLES + `.orc-tree-table{width:100%;overflow:auto;border:1px solid #e2e8f0;border-radius:.5rem;background:#fff}.orc-tree-table table{width:100%;border-collapse:collapse;color:#0f172a}.orc-tree-table th,.orc-tree-table td{padding:.65rem .75rem;border-bottom:1px solid #e2e8f0;text-align:left}.orc-tree-table th{background:#f8fafc}.toggle{width:1.5rem;border:0;background:transparent}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeTableComponent<T = Record<string, unknown>> {
  readonly value = input<HierarchyNode<T>[]>([]); readonly columns = input<TreeTableColumn[]>([]); readonly label = input('Tree table'); readonly treeColumnHeader = input('Name'); readonly emptyText = input('No data'); readonly expanded = signal<ReadonlySet<string>>(new Set()); readonly selected = model<ReadonlySet<string>>(new Set()); readonly nodeSelect = output<HierarchyNode<T>>();
  readonly visibleNodes = computed<FlatHierarchyNode<T>[]>(() => { const result: FlatHierarchyNode<T>[] = []; const visit = (nodes: HierarchyNode<T>[], level: number): void => { for (const node of nodes) { result.push({ node, level }); if (node.children?.length && this.expanded().has(node.key)) visit(node.children, level + 1); } }; visit(this.value(), 1); return result; });
  toggle(item: FlatHierarchyNode<T>): void { const node = item.node; if (!node.children?.length) return; this.expanded.update(current => { const next = new Set(current); if (next.has(node.key)) next.delete(node.key); else next.add(node.key); return next; }); }
  select(item: FlatHierarchyNode<T>, checked: boolean): void { const next = new Set(this.selected()); checked ? next.add(item.node.key) : next.delete(item.node.key); this.selected.set(next); this.nodeSelect.emit(item.node); }
  cellValue(node: HierarchyNode<T>, key: string): unknown { return node.data && typeof node.data === 'object' ? (node.data as Record<string, unknown>)[key] ?? '' : ''; }
}
