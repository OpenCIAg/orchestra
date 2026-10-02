import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { P2Option, P2_SHARED_STYLES } from './p2-shared';

export interface CascadeOption extends P2Option<string> {
  children?: CascadeOption[];
}
@Component({
  selector: 'orc-cascade-select',
  standalone: true,
  template: `<div
    class="orc-cascade"
    [class]="styleClass()"
    [class.orc-cascade--small]="size() === 'small'"
    [class.orc-cascade--large]="size() === 'large'"
    [class.orc-cascade--filled]="variant() === 'filled'"
    [class.orc-cascade--outlined]="variant() === 'outlined'"
  >
    <button
      type="button"
      class="trigger"
      [attr.id]="inputId() || generatedId"
      [disabled]="disabled() || cvaDisabled()"
      [attr.tabindex]="tabindex()"
      [attr.aria-label]="
        ariaLabel() || label() || placeholder() || 'Select an option'
      "
      [autofocus]="autofocus()"
      [attr.aria-expanded]="open()"
      aria-haspopup="listbox"
      [attr.aria-controls]="open() ? listboxId(0) : null"
      [attr.aria-busy]="loading()"
      [attr.aria-required]="required()"
      (click)="toggle()"
      (keydown)="onTriggerKeydown($event)"
    >
      {{ selectedLabel() || placeholder() }}⌄
    </button>
    @if (showClear() && value() !== null) {
      <button
        type="button"
        [disabled]="disabled() || cvaDisabled() || readonly()"
        (click)="clear()"
        [attr.aria-label]="clearAriaLabel() || 'Clear selection'"
      >
        ×
      </button>
    }
    @if (open()) {
      <div
        class="levels"
        [class]="panelStyleClass()"
        [attr.aria-busy]="loading()"
      >
        @if (filter()) {
          <input
            [value]="filterValue()"
            [attr.placeholder]="filterPlaceholder() || null"
            [attr.aria-label]="
              filterAriaLabel() || ariaLabel() || label() || 'Filter options'
            "
            (input)="filterValue.set($any($event.target).value)"
            (keydown)="onPanelKeydown($event)"
          />
        }
        @if (loading()) {
          <div class="loading" role="status" aria-live="polite">
            Loading options
          </div>
        } @else if (noResults()) {
          <div class="empty" role="status" aria-live="polite">
            No results found
          </div>
        }
        @for (level of levels(); track $index) {
          <ul
            [attr.id]="listboxId($index)"
            role="listbox"
            [attr.aria-label]="
              (label() || ariaLabel() || 'Options') + ', level ' + ($index + 1)
            "
          >
            @for (option of level; track getOptionValue(option)) {
              <li role="presentation">
                <button
                  type="button"
                  role="option"
                  tabindex="-1"
                  [disabled]="
                    disabled() ||
                    cvaDisabled() ||
                    readonly() ||
                    loading() ||
                    isOptionDisabled(option)
                  "
                  [attr.aria-selected]="isSelectedOption(option, $index)"
                  [attr.aria-disabled]="
                    disabled() ||
                    cvaDisabled() ||
                    readonly() ||
                    loading() ||
                    isOptionDisabled(option)
                  "
                  (click)="choose(option, $index)"
                  (keydown)="onOptionKeydown($event, option, $index)"
                >
                  {{ getOptionLabel(option) }}
                  @if (option.children?.length) {
                    ›
                  }
                </button>
              </li>
            }
          </ul>
        }
      </div>
    }
  </div>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-cascade{position:relative;display:block;width:100%}.trigger{display:flex;justify-content:space-between;width:100%;min-height:2.5rem;border:1px solid var(--orc-component-border-strong);border-radius:.45rem;background:var(--orc-component-surface);padding:.55rem .7rem;text-align:left}.levels{position:absolute;z-index:5;display:flex;top:calc(100% + .25rem);left:0;max-width:100%;border:1px solid var(--orc-component-border);border-radius:.45rem;background:var(--orc-component-surface);box-shadow:0 10px 24px var(--orc-component-shadow-color)}.levels ul{min-width:11rem;max-height:16rem;overflow:auto;margin:0;padding:.35rem;list-style:none}.levels button{display:flex;justify-content:space-between;width:100%;border:0;background:transparent;padding:.55rem;text-align:left}.levels button:hover:not(:disabled){background:var(--orc-component-interactive-soft)}.orc-cascade--small .trigger{min-height:2rem;padding:.35rem .5rem;font-size:.875rem}.orc-cascade--small .levels button{padding:.4rem .5rem;font-size:.875rem}.orc-cascade--large .trigger{min-height:3rem;padding:.75rem .9rem;font-size:1.125rem}.orc-cascade--large .levels button{padding:.7rem .8rem;font-size:1.125rem}.orc-cascade--filled .trigger{border-color:var(--orc-component-border);background:var(--orc-component-interactive-soft)}.orc-cascade--outlined .trigger{border-color:var(--orc-component-border-strong);background:var(--orc-component-surface)}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CascadeSelectComponent),
      multi: true,
    },
  ],
})
export class CascadeSelectComponent implements ControlValueAccessor {
  // Pass inputId when an id must remain stable across independently rendered SSR requests.
  private static nextGeneratedId = 0;
  readonly generatedId = `orc-cascade-select-${CascadeSelectComponent.nextGeneratedId++}`;
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);
  readonly options = input<CascadeOption[]>([]);
  readonly value = model<string | null>(null);
  readonly label = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly open = model(false);
  private readonly outsidePointerEffect = effect((onCleanup) => {
    if (!this.open()) return;
    const listener = (event: Event) => this.onDocumentPointerDown(event);
    this.document.addEventListener('pointerdown', listener);
    onCleanup(() => this.document.removeEventListener('pointerdown', listener));
  });
  readonly selected = signal<CascadeOption[]>([]);
  readonly optionSelect = output<CascadeOption>();
  readonly cvaDisabled = signal(false);
  private onModelChange: (value: string | null) => void = () => {};
  private onModelTouched: () => void = () => {};
  readonly optionLabel = input<string | undefined>(undefined);
  readonly optionValue = input<string | undefined>(undefined);
  readonly optionDisabled = input<string | undefined>(undefined);
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly tabindex = input(0);
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly autofocus = input(false, { transform: booleanAttribute });
  readonly styleClass = input('');
  readonly panelStyleClass = input('');
  readonly filter = input(false, { transform: booleanAttribute });
  readonly filterValue = model('');
  readonly filterPlaceholder = input<string | undefined>(undefined);
  readonly filterAriaLabel = input<string | undefined>(undefined);
  readonly clearAriaLabel = input<string | undefined>(undefined);
  readonly showClear = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly size = input<'small' | 'large' | undefined>(undefined);
  readonly variant = input<'outlined' | 'filled' | undefined>(undefined);
  readonly onChange = output<{ value: string | null }>();
  readonly onShow = output<void>();
  readonly onHide = output<void>();
  readonly onClear = output<void>();
  readonly levels = computed(() => {
    const result: CascadeOption[][] = [this.options()];
    const path = this.selected();
    const last = path[path.length - 1];
    if (last?.children?.length) result.push(last.children);
    const query = this.filterValue().trim().toLocaleLowerCase();
    return query
      ? result.map((level) =>
          level.filter((option) =>
            this.getOptionLabel(option).toLocaleLowerCase().includes(query),
          ),
        )
      : result;
  });
  readonly noResults = computed(() =>
    this.levels().every((level) => level.length === 0),
  );
  selectedLabel(): string {
    return this.selected()
      .map((item) => this.getOptionLabel(item))
      .join(' / ');
  }
  listboxId(level: number): string {
    return `${this.inputId() || this.generatedId}-listbox-${level}`;
  }
  isSelectedOption(option: CascadeOption, level: number): boolean {
    return this.selected()[level] === option;
  }
  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.open()) {
      event.preventDefault();
      this.closePanel(true);
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    if (!this.open()) {
      this.toggle();
      queueMicrotask(() =>
        this.focusOption(0, event.key === 'ArrowUp' ? 'last' : 'first'),
      );
    } else {
      this.focusOption(0, event.key === 'ArrowUp' ? 'last' : 'first');
    }
  }
  onPanelKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.open()) return;
    event.preventDefault();
    this.closePanel(true);
  }
  private onDocumentPointerDown(event: Event): void {
    const target = event.target;
    const NodeConstructor =
      this.host.nativeElement.ownerDocument.defaultView?.Node;
    if (
      this.open() &&
      !!NodeConstructor &&
      target instanceof NodeConstructor &&
      !(this.host.nativeElement as HTMLElement).contains(target as Node)
    ) {
      this.closePanel();
    }
  }
  private closePanel(restoreFocus = false): void {
    if (!this.open()) return;
    this.open.set(false);
    this.onHide.emit();
    if (restoreFocus) {
      (
        (this.host.nativeElement as HTMLElement).querySelector(
          '.trigger',
        ) as HTMLButtonElement | null
      )?.focus();
    }
  }
  onOptionKeydown(
    event: KeyboardEvent,
    option: CascadeOption,
    level: number,
  ): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closePanel(true);
      return;
    }
    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Home' ||
      event.key === 'End'
    ) {
      event.preventDefault();
      const list = (event.currentTarget as HTMLElement).closest(
        '[role="listbox"]',
      );
      const buttons = Array.from(
        list?.querySelectorAll<HTMLButtonElement>(
          'button[role="option"]:not(:disabled)',
        ) ?? [],
      );
      const index = buttons.indexOf(event.currentTarget as HTMLButtonElement);
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? buttons.length - 1
            : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) %
              buttons.length;
      buttons[next]?.focus();
      return;
    }
    if (event.key === 'ArrowRight' && option.children?.length) {
      event.preventDefault();
      this.choose(option, level);
      queueMicrotask(() => this.focusOption(level + 1, 'first'));
    }
    if (event.key === 'ArrowLeft' && level > 0) {
      event.preventDefault();
      this.focusOption(level - 1, 'selected');
    }
  }
  private focusOption(
    level: number,
    position: 'first' | 'last' | 'selected',
  ): void {
    const list = (this.host.nativeElement as HTMLElement).querySelector(
      `#${CSS.escape(this.listboxId(level))}`,
    ) as HTMLElement | null;
    const buttons = Array.from(
      list?.querySelectorAll('button[role="option"]:not(:disabled)') ?? [],
    ) as HTMLButtonElement[];
    const selectedIndex = buttons.findIndex(
      (button) => button.getAttribute('aria-selected') === 'true',
    );
    buttons[
      position === 'last'
        ? buttons.length - 1
        : position === 'selected' && selectedIndex >= 0
          ? selectedIndex
          : 0
    ]?.focus();
  }
  getOptionLabel(option: CascadeOption): string {
    const key = this.optionLabel();
    return String(key ? ((option as any)?.[key] ?? '') : (option.label ?? ''));
  }
  choose(option: CascadeOption, level: number): void {
    if (
      this.readonly() ||
      this.disabled() ||
      this.cvaDisabled() ||
      this.loading() ||
      this.isOptionDisabled(option)
    )
      return;
    const path = [...this.selected().slice(0, level), option];
    this.selected.set(path);
    if (option.children?.length) return;
    const value = this.getOptionValue(option);
    this.value.set(value);
    this.onModelChange(value);
    this.onModelTouched();
    this.optionSelect.emit(option);
    this.onChange.emit({ value });
    this.open.set(false);
    this.onHide.emit();
  }
  getOptionValue(option: CascadeOption): string {
    const key = this.optionValue();
    return String(key ? ((option as any)?.[key] ?? '') : option.value);
  }
  isOptionDisabled(option: CascadeOption): boolean {
    const key = this.optionDisabled();
    return Boolean(key ? (option as any)?.[key] : option.disabled);
  }
  toggle(): void {
    if (this.disabled() || this.cvaDisabled() || this.readonly()) return;
    const next = !this.open();
    this.open.set(next);
    if (next) this.onShow.emit();
    else this.onHide.emit();
  }
  clear(): void {
    if (this.disabled() || this.cvaDisabled() || this.readonly()) return;
    this.value.set(null);
    this.selected.set([]);
    this.filterValue.set('');
    this.onModelChange(null);
    this.onModelTouched();
    this.onClear.emit();
    this.onChange.emit({ value: null });
  }
  writeValue(value: string | null): void {
    this.value.set(value);
    this.selected.set(
      value == null ? [] : (this.findPath(this.options(), value) ?? []),
    );
  }
  registerOnChange(fn: (value: string | null) => void): void {
    this.onModelChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.cvaDisabled.set(disabled);
  }
  private findPath(
    options: CascadeOption[],
    value: string,
    path: CascadeOption[] = [],
  ): CascadeOption[] | undefined {
    for (const option of options) {
      const next = [...path, option];
      if (this.getOptionValue(option) === value) return next;
      if (option.children) {
        const found = this.findPath(option.children, value, next);
        if (found) return found;
      }
    }
    return undefined;
  }
}
