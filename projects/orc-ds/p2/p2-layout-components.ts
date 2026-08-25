import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { P2_SHARED_STYLES, P2Size, P2Orientation } from './p2-shared';

@Component({
  selector: 'orc-button-group',
  standalone: true,
  template: `<div class="orc-p2-button-group" [class.vertical]="orientation() === 'vertical'" [class.attached]="attached()" role="group" [attr.aria-label]="label()"><ng-content /></div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-button-group { display: inline-flex; gap: .5rem; align-items: center; } .orc-p2-button-group.vertical { flex-direction: column; align-items: stretch; } .orc-p2-button-group.attached { gap: 0; } .orc-p2-button-group.attached ::ng-deep button { border-radius: 0; } .orc-p2-button-group.attached ::ng-deep button:first-child { border-radius: .5rem 0 0 .5rem; } .orc-p2-button-group.attached ::ng-deep button:last-child { border-radius: 0 .5rem .5rem 0; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonGroupComponent {
  readonly orientation = input<P2Orientation>('horizontal');
  readonly attached = input(false, { transform: booleanAttribute });
  readonly label = input('Button group');
}

@Component({
  selector: 'orc-grid',
  standalone: true,
  template: `<div class="orc-p2-grid" [style.grid-template-columns]="columnsStyle()" [style.gap]="gap()" [style.align-items]="alignItems()" [attr.aria-label]="label() || null"><ng-content /></div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-grid { display: grid; width: 100%; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent {
  readonly columns = input(0);
  readonly minColumnWidth = input('12rem');
  readonly gap = input('1rem');
  readonly alignItems = input<'start' | 'center' | 'stretch' | 'end'>('stretch');
  readonly label = input('');
  readonly columnsStyle = computed(() => this.columns() > 0 ? `repeat(${this.columns()}, minmax(0, 1fr))` : `repeat(auto-fit, minmax(${this.minColumnWidth()}, 1fr))`);
}

@Component({
  selector: 'orc-aspect-ratio',
  standalone: true,
  template: `<div class="orc-p2-aspect-ratio" [style.aspect-ratio]="ratio()" [style.overflow]="overflow()"><ng-content /></div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-aspect-ratio { position: relative; width: 100%; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AspectRatioComponent {
  readonly ratio = input('16 / 9');
  readonly overflow = input<'hidden' | 'visible'>('hidden');
}

@Component({
  selector: 'orc-container',
  standalone: true,
  template: `<div class="orc-p2-container" [class.fluid]="fluid()" [style.max-width]="fluid() ? null : maxWidth()" [style.padding-inline]="padding()"><ng-content /></div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-container { width: 100%; margin-inline: auto; } .orc-p2-container:not(.fluid) { box-sizing: border-box; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContainerComponent {
  readonly maxWidth = input('72rem');
  readonly padding = input('1rem');
  readonly fluid = input(false, { transform: booleanAttribute });
}

@Component({
  selector: 'orc-flex',
  standalone: true,
  template: `<div class="orc-p2-flex" [style.flex-direction]="direction()" [style.gap]="gap()" [style.align-items]="align()" [style.justify-content]="justify()" [style.flex-wrap]="wrap() ? 'wrap' : 'nowrap'"><ng-content /></div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-flex { display: flex; width: 100%; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexComponent {
  readonly direction = input<'row' | 'row-reverse' | 'column' | 'column-reverse'>('row');
  readonly gap = input('1rem');
  readonly align = input<'start' | 'center' | 'end' | 'stretch' | 'baseline'>('stretch');
  readonly justify = input<'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'>('start');
  readonly wrap = input(false, { transform: booleanAttribute });
}

@Component({
  selector: 'orc-stack',
  standalone: true,
  template: `<div class="orc-p2-stack" [style.flex-direction]="direction()" [style.gap]="gap()" [style.align-items]="align()" [style.justify-content]="justify()"><ng-content /></div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-stack { display: flex; width: 100%; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackComponent {
  readonly direction = input<'row' | 'column'>('column');
  readonly gap = input('1rem');
  readonly align = input<'start' | 'center' | 'end' | 'stretch'>('stretch');
  readonly justify = input<'start' | 'center' | 'end' | 'space-between'>('start');
}

@Component({
  selector: 'orc-space',
  standalone: true,
  template: `<div class="orc-p2-space" [style.flex-direction]="direction()" [style.gap]="size()" [style.flex-wrap]="wrap() ? 'wrap' : 'nowrap'"><ng-content /></div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-space { display: flex; align-items: center; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpaceComponent {
  readonly size = input('1rem');
  readonly direction = input<'row' | 'column'>('row');
  readonly wrap = input(false, { transform: booleanAttribute });
}

@Component({
  selector: 'orc-box',
  standalone: true,
  template: `<div class="orc-p2-box" [style.padding]="padding()" [style.margin]="margin()" [style.background]="background() || null" [style.border-radius]="radius()" [style.width]="width() || null"><ng-content /></div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-box { width: 100%; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoxComponent {
  readonly padding = input('0');
  readonly margin = input('0');
  readonly background = input('');
  readonly radius = input('.5rem');
  readonly width = input('');
}

@Component({
  selector: 'orc-separator',
  standalone: true,
  template: `<div class="orc-p2-separator" [class.vertical]="orientation() === 'vertical'" role="separator" [attr.aria-orientation]="orientation()" [attr.aria-label]="label() || null"></div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-separator { width: 100%; height: 1px; background: var(--orc-component-surface-subtle); } .orc-p2-separator.vertical { width: 1px; height: 100%; min-height: 1rem; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeparatorComponent {
  readonly orientation = input<P2Orientation>('horizontal');
  readonly label = input('');
}

@Component({
  selector: 'orc-visually-hidden',
  standalone: true,
  template: `<span class="orc-p2-visually-hidden"><ng-content /></span>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-visually-hidden { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0, 0, 0, 0) !important; white-space: nowrap !important; border: 0 !important; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisuallyHiddenComponent {}

@Component({
  selector: 'orc-typography',
  standalone: true,
  template: `<span class="orc-p2-typography" [class]="'orc-p2-typography orc-p2-typography--' + size()" [style.font-weight]="weight()" [style.color]="color() || null" [class.truncate]="truncate()"><ng-content /></span>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-typography { display: inline; line-height: 1.5; } .orc-p2-typography--xs { font-size: .75rem; } .orc-p2-typography--sm { font-size: .875rem; } .orc-p2-typography--md { font-size: 1rem; } .orc-p2-typography--lg { font-size: 1.25rem; } .orc-p2-typography--xl { font-size: 1.75rem; } .truncate { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypographyComponent {
  readonly as = input<'span' | 'p' | 'h1' | 'h2' | 'h3'>('span');
  readonly size = input<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly weight = input<number | string>(400);
  readonly color = input('');
  readonly truncate = input(false, { transform: booleanAttribute });
}

@Component({
  selector: 'orc-text',
  standalone: true,
  template: `<span [class]="'orc-p2-text orc-p2-text--' + size()" [class.muted]="muted()" [class.truncate]="truncate()"><ng-content /></span>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-text { color: var(--orc-component-text); } .orc-p2-text--sm { font-size: .875rem; } .orc-p2-text--md { font-size: 1rem; } .orc-p2-text--lg { font-size: 1.25rem; } .muted { color: var(--orc-component-text-muted); } .truncate { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextComponent {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly muted = input(false, { transform: booleanAttribute });
  readonly truncate = input(false, { transform: booleanAttribute });
}

@Component({
  selector: 'orc-kbd',
  standalone: true,
  template: `<kbd class="orc-p2-kbd" [attr.aria-label]="ariaLabel() || null">@for (key of normalizedKeys(); track $index) { <span>{{ key }}</span> }</kbd>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-kbd { display: inline-flex; gap: .2rem; align-items: center; padding: .15rem .35rem; border: 1px solid var(--orc-component-border-strong); border-bottom-width: 2px; border-radius: .3rem; background: var(--orc-component-surface-subtle); color: var(--orc-component-text-secondary); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .75rem; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KbdComponent {
  readonly keys = input<string | string[]>('⌘ K');
  readonly ariaLabel = input('');
  readonly normalizedKeys = computed(() => {
    const keys = this.keys();
    return Array.isArray(keys) ? keys : keys.split(/\s*\+\s*/);
  });
}

@Component({
  selector: 'orc-link',
  standalone: true,
  template: `<a class="orc-p2-link" [href]="disabled() ? null : href()" [target]="target() || null" [rel]="target() === '_blank' ? 'noopener noreferrer' : null" [class.disabled]="disabled()" [class.underline]="underline()" [attr.aria-label]="ariaLabel() || null" [attr.aria-disabled]="disabled()" (click)="onClick($event)"><ng-content /></a>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-link { color: var(--orc-component-interactive); text-decoration: none; } .orc-p2-link.underline, .orc-p2-link:hover { text-decoration: underline; } .orc-p2-link.disabled { pointer-events: none; color: var(--orc-component-text-muted); }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkComponent {
  readonly href = input('#');
  readonly target = input('');
  readonly ariaLabel = input('');
  readonly underline = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly activated = output<MouseEvent>();
  onClick(event: MouseEvent): void { if (this.disabled()) { event.preventDefault(); return; } this.activated.emit(event); }
}
