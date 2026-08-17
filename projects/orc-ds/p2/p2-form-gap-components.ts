import { booleanAttribute, ChangeDetectionStrategy, Component, Directive, HostListener, computed, input, model, output, signal } from '@angular/core';
import { P2Option, P2_SHARED_STYLES } from './p2-shared';

@Component({
  selector: 'orc-select-button', standalone: true,
  template: `<div class="orc-select-button" role="group" [attr.aria-label]="label()">@for (option of options(); track option.value) { <button type="button" [disabled]="disabled() || option.disabled" [class.selected]="isSelected(option)" [attr.aria-pressed]="isSelected(option)" (click)="select(option)">{{ option.icon }} {{ option.label }}</button> }</div>`,
  styles: [P2_SHARED_STYLES + `.orc-select-button{display:inline-flex;gap:0}.orc-select-button button{border:1px solid #cbd5e1;background:#fff;padding:.55rem .8rem}.orc-select-button button:first-child{border-radius:.4rem 0 0 .4rem}.orc-select-button button:last-child{border-radius:0 .4rem .4rem 0}.orc-select-button button.selected{border-color:#2563eb;background:#2563eb;color:#fff}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectButtonComponent<T = unknown> { readonly options = input<P2Option<T>[]>([]); readonly value = model<T | T[] | null>(null); readonly multiple = input(false, { transform: booleanAttribute }); readonly disabled = input(false, { transform: booleanAttribute }); readonly label = input('Select option'); readonly valueChangeEvent = output<T | T[] | null>(); isSelected(option: P2Option<T>): boolean { const current = this.value(); return this.multiple() ? Array.isArray(current) && current.includes(option.value) : current === option.value; } select(option: P2Option<T>): void { if (this.disabled() || option.disabled) return; let next: T | T[] | null; const current = this.value(); if (this.multiple()) { const items: T[] = Array.isArray(current) ? [...current] : []; const index = items.indexOf(option.value); index >= 0 ? items.splice(index, 1) : items.push(option.value); next = items; } else next = option.value; this.value.set(next); this.valueChangeEvent.emit(next); } }

@Component({
  selector: 'orc-toggle-button', standalone: true,
  template: `<button type="button" class="orc-toggle-button" [class.checked]="checked()" [disabled]="disabled()" [attr.aria-pressed]="checked()" (click)="toggle()">{{ checked() ? onLabel() : offLabel() }}<ng-content /></button>`,
  styles: [P2_SHARED_STYLES + `.orc-toggle-button{border:1px solid #cbd5e1;border-radius:.4rem;background:#fff;padding:.55rem .85rem}.orc-toggle-button.checked{border-color:#2563eb;background:#2563eb;color:#fff}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleButtonComponent { readonly checked = model(false); readonly onLabel = input('On'); readonly offLabel = input('Off'); readonly disabled = input(false, { transform: booleanAttribute }); readonly change = output<boolean>(); toggle(): void { if (this.disabled()) return; this.checked.update(value => !value); this.change.emit(this.checked()); } }

export interface CascadeOption extends P2Option<string> { children?: CascadeOption[]; }
@Component({
  selector: 'orc-cascade-select', standalone: true,
  template: `<div class="orc-cascade" [attr.aria-label]="label()"><button type="button" class="trigger" [disabled]="disabled()" (click)="open.set(!open())">{{ selectedLabel() || placeholder() }}⌄</button>@if (open()) { <div class="levels">@for (level of levels(); track $index) { <ul role="listbox">@for (option of level; track option.value) { <li><button type="button" [disabled]="option.disabled" (click)="choose(option, $index)">{{ option.label }} @if (option.children?.length) { › }</button></li> }</ul> }</div> }</div>`,
  styles: [P2_SHARED_STYLES + `.orc-cascade{position:relative;display:block;width:100%}.trigger{display:flex;justify-content:space-between;width:100%;min-height:2.5rem;border:1px solid #cbd5e1;border-radius:.45rem;background:#fff;padding:.55rem .7rem;text-align:left}.levels{position:absolute;z-index:5;display:flex;top:calc(100% + .25rem);left:0;max-width:100%;border:1px solid #e2e8f0;border-radius:.45rem;background:#fff;box-shadow:0 10px 24px #0f172a1a}.levels ul{min-width:11rem;max-height:16rem;overflow:auto;margin:0;padding:.35rem;list-style:none}.levels button{display:flex;justify-content:space-between;width:100%;border:0;background:transparent;padding:.55rem;text-align:left}.levels button:hover:not(:disabled){background:#eff6ff}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CascadeSelectComponent { readonly options = input<CascadeOption[]>([]); readonly value = model<string | null>(null); readonly label = input('Cascade select'); readonly placeholder = input('Select an item'); readonly disabled = input(false, { transform: booleanAttribute }); readonly open = model(false); readonly selected = signal<CascadeOption[]>([]); readonly optionSelect = output<CascadeOption>();
  readonly levels = computed(() => { const result: CascadeOption[][] = [this.options()]; const path = this.selected(); const last = path[path.length - 1]; if (last?.children?.length) result.push(last.children); return result; });
  selectedLabel(): string { return this.selected().map(item => item.label).join(' / '); }
  choose(option: CascadeOption, level: number): void { const path = [...this.selected().slice(0, level), option]; this.selected.set(path); if (option.children?.length) return; this.value.set(option.value); this.optionSelect.emit(option); this.open.set(false); }
}

@Directive({ selector: '[orcKeyFilter]', standalone: true })
export class KeyFilterDirective { readonly pattern = input<string | RegExp>('[0-9]'); @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent): void { if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return; const regex = this.pattern() instanceof RegExp ? this.pattern() as RegExp : new RegExp(this.pattern()); if (!regex.test(event.key)) event.preventDefault(); } }

@Directive({ selector: '[orcInputMask]', standalone: true })
export class InputMaskDirective { readonly mask = input(''); @HostListener('input', ['$event']) onInput(event: Event): void { const input = event.target as HTMLInputElement; const raw = input.value.replace(/[^a-zA-Z0-9]/g, ''); let index = 0; input.value = this.mask().split('').map(token => token === '9' || token === 'a' || token === '*' ? (raw[index++] || '') : token).join(''); } }
