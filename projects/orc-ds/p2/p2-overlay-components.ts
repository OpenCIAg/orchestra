import { booleanAttribute, ChangeDetectionStrategy, Component, computed, HostListener, input, model, output, signal } from '@angular/core';
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
}

@Component({
  selector: 'orc-context-menu',
  standalone: true,
  template: `<div class="orc-p2-context-menu-host" (contextmenu)="openAt($event)"><ng-content />@if (open()) { <div class="orc-p2-context-menu" role="menu" [style.left.px]="position().x" [style.top.px]="position().y" (keydown)="onKeydown($event)">@for (item of items(); track item.value) { <button type="button" role="menuitem" [disabled]="item.disabled" [class.danger]="item.danger" (click)="activate(item)">{{ item.label }} @if (item.shortcut) { <small>{{ item.shortcut }}</small> }</button> }</div> }</div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-context-menu-host { position: relative; min-height: 2rem; } .orc-p2-context-menu { position: fixed; z-index: 10; display: grid; min-width: 12rem; padding: .25rem; border: 1px solid #cbd5e1; border-radius: .55rem; background: #fff; box-shadow: 0 12px 28px #0f172a26; } .orc-p2-context-menu button { display: flex; justify-content: space-between; border: 0; border-radius: .35rem; background: transparent; padding: .55rem .7rem; text-align: left; } .orc-p2-context-menu button:hover { background: #eff6ff; } .orc-p2-context-menu button.danger { color: #b91c1c; } small { color: #64748b; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuComponent {
  readonly items = input<ContextMenuItem[]>([]);
  readonly open = model(false);
  readonly position = signal({ x: 0, y: 0 });
  readonly itemSelect = output<ContextMenuItem>();
  readonly opened = output<{ x: number; y: number }>();
  openAt(event: MouseEvent): void { event.preventDefault(); this.position.set({ x: event.clientX, y: event.clientY }); this.open.set(true); this.opened.emit(this.position()); }
  activate(item: ContextMenuItem): void { if (item.disabled) return; this.itemSelect.emit(item); this.open.set(false); }
  onKeydown(event: KeyboardEvent): void { if (event.key === 'Escape') { event.preventDefault(); this.open.set(false); } }
}

/** PrimeNG OverlayPanel/Popover-compatible controlled overlay surface. */
@Component({
  selector: 'orc-overlay-panel',
  standalone: true,
  template: `<section class="orc-p2-overlay-panel" [class]="styleClass()" [hidden]="!visible()" role="dialog" [attr.aria-label]="ariaLabel()" [attr.aria-modal]="modal()" (keydown.escape)="onEscape()">@if (closable()) { <button type="button" class="close" [attr.aria-label]="closeLabel()" (click)="hide()">×</button> }<ng-content /></section>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-overlay-panel{position:absolute;z-index:1000;min-width:12rem;padding:1rem;border:1px solid #cbd5e1;border-radius:.6rem;background:#fff;box-shadow:0 12px 30px #0f172a26;color:#0f172a}.orc-p2-overlay-panel[hidden]{display:none}.close{position:absolute;top:.35rem;right:.35rem;border:0;background:transparent;color:#64748b;font-size:1.1rem}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlayPanelComponent {
  readonly visible = model(false);
  readonly modal = input(false, { transform: booleanAttribute });
  readonly dismissable = input(true, { transform: booleanAttribute });
  readonly closable = input(false, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  readonly ariaLabel = input('Overlay panel');
  readonly closeLabel = input('Close');
  readonly styleClass = input('');
  readonly onShow = output<void>(); readonly onHide = output<void>(); readonly onClick = output<MouseEvent>();
  show(): void { if (!this.visible()) { this.visible.set(true); this.onShow.emit(); } }
  hide(): void { if (this.visible()) { this.visible.set(false); this.onHide.emit(); } }
  toggle(): void { this.visible() ? this.hide() : this.show(); }
  onEscape(): void { if (this.closeOnEscape()) this.hide(); }
  @HostListener('document:mousedown', ['$event']) onDocumentClick(event: MouseEvent): void { if (!this.dismissable() || !this.visible()) return; const target = event.target as Node | null; if (target && !((event.currentTarget as Document).contains(target))) this.hide(); }
}

@Component({
  selector: 'orc-popover',
  standalone: true,
  template: `<aside class="orc-p2-popover" [class]="styleClass()" [hidden]="!visible()" role="dialog" [attr.aria-label]="ariaLabel()" (keydown.escape)="onEscape()">@if (header()) { <header>{{ header() }}@if (closable()) { <button type="button" [attr.aria-label]="closeLabel()" (click)="hide()">×</button> }</header> }<ng-content /></aside>`,
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
  template: `<div class="orc-p2-speed-dial"><div class="actions" [class.open]="open()">@if (open()) { @for (action of actions(); track action.value) { <button type="button" [disabled]="action.disabled" [attr.aria-label]="action.label" (click)="activate(action)">{{ action.icon || '•' }}</button> } }</div><button type="button" class="trigger" [attr.aria-expanded]="open()" [attr.aria-label]="open() ? closeLabel() : openLabel()" (click)="open.set(!open())">{{ open() ? '×' : icon() }}</button></div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-speed-dial { display: inline-flex; flex-direction: column; align-items: center; gap: .5rem; } .actions { display: flex; flex-direction: column-reverse; gap: .45rem; } .actions button, .trigger { display: grid; place-items: center; width: 2.6rem; height: 2.6rem; border: 0; border-radius: 999px; background: #e2e8f0; color: #0f172a; } .trigger { background: #2563eb; color: #fff; font-size: 1.3rem; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeedDialComponent {
  readonly actions = input<SpeedDialAction[]>([]);
  readonly open = model(false);
  readonly icon = input('+');
  readonly openLabel = input('Open actions');
  readonly closeLabel = input('Close actions');
  readonly actionSelect = output<SpeedDialAction>();
  activate(action: SpeedDialAction): void { if (!action.disabled) { this.actionSelect.emit(action); this.open.set(false); } }
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
  template: `<div class="orc-p2-splitter" [class.vertical]="orientation() === 'vertical'" role="group" [attr.aria-label]="label()">@if (panels().length) { @for (panel of panels(); track panel.id) { <section class="panel" [style.flex-basis.%]="panelSize($index)"><header>{{ panel.label || panel.id }}</header><div class="panel-body"></div></section> } } @else { <ng-content /> }</div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-splitter { display: flex; min-height: 8rem; width: 100%; gap: 1px; background: #cbd5e1; } .orc-p2-splitter.vertical { flex-direction: column; } .panel { min-width: 0; min-height: 0; flex: 1 1 0; background: #fff; color: #0f172a; } .panel header { padding: .45rem .65rem; border-bottom: 1px solid #e2e8f0; font-size: .8rem; font-weight: 700; } .panel-body { min-height: 4rem; padding: .5rem; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitterComponent {
  readonly panels = input<SplitterPanel[]>([]);
  readonly orientation = input<P2Orientation>('horizontal');
  readonly label = input('Resizable panels');
  readonly sizes = model<number[]>([]);
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
    this.setSizes(next);
  }
  private normalize(sizes: number[]): number[] { const total = sizes.reduce((sum, size) => sum + Math.max(0, size), 0) || 1; return sizes.map(size => Math.max(0, size) / total * 100); }
}
