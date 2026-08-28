import { ChangeDetectionStrategy, Component, booleanAttribute, input, model, output } from '@angular/core';

export interface TabMenuItem {
  label?: string;
  icon?: string;
  disabled?: boolean;
  visible?: boolean;
  command?: (event?: Event) => void;
  routerLink?: string | unknown[];
  [key: string]: unknown;
}

@Component({
  selector: 'orc-tab-menu',
  standalone: true,
  template: `<nav class="orc-tab-menu" [class.scrollable]="scrollable()" [class]="styleClass()" [style]="style()" [attr.aria-label]="ariaLabel()" [attr.aria-labelledby]="ariaLabelledBy()"><ul role="tablist">@for (item of model(); track item.label; let i = $index) { @if (item.visible !== false) { <li role="presentation"><button type="button" role="tab" [disabled]="!!item.disabled" [attr.aria-selected]="isActive(item)" [attr.tabindex]="isActive(item) ? 0 : -1" (click)="activate(item, $event)" (keydown)="onKeydown($event, i)">@if (item.icon) { <span aria-hidden="true">{{ item.icon }}</span> }{{ item.label }}</button></li> } }</ul></nav>`,
  styles: [`.orc-tab-menu{display:block;overflow:auto}.orc-tab-menu ul{display:flex;gap:.25rem;margin:0;padding:0;border-bottom:1px solid var(--orc-border-default,#e2e8f0);list-style:none}.orc-tab-menu button{border:0;border-bottom:2px solid transparent;background:transparent;padding:.65rem .85rem;color:var(--orc-text-secondary,#475569)}.orc-tab-menu button[aria-selected=true]{border-bottom-color:var(--orc-interactive,#2563eb);color:var(--orc-interactive-hover,var(--orc-interactive,#1d4ed8));font-weight:600}.orc-tab-menu button:disabled{opacity:.5}.orc-tab-menu.scrollable ul{min-width:max-content}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabMenuComponent {
  readonly model = input<TabMenuItem[]>([]);
  readonly activeItem = model<TabMenuItem | undefined>(undefined);
  readonly scrollable = input(false, { transform: booleanAttribute });
  readonly popup = input(false, { transform: booleanAttribute });
  readonly style = input<Record<string, string | number> | undefined>(undefined);
  readonly styleClass = input('');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly itemSelect = output<TabMenuItem>();
  isActive(item: TabMenuItem): boolean { return this.activeItem() === item || (!this.activeItem() && this.model().indexOf(item) === 0); }
  activate(item: TabMenuItem, event: Event): void { if (item.disabled) return; this.activeItem.set(item); item.command?.(event); this.itemSelect.emit(item); }
  onKeydown(event: KeyboardEvent, index: number): void { const items = this.model().filter(item => item.visible !== false && !item.disabled); const current = items.indexOf(this.model()[index]); if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'Home' && event.key !== 'End') return; event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length; this.activeItem.set(items[next]); }
}
