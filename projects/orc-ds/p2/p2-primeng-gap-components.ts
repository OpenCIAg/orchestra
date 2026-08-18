import { CommonModule } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, forwardRef, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { P2_SHARED_STYLES } from './p2-shared';

@Component({
  selector: 'orc-panel', standalone: true,
  template: `<section class="orc-p2-panel" [class]="styleClass()" [class.collapsed]="collapsed()" [attr.aria-label]="ariaLabel() || null">
    <header class="orc-p2-panel__header" (click)="toggle()">
      <span class="orc-p2-panel__title"><ng-content select="[orcPanelHeader]" /> @if (!hasHeader()) { {{ header() }} }</span>
      @if (toggleable()) { <button type="button" class="orc-p2-panel__toggle" [attr.aria-expanded]="!collapsed()" (click)="$event.stopPropagation(); toggle()" [attr.aria-label]="collapsed() ? 'Expand panel' : 'Collapse panel'">{{ collapsed() ? '＋' : '−' }}</button> }
    </header>
    @if (!collapsed()) { <div class="orc-p2-panel__content"><ng-content /></div> }
  </section>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-panel{border:1px solid #e2e8f0;border-radius:.625rem;background:#fff;overflow:hidden}.orc-p2-panel__header{display:flex;align-items:center;justify-content:space-between;min-height:2.75rem;padding:.65rem .85rem;background:#f8fafc;font-weight:600;cursor:pointer}.orc-p2-panel__content{padding:.85rem}.orc-p2-panel__toggle{border:0;background:transparent;font-size:1.15rem}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelComponent {
  readonly header = input(''); readonly legend = input<string | undefined>(undefined); readonly toggleable = input(false, { transform: booleanAttribute }); readonly styleClass = input(''); readonly style = input<Record<string, string> | null>(null); readonly transitionOptions = input('');
  readonly collapsed = model(false); readonly ariaLabel = input(''); readonly onBeforeToggle = output<{ collapsed: boolean }>(); readonly onAfterToggle = output<{ collapsed: boolean }>();
  hasHeader(): boolean { return !!this.header(); }
  toggle(): void { if (!this.toggleable()) return; const next = !this.collapsed(); this.onBeforeToggle.emit({ collapsed: next }); this.collapsed.set(next); this.onAfterToggle.emit({ collapsed: next }); }
  expand(): void { if (this.collapsed()) this.toggle(); }
  collapse(): void { if (!this.collapsed()) this.toggle(); }
}

@Component({
  selector: 'orc-fieldset', standalone: true,
  template: `<fieldset class="orc-p2-fieldset" [class.collapsed]="collapsed()" [class]="styleClass()" [attr.aria-label]="ariaLabel() || legend()"><legend>{{ legend() }}@if (toggleable()) { <button type="button" [attr.aria-expanded]="!collapsed()" (click)="toggle()" [attr.aria-label]="collapsed() ? 'Expand' : 'Collapse'">{{ collapsed() ? '＋' : '−' }}</button> }</legend>@if (!collapsed()) { <div class="content"><ng-content /></div> }</fieldset>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-fieldset{min-width:0;border:1px solid #e2e8f0;border-radius:.625rem;background:#fff;color:#0f172a}.orc-p2-fieldset legend{padding:0 .45rem;font-weight:600}.orc-p2-fieldset legend button{margin-left:.5rem;border:0;background:transparent}.orc-p2-fieldset .content{padding:.85rem}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldsetComponent {
  readonly legend = input(''); readonly toggleable = input(false, { transform: booleanAttribute }); readonly collapsed = model(false); readonly styleClass = input(''); readonly style = input<Record<string, string> | null>(null); readonly ariaLabel = input(''); readonly onBeforeToggle = output<{ collapsed: boolean }>(); readonly onAfterToggle = output<{ collapsed: boolean }>();
  toggle(): void { if (!this.toggleable()) return; const next = !this.collapsed(); this.onBeforeToggle.emit({ collapsed: next }); this.collapsed.set(next); this.onAfterToggle.emit({ collapsed: next }); }
  expand(): void { if (this.collapsed()) this.toggle(); }
  collapse(): void { if (!this.collapsed()) this.toggle(); }
}

@Component({
  selector: 'orc-float-label', standalone: true,
  template: `<span class="orc-p2-float-label"><ng-content /></span>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-float-label{position:relative;display:block}.orc-p2-float-label>label{position:absolute;z-index:1;top:50%;left:.75rem;transform:translateY(-50%);padding:0 .2rem;color:#64748b;background:#fff;pointer-events:none;transition:.15s}.orc-p2-float-label:focus-within>label,.orc-p2-float-label>.filled+label{top:0;font-size:.75rem;color:#2563eb}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatLabelComponent { readonly variant = input<'in' | 'over' | 'on'>('over'); readonly styleClass = input(''); }

@Component({
  selector: 'orc-fluid', standalone: true,
  template: `<div class="orc-p2-fluid"><ng-content /></div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-fluid{display:flex;flex-direction:column;width:100%;gap:1rem}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FluidComponent { readonly styleClass = input(''); }

@Component({
  selector: 'orc-overlay-badge', standalone: true,
  template: `<span class="orc-p2-overlay-badge"><ng-content /><span class="orc-p2-overlay-badge__value" [class.dot]="!value()">{{ value() }}</span></span>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-overlay-badge{position:relative;display:inline-flex}.orc-p2-overlay-badge__value{position:absolute;top:-.45rem;right:-.45rem;min-width:1.15rem;height:1.15rem;padding:0 .25rem;border-radius:999px;background:#ef4444;color:#fff;font-size:.7rem;line-height:1.15rem;text-align:center}.orc-p2-overlay-badge__value.dot{width:.6rem;min-width:.6rem;height:.6rem;padding:0}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlayBadgeComponent { readonly value = input<string | number>(''); }

export interface MeterItem { value: number; label?: string; color?: string; }
@Component({
  selector: 'orc-meter-group', standalone: true,
  template: `<div class="orc-p2-meter" [class]="styleClass()" [attr.aria-label]="ariaLabel()"><div class="orc-p2-meter__track" role="meter" [attr.aria-valuemin]="min()" [attr.aria-valuemax]="max()" [attr.aria-valuenow]="total()">@for (item of effectiveValues(); track $index) { <span [style.width.%]="percent(item)" [style.background]="item.color || color()" [attr.title]="item.label || null"></span> }</div>@if (label()) { <small>{{ label() }} {{ total() }}/{{ max() }}</small> }</div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-meter{display:grid;gap:.35rem;width:100%}.orc-p2-meter__track{display:flex;height:.65rem;overflow:hidden;border-radius:999px;background:#e2e8f0}.orc-p2-meter__track span{min-width:0}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeterGroupComponent {
  readonly values = input<MeterItem[]>([]); readonly value = input<MeterItem[] | undefined>(undefined); readonly min = input(0); readonly max = input(100); readonly color = input('#3b82f6'); readonly label = input(''); readonly labelPosition = input<'start' | 'end'>('end'); readonly labelOrientation = input<'horizontal' | 'vertical'>('horizontal'); readonly orientation = input<'horizontal' | 'vertical'>('horizontal'); readonly styleClass = input(''); readonly ariaLabel = input('Meter');
  effectiveValues(): MeterItem[] { return this.value() ?? this.values(); }
  total(): number { return this.effectiveValues().reduce((sum, item) => sum + item.value, 0); }
  percent(item: MeterItem): number { return Math.max(0, Math.min(100, ((item.value - this.min()) / Math.max(1, this.max() - this.min())) * 100)); }
}

@Component({
  selector: 'orc-password', standalone: true,
  template: `<div class="orc-p2-password" [class]="styleClass()" [style]="style()" [class.fluid]="fluid()"><label *ngIf="label()" [attr.for]="inputId()">{{ label() }}</label><div class="control"><input [id]="inputId()" [type]="visible() ? 'text' : 'password'" [value]="value()" [placeholder]="placeholder()" [autocomplete]="autocomplete()" [attr.maxlength]="maxLength()" [disabled]="disabled() || cvaDisabled()" [readonly]="readonly()" [autofocus]="autofocus()" [attr.tabindex]="tabindex()" [class]="inputStyleClass()" [style]="inputStyle()" (input)="onInput($event)" (focus)="handleFocus($event)" (blur)="handleBlur($event)" [attr.aria-label]="ariaLabel()" [attr.aria-labelledby]="ariaLabelledBy()" />@if (showClear() && value()) { <button type="button" [disabled]="disabled() || cvaDisabled()" (click)="clear()" aria-label="Clear">×</button> }@if (toggleMask()) { <button type="button" [disabled]="disabled() || cvaDisabled()" (click)="toggleVisible()" [attr.aria-label]="visible() ? 'Hide password' : 'Show password'">{{ visible() ? '◉' : '○' }}</button> }</div>@if (feedback() && (value() || focused())) { <div class="feedback" aria-live="polite"><span>{{ value() ? strengthLabel() : promptLabel() }}</span><span class="meter" [class]="strength()"></span></div> }</div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-password{display:flex;align-items:center;border:1px solid #cbd5e1;border-radius:.5rem;overflow:hidden}.orc-p2-password input{min-width:0;flex:1;border:0;padding:.55rem .7rem;outline:0}.orc-p2-password button{border:0;background:transparent;padding:.5rem}`],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PasswordComponent), multi: true }],
})
export class PasswordComponent implements ControlValueAccessor {
  readonly value = model(''); readonly visible = model(false); readonly placeholder = input(''); readonly disabled = input(false, { transform: booleanAttribute }); readonly readonly = input(false, { transform: booleanAttribute }); readonly required = input(false, { transform: booleanAttribute }); readonly ariaLabel = input('Password'); readonly ariaLabelledBy = input<string | undefined>(undefined); readonly label = input<string | undefined>(undefined); readonly inputId = input<string | undefined>(undefined); readonly inputStyleClass = input(''); readonly inputStyle = input<Record<string, string | number> | undefined>(undefined); readonly styleClass = input(''); readonly style = input<Record<string, string | number> | undefined>(undefined); readonly fluid = input(false, { transform: booleanAttribute }); readonly variant = input<'filled' | 'outlined'>('outlined'); readonly size = input<'small' | 'large' | undefined>(undefined); readonly maxLength = input<number | undefined>(undefined); readonly autocomplete = input('off'); readonly autofocus = input(false, { transform: booleanAttribute }); readonly tabindex = input<number | undefined>(undefined); readonly feedback = input(true, { transform: booleanAttribute }); readonly toggleMask = input(true, { transform: booleanAttribute }); readonly showClear = input(false, { transform: booleanAttribute }); readonly appendTo = input<unknown>(undefined); readonly showTransitionOptions = input('150ms ease'); readonly hideTransitionOptions = input('150ms ease'); readonly promptLabel = input('Enter a password'); readonly weakLabel = input('Weak'); readonly mediumLabel = input('Medium'); readonly strongLabel = input('Strong'); readonly mediumRegex = input('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{6,}$'); readonly strongRegex = input('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}$');
  readonly onFocus = output<Event>(); readonly onBlur = output<Event>(); readonly onClear = output<void>(); readonly focused = signal(false); protected readonly cvaDisabled = signal(false); private onModelChange: (value: string) => void = () => {}; private onModelTouched: () => void = () => {};
  readonly strength = computed<'weak' | 'medium' | 'strong'>(() => { const value = this.value(); if (!value) return 'weak'; try { if (new RegExp(this.strongRegex()).test(value)) return 'strong'; if (new RegExp(this.mediumRegex()).test(value)) return 'medium'; } catch { /* invalid custom expressions fall back to weak */ } return 'weak'; });
  readonly strengthLabel = computed(() => this.strength() === 'strong' ? this.strongLabel() : this.strength() === 'medium' ? this.mediumLabel() : this.weakLabel());
  writeValue(value: unknown): void { this.value.set(value == null ? '' : String(value)); }
  registerOnChange(fn: (value: string) => void): void { this.onModelChange = fn; }
  registerOnTouched(fn: () => void): void { this.onModelTouched = fn; }
  setDisabledState(value: boolean): void { this.cvaDisabled.set(value); }
  onInput(event: Event): void { if (this.readonly() || this.disabled() || this.cvaDisabled()) return; const value = (event.target as HTMLInputElement).value; this.value.set(value); this.onModelChange(value); }
  handleFocus(event: Event): void { this.focused.set(true); this.onFocus.emit(event); }
  handleBlur(event: Event): void { this.focused.set(false); this.onModelTouched(); this.onBlur.emit(event); }
  toggleVisible(): void { if (!this.disabled() && !this.cvaDisabled()) this.visible.update(value => !value); }
  clear(): void { if (this.disabled() || this.cvaDisabled()) return; this.value.set(''); this.onModelChange(''); this.onClear.emit(); }
}

@Component({
  selector: 'orc-split-button', standalone: true,
  template: `<div class="orc-p2-split" [class]="styleClass()"><button type="button" [disabled]="disabled() || loading()" (click)="primaryClick.emit($event)">@if (loading()) { … } @else { {{ icon() }} {{ label() }} }</button><button type="button" class="arrow" [disabled]="disabled() || loading()" (click)="toggleOpen($event)" aria-label="More actions">⌄</button>@if (open()) { <div class="orc-p2-split__menu"><ng-content /></div> }</div>`,
  styles: [P2_SHARED_STYLES + `.orc-p2-split{position:relative;display:inline-flex}.orc-p2-split>button{border:1px solid #2563eb;padding:.55rem .8rem;background:#2563eb;color:#fff}.orc-p2-split>.arrow{border-left-color:#60a5fa;border-radius:0 .4rem .4rem 0}.orc-p2-split>button:first-child{border-radius:.4rem 0 0 .4rem}.orc-p2-split__menu{position:absolute;z-index:3;top:calc(100% + .25rem);right:0;min-width:10rem;padding:.35rem;border:1px solid #e2e8f0;border-radius:.4rem;background:#fff;box-shadow:0 8px 20px #0f172a1a}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitButtonComponent { readonly label = input('Action'); readonly icon = input(''); readonly styleClass = input(''); readonly disabled = input(false, { transform: booleanAttribute }); readonly loading = input(false, { transform: booleanAttribute }); readonly size = input<'small' | 'large' | undefined>(undefined); readonly severity = input<string | undefined>(undefined); readonly open = model(false); readonly primaryClick = output<Event>(); readonly dropdownClick = output<Event>(); toggleOpen(event?: Event): void { this.open.update(value => !value); if (event) this.dropdownClick.emit(event); } }

@Component({
  selector: 'orc-scroll-top', standalone: true,
  template: `@if (visible()) { <button type="button" class="orc-p2-scroll-top" (click)="scroll()" [attr.aria-label]="ariaLabel()">↑</button> }`,
  styles: [P2_SHARED_STYLES + `.orc-p2-scroll-top{position:fixed;right:1.25rem;bottom:1.25rem;z-index:10;width:2.5rem;height:2.5rem;border:0;border-radius:50%;background:#2563eb;color:#fff;font-size:1.25rem;box-shadow:0 4px 14px #0f172a33}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollTopComponent {
  readonly threshold = input(200); readonly target = input<'window' | 'parent'>('window'); readonly behavior = input<'auto' | 'smooth'>('smooth'); readonly styleClass = input(''); readonly buttonAriaLabel = input<string | undefined>(undefined); readonly ariaLabel = input('Scroll to top'); readonly visible = model(false);
  constructor(private readonly host: ElementRef<HTMLElement>) {}
  @HostListener('window:scroll') onScroll(): void { this.visible.set((globalThis.scrollY || 0) > this.threshold()); }
  scroll(): void { globalThis.scrollTo?.({ top: 0, behavior: this.behavior() }); }
}
