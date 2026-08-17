import { CommonModule } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, Injectable, input, output, signal } from '@angular/core';
import { P2_SHARED_STYLES } from './p2-shared';

export interface PrimeMenuItem {
  label: string;
  value?: string;
  icon?: string;
  disabled?: boolean;
  separator?: boolean;
  items?: PrimeMenuItem[];
  command?: () => void;
}

@Component({
  selector: 'orc-tiered-menu', standalone: true,
  template: `<nav class="orc-advanced-menu" role="menu" [attr.aria-label]="ariaLabel()">@for (item of items(); track $index) { @if (item.separator) { <hr /> } @else { <button type="button" role="menuitem" [disabled]="item.disabled" (click)="activate(item)">{{ item.icon }} {{ item.label }} @if (item.items?.length) { <span aria-hidden="true">›</span> }</button> @if (openItem() === item && item.items?.length) { <div class="submenu" role="menu">@for (child of item.items; track $index) { <button type="button" role="menuitem" [disabled]="child.disabled" (click)="activate(child)">{{ child.icon }} {{ child.label }}</button> }</div> } } }</nav>`,
  styles: [P2_SHARED_STYLES + `.orc-advanced-menu{position:relative;display:grid;min-width:12rem;padding:.35rem;border:1px solid #e2e8f0;border-radius:.5rem;background:#fff;box-shadow:0 10px 24px #0f172a1a}.orc-advanced-menu button{display:flex;justify-content:space-between;gap:1.5rem;border:0;border-radius:.35rem;background:transparent;padding:.55rem .7rem;text-align:left}.orc-advanced-menu button:hover:not(:disabled){background:#eff6ff}.orc-advanced-menu hr{width:100%;border:0;border-top:1px solid #e2e8f0}.submenu{position:absolute;z-index:2;left:calc(100% - .25rem);top:2rem;display:grid;min-width:12rem;padding:.35rem;border:1px solid #e2e8f0;border-radius:.5rem;background:#fff;box-shadow:0 10px 24px #0f172a1a}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TieredMenuComponent {
  readonly items = input<PrimeMenuItem[]>([]); readonly ariaLabel = input('Menu'); readonly openItem = signal<PrimeMenuItem | null>(null); readonly itemSelect = output<PrimeMenuItem>();
  activate(item: PrimeMenuItem): void { if (item.disabled) return; if (item.items?.length) { this.openItem.set(this.openItem() === item ? null : item); return; } item.command?.(); this.itemSelect.emit(item); }
}

@Component({
  selector: 'orc-panel-menu', standalone: true,
  template: `<div class="orc-panel-menu" role="tree" [attr.aria-label]="ariaLabel()">@for (item of items(); track $index) { <button type="button" role="treeitem" [disabled]="item.disabled" (click)="toggle(item)">{{ item.icon }} {{ item.label }} <span>{{ open().has(item) ? '−' : '+' }}</span></button> @if (open().has(item) && item.items?.length) { <div class="children">@for (child of item.items; track $index) { <button type="button" role="treeitem" [disabled]="child.disabled" (click)="select(child)">{{ child.icon }} {{ child.label }}</button> }</div> } }</div>`,
  styles: [P2_SHARED_STYLES + `.orc-panel-menu{display:grid;width:100%;border:1px solid #e2e8f0;border-radius:.5rem;overflow:hidden}.orc-panel-menu>button,.children button{display:flex;justify-content:space-between;border:0;border-bottom:1px solid #f1f5f9;background:#fff;padding:.65rem .8rem;text-align:left}.children{display:grid;padding-left:1rem;background:#f8fafc}.children button{background:transparent}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelMenuComponent {
  readonly items = input<PrimeMenuItem[]>([]); readonly ariaLabel = input('Panel menu'); readonly open = signal(new Set<PrimeMenuItem>()); readonly itemSelect = output<PrimeMenuItem>();
  toggle(item: PrimeMenuItem): void { if (item.disabled) return; if (!item.items?.length) return this.select(item); const next = new Set(this.open()); next.has(item) ? next.delete(item) : next.add(item); this.open.set(next); }
  select(item: PrimeMenuItem): void { if (!item.disabled) { item.command?.(); this.itemSelect.emit(item); } }
}

@Component({
  selector: 'orc-mega-menu', standalone: true,
  template: `<nav class="orc-mega-menu" role="menubar" [attr.aria-label]="ariaLabel()">@for (group of items(); track $index) { <section><h3>{{ group.label }}</h3>@for (item of group.items || []; track $index) { <button type="button" role="menuitem" [disabled]="item.disabled" (click)="select(item)">{{ item.icon }} {{ item.label }}</button> }</section> }</nav>`,
  styles: [P2_SHARED_STYLES + `.orc-mega-menu{display:flex;flex-wrap:wrap;gap:1.5rem;padding:1rem;border:1px solid #e2e8f0;border-radius:.5rem;background:#fff}.orc-mega-menu section{display:grid;align-content:start;min-width:10rem;gap:.25rem}.orc-mega-menu h3{margin:0 0 .35rem;font-size:.85rem}.orc-mega-menu button{border:0;background:transparent;padding:.35rem;text-align:left}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MegaMenuComponent { readonly items = input<PrimeMenuItem[]>([]); readonly ariaLabel = input('Mega menu'); readonly itemSelect = output<PrimeMenuItem>(); select(item: PrimeMenuItem): void { if (!item.disabled) { item.command?.(); this.itemSelect.emit(item); } } }

@Component({
  selector: 'orc-block-ui', standalone: true,
  template: `@if (blocked()) { <div class="orc-block-ui" role="alert" [attr.aria-label]="message()"><span>{{ message() }}</span></div> }<ng-content />`,
  styles: [P2_SHARED_STYLES + `.orc-block-ui{position:absolute;inset:0;z-index:20;display:grid;place-items:center;background:#fff9;backdrop-filter:blur(1px);color:#0f172a}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockUiComponent { readonly blocked = input(false, { transform: booleanAttribute }); readonly message = input('Please wait…'); }

@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  readonly request = signal<ConfirmationRequest | null>(null);
  confirm(request: ConfirmationRequest): void { this.request.set(request); }
  close(): void { this.request.set(null); }
}
export interface ConfirmationRequest { message: string; header?: string; acceptLabel?: string; rejectLabel?: string; accept?: () => void; reject?: () => void; }

@Component({
  selector: 'orc-confirm-dialog', standalone: true,
  template: `@if (request()) { <div class="orc-confirm-backdrop" (click)="reject()"><section class="orc-confirm" role="alertdialog" aria-modal="true" (click)="$event.stopPropagation()"><h2>{{ request()?.header || 'Confirmation' }}</h2><p>{{ request()?.message }}</p><footer><button type="button" (click)="reject()">{{ request()?.rejectLabel || 'Cancel' }}</button><button type="button" class="accept" (click)="accept()">{{ request()?.acceptLabel || 'Confirm' }}</button></footer></section></div> }`,
  styles: [P2_SHARED_STYLES + `.orc-confirm-backdrop{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:#0f172a66}.orc-confirm{width:min(28rem,calc(100% - 2rem));padding:1.25rem;border-radius:.75rem;background:#fff;box-shadow:0 20px 40px #0f172a33}.orc-confirm h2{margin:0 0 .5rem}.orc-confirm p{color:#475569}.orc-confirm footer{display:flex;justify-content:flex-end;gap:.5rem}.orc-confirm button{border:1px solid #cbd5e1;border-radius:.4rem;background:#fff;padding:.5rem .8rem}.orc-confirm .accept{border-color:#2563eb;background:#2563eb;color:#fff}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  readonly request: ConfirmationService['request'];
  constructor(private readonly service: ConfirmationService) { this.request = service.request; }
  accept(): void { this.request()?.accept?.(); this.service.close(); }
  reject(): void { this.request()?.reject?.(); this.service.close(); }
}

@Component({
  selector: 'orc-data-view', standalone: true,
  template: `<section class="orc-data-view" [attr.aria-label]="ariaLabel()">@if (header()) { <header>{{ header() }}</header> }<div class="content" [class.list]="layout() === 'list'">@for (item of value(); track $index) { <article>@if (itemTemplate()) { <ng-container [ngTemplateOutlet]="itemTemplate()" [ngTemplateOutletContext]="{ $implicit: item }" /> } @else { {{ itemLabel(item) }} }</article> } @empty { <p>{{ emptyMessage() }}</p> }</div></section>`,
  imports: [CommonModule],
  styles: [P2_SHARED_STYLES + `.orc-data-view{display:block}.orc-data-view header{padding:.7rem;border-bottom:1px solid #e2e8f0;font-weight:700}.content{display:grid;grid-template-columns:repeat(auto-fill,minmax(12rem,1fr));gap:1rem}.content.list{display:grid;grid-template-columns:1fr}.content article{padding:.8rem;border:1px solid #e2e8f0;border-radius:.5rem}.content>p{color:#64748b}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataViewComponent<T = unknown> { readonly value = input<T[]>([]); readonly layout = input<'list' | 'grid'>('grid'); readonly header = input(''); readonly emptyMessage = input('No items'); readonly ariaLabel = input('Data view'); readonly itemTemplate = input<any>(null); itemLabel(item: T): string { return typeof item === 'object' ? JSON.stringify(item) : String(item ?? ''); } }
