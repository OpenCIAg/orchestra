import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import { P2Option, P2_SHARED_STYLES } from './p2-shared';

@Component({
  selector: 'orc-segmented-control',
  standalone: true,
  template: `<div class="orc-p2-segmented" role="group" [attr.aria-label]="label()" (keydown)="onKeydown($event)">@for (option of options(); track option.value) { <button type="button" [disabled]="option.disabled || disabled()" [class.selected]="isSelected(option)" [attr.aria-pressed]="isSelected(option)" (click)="select(option)">{{ option.icon }} {{ option.label }}</button> }</div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-segmented { display: inline-flex; gap: .2rem; padding: .2rem; border-radius: .6rem; background: #f1f5f9; } .orc-p2-segmented button { border: 0; border-radius: .4rem; background: transparent; color: #475569; padding: .5rem .75rem; } .orc-p2-segmented button.selected { background: #fff; color: #1d4ed8; box-shadow: 0 1px 3px #0f172a1a; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentedControlComponent<T = unknown> {
  readonly options = input<P2Option<T>[]>([]);
  readonly value = model<T | null>(null);
  readonly label = input('Options');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly valueChangeEvent = output<T>();
  readonly activeIndex = signal(0);
  isSelected(option: P2Option<T>): boolean { return this.value() === option.value; }
  select(option: P2Option<T>): void { if (option.disabled || this.disabled()) return; this.value.set(option.value); this.valueChangeEvent.emit(option.value); }
  onKeydown(event: KeyboardEvent): void {
    const options = this.options(); if (!options.length) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); const delta = event.key === 'ArrowRight' ? 1 : -1; this.activeIndex.update(index => (index + delta + options.length) % options.length); }
    else if (event.key === 'Enter' || event.key === ' ') { const option = options[this.activeIndex()]; if (option) this.select(option); }
  }
}

export interface TreeSelectNode extends P2Option<string> {
  children?: TreeSelectNode[];
}

interface VisibleTreeSelectNode { node: TreeSelectNode; level: number; }

@Component({
  selector: 'orc-tree-select',
  standalone: true,
  template: `
    <div class="orc-p2-tree-select">
      @if (label()) { <label>{{ label() }}</label> }
      <button type="button" class="trigger" [disabled]="disabled()" [attr.aria-expanded]="open()" (click)="open.set(!open())">{{ selectedLabel() || placeholder() }} <span aria-hidden="true">⌄</span></button>
      @if (open()) {
        <ul class="tree" role="tree">
          @for (item of visibleNodes(); track item.node.value) {
            <li role="treeitem" [attr.aria-level]="item.level" [style.padding-left.rem]="item.level * .9" [attr.aria-selected]="value() === item.node.value" [class.selected]="value() === item.node.value" [class.disabled]="item.node.disabled">
              @if (item.node.children?.length) { <button type="button" class="expand" [attr.aria-label]="expanded().has(item.node.value) ? 'Collapse' : 'Expand'" (click)="toggle(item.node)">{{ expanded().has(item.node.value) ? '▾' : '▸' }}</button> } @else { <span class="expand-placeholder"></span> }
              <button type="button" class="item" [disabled]="item.node.disabled" (click)="select(item.node)">{{ item.node.label }}</button>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [P2_SHARED_STYLES + `.orc-p2-tree-select { position: relative; display: grid; gap: .35rem; color: #0f172a; } label { font-size: .875rem; font-weight: 600; } .trigger { display: flex; justify-content: space-between; min-height: 2.5rem; border: 1px solid #cbd5e1; border-radius: .5rem; background: #fff; padding: .5rem .7rem; text-align: left; } .tree { position: absolute; z-index: 3; top: 4.2rem; right: 0; left: 0; max-height: 16rem; overflow: auto; margin: 0; padding: .25rem; border: 1px solid #cbd5e1; border-radius: .5rem; background: #fff; box-shadow: 0 10px 25px #0f172a1a; list-style: none; } li { display: flex; align-items: center; min-height: 2rem; } li.selected { background: #eff6ff; } li.disabled { color: #94a3b8; } .expand, .expand-placeholder { flex: 0 0 1.4rem; width: 1.4rem; border: 0; background: transparent; text-align: center; } .item { flex: 1; border: 0; background: transparent; padding: .35rem; text-align: left; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeSelectComponent {
  readonly nodes = input<TreeSelectNode[]>([]);
  readonly value = model<string | null>(null);
  readonly label = input('');
  readonly placeholder = input('Select an item');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly open = model(false);
  readonly expanded = signal<ReadonlySet<string>>(new Set());
  readonly nodeSelect = output<TreeSelectNode>();

  readonly visibleNodes = computed<VisibleTreeSelectNode[]>(() => {
    const result: VisibleTreeSelectNode[] = [];
    const visit = (nodes: TreeSelectNode[], level: number): void => {
      for (const node of nodes) { result.push({ node, level }); if (node.children?.length && this.expanded().has(node.value)) visit(node.children, level + 1); }
    };
    visit(this.nodes(), 1); return result;
  });
  selectedLabel(): string { return this.findNode(this.nodes(), this.value())?.label ?? ''; }
  toggle(node: TreeSelectNode): void { if (!node.children?.length) return; this.expanded.update(current => { const next = new Set(current); next.has(node.value) ? next.delete(node.value) : next.add(node.value); return next; }); }
  select(node: TreeSelectNode): void { if (node.disabled) return; this.value.set(node.value); this.nodeSelect.emit(node); this.open.set(false); }
  private findNode(nodes: TreeSelectNode[], value: string | null): TreeSelectNode | undefined { for (const node of nodes) { if (node.value === value) return node; const nested = node.children ? this.findNode(node.children, value) : undefined; if (nested) return nested; } return undefined; }
}

