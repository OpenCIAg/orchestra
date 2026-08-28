import { booleanAttribute, ChangeDetectionStrategy, Component, computed, forwardRef, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { P2Option, P2_SHARED_STYLES } from './p2-shared';

let nextTreeSelectId = 0;

@Component({
  selector: 'orc-segmented-control',
  standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SegmentedControlComponent), multi: true }],
  template: `<div class="p-selectbutton p-buttonset p-component orc-p2-segmented" [class]="'p-selectbutton p-buttonset p-component orc-p2-segmented ' + styleClass()" [style]="style()" [attr.id]="inputId() || null" role="group" [attr.aria-label]="label() || null" [attr.data-pc-name]="'selectbutton'" (keydown)="onKeydown($event)">@for (option of options(); track option.value) { <button type="button" class="p-button p-component" [disabled]="option.disabled || disabled() || cvaDisabled() || readonly()" [attr.tabindex]="tabindex()" [class.selected]="isSelected(option)" [attr.aria-pressed]="isSelected(option)" (click)="select(option)">{{ option.icon }} {{ option.label }}</button> }</div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-segmented { display: inline-flex; gap: .2rem; padding: .2rem; border-radius: .6rem; background: var(--orc-component-surface-muted); } .orc-p2-segmented button { border: 0; border-radius: .4rem; background: transparent; color: var(--orc-component-text-secondary); padding: .5rem .75rem; } .orc-p2-segmented button.selected { background: var(--orc-component-surface-raised); color: var(--orc-component-interactive-hover); box-shadow: var(--orc-component-overlay-shadow); }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentedControlComponent<T = unknown> implements ControlValueAccessor {
  readonly options = input<P2Option<T>[]>([]);
  readonly value = model<T | null>(null);
  readonly label = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly inputId = input<string | undefined>(undefined);
  readonly tabindex = input(0);
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(undefined);
  readonly valueChangeEvent = output<T>();
  protected readonly cvaDisabled = signal(false);
  private onModelChange: (value: T | null) => void = () => {};
  private onModelTouched: () => void = () => {};
  readonly activeIndex = signal(0);
  isSelected(option: P2Option<T>): boolean { return this.value() === option.value; }
  writeValue(value: T | null): void { this.value.set(value); }
  registerOnChange(fn: (value: T | null) => void): void { this.onModelChange = fn; }
  registerOnTouched(fn: () => void): void { this.onModelTouched = fn; }
  setDisabledState(disabled: boolean): void { this.cvaDisabled.set(disabled); }
  select(option: P2Option<T>): void { if (option.disabled || this.disabled() || this.cvaDisabled() || this.readonly()) return; this.value.set(option.value); this.onModelChange(option.value); this.onModelTouched(); this.valueChangeEvent.emit(option.value); }
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
    <div class="p-treeselect p-component orc-p2-tree-select" [class]="'p-treeselect p-component orc-p2-tree-select ' + styleClass()" [style]="style()" [class.p-treeselect-fluid]="fluid()" [attr.data-pc-name]="'treeselect'">
      @if (label()) { <label [for]="effectiveId()">{{ label() }}</label> }
      <button type="button" class="p-treeselect-label p-treeselect-trigger trigger" [disabled]="disabled() || cvaDisabled()" [attr.id]="effectiveId()" [attr.tabindex]="tabindex()" [attr.aria-label]="ariaLabel()" [attr.aria-labelledby]="ariaLabelledBy()" [attr.aria-expanded]="open()" [attr.aria-controls]="effectiveId() + '-panel'" [attr.aria-readonly]="readonly()" (click)="toggleOpen()">{{ selectedLabel() || placeholder() }} <span aria-hidden="true">⌄</span></button>
      @if (showClear() && value() !== null && !readonly()) { <button type="button" (click)="clear($event)" [attr.aria-label]="clearAriaLabel() || null">×</button> }
      @if (open()) {
        @if (filter()) { <input [value]="filterValue()" [attr.placeholder]="filterPlaceholder() || null" (input)="onFilterInput($event)" [attr.aria-label]="filterAriaLabel() || null" /> }
        <ul class="p-treeselect-panel p-component tree" [class]="'p-treeselect-panel p-component tree ' + (panelStyleClass() || panelClass())" [style]="panelStyle()" [style.max-height]="scrollHeight()" [id]="effectiveId() + '-panel'" role="tree" [attr.tabindex]="0" [attr.aria-activedescendant]="activeTreeOptionId()" (keydown)="onKeydown($event)" (focus)="onFocus.emit($event)" (blur)="onBlur.emit($event)">
          @for (item of filteredVisibleNodes(); track item.node.value) {
            <li role="treeitem" [id]="treeOptionId($index)" [attr.aria-level]="item.level" [style.padding-left.rem]="item.level * .9" [attr.aria-selected]="isNodeSelected(item.node)" [class.selected]="isNodeSelected(item.node)" [class.active]="activeTreeIndex() === $index" [class.disabled]="item.node.disabled">
              @if (item.node.children?.length) { <button type="button" class="expand" [attr.aria-label]="(expanded().has(item.node.value) ? collapseAriaLabel() : expandAriaLabel()) || null" (click)="toggle(item.node)">{{ expanded().has(item.node.value) ? '▾' : '▸' }}</button> } @else { <span class="expand-placeholder"></span> }
              <button type="button" class="item" [disabled]="item.node.disabled" (click)="select(item.node, $event)">@if (selectionMode() === 'checkbox') { <span aria-hidden="true">{{ isNodeSelected(item.node) ? '☑' : '☐' }}</span> }{{ item.node.label }}</button>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [P2_SHARED_STYLES + `.orc-p2-tree-select { position: relative; display: grid; gap: .35rem; color: var(--orc-component-text); } label { font-size: .875rem; font-weight: 600; } .trigger { display: flex; justify-content: space-between; min-height: 2.5rem; border: 1px solid var(--orc-component-border-strong); border-radius: .5rem; background: var(--orc-component-control); color: var(--orc-component-text); padding: .5rem .7rem; text-align: left; } .tree { position: absolute; z-index: 3; top: 4.2rem; right: 0; left: 0; max-height: 16rem; overflow: auto; margin: 0; padding: .25rem; border: 1px solid var(--orc-component-border-strong); border-radius: .5rem; background: var(--orc-component-surface-raised); color: var(--orc-component-text); box-shadow: var(--orc-component-overlay-shadow); list-style: none; } li { display: flex; align-items: center; min-height: 2rem; } li.selected { background: var(--orc-component-interactive-soft); } li.disabled { color: var(--orc-component-text-muted); } .expand, .expand-placeholder { flex: 0 0 1.4rem; width: 1.4rem; border: 0; background: transparent; text-align: center; } .item { flex: 1; border: 0; background: transparent; color: inherit; padding: .35rem; text-align: left; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TreeSelectComponent), multi: true }],
})
export class TreeSelectComponent implements ControlValueAccessor {
  private readonly uniqueId = `orc-treeselect-${++nextTreeSelectId}`;
  readonly styleClass = input('');
  readonly nodes = input<TreeSelectNode[]>([]);
  readonly value = model<string | string[] | null>(null);
  readonly label = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly inputId = input<string | undefined>(undefined); readonly ariaLabel = input<string | undefined>(undefined); readonly ariaLabelledBy = input<string | undefined>(undefined); readonly tabindex = input<string | number | undefined>(undefined); readonly fluid = input(false, { transform: booleanAttribute }); readonly variant = input<'filled' | 'outlined'>('outlined'); readonly display = input<'comma' | 'chip'>('comma'); readonly size = input<'small' | 'large' | undefined>(undefined); readonly style = input<Record<string, string | number> | undefined>(undefined); readonly panelStyle = input<Record<string, string | number> | undefined>(undefined); readonly panelStyleClass = input(''); readonly panelClass = input(''); readonly appendTo = input<unknown>(undefined); readonly overlayOptions = input<Record<string, unknown> | undefined>(undefined); readonly scrollHeight = input('16rem'); readonly filter = input(false, { transform: booleanAttribute }); readonly filterBy = input('label'); readonly filterMode = input('lenient'); readonly filterLocale = input<string | undefined>(undefined); readonly filterPlaceholder = input<string | undefined>(undefined); readonly filterAriaLabel = input<string | undefined>(undefined); readonly clearAriaLabel = input<string | undefined>(undefined); readonly expandAriaLabel = input<string | undefined>(undefined); readonly collapseAriaLabel = input<string | undefined>(undefined); readonly filterInputAutoFocus = input(false, { transform: booleanAttribute }); readonly filterValue = model(''); readonly showClear = input(false, { transform: booleanAttribute }); readonly resetFilterOnHide = input(true, { transform: booleanAttribute }); readonly propagateSelectionDown = input(true, { transform: booleanAttribute }); readonly propagateSelectionUp = input(true, { transform: booleanAttribute }); readonly virtualScroll = input(false, { transform: booleanAttribute }); readonly virtualScrollItemSize = input<number | undefined>(undefined); readonly virtualScrollOptions = input<Record<string, unknown> | undefined>(undefined); readonly autofocus = input(false, { transform: booleanAttribute }); readonly loading = input(false, { transform: booleanAttribute }); readonly emptyMessage = input<string | undefined>(undefined); readonly selectionMode = input<'single' | 'multiple' | 'checkbox'>('single'); readonly metaKeySelection = input(true, { transform: booleanAttribute });
  readonly open = model(false);
  readonly expanded = signal<ReadonlySet<string>>(new Set());
  readonly nodeSelect = output<TreeSelectNode>(); readonly onChange = output<{ originalEvent: Event; value: string | string[] | null }>(); readonly onShow = output<void>(); readonly onHide = output<void>(); readonly onClear = output<Event>(); readonly onFilter = output<{ originalEvent: Event; filter: string }>(); readonly onFocus = output<Event>(); readonly onBlur = output<Event>(); readonly onNodeExpand = output<TreeSelectNode>(); readonly onNodeCollapse = output<TreeSelectNode>(); readonly nodeUnselect = output<TreeSelectNode>();
  protected readonly cvaDisabled = signal(false); private onModelChange: (value: string | string[] | null) => void = () => {}; private onModelTouched: () => void = () => {};
  readonly effectiveId = computed(() => this.inputId() || this.uniqueId);
  readonly activeTreeIndex = signal(0);
  readonly activeTreeOptionId = computed(() => { const length = this.filteredVisibleNodes().length; return length ? this.treeOptionId(Math.min(this.activeTreeIndex(), length - 1)) : null; });

