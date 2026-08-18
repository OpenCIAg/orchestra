import { booleanAttribute, ChangeDetectionStrategy, Component, computed, ElementRef, HostListener, input, model, output, signal, inject } from '@angular/core';
import { P2Option, P2_SHARED_STYLES, P2Orientation } from './p2-shared';

@Component({
  selector: 'orc-floating-action-button',
  standalone: true,
  template: `<button type="button" class="orc-p2-fab" [class.extended]="extended()" [class.loading]="loading()" [disabled]="disabled() || loading()" [attr.aria-label]="ariaLabel()" (click)="clicked.emit($event)">@if (loading()) { <span aria-hidden="true">…</span> } @else { <span aria-hidden="true">{{ icon() }}</span> } @if (extended()) { <span>{{ label() }}</span> }</button>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-fab { display: inline-flex; gap: .5rem; align-items: center; justify-content: center; min-width: 3rem; min-height: 3rem; border: 0; border-radius: 999px; background: #2563eb; color: #fff; box-shadow: 0 8px 18px #2563eb40; font-weight: 700; } .orc-p2-fab.extended { padding-inline: 1rem; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatingActionButtonComponent {
  readonly label = input('');
  readonly icon = input('+');
  readonly ariaLabel = input('Create');
  readonly extended = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly clicked = output<MouseEvent>();
}

@Component({
  selector: 'orc-close-button',
  standalone: true,
  template: `<button type="button" class="orc-p2-close-button" [class]="'orc-p2-close-button orc-p2-close-button--' + size()" [disabled]="disabled()" [attr.aria-label]="ariaLabel()" (click)="close.emit()">{{ icon() }}</button>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-close-button { display: inline-grid; place-items: center; border: 0; border-radius: .4rem; background: transparent; color: #475569; } .orc-p2-close-button:hover { background: #f1f5f9; color: #0f172a; } .orc-p2-close-button--sm { width: 1.5rem; height: 1.5rem; } .orc-p2-close-button--md { width: 2rem; height: 2rem; } .orc-p2-close-button--lg { width: 2.5rem; height: 2.5rem; font-size: 1.3rem; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseButtonComponent {
  readonly ariaLabel = input('Close');
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
  template: `<div class="orc-p2-context-menu-host" (contextmenu)="openAt($event)"><ng-content />@if (open()) { <div class="p-contextmenu p-component orc-p2-context-menu" [class]="'p-contextmenu p-component orc-p2-context-menu ' + styleClass()" [style]="style()" [style.z-index]="autoZIndex() ? baseZIndex() + 1 : null" [id]="id()" role="menu" [attr.aria-label]="ariaLabel()" [attr.aria-labelledby]="ariaLabelledBy()" [attr.tabindex]="tabindex()" [attr.data-pc-name]="'contextmenu'" [style.left.px]="position().x" [style.top.px]="position().y" (keydown)="onKeydown($event)">@for (item of effectiveItems(); track item.value || $index) { @if (item.visible !== false) { <button type="button" role="menuitem" [disabled]="item.disabled" [class.active]="isActive(item)" [class.danger]="item.danger" [attr.tabindex]="isActive(item) ? 0 : -1" (click)="activate(item)">{{ item.label }} @if (item.badge) { <span>{{ item.badge }}</span> } @if (item.shortcut) { <small>{{ item.shortcut }}</small> } </button> } }</div> }</div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-context-menu-host { position: relative; min-height: 2rem; } .orc-p2-context-menu { position: fixed; z-index: 10; display: grid; min-width: 12rem; padding: .25rem; border: 1px solid #cbd5e1; border-radius: .55rem; background: #fff; box-shadow: 0 12px 28px #0f172a26; } .orc-p2-context-menu button { display: flex; justify-content: space-between; border: 0; border-radius: .35rem; background: transparent; padding: .55rem .7rem; text-align: left; } .orc-p2-context-menu button:hover, .orc-p2-context-menu button.active { background: #eff6ff; } .orc-p2-context-menu button.danger { color: #b91c1c; } small { color: #64748b; }`],
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
  readonly ariaLabel = input('Context menu');
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
  template: `<section [id]="id() || null" class="p-overlaypanel p-component orc-p2-overlay-panel" [class]="'p-overlaypanel p-component orc-p2-overlay-panel ' + styleClass()" [style]="style()" [style.z-index]="computedZIndex()" [hidden]="!visible()" role="dialog" tabindex="-1" [attr.aria-label]="ariaLabel()" [attr.aria-labelledby]="ariaLabelledBy()" [attr.aria-modal]="modal()" data-pc-name="overlaypanel" (keydown.escape)="onEscape()">@if (closable() || showCloseIcon()) { <button type="button" class="close" [attr.aria-label]="closeLabel()" (click)="hide()">×</button> }<ng-content /></section>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-overlay-panel{position:absolute;z-index:1000;min-width:12rem;padding:1rem;border:1px solid #cbd5e1;border-radius:.6rem;background:#fff;box-shadow:0 12px 30px #0f172a26;color:#0f172a}.orc-p2-overlay-panel[hidden]{display:none}.close{position:absolute;top:.35rem;right:.35rem;border:0;background:transparent;color:#64748b;font-size:1.1rem}`],
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
  readonly ariaLabel = input('Overlay panel');
  readonly id = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly closeLabel = input('Close');
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
  template: `<aside [id]="id() || null" class="p-popover p-component orc-p2-popover" [class]="'p-popover p-component orc-p2-popover ' + styleClass()" [style]="style()" [style.z-index]="computedZIndex()" [hidden]="!visible()" role="dialog" tabindex="-1" [attr.aria-label]="ariaLabel()" [attr.aria-labelledby]="ariaLabelledBy()" data-pc-name="popover" (keydown.escape)="onEscape()">@if (header()) { <header>{{ header() }}@if (closable()) { <button type="button" [attr.aria-label]="closeLabel()" (click)="hide()">×</button> }</header> }<ng-content /></aside>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-popover{position:absolute;z-index:1000;min-width:12rem;padding:1rem;border:1px solid #cbd5e1;border-radius:.6rem;background:#fff;box-shadow:0 12px 30px #0f172a26;color:#0f172a}.orc-p2-popover[hidden]{display:none}.orc-p2-popover header{display:flex;justify-content:space-between;margin:-.25rem 0 .5rem;font-weight:700}.orc-p2-popover header button{border:0;background:transparent}`],
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
  template: `<div class="orc-p2-speed-dial" [class]="styleClass()"><div class="actions" [class.open]="open()">@if (open()) { @for (action of effectiveActions(); track action.value) { <button type="button" [disabled]="disabled() || action.disabled" [attr.aria-label]="action.label" (click)="activate(action)">{{ action.icon || '•' }}</button> } }</div><button type="button" class="trigger" [disabled]="disabled()" [attr.aria-expanded]="open()" [attr.aria-label]="open() ? closeLabel() : openLabel()" (click)="toggleButton($event)">{{ open() ? '×' : icon() }}</button></div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-speed-dial { display: inline-flex; flex-direction: column; align-items: center; gap: .5rem; } .actions { display: flex; flex-direction: column-reverse; gap: .45rem; } .actions button, .trigger { display: grid; place-items: center; width: 2.6rem; height: 2.6rem; border: 0; border-radius: 999px; background: #e2e8f0; color: #0f172a; } .trigger { background: #2563eb; color: #fff; font-size: 1.3rem; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeedDialComponent {
  readonly actions = input<SpeedDialAction[]>([]); readonly model = input<SpeedDialAction[] | null>(null); readonly direction = input<'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right'>('up'); readonly type = input<'linear' | 'circle' | 'semi-circle' | 'quarter-circle'>('linear'); readonly radius = input(0); readonly transitionDelay = input(0); readonly mask = input(false, { transform: booleanAttribute }); readonly disabled = input(false, { transform: booleanAttribute }); readonly hideOnClickOutside = input(true, { transform: booleanAttribute }); readonly styleClass = input(''); readonly buttonClass = input(''); readonly ariaLabel = input('Actions');
  readonly open = model(false);
  readonly icon = input('+');
  readonly openLabel = input('Open actions');
  readonly closeLabel = input('Close actions');
  readonly actionSelect = output<SpeedDialAction>(); readonly visibleChange = output<boolean>(); readonly onVisibleChange = this.visibleChange; readonly onShow = output<Event>(); readonly onHide = output<Event>(); readonly onClick = output<MouseEvent>();
  effectiveActions(): SpeedDialAction[] { return this.model() ?? this.actions(); }
  toggleButton(event: MouseEvent): void { this.onClick.emit(event); this.open() ? this.hide(event) : this.show(event); }
  show(event?: Event): void { if (this.disabled()) return; this.open.set(true); this.visibleChange.emit(true); if (event) this.onShow.emit(event); }
  hide(event?: Event): void { this.open.set(false); this.visibleChange.emit(false); if (event) this.onHide.emit(event); }
  activate(action: SpeedDialAction): void { if (!this.disabled() && !action.disabled) { this.actionSelect.emit(action); this.hide(); } }
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
  template: `<div class="orc-p2-splitter" [class.vertical]="orientation() === 'vertical'" role="group" [attr.aria-label]="label()">@if (panels().length) { @for (panel of panels(); track panel.id; let index = $index) { <section class="panel" [style.flex-basis.%]="panelSize(index)"><header>{{ panel.label || panel.id }}</header><div class="panel-body"></div></section>@if (index < panels().length - 1) { <button type="button" class="gutter" [attr.aria-label]="'Resize ' + (panel.label || panel.id)" (click)="resize(index, 5)" (keydown.shift.arrowleft)="resize(index, -5)" (keydown.shift.arrowright)="resize(index, 5)" (keydown.shift.arrowup)="resize(index, -5)" (keydown.shift.arrowdown)="resize(index, 5)" (keyup)="onResizeEnd.emit($event)"></button> } } } @else { <ng-content /> }</div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-splitter { display: flex; min-height: 8rem; width: 100%; gap: 1px; background: #cbd5e1; } .orc-p2-splitter.vertical { flex-direction: column; } .panel { min-width: 0; min-height: 0; flex: 1 1 0; background: #fff; color: #0f172a; } .panel header { padding: .45rem .65rem; border-bottom: 1px solid #e2e8f0; font-size: .8rem; font-weight: 700; } .panel-body { min-height: 4rem; padding: .5rem; } .gutter{flex:0 0 .45rem;border:0;background:#e2e8f0;cursor:col-resize}.vertical .gutter{cursor:row-resize}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitterComponent {
  readonly panels = input<SplitterPanel[]>([]);
  readonly orientation = input<P2Orientation>('horizontal');
  readonly label = input('Resizable panels');
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
