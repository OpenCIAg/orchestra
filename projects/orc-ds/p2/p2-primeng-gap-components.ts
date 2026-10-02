import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { P2_SHARED_STYLES } from './p2-shared';

@Component({
  selector: 'orc-panel',
  standalone: true,
  template: `<section
    class="p-panel p-component orc-p2-panel"
    [class]="'p-panel p-component orc-p2-panel ' + styleClass()"
    [style]="style()"
    [class.collapsed]="collapsed()"
    [attr.aria-label]="ariaLabel() || null"
    [attr.aria-labelledby]="ariaLabel() ? null : headerId"
    [attr.data-pc-name]="'panel'"
  >
    <header
      class="orc-p2-panel__header"
      [class.toggleable]="toggleable()"
      [id]="headerId"
      (click)="toggle()"
    >
      <span class="orc-p2-panel__title"
        ><ng-content select="[orcPanelHeader]" />
        @if (!hasHeader()) {
          {{ header() }}
        }
      </span>
      @if (toggleable()) {
        <button
          type="button"
          class="orc-p2-panel__toggle"
          [attr.aria-expanded]="!collapsed()"
          [attr.aria-controls]="!collapsed() ? contentId : null"
          (click)="$event.stopPropagation(); toggle()"
          [attr.aria-label]="
            collapsed() ? effectiveExpandLabel() : effectiveCollapseLabel()
          "
        >
          {{ collapsed() ? '＋' : '−' }}
        </button>
      }
    </header>
    @if (!collapsed()) {
      <div class="orc-p2-panel__content" [id]="contentId"><ng-content /></div>
    }
  </section>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-p2-panel{border:1px solid var(--orc-component-border);border-radius:.625rem;background:var(--orc-component-surface);overflow:hidden}.orc-p2-panel__header{display:flex;align-items:center;justify-content:space-between;min-height:2.75rem;padding:.65rem .85rem;background:var(--orc-component-surface-subtle);font-weight:600;cursor:default}.orc-p2-panel__header.toggleable{cursor:pointer}.orc-p2-panel__content{padding:.85rem}.orc-p2-panel__toggle{border:0;background:transparent;font-size:1.15rem;cursor:pointer}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelComponent {
  private static generatedIdSequence = 0;
  readonly headerId = `orc-panel-header-${++PanelComponent.generatedIdSequence}`;
  readonly contentId = `orc-panel-content-${PanelComponent.generatedIdSequence}`;
  readonly header = input('');
  /** @deprecated Compatibility input; this lightweight Panel uses `header` and projected `[orcPanelHeader]` content. */
  readonly legend = input<string | undefined>(undefined);
  readonly toggleable = input(false, { transform: booleanAttribute });
  readonly styleClass = input('');
  readonly style = input<Record<string, string> | null>(null);
  /** @deprecated Transition timing is fixed by the component stylesheet. */
  readonly transitionOptions = input('');
  readonly collapsed = model(false);
  readonly ariaLabel = input('');
  readonly expandLabel = input<string | undefined>(undefined);
  readonly collapseLabel = input<string | undefined>(undefined);
  readonly onBeforeToggle = output<{ collapsed: boolean }>();
  readonly onAfterToggle = output<{ collapsed: boolean }>();
  hasHeader(): boolean {
    return !!this.header();
  }
  effectiveExpandLabel(): string {
    return this.expandLabel() || 'Expand panel';
  }
  effectiveCollapseLabel(): string {
    return this.collapseLabel() || 'Collapse panel';
  }
  toggle(): void {
    if (!this.toggleable()) return;
    const next = !this.collapsed();
    this.onBeforeToggle.emit({ collapsed: next });
    this.collapsed.set(next);
    this.onAfterToggle.emit({ collapsed: next });
  }
  expand(): void {
    if (this.collapsed()) this.toggle();
  }
  collapse(): void {
    if (!this.collapsed()) this.toggle();
  }
}

@Component({
  selector: 'orc-fieldset',
  standalone: true,
  template: `<fieldset
    class="p-fieldset p-component orc-p2-fieldset"
    [class]="'p-fieldset p-component orc-p2-fieldset ' + styleClass()"
    [style]="style()"
    [class.collapsed]="collapsed()"
    [attr.aria-label]="ariaLabel() || null"
    [attr.aria-labelledby]="ariaLabel() ? null : legendId"
    [attr.data-pc-name]="'fieldset'"
  >
    <legend [id]="legendId">
      {{ legend() }}
      @if (toggleable()) {
        <button
          type="button"
          [attr.aria-expanded]="!collapsed()"
          [attr.aria-controls]="!collapsed() ? contentId : null"
          (click)="toggle()"
          [attr.aria-label]="
            collapsed() ? effectiveExpandLabel() : effectiveCollapseLabel()
          "
        >
          {{ collapsed() ? '＋' : '−' }}
        </button>
      }
    </legend>
    @if (!collapsed()) {
      <div class="content" [id]="contentId"><ng-content /></div>
    }
  </fieldset>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-p2-fieldset{min-width:0;margin:0;padding:0;border:1px solid var(--orc-component-border);border-radius:.625rem;background:var(--orc-component-surface);color:var(--orc-component-text)}.orc-p2-fieldset legend{padding:0 .45rem;font-weight:600}.orc-p2-fieldset legend button{margin-inline-start:.5rem;border:0;background:transparent;cursor:pointer}.orc-p2-fieldset .content{padding:.85rem}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldsetComponent {
  private static generatedIdSequence = 0;
  readonly legendId = `orc-fieldset-legend-${++FieldsetComponent.generatedIdSequence}`;
  readonly contentId = `orc-fieldset-content-${FieldsetComponent.generatedIdSequence}`;
  readonly legend = input('');
  readonly toggleable = input(false, { transform: booleanAttribute });
  readonly collapsed = model(false);
  readonly styleClass = input('');
  readonly style = input<Record<string, string> | null>(null);
  readonly ariaLabel = input('');
  readonly expandLabel = input<string | undefined>(undefined);
  readonly collapseLabel = input<string | undefined>(undefined);
  readonly onBeforeToggle = output<{ collapsed: boolean }>();
  readonly onAfterToggle = output<{ collapsed: boolean }>();
  effectiveExpandLabel(): string {
    return this.expandLabel() || 'Expand fieldset';
  }
  effectiveCollapseLabel(): string {
    return this.collapseLabel() || 'Collapse fieldset';
  }
  toggle(): void {
    if (!this.toggleable()) return;
    const next = !this.collapsed();
    this.onBeforeToggle.emit({ collapsed: next });
    this.collapsed.set(next);
    this.onAfterToggle.emit({ collapsed: next });
  }
  expand(): void {
    if (this.collapsed()) this.toggle();
  }
  collapse(): void {
    if (!this.collapsed()) this.toggle();
  }
}

/**
 * Compatibility surface: FloatLabelComponent lives in the canonical
 * `float-label` directory; these re-exports keep every p2 entry symbol unchanged.
 */
export { FloatLabelComponent } from '@ciag/orchestra/float-label';

@Component({
  selector: 'orc-fluid',
  standalone: true,
  template: `<div
    class="p-fluid p-component orc-p2-fluid"
    [class]="'p-fluid p-component orc-p2-fluid ' + styleClass()"
  >
    <ng-content />
  </div>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-p2-fluid{display:flex;flex-direction:column;width:100%;gap:1rem}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FluidComponent {
  readonly styleClass = input('');
}

@Component({
  selector: 'orc-overlay-badge',
  standalone: true,
  template: `<span class="orc-p2-overlay-badge"
    ><ng-content /><span
      class="orc-p2-overlay-badge__value"
      [class.dot]="isDot()"
      [attr.role]="ariaLabel() || !isDot() ? 'img' : null"
      [attr.aria-label]="ariaLabel() || (!isDot() ? value() : null)"
      [attr.aria-hidden]="isDot() && !ariaLabel() ? 'true' : null"
      >{{ isDot() ? '' : value() }}</span
    ></span
  >`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-p2-overlay-badge{position:relative;display:inline-flex}.orc-p2-overlay-badge__value{position:absolute;top:-.45rem;inset-inline-end:-.45rem;min-width:1.15rem;height:1.15rem;padding:0 .25rem;border-radius:999px;background:var(--orc-component-danger);color:var(--orc-component-on-dark);font-size:.7rem;line-height:1.15rem;text-align:center}.orc-p2-overlay-badge__value.dot{width:.6rem;min-width:.6rem;height:.6rem;padding:0}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlayBadgeComponent {
  readonly value = input<string | number>('');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly isDot = computed(() => this.value() == null || this.value() === '');
}

export interface MeterItem {
  value: number;
  label?: string;
  color?: string;
}
@Component({
  selector: 'orc-meter-group',
  standalone: true,
  template: `<div
    class="p-metergroup p-component orc-p2-meter"
    [class]="
      'p-metergroup p-component orc-p2-meter orientation-' +
      orientation() +
      ' label-orientation-' +
      labelOrientation() +
      ' ' +
      styleClass()
    "
    [style]="style()"
    [attr.data-pc-name]="'metergroup'"
  >
    @if (label() && labelPosition() === 'start') {
      <small class="orc-p2-meter__label"
        >{{ label() }} {{ ariaValue() }}/{{ normalizedMax() }}</small
      >
    }
    <div
      class="orc-p2-meter__track"
      role="meter"
      [attr.aria-label]="ariaLabel() || label() || 'Meter'"
      [attr.aria-valuemin]="normalizedMin()"
      [attr.aria-valuemax]="normalizedMax()"
      [attr.aria-valuenow]="ariaValue()"
    >
      @for (item of effectiveValues(); track $index) {
        <span
          [style.width.%]="
            orientation() === 'horizontal' ? percent(item) : null
          "
          [style.height.%]="orientation() === 'vertical' ? percent(item) : null"
          [style.background]="item.color || color()"
          [attr.title]="item.label || null"
        ></span>
      }
    </div>
    @if (label() && labelPosition() === 'end') {
      <small class="orc-p2-meter__label"
        >{{ label() }} {{ ariaValue() }}/{{ normalizedMax() }}</small
      >
    }
  </div>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-p2-meter{display:grid;gap:.35rem;width:100%;align-items:stretch}.orc-p2-meter__label{min-width:0}.orc-p2-meter__track{display:flex;flex-direction:row;width:100%;height:.65rem;min-width:0;overflow:hidden;border-radius:999px;background:var(--orc-component-surface-subtle)}.orc-p2-meter__track span{display:block;flex:0 0 auto;min-width:0;min-height:0}/* Keep a definite default extent so percentage segment heights resolve; callers can override it through style.height. */.orc-p2-meter.orientation-vertical{display:inline-flex;flex-direction:column;width:auto;height:8rem;min-width:.65rem;min-height:8rem;align-items:center}.orc-p2-meter.orientation-vertical .orc-p2-meter__track{flex:0 0 auto;flex-direction:column;width:.65rem;height:100%;min-height:8rem}.orc-p2-meter.label-orientation-vertical .orc-p2-meter__label{writing-mode:vertical-rl;text-orientation:mixed}.orc-p2-meter.label-orientation-horizontal .orc-p2-meter__label{writing-mode:horizontal-tb;text-orientation:mixed}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeterGroupComponent {
  readonly values = input<MeterItem[]>([]);
  readonly value = input<MeterItem[] | undefined>(undefined);
  readonly min = input(0);
  readonly max = input(100);
  readonly color = input('#3b82f6');
  readonly label = input('');
  readonly labelPosition = input<'start' | 'end'>('end');
  readonly labelOrientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly styleClass = input('');
  readonly ariaLabel = input<string | undefined>(undefined);
  private finiteNonNegative(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0
      ? value
      : 0;
  }
  private finite(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value)
      ? value
      : fallback;
  }
  private readonly normalizedValues = computed<MeterItem[]>(() => {
    const source = this.value() ?? this.values();
    return (Array.isArray(source) ? source : []).map((item) => ({
      ...(item ?? {}),
      value: this.finiteNonNegative(item?.value),
    }));
  });
  private readonly normalizedMinValue = computed(() =>
    this.finite(this.min(), 0),
  );
  private readonly normalizedMaxValue = computed(() =>
    Math.max(this.normalizedMinValue(), this.finite(this.max(), 100)),
  );
  private readonly totalValue = computed(() =>
    this.normalizedValues().reduce((sum, item) => {
      const next = sum + item.value;
      return Number.isFinite(next) ? next : Number.MAX_VALUE;
    }, 0),
  );
  private readonly ariaValueValue = computed(() =>
    Math.max(
      this.normalizedMinValue(),
      Math.min(this.normalizedMaxValue(), this.totalValue()),
    ),
  );
  normalizedMin(): number {
    return this.normalizedMinValue();
  }
  normalizedMax(): number {
    return this.normalizedMaxValue();
  }
  effectiveValues(): MeterItem[] {
    return this.normalizedValues();
  }
  total(): number {
    return this.totalValue();
  }
  ariaValue(): number {
    return this.ariaValueValue();
  }
  percent(item: MeterItem): number {
    const value = this.finiteNonNegative(item?.value);
    const total = this.totalValue();
    const range = this.normalizedMax() - this.normalizedMin();
    if (value === 0 || total === 0 || range <= 0) return 0;
    const share = total > range ? value / total : value / range;
    return Math.max(0, Math.min(100, share * 100));
  }
}
/**
 * Compatibility surface: PasswordComponent lives in the canonical
 * `password` directory; these re-exports keep every p2 entry symbol unchanged.
 */
export { PasswordComponent } from '@ciag/orchestra/password';

export { SplitButtonComponent } from './p2-split-button-component';

@Component({
  selector: 'orc-scroll-top',
  standalone: true,
  template: `@if (visible()) {
    <button
      type="button"
      class="p-scrolltop p-component orc-p2-scroll-top"
      [class]="'p-scrolltop p-component orc-p2-scroll-top ' + styleClass()"
      [style]="style()"
      [attr.aria-label]="effectiveAriaLabel()"
      [attr.data-pc-name]="'scrolltop'"
      (focus)="onButtonFocus()"
      (blur)="onButtonBlur()"
      (click)="scroll()"
    >
      {{ icon() }}
    </button>
  }`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-p2-scroll-top{position:fixed;right:1.25rem;bottom:1.25rem;z-index:10;width:2.5rem;height:2.5rem;border:0;border-radius:50%;background:var(--orc-component-interactive);color:var(--orc-component-on-interactive);font-size:1.25rem;box-shadow:0 4px 14px var(--orc-component-shadow-color)}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollTopComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly threshold = input(200);
  readonly target = input<'window' | 'parent'>('window');
  readonly behavior = input<'auto' | 'smooth'>('smooth');
  readonly icon = input('↑');
  readonly styleClass = input('');
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly buttonAriaLabel = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  /** @deprecated ScrollTop does not currently animate its visibility changes. */
  readonly showTransitionOptions = input('150ms ease');
  /** @deprecated ScrollTop does not currently animate its visibility changes. */
  readonly hideTransitionOptions = input('150ms ease');
  readonly visible = model(false);
  readonly clicked = output<void>();
  private parent: HTMLElement | null = null;
  private readonly parentScroll = (): void => this.onParentScroll();
  private ownerWindow: Window | null = null;
  private readonly windowScroll = (): void => this.onScroll();
  private buttonFocused = false;
  private boundScrollTarget: 'window' | 'parent' | null = null;
  private initialized = false;
  constructor(private readonly host: ElementRef<HTMLElement>) {}
  ngAfterViewInit(): void {
    this.initialized = true;
    this.ownerWindow = this.host.nativeElement.ownerDocument.defaultView;
    this.bindScrollSource();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.initialized) return;
    if (changes['target']) this.bindScrollSource();
    else if (changes['threshold']) this.refreshVisibility();
  }
  private bindScrollSource(): void {
    if (this.boundScrollTarget === 'window')
      this.ownerWindow?.removeEventListener('scroll', this.windowScroll);
    else if (this.boundScrollTarget === 'parent')
      this.parent?.removeEventListener('scroll', this.parentScroll);

    this.boundScrollTarget = null;
    this.parent = null;
    if (this.target() === 'window') {
      this.boundScrollTarget = 'window';
      this.ownerWindow?.addEventListener('scroll', this.windowScroll, {
        passive: true,
      });
    } else if (this.target() === 'parent') {
      this.parent = this.host.nativeElement.parentElement;
      if (this.parent) {
        this.boundScrollTarget = 'parent';
        this.parent.addEventListener('scroll', this.parentScroll, {
          passive: true,
        });
      }
    }
    this.refreshVisibility();
  }
  private refreshVisibility(): void {
    if (this.target() === 'parent') this.onParentScroll();
    else this.onScroll();
  }
  effectiveAriaLabel(): string {
    return (
      this.buttonAriaLabel()?.trim() ||
      this.ariaLabel()?.trim() ||
      'Scroll to top'
    );
  }
  ngOnDestroy(): void {
    if (this.boundScrollTarget === 'window')
      this.ownerWindow?.removeEventListener('scroll', this.windowScroll);
    else if (this.boundScrollTarget === 'parent')
      this.parent?.removeEventListener('scroll', this.parentScroll);
    this.boundScrollTarget = null;
    this.ownerWindow = null;
    this.parent = null;
  }
  onScroll(): void {
    if (this.target() === 'window')
      this.updateVisibility(
        this.host.nativeElement.ownerDocument.defaultView?.scrollY ?? 0,
      );
  }
  onParentScroll(): void {
    if (this.target() === 'parent')
      this.updateVisibility(
        this.parent?.scrollTop ??
          this.host.nativeElement.parentElement?.scrollTop ??
          0,
      );
  }
  onButtonFocus(): void {
    this.buttonFocused = true;
  }
  onButtonBlur(): void {
    this.buttonFocused = false;
    this.refreshVisibility();
  }
  private updateVisibility(scrollOffset: number): void {
    this.visible.set(scrollOffset > this.threshold() || this.buttonFocused);
  }
  private effectiveScrollBehavior(): ScrollBehavior {
    const behavior = this.behavior();
    const view = this.host.nativeElement.ownerDocument.defaultView;
    return behavior === 'smooth' &&
      view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : behavior;
  }
  scroll(): void {
    if (this.target() === 'parent')
      this.host.nativeElement.parentElement?.scrollTo?.({
        top: 0,
        behavior: this.effectiveScrollBehavior(),
      });
    else
      this.host.nativeElement.ownerDocument.defaultView?.scrollTo?.({
        top: 0,
        behavior: this.effectiveScrollBehavior(),
      });
    this.clicked.emit();
  }
}