  readonly visibleNodes = computed<VisibleTreeSelectNode[]>(() => {
    const result: VisibleTreeSelectNode[] = [];
    const visit = (nodes: TreeSelectNode[], level: number): void => {
      for (const node of nodes) { result.push({ node, level }); if (node.children?.length && this.expanded().has(node.value)) visit(node.children, level + 1); }
    };
    visit(this.nodes(), 1); return result;
  });
  readonly filteredVisibleNodes = computed(() => { const term = this.filterValue().trim().toLowerCase(); return term ? this.visibleNodes().filter(item => item.node.label.toLowerCase().includes(term)) : this.visibleNodes(); });
  writeValue(value: string | string[] | null): void { this.value.set(value); }
  registerOnChange(fn: (value: string | string[] | null) => void): void { this.onModelChange = fn; }
  registerOnTouched(fn: () => void): void { this.onModelTouched = fn; }
  setDisabledState(value: boolean): void { this.cvaDisabled.set(value); }
  selectedLabel(): string { const value = this.value(); const values = Array.isArray(value) ? value : value === null ? [] : [value]; return values.map(item => this.findNode(this.nodes(), item)?.label).filter(Boolean).join(', '); }
  isNodeSelected(node: TreeSelectNode): boolean { const value = this.value(); return Array.isArray(value) ? value.includes(node.value) : value === node.value; }
  toggleOpen(): void { if (this.disabled() || this.cvaDisabled() || this.readonly()) return; this.open.update(value => !value); if (!this.open() && this.resetFilterOnHide()) this.filterValue.set(''); this.open() ? this.onShow.emit() : this.onHide.emit(); }
  toggle(node: TreeSelectNode): void { if (!node.children?.length) return; this.expanded.update(current => { const next = new Set(current); const wasExpanded = next.has(node.value); wasExpanded ? next.delete(node.value) : next.add(node.value); wasExpanded ? this.onNodeCollapse.emit(node) : this.onNodeExpand.emit(node); return next; }); }
  select(node: TreeSelectNode, event?: Event): void { if (node.disabled || this.disabled() || this.cvaDisabled() || this.readonly()) return; const originalEvent = event ?? new Event('change'); const mode = this.selectionMode(); if (mode === 'single') { this.value.set(node.value); this.onModelChange(node.value); this.nodeSelect.emit(node); this.open.set(false); this.onChange.emit({ originalEvent, value: node.value }); this.onHide.emit(); } else { const current = Array.isArray(this.value()) ? [...this.value() as string[]] : []; const descendants = this.propagateSelectionDown() ? this.descendantValues(node) : [node.value]; const selected = current.includes(node.value); let next = selected ? current.filter(value => !descendants.includes(value)) : [...new Set([...current, ...descendants])]; if (this.propagateSelectionUp()) { const ancestors = this.ancestorValues(node); if (selected) next = next.filter(value => !ancestors.includes(value)); else for (const ancestor of ancestors) { const parent = this.findNode(this.nodes(), ancestor); if (parent && this.descendantValues(parent).every(value => next.includes(value))) next.push(ancestor); } } this.value.set(next); this.onModelChange(next); (selected ? this.nodeUnselect : this.nodeSelect).emit(node); this.onChange.emit({ originalEvent, value: next }); } this.onModelTouched(); }
  private descendantValues(node: TreeSelectNode): string[] { return [node.value, ...(node.children || []).flatMap(child => this.descendantValues(child))]; }
  private ancestorValues(target: TreeSelectNode, nodes = this.nodes(), path: string[] = []): string[] { for (const node of nodes) { if (node.children?.some(child => child.value === target.value)) return [node.value, ...path]; if (node.children) { const nested = this.ancestorValues(target, node.children, [node.value, ...path]); if (nested.length) return nested; } } return []; }
  clear(event?: Event): void { if (this.disabled() || this.cvaDisabled() || this.readonly()) return; const originalEvent = event ?? new Event('clear'); this.value.set(null); this.onModelChange(null); this.onModelTouched(); this.onChange.emit({ originalEvent, value: null }); this.onClear.emit(originalEvent); }
  onFilterInput(event: Event): void { const filter = (event.target as HTMLInputElement).value; this.filterValue.set(filter); this.onFilter.emit({ originalEvent: event, filter }); }
  treeOptionId(index: number): string { return `${this.effectiveId()}-tree-option-${index}`; }
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled() || this.cvaDisabled() || this.readonly()) return;
    const nodes = this.filteredVisibleNodes();
    if (!nodes.length) return;
    if (event.key === 'Escape') { event.preventDefault(); this.open.set(false); this.onHide.emit(); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this.activeTreeIndex.set(event.key === 'Home' ? 0 : event.key === 'End' ? nodes.length - 1 : (this.activeTreeIndex() + (event.key === 'ArrowDown' ? 1 : -1) + nodes.length) % nodes.length);
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && nodes[this.activeTreeIndex()]) { event.preventDefault(); this.select(nodes[this.activeTreeIndex()].node, event); }
  }
  private findNode(nodes: TreeSelectNode[], value: string | null): TreeSelectNode | undefined { for (const node of nodes) { if (node.value === value) return node; const nested = node.children ? this.findNode(node.children, value) : undefined; if (nested) return nested; } return undefined; }
}
