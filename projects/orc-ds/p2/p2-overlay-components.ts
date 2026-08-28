import { booleanAttribute, ChangeDetectionStrategy, Component, computed, ElementRef, HostListener, input, model, output, signal, inject } from '@angular/core';
import { P2Option, P2_SHARED_STYLES, P2Orientation } from './p2-shared';

@Component({
  selector: 'orc-floating-action-button',
  standalone: true,
  template: `<button type="button" class="orc-p2-fab" [class.extended]="extended()" [class.loading]="loading()" [disabled]="disabled() || loading()" [attr.aria-label]="ariaLabel() || null" (click)="clicked.emit($event)">@if (loading()) { <span aria-hidden="true">…</span> } @else { <span aria-hidden="true">{{ icon() }}</span> } @if (extended() && label()) { <span>{{ label() }}</span> }</button>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-fab { display: inline-flex; gap: .5rem; align-items: center; justify-content: center; min-width: 3rem; min-height: 3rem; border: 0; border-radius: 999px; background: var(--orc-component-interactive); color: var(--orc-component-on-interactive); box-shadow: 0 8px 18px var(--orc-component-interactive-shadow); font-weight: 700; } .orc-p2-fab.extended { padding-inline: 1rem; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatingActionButtonComponent {
  readonly label = input('');
  readonly icon = input('+');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly extended = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly clicked = output<MouseEvent>();
}

@Component({
  selector: 'orc-close-button',
  standalone: true,
  template: `<button type="button" class="orc-p2-close-button" [class]="'orc-p2-close-button orc-p2-close-button--' + size()" [disabled]="disabled()" [attr.aria-label]="ariaLabel() || null" (click)="close.emit()">{{ icon() }}</button>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-close-button { display: inline-grid; place-items: center; border: 0; border-radius: .4rem; background: transparent; color: var(--orc-component-text-secondary); } .orc-p2-close-button:hover { background: var(--orc-component-surface-muted); color: var(--orc-component-text); } .orc-p2-close-button--sm { width: 1.5rem; height: 1.5rem; } .orc-p2-close-button--md { width: 2rem; height: 2rem; } .orc-p2-close-button--lg { width: 2.5rem; height: 2.5rem; font-size: 1.3rem; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseButtonComponent {
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly icon = input('×');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly close = output<void>();
}

export interface ContextMenuItem extends P2Option<string> {
  danger?: boolean;
  shortcut?: string;
  visible?: boolean;
  badge?: string;
}

@Component({
  selector: 'orc-context-menu',
  standalone: true,
  template: `<div class="orc-p2-context-menu-host" (contextmenu)="openAt($event)"><ng-content />@if (open()) { <div class="p-contextmenu p-component orc-p2-context-menu" [class]="'p-contextmenu p-component orc-p2-context-menu ' + styleClass()" [style]="style()" [style.z-index]="autoZIndex() ? baseZIndex() + 1 : null" [id]="id()" role="menu" [attr.aria-label]="ariaLabel() || null" [attr.aria-labelledby]="ariaLabelledBy()" [attr.tabindex]="tabindex()" [attr.data-pc-name]="'contextmenu'" [style.left.px]="position().x" [style.top.px]="position().y" (keydown)="onKeydown($event)">@for (item of effectiveItems(); track item.value || $index) { @if (item.visible !== false) { <button type="button" role="menuitem" [disabled]="item.disabled" [class.active]="isActive(item)" [class.danger]="item.danger" [attr.tabindex]="isActive(item) ? 0 : -1" (click)="activate(item)">{{ item.label }} @if (item.badge) { <span>{{ item.badge }}</span> } @if (item.shortcut) { <small>{{ item.shortcut }}</small> } </button> } }</div> }</div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-context-menu-host { position: relative; min-height: 2rem; } .orc-p2-context-menu { position: fixed; z-index: 10; display: grid; min-width: 12rem; padding: .25rem; border: 1px solid var(--orc-component-border-strong); border-radius: .55rem; background: var(--orc-component-surface); box-shadow: 0 12px 28px var(--orc-component-shadow-color); } .orc-p2-context-menu button { display: flex; justify-content: space-between; border: 0; border-radius: .35rem; background: transparent; padding: .55rem .7rem; text-align: left; } .orc-p2-context-menu button:hover, .orc-p2-context-menu button.active { background: var(--orc-component-interactive-soft); } .orc-p2-context-menu button.danger { color: var(--orc-component-danger); } small { color: var(--orc-component-text-muted); }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly items = input<ContextMenuItem[]>([]);
  readonly model = input<ContextMenuItem[] | undefined>(undefined);
  readonly open = model(false);
  readonly visible = this.open;
  readonly popup = input(true, { transform: booleanAttribute });
  readonly target = input<HTMLElement | string | undefined>(undefined);
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly styleClass = input(''); readonly appendTo = input<HTMLElement | string | null | undefined>(undefined); readonly autoZIndex = input(true, { transform: booleanAttribute }); readonly baseZIndex = input(0); readonly id = input<string | undefined>(undefined); readonly breakpoint = input(''); readonly tabindex = input(0);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly position = signal({ x: 0, y: 0 });
  readonly activeIndex = signal(0);
  readonly itemSelect = output<ContextMenuItem>();
  readonly opened = output<{ x: number; y: number }>();
  readonly onShow = output<void>(); readonly onHide = output<void>();
  effectiveItems(): ContextMenuItem[] { return this.model() ?? this.items(); }
  private selectableItems(): ContextMenuItem[] { return this.effectiveItems().filter(item => item.visible !== false && !item.disabled); }
  isActive(item: ContextMenuItem): boolean { return this.selectableItems()[this.activeIndex()] === item; }
  openAt(event: MouseEvent): void { event.preventDefault(); this.position.set({ x: event.clientX, y: event.clientY }); this.activeIndex.set(0); this.open.set(true); this.opened.emit(this.position()); this.onShow.emit(); }
  show(event?: MouseEvent): void { if (event) this.position.set({ x: event.clientX, y: event.clientY }); if (!this.open()) { this.activeIndex.set(0); this.open.set(true); this.onShow.emit(); } }
  hide(): void { if (this.open()) { this.open.set(false); this.onHide.emit(); } }
  toggle(event?: MouseEvent): void { this.open() ? this.hide() : this.show(event); }
  activate(item: ContextMenuItem): void { if (item.disabled) return; this.itemSelect.emit(item); this.hide(); }
  onKeydown(event: KeyboardEvent): void { const items = this.selectableItems(); if (event.key === 'Escape') { event.preventDefault(); this.hide(); return; } if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); const delta = event.key === 'ArrowDown' ? 1 : -1; this.activeIndex.update(index => items.length ? (index + delta + items.length) % items.length : 0); return; } if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); this.activeIndex.set(event.key === 'Home' ? 0 : Math.max(0, items.length - 1)); return; } if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); const item = items[this.activeIndex()]; if (item) this.activate(item); } }
  @HostListener('document:mousedown', ['$event']) onDocumentClick(event: MouseEvent): void { if (!this.open()) return; const target = event.target as Node | null; if (target && !this.host.nativeElement.contains(target)) this.hide(); }
}

/** PrimeNG OverlayPanel/Popover-compatible controlled overlay surface. */
@Component({
  selector: 'orc-overlay-panel',
  standalone: true,
  template: `<section [id]="id() || null" class="p-overlaypanel p-component orc-p2-overlay-panel" [class]="'p-overlaypanel p-component orc-p2-overlay-panel ' + styleClass()" [style]="style()" [style.z-index]="computedZIndex()" [hidden]="!visible()" role="dialog" tabindex="-1" [attr.aria-label]="ariaLabel() || null" [attr.aria-labelledby]="ariaLabelledBy()" [attr.aria-modal]="modal()" data-pc-name="overlaypanel" (keydown.escape)="onEscape()">@if ((closable() || showCloseIcon()) && closeLabel()) { <button type="button" class="close" [attr.aria-label]="closeLabel()" (click)="hide()">×</button> }<ng-content /></section>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-overlay-panel{position:absolute;z-index:1000;min-width:12rem;padding:1rem;border:1px solid var(--orc-component-border-strong);border-radius:.6rem;background:var(--orc-component-surface);box-shadow:0 12px 30px var(--orc-component-shadow-color);color:var(--orc-component-text)}.orc-p2-overlay-panel[hidden]{display:none}.close{position:absolute;top:.35rem;right:.35rem;border:0;background:transparent;color:var(--orc-component-text-muted);font-size:1.1rem}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlayPanelComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly visible = model(false);
  readonly modal = input(false, { transform: booleanAttribute });
  readonly dismissable = input(true, { transform: booleanAttribute });
  readonly closable = input(false, { transform: booleanAttribute });
  readonly showCloseIcon = input(false, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly id = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly closeLabel = input<string | undefined>(undefined);
  readonly ariaCloseLabel = this.closeLabel;
  readonly style = input<Record<string, string | number> | undefined>(undefined);
  readonly styleClass = input('');
  readonly appendTo = input<unknown>(undefined);
  readonly autoZIndex = input(true, { transform: booleanAttribute });
  readonly baseZIndex = input(0);
  readonly focusOnShow = input(true, { transform: booleanAttribute });
  readonly showTransitionOptions = input('150ms cubic-bezier(0, 0, 0.2, 1)');
  readonly hideTransitionOptions = input('100ms linear');
  readonly onShow = output<void>(); readonly onHide = output<void>(); readonly onClick = output<MouseEvent>();
  readonly computedZIndex = computed(() => this.autoZIndex() ? this.baseZIndex() + 1 : this.baseZIndex());
  show(): void { if (!this.visible()) { this.visible.set(true); this.onShow.emit(); if (this.focusOnShow()) queueMicrotask(() => (this.host.nativeElement.querySelector('section') as HTMLElement | null)?.focus()); } }
  hide(): void { if (this.visible()) { this.visible.set(false); this.onHide.emit(); } }
  toggle(): void { this.visible() ? this.hide() : this.show(); }
  onEscape(): void { if (this.closeOnEscape()) this.hide(); }
  @HostListener('document:mousedown', ['$event']) onDocumentClick(event: MouseEvent): void { if (!this.dismissable() || !this.visible()) return; const target = event.target as Node | null; if (target && !this.host.nativeElement.contains(target)) this.hide(); }
}

@Component({
  selector: 'orc-overlay',
  standalone: true,
  template: `<section class="orc-p2-overlay" [class]="styleClass()" [style]="style()" [hidden]="!visible()" role="presentation" (keydown.escape)="onEscape()"><ng-content /></section>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-overlay{position:absolute;z-index:1000}.orc-p2-overlay[hidden]{display:none}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlayComponent {
  readonly visible = model(false);
  readonly mode = input<string>('overlay');
  readonly style = input<Record<string, string> | null>(null);
  readonly styleClass = input('');
  readonly contentStyle = input<Record<string, string> | null>(null);
  readonly contentStyleClass = input('');
  readonly target = input<string | HTMLElement | null>(null);
  readonly appendTo = input<'body' | HTMLElement | undefined>(undefined);
  readonly autoZIndex = input(false, { transform: booleanAttribute });
  readonly baseZIndex = input(0);
  readonly showTransitionOptions = input('');
  readonly hideTransitionOptions = input('');
  readonly onShow = output<void>(); readonly onHide = output<void>();
  show(): void { if (!this.visible()) { this.visible.set(true); this.onShow.emit(); } }
  hide(): void { if (this.visible()) { this.visible.set(false); this.onHide.emit(); } }
  toggle(): void { this.visible() ? this.hide() : this.show(); }
  onEscape(): void { this.hide(); }
}

@Component({
  selector: 'orc-popover',
  standalone: true,
  template: `<aside [id]="id() || null" class="p-popover p-component orc-p2-popover" [class]="'p-popover p-component orc-p2-popover ' + styleClass()" [style]="style()" [style.z-index]="computedZIndex()" [hidden]="!visible()" role="dialog" tabindex="-1" [attr.aria-label]="ariaLabel() || null" [attr.aria-labelledby]="ariaLabelledBy()" data-pc-name="popover" (keydown.escape)="onEscape()">@if (header()) { <header>{{ header() }}@if (closable() && closeLabel()) { <button type="button" [attr.aria-label]="closeLabel()" (click)="hide()">×</button> }</header> }<ng-content /></aside>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-popover{position:absolute;z-index:1000;min-width:12rem;padding:1rem;border:1px solid var(--orc-component-border-strong);border-radius:.6rem;background:var(--orc-component-surface);box-shadow:0 12px 30px var(--orc-component-shadow-color);color:var(--orc-component-text)}.orc-p2-popover[hidden]{display:none}.orc-p2-popover header{display:flex;justify-content:space-between;margin:-.25rem 0 .5rem;font-weight:700}.orc-p2-popover header button{border:0;background:transparent}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverComponent extends OverlayPanelComponent {
  readonly header = input('');
}

export interface SpeedDialAction extends P2Option<string> {
  color?: string;
}

@Component({
  selector: 'orc-speed-dial',
  standalone: true,
  template: `<div class="orc-p2-speed-dial" [class]="styleClass()"><div class="actions" [class.open]="open()">@if (open()) { @for (action of effectiveActions(); track action.value) { <button type="button" [disabled]="disabled() || action.disabled" [attr.aria-label]="action.label || null" (click)="activate(action)">{{ action.icon }}</button> } }</div><button type="button" class="trigger" [disabled]="disabled()" [attr.aria-expanded]="open()" [attr.aria-label]="(open() ? closeLabel() : openLabel()) || null" (click)="toggleButton($event)">{{ open() ? '×' : icon() }}</button></div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-speed-dial { display: inline-flex; flex-direction: column; align-items: center; gap: .5rem; } .actions { display: flex; flex-direction: column-reverse; gap: .45rem; } .actions button, .trigger { display: grid; place-items: center; width: 2.6rem; height: 2.6rem; border: 0; border-radius: 999px; background: var(--orc-component-surface-subtle); color: var(--orc-component-text); } .trigger { background: var(--orc-component-interactive); color: var(--orc-component-on-interactive); font-size: 1.3rem; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeedDialComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly actions = input<SpeedDialAction[]>([]); readonly model = input<SpeedDialAction[] | null>(null); readonly direction = input<'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right'>('up'); readonly type = input<'linear' | 'circle' | 'semi-circle' | 'quarter-circle'>('linear'); readonly radius = input(0); readonly transitionDelay = input(0); readonly mask = input(false, { transform: booleanAttribute }); readonly disabled = input(false, { transform: booleanAttribute }); readonly hideOnClickOutside = input(true, { transform: booleanAttribute }); readonly styleClass = input(''); readonly buttonClass = input(''); readonly ariaLabel = input<string | undefined>(undefined);
  readonly open = model(false);
  readonly icon = input('+');
  readonly openLabel = input<string | undefined>(undefined);
  readonly closeLabel = input<string | undefined>(undefined);
  readonly actionSelect = output<SpeedDialAction>(); readonly visibleChange = output<boolean>(); readonly onVisibleChange = this.visibleChange; readonly onShow = output<Event>(); readonly onHide = output<Event>(); readonly onClick = output<MouseEvent>();
  effectiveActions(): SpeedDialAction[] { return this.model() ?? this.actions(); }
  toggleButton(event: MouseEvent): void { this.onClick.emit(event); this.open() ? this.hide(event) : this.show(event); }
  show(event?: Event): void { if (this.disabled()) return; this.open.set(true); this.visibleChange.emit(true); if (event) this.onShow.emit(event); }
  hide(event?: Event): void { this.open.set(false); this.visibleChange.emit(false); if (event) this.onHide.emit(event); }
  activate(action: SpeedDialAction): void { if (!this.disabled() && !action.disabled) { this.actionSelect.emit(action); this.hide(); } }
  @HostListener('document:mousedown', ['$event']) onDocumentClick(event: MouseEvent): void { if (!this.hideOnClickOutside() || !this.open()) return; const target = event.target as Node | null; if (target && !this.host.nativeElement.contains(target)) this.hide(event); }
}

@Component({
  selector: 'orc-portal',
  standalone: true,
  template: `<ng-content />`,
  styles: [P2_SHARED_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalComponent {
  readonly target = input<HTMLElement | null>(null);
}

export interface SplitterPanel {
  id: string;
  label?: string;
  size?: number;
  minSize?: number;
}

@Component({
  selector: 'orc-splitter',
  standalone: true,
  template: `<div class="orc-p2-splitter" [class.vertical]="orientation() === 'vertical'" role="group" [attr.aria-label]="label() || null">@if (panels().length) { @for (panel of panels(); track panel.id; let index = $index) { <section class="panel" [style.flex-basis.%]="panelSize(index)"><header>{{ panel.label || panel.id }}</header><div class="panel-body"></div></section>@if (index < panels().length - 1) { <button type="button" class="gutter" [attr.aria-label]="resizeLabel() || null" (click)="resize(index, 5)" (keydown.shift.arrowleft)="resize(index, -5)" (keydown.shift.arrowright)="resize(index, 5)" (keydown.shift.arrowup)="resize(index, -5)" (keydown.shift.arrowdown)="resize(index, 5)" (keyup)="onResizeEnd.emit($event)"></button> } } } @else { <ng-content /> }</div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-splitter { display: flex; min-height: 8rem; width: 100%; gap: 1px; background: var(--orc-component-surface-subtle); } .orc-p2-splitter.vertical { flex-direction: column; } .panel { min-width: 0; min-height: 0; flex: 1 1 0; background: var(--orc-component-surface); color: var(--orc-component-text); } .panel header { padding: .45rem .65rem; border-bottom: 1px solid var(--orc-component-border); font-size: .8rem; font-weight: 700; } .panel-body { min-height: 4rem; padding: .5rem; } .gutter{flex:0 0 .45rem;border:0;background:var(--orc-component-surface-subtle);cursor:col-resize}.vertical .gutter{cursor:row-resize}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitterComponent {
  readonly panels = input<SplitterPanel[]>([]);
  readonly orientation = input<P2Orientation>('horizontal');
  readonly label = input<string | undefined>(undefined);
  readonly resizeLabel = input<string | undefined>(undefined);
  readonly sizes = model<number[]>([]);
  readonly onResizeStart = output<{ index: number }>(); readonly onResizeEnd = output<KeyboardEvent>(); readonly onResize = output<{ index: number; sizes: number[] }>();
  readonly normalizedSizes = computed(() => {
    const count = this.panels().length;
    if (!count) return [];
    const supplied = this.sizes();
    if (supplied.length === count && supplied.every(size => size > 0)) return supplied;
    return Array.from({ length: count }, () => 100 / count);
  });
  panelSize(index: number): number { return this.normalizedSizes()[index] ?? 0; }
  setSizes(sizes: number[]): void { const next = this.normalize(sizes); this.sizes.set(next); }
  resize(index: number, delta: number): void {
    const next = [...this.normalizedSizes()];
    if (index < 0 || index >= next.length - 1) return;
    next[index] = Math.max(10, Math.min(90, next[index] + delta));
    next[index + 1] = Math.max(10, next[index + 1] - delta);
    this.onResizeStart.emit({ index }); this.setSizes(next); this.onResize.emit({ index, sizes: next });
  }
  private normalize(sizes: number[]): number[] { const total = sizes.reduce((sum, size) => sum + Math.max(0, size), 0) || 1; return sizes.map(size => Math.max(0, size) / total * 100); }
}
