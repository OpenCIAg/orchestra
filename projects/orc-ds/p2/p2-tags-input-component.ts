import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { P2_SHARED_STYLES } from './p2-shared';

let nextTagsInputId = 0;

@Component({
  selector: 'orc-tags-input, orc-chips, orc-input-chips',
  standalone: true,
  template: `
    <div
      class="p-chips p-component orc-p2-tags-input"
      [class]="'p-chips p-component orc-p2-tags-input ' + styleClass()"
      [style]="style()"
      [attr.data-pc-name]="'chips'"
      (focusout)="onCompositeFocusOut($event)"
    >
      @if (label()) {
        <label [for]="effectiveId()">{{ label() }}</label>
      }
      <div
        class="p-chips-multiple-container input-shell"
        [class.is-disabled]="effectiveDisabled()"
      >
        @for (tag of value(); track $index) {
          <span
            class="p-chips-token tag"
            (click)="
              onChipClick.emit({
                value: tag,
                index: $index,
                originalEvent: $event,
              })
            "
            >{{ tag }}
            @if (removeAriaLabel()) {
              <button
                type="button"
                [disabled]="effectiveDisabled()"
                [attr.aria-label]="removeAriaLabel()"
                (click)="removeTag($index); $event.stopPropagation()"
              >
                ×
              </button>
            }
          </span>
        }
        <input
          [id]="effectiveId()"
          [attr.placeholder]="value().length ? null : placeholder() || null"
          [disabled]="effectiveDisabled()"
          [value]="draft()"
          [attr.maxlength]="maxLength() ?? null"
          [attr.aria-label]="ariaLabel() || null"
          [attr.aria-controls]="effectiveId() + '-panel'"
          [attr.aria-expanded]="suggestionsVisible()"
          [attr.aria-activedescendant]="activeSuggestionId()"
          (input)="onDraftInput($event)"
          (paste)="onPaste($event)"
          (keydown)="onKeydown($event)"
          (focus)="onFocus.emit($event)"
          (blur)="onBlur.emit($event); onBlurCommit()"
        />
      </div>
      @if (suggestionsVisible()) {
        <ul
          class="p-chips-panel p-component suggestions"
          [id]="effectiveId() + '-panel'"
          role="listbox"
        >
          @for (
            suggestion of filteredSuggestions();
            track suggestion;
            let index = $index
          ) {
            <li
              class="p-chips-option"
              [id]="suggestionId(index)"
              role="option"
              [attr.aria-selected]="activeSuggestionIndex() === index"
              (mousedown)="$event.preventDefault()"
              (click)="addTag(suggestion)"
            >
              {{ suggestion }}
            </li>
          }
        </ul>
      }
      @if (showClear() && value().length && clearAriaLabel()) {
        <button
          type="button"
          [disabled]="effectiveDisabled()"
          (click)="clear($event)"
          [attr.aria-label]="clearAriaLabel()"
        >
          ×
        </button>
      }
      @if (helperText()) {
        <small>{{ helperText() }}</small>
      }
    </div>
  `,
  styles: [
    P2_SHARED_STYLES +
      `
    .orc-p2-tags-input { position: relative; display: grid; gap: .35rem; color: var(--orc-component-text); } label { font-size: .875rem; font-weight: 600; } .input-shell { display: flex; flex-wrap: wrap; gap: .35rem; align-items: center; min-height: 2.5rem; padding: .35rem .5rem; border: 1px solid var(--orc-component-border-strong); border-radius: .5rem; background: var(--orc-component-control); } .input-shell.is-disabled { background: var(--orc-component-surface-subtle); } input { min-width: 6rem; flex: 1; border: 0; outline: 0; background: transparent; color: var(--orc-component-text); } .tag { display: inline-flex; align-items: center; gap: .2rem; padding: .2rem .45rem; border-radius: 999px; background: var(--orc-component-interactive-soft); color: var(--orc-component-interactive-hover); font-size: .8rem; } .tag button { border: 0; padding: 0; background: transparent; color: inherit; } small { color: var(--orc-component-text-muted); font-weight: 400; } .suggestions { position: absolute; z-index: 2; top: 4.2rem; right: 0; left: 0; margin: 0; padding: .25rem; border: 1px solid var(--orc-component-border-strong); border-radius: .5rem; background: var(--orc-component-surface-raised); box-shadow: var(--orc-component-overlay-shadow); list-style: none; } .suggestions li { padding: .5rem .65rem; cursor: pointer; } .suggestions li:hover { background: var(--orc-component-interactive-soft); }
  `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagsInputComponent),
      multi: true,
    },
  ],
})
export class TagsInputComponent implements ControlValueAccessor {
  private readonly uniqueId = `orc-chips-${++nextTagsInputId}`;
  readonly value = model<string[]>([]);
  readonly draft = signal('');
  readonly label = input('');
  readonly placeholder = input<string | undefined>(undefined);
  readonly helperText = input('');
  readonly suggestions = input<string[]>([]);
  readonly maxTags = input<number | undefined>(undefined);
  readonly max = input<number | undefined>(undefined, { alias: 'max' });
  readonly maxLength = input<number | undefined, unknown>(undefined, {
    transform: (value) => {
      if (value === undefined || value === null) return undefined;
      const limit = numberAttribute(value);
      return Number.isFinite(limit) && limit >= 0
        ? Math.floor(limit)
        : undefined;
    },
  });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly allowDuplicate = input(false, { transform: booleanAttribute });
  readonly caseSensitiveDuplication = input(false, {
    transform: booleanAttribute,
  });
  readonly addOnTab = input(false, { transform: booleanAttribute });
  readonly addOnBlur = input(false, { transform: booleanAttribute });
  readonly separator = input<string | RegExp | undefined>(undefined);
  readonly showClear = input(false, { transform: booleanAttribute });
  readonly removeAriaLabel = input<string | undefined>(undefined);
  readonly clearAriaLabel = input<string | undefined>(undefined);
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input('');
  readonly tagAdded = output<string>();
  readonly tagRemoved = output<string>();
  readonly onAdd = output<{ value: string }>();
  readonly onRemove = output<{ value: string; index: number }>();
  readonly onFocus = output<Event>();
  readonly onBlur = output<Event>();
  readonly onChipClick = output<{
    value: string;
    index: number;
    originalEvent: Event;
  }>();
  readonly onClear = output<Event>();
  protected readonly cvaDisabled = signal(false);
  readonly activeSuggestionIndex = signal(-1);
  readonly suggestionsDismissed = signal(false);
  readonly effectiveId = computed(() => this.inputId() || this.uniqueId);
  private onChange: (value: string[]) => void = () => undefined;
  private onTouchedCallback: () => void = () => undefined;

