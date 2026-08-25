import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { NavigationItem } from './navigation.types';

@Component({
  selector: 'orc-navigation-shell',
  standalone: true,
  template: `<aside class="orc-navigation-shell" [class.orc-navigation-shell--rail]="rail()" [class.orc-navigation-shell--open]="open()"><header class="orc-navigation-shell__brand"><ng-content select="[navigation-logo]" /></header><nav [attr.aria-label]="ariaLabel()"><ng-content /></nav><footer class="orc-navigation-shell__footer"><ng-content select="[navigation-footer]" /></footer></aside>`,
  styles: [':host{display:block}.orc-navigation-shell{display:grid;grid-template-rows:auto 1fr auto;width:var(--orc-navigation-width,17rem);min-height:100%;background:var(--orc-surface-raised,var(--orc-surface,#fff));border-inline-end:1px solid var(--orc-border-default,#e2e8f0);color:var(--orc-text,#0f172a)}.orc-navigation-shell__brand,.orc-navigation-shell__footer{padding:1rem}.orc-navigation-shell nav{padding:.5rem}@media(max-width:48rem){.orc-navigation-shell{position:fixed;inset-block:0;inset-inline-start:0;z-index:var(--z-drawer,1000);transform:translateX(-100%);transition:transform .2s ease}.orc-navigation-shell--open{transform:translateX(0)}}.orc-navigation-shell--rail{width:var(--orc-navigation-rail-width,4.5rem)}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationShellComponent {
  readonly open = input(false, { transform: booleanAttribute });
  readonly rail = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input('Main navigation');
}

@Component({
  selector: 'orc-navigation-item',
  standalone: true,
  template: `<a class="orc-navigation-item" [class.orc-navigation-item--active]="active()" [class.orc-navigation-item--disabled]="item().disabled" [attr.href]="item().href || null" [attr.aria-current]="active() ? 'page' : null" [attr.aria-disabled]="item().disabled || null" (click)="select($event)">@if (item().icon) { <span aria-hidden="true">{{ item().icon }}</span> }<span class="orc-navigation-item__label">{{ item().label }}</span>@if (item().badge !== undefined) { <span class="orc-navigation-item__badge">{{ item().badge }}</span> }</a>`,
  styles: [':host{display:block}.orc-navigation-item{display:flex;gap:.65rem;align-items:center;min-height:2.5rem;padding:.5rem .7rem;border-radius:.5rem;color:inherit;text-decoration:none;cursor:pointer}.orc-navigation-item:hover,.orc-navigation-item--active{background:var(--orc-interactive-soft,#eff6ff);color:var(--orc-interactive-hover,#1d4ed8)}.orc-navigation-item--disabled{opacity:.55;pointer-events:none}.orc-navigation-item__badge{margin-inline-start:auto;font-size:.75rem}.orc-navigation-item__label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationItemComponent {
  readonly item = input.required<NavigationItem>();
  readonly active = input(false, { transform: booleanAttribute });
  readonly activated = output<NavigationItem>();
  select(event: MouseEvent): void { if (this.item().disabled) { event.preventDefault(); return; } this.activated.emit(this.item()); }
}