  readonly filteredSuggestions = computed(() => {
    const query = this.draft().trim().toLocaleLowerCase();
    return this.suggestions()
      .filter(
        (item) =>
          this.canAddTag(item) &&
          item.trim().toLocaleLowerCase().includes(query),
      )
      .slice(0, 8);
  });
  readonly suggestionsVisible = computed(
    () =>
      !this.effectiveDisabled() &&
      !this.suggestionsDismissed() &&
      Boolean(this.draft()) &&
      this.filteredSuggestions().length > 0,
  );
  readonly activeSuggestionId = computed(() =>
    this.suggestionsVisible() && this.activeSuggestionIndex() >= 0
      ? this.suggestionId(this.activeSuggestionIndex())
      : null,
  );

  writeValue(value: string[] | null): void {
    this.value.set(Array.isArray(value) ? [...value] : []);
    this.activeSuggestionIndex.set(-1);
  }
  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.cvaDisabled.set(disabled);
  }
  readonly effectiveDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );
  suggestionId(index: number): string {
    return `${this.effectiveId()}-option-${index}`;
  }
  onDraftInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
    this.activeSuggestionIndex.set(-1);
    this.suggestionsDismissed.set(false);
  }
  onPaste(event: ClipboardEvent): void {
    if (this.effectiveDisabled()) return;
    const pastedText = event.clipboardData?.getData('text') ?? '';
    if (!pastedText) return;

    event.preventDefault();
    const separator = this.separator();
    const tokens = (
      typeof separator === 'string' && separator.length > 0
        ? pastedText.split(separator)
        : separator instanceof RegExp
          ? pastedText.split(new RegExp(separator.source, separator.flags))
          : pastedText.split(/[\r\n,]+/)
    )
      .map((item) => item.trim())
      .filter(Boolean);

    const next = [...this.value()];
    const added: string[] = [];
    for (const token of tokens) {
      if (!this.canAddTag(token, next)) continue;
      next.push(token);
      added.push(token);
    }
    if (!added.length) return;

    this.value.set(next);
    this.draft.set('');
    this.activeSuggestionIndex.set(-1);
    this.suggestionsDismissed.set(false);
    this.onChange(next);
    for (const tag of added) {
      this.tagAdded.emit(tag);
      this.onAdd.emit({ value: tag });
    }
  }
  onKeydown(event: KeyboardEvent): void {
    if (this.effectiveDisabled()) return;
    if (event.isComposing || event.keyCode === 229) return;
    const suggestions = this.filteredSuggestions();
    if (
      (event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
      suggestions.length
    ) {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const current = this.activeSuggestionIndex();
      this.activeSuggestionIndex.set(
        (current + delta + suggestions.length) % suggestions.length,
      );
      return;
    }
    if (event.key === 'Escape' && this.suggestionsVisible()) {
      event.preventDefault();
      this.activeSuggestionIndex.set(-1);
      this.suggestionsDismissed.set(true);
      return;
    }
    if (
      event.key === 'Enter' &&
      this.activeSuggestionIndex() >= 0 &&
      suggestions[this.activeSuggestionIndex()]
    ) {
      event.preventDefault();
      this.addTag(suggestions[this.activeSuggestionIndex()]);
      return;
    }
    const separatorPressed = this.matchesSeparator(this.separator(), event.key);
    if (event.key === 'Tab' && this.addOnTab()) {
      // Commit the draft without trapping keyboard users in the input. Tab's
      // native focus navigation must remain available after adding the tag.
      this.addTag(this.draft().trim());
      return;
    }
    if (event.key === 'Enter' || separatorPressed) {
      event.preventDefault();
      this.addTag(this.draft().trim());
    }
    if (event.key === 'Backspace' && !this.draft() && this.value().length) {
      this.removeTag(this.value().length - 1);
      event.preventDefault();
    }
  }
  onBlurCommit(): void {
    if (this.addOnBlur()) this.addTag(this.draft().trim());
  }
  onCompositeFocusOut(event: FocusEvent): void {
    const container = event.currentTarget as HTMLElement | null;
    const nextFocused = event.relatedTarget as Node | null;
    if (nextFocused && container?.contains(nextFocused)) return;
    this.onTouched();
  }
  addTag(tag: string): void {
    const normalized = tag.trim();
    if (!this.canAddTag(normalized)) return;
    const next = [...this.value(), normalized];
    this.value.set(next);
    this.draft.set('');
    this.activeSuggestionIndex.set(-1);
    this.suggestionsDismissed.set(false);
    this.onChange(next);
    this.tagAdded.emit(normalized);
    this.onAdd.emit({ value: normalized });
  }
  private canAddTag(tag: string, current = this.value()): boolean {
    const normalized = tag.trim();
    if (!normalized || this.effectiveDisabled()) return false;
    const maxLength = this.maxLength();
    if (maxLength !== undefined && normalized.length > maxLength) return false;
    const max = this.max() ?? this.maxTags();
    if (max !== undefined && current.length >= max) return false;
    return this.allowDuplicate() || !this.hasTag(normalized, current);
  }
  private hasTag(tag: string, current = this.value()): boolean {
    const candidate = this.caseSensitiveDuplication()
      ? tag
      : tag.toLocaleLowerCase();
    return current.some(
      (item) =>
        (this.caseSensitiveDuplication() ? item : item.toLocaleLowerCase()) ===
        candidate,
    );
  }
  private matchesSeparator(
    separator: string | RegExp | undefined,
    key: string,
  ): boolean {
    if (typeof separator === 'string') return key === separator;
    if (separator instanceof RegExp) {
      // A fresh instance preserves the configured expression while isolating lastIndex
      // for global and sticky expressions across repeated key presses.
      return new RegExp(separator.source, separator.flags).test(key);
    }
    return false;
  }
  removeTag(index: number): void {
    if (this.effectiveDisabled()) return;
    const removed = this.value()[index];
    if (removed === undefined) return;
    const next = this.value().filter((_, current) => current !== index);
    this.value.set(next);
    this.activeSuggestionIndex.set(-1);
    this.onChange(next);
    this.tagRemoved.emit(removed);
    this.onRemove.emit({ value: removed, index });
  }
  clear(event: Event): void {
    if (this.effectiveDisabled()) return;
    this.value.set([]);
    this.draft.set('');
    this.activeSuggestionIndex.set(-1);
    this.suggestionsDismissed.set(false);
    this.onChange([]);
    this.onClear.emit(event);
  }
  onTouched(): void {
    this.onTouchedCallback();
  }
}
