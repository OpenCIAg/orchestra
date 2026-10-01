import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  numberAttribute,
  output,
  signal,
  inject,
  effect,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  isTopOverlay,
  listenForOutsideInteraction,
  overlayAttachmentTarget,
  registerOverlay,
} from '@ciag/orchestra/internal';
import { AutocompleteOption } from './autocomplete.types';

let nextAutocompleteId = 0;

@Component({
  selector: 'orc-autocomplete',
  standalone: true,
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true,
    },
  ],
})
export class AutocompleteComponent implements ControlValueAccessor {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly uniqueId = `orc-autocomplete-${++nextAutocompleteId}`;
  private lastValue: string | null = null;
  private readonly editing = signal(false);
  private blurTimeout: ReturnType<typeof setTimeout> | null = null;
  private openTimeout: ReturnType<typeof setTimeout> | null = null;
  private composing = false;
  private readonly panel = viewChild<ElementRef<HTMLUListElement>>('panel');
  private outsideCleanup: (() => void) | null = null;
  private layerCleanup: (() => void) | null = null;
  private positionCleanup: (() => void) | null = null;

  private get ownerDocument(): Document {
    return this.host.nativeElement.ownerDocument ?? this.document;
  }

  readonly id = input('');
  readonly inputId = input<string | undefined>(undefined);
  readonly name = input('');
  readonly label = input('');
  readonly placeholder = input<string | undefined>(undefined);
  readonly helperText = input('');
  readonly errorMessage = input('');
  readonly options = input<AutocompleteOption[]>([]);
  readonly suggestions = input<AutocompleteOption[] | undefined>(undefined);
  readonly minChars = input(0, { transform: numberAttribute });
  readonly minLength = input<number | undefined, unknown>(undefined, {
    transform: numberAttribute,
  });
  readonly clearable = input(true, { transform: booleanAttribute });
  readonly showClear = input<boolean | undefined, unknown>(undefined, {
    transform: booleanAttribute,
  });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly dropdown = input(false, { transform: booleanAttribute });
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly loadingMessage = input('Loading…');
  readonly clearAriaLabel = input<string | undefined>(undefined);
  readonly dropdownAriaLabel = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly styleClass = input('');
  readonly panelStyle = input<Record<string, any> | null | undefined>(
    undefined,
  );
  readonly panelStyleClass = input('');
  readonly appendTo = input<unknown>(undefined);
  readonly delay = input(300, { transform: numberAttribute });
  readonly forceSelection = input(false, { transform: booleanAttribute });
  readonly autoHighlight = input(false, { transform: booleanAttribute });
  readonly showEmptyMessage = input(true, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });

  readonly value = model<string | null>(null);
  readonly query = signal('');
  private readonly filterQuery = signal('');
  readonly isOpen = signal(false);
  readonly activeIndex = signal(-1);
  readonly optionSelected = output<AutocompleteOption>();
  readonly onChange = output<{ value: string | null }>();
  readonly onClear = output<void>();
  readonly onShow = output<void>();
  readonly onHide = output<void>();
  readonly onFocusEvent = output<Event>();
  readonly onBlurEvent = output<Event>();
  private readonly cvaDisabled = signal(false);

  readonly effectiveId = computed(
    () => this.inputId() || this.id() || this.uniqueId,
  );
  readonly listId = computed(() => `${this.effectiveId()}-list`);
  readonly effectiveDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );
  readonly effectiveReadonly = computed(
    () => this.readonly() && !this.effectiveDisabled(),
  );
  readonly effectiveOptions = computed(
    () => this.suggestions() ?? this.options(),
  );
  readonly effectiveMinLength = computed(
    () => this.minLength() ?? this.minChars(),
  );
  readonly effectiveShowClear = computed(
    () => this.showClear() ?? this.clearable(),
  );
  readonly selectedLabel = computed(
    () =>
      this.effectiveOptions().find((option) => option.value === this.value())
        ?.label ?? '',
  );
  readonly displayText = computed(() =>
    this.editing()
      ? this.query()
      : this.selectedLabel() || this.value() || this.query(),
  );
  readonly panelVisible = computed(
    () =>
      this.isOpen() &&
      (this.filteredOptions().length > 0 ||
        this.loading() ||
        this.showEmptyMessage()),
  );
  readonly filteredOptions = computed(() => {
    const query = this.filterQuery().trim().toLocaleLowerCase();
    if (query.length < this.effectiveMinLength()) return [];
    return this.effectiveOptions().filter(
      (option) =>
        option.label.toLocaleLowerCase().includes(query) ||
        option.value.toLocaleLowerCase().includes(query),
    );
  });
  readonly describedBy = computed(() =>
    this.errorMessage()
      ? `${this.effectiveId()}-error`
      : this.helperText()
        ? `${this.effectiveId()}-helper`
        : null,
  );

  private cvaChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const value = this.value();
      if (value !== this.lastValue) {
        this.lastValue = value;
        this.editing.set(false);
        this.query.set('');
        this.filterQuery.set('');
        this.activeIndex.set(-1);
      }
    });
    effect((onCleanup) => {
      const panel = this.panel()?.nativeElement;
      const open = this.isOpen();
      const unavailable = this.effectiveDisabled() || this.readonly();
      const requestedParent = this.appendTo();
      if (unavailable) {
        this.clearOpenTimeout();
        if (open) this.closeDropdown();
        return;
      }
      if (!panel || !open) return;

      const parent = overlayAttachmentTarget(
        this.host.nativeElement,
        requestedParent,
        this.host.nativeElement,
      );
      if (parent !== this.host.nativeElement && panel.parentElement !== parent)
        parent.appendChild(panel);
      this.positionPanel(panel, parent);
      this.layerCleanup = registerOverlay(panel, {
        anchor: this.host.nativeElement,
        onParentClose: () => this.closeDropdown(),
      });
      this.outsideCleanup = listenForOutsideInteraction(
        this.ownerDocument,
        () => [this.host.nativeElement, panel],
        () => {
          if (isTopOverlay(panel)) this.closeDropdown();
        },
      );
      const reposition = () => this.positionPanel(panel, parent);
      const ResizeObserverConstructor =
        this.ownerDocument.defaultView?.ResizeObserver;
      const resize = ResizeObserverConstructor
        ? new ResizeObserverConstructor(reposition)
        : null;
      resize?.observe(panel);
      resize?.observe(this.host.nativeElement);
      this.ownerDocument.addEventListener('scroll', reposition, true);
      this.ownerDocument.defaultView?.addEventListener('resize', reposition);
      this.positionCleanup = () => {
        resize?.disconnect();
        this.ownerDocument.removeEventListener('scroll', reposition, true);
        this.ownerDocument.defaultView?.removeEventListener(
          'resize',
          reposition,
        );
      };

      onCleanup(() => {
        this.positionCleanup?.();
        this.positionCleanup = null;
        this.outsideCleanup?.();
        this.outsideCleanup = null;
        this.layerCleanup?.();
        this.layerCleanup = null;
        this.resetPanelPosition(panel);
        // Angular tracks the view, but cannot remove a root moved out of its
        // original parent during every destruction path.
        if (parent !== this.host.nativeElement) panel.remove();
      });
    });
    this.destroyRef.onDestroy(() => {
      this.clearBlurTimeout();
      this.clearOpenTimeout();
      this.outsideCleanup?.();
      this.layerCleanup?.();
      this.positionCleanup?.();
    });
  }

  writeValue(value: unknown): void {
    this.setInternalValue(
      value === null || value === undefined ? null : String(value),
    );
    this.query.set('');
    this.filterQuery.set('');
    this.editing.set(false);
    this.activeIndex.set(-1);
  }
  registerOnChange(fn: (value: string | null) => void): void {
    this.cvaChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.cvaDisabled.set(disabled);
  }

  onInput(event: Event): void {
    if (this.effectiveDisabled() || this.readonly()) return;
    const text = (event.target as HTMLInputElement).value;
    if (this.composing) {
      // Keep the native composition text visible and searchable only after the
      // IME has committed it. Committing intermediate input events can clear a
      // valid selection or open a panel for an incomplete grapheme.
      this.editing.set(true);
      this.query.set(text);
      this.activeIndex.set(-1);
      return;
    }
    this.applyInputValue(text);
  }

  onCompositionStart(): void {
    if (this.effectiveDisabled() || this.readonly()) return;
    this.composing = true;
    this.clearOpenTimeout();
    this.activeIndex.set(-1);
  }

  onCompositionEnd(event: Event): void {
    if (!this.composing) return;
    this.composing = false;
    if (this.effectiveDisabled() || this.readonly()) return;
    const target = event.target as HTMLInputElement | null;
    this.applyInputValue(target?.value ?? this.query());
  }

  private applyInputValue(text: string): void {
    this.clearOpenTimeout();
    this.filterQuery.set(text);
    const selectedLabel = this.selectedLabel();
    this.editing.set(true);
    this.query.set(text);
    const nextValue = this.forceSelection()
      ? text === selectedLabel
        ? this.value()
        : null
      : text || null;
    if (nextValue !== this.value()) {
      this.setInternalValue(nextValue);
      this.cvaChange(nextValue);
      this.onChange.emit({ value: nextValue });
    }
    this.activeIndex.set(-1);
    if (text.trim().length >= this.effectiveMinLength()) {
      const open = () => {
        this.openTimeout = null;
        this.openDropdown();
        this.activeIndex.set(
          this.autoHighlight() ? this.firstEnabledIndex() : -1,
        );
      };
      const delay = Number(this.delay());
      if (Number.isFinite(delay) && delay > 0)
        this.openTimeout = setTimeout(open, delay);
      else open();
    } else {
      this.closeDropdown();
      this.activeIndex.set(-1);
    }
  }

  onFocus(event?: Event): void {
    this.clearBlurTimeout();
    if (
      !this.effectiveDisabled() &&
      !this.readonly() &&
      (this.dropdown() ||
        this.query().trim().length >= this.effectiveMinLength())
    ) {
      this.openDropdown();
      if (this.autoHighlight()) this.activeIndex.set(this.firstEnabledIndex());
    }
    if (event) this.onFocusEvent.emit(event);
  }

  toggleDropdown(event?: Event): void {
    event?.preventDefault();
    if (this.effectiveDisabled() || this.readonly()) return;
    this.clearOpenTimeout();
    this.clearBlurTimeout();
    if (this.isOpen()) {
      this.closeDropdown();
      return;
    }
    this.openDropdown();
    this.activeIndex.set(this.firstEnabledIndex());
  }

  onBlur(event?: Event): void {
    this.clearOpenTimeout();
    this.onTouched();
    if (this.forceSelection() && !this.composing) {
      const query = this.query();
      const selected = this.effectiveOptions().find(
        (option) =>
          !option.disabled &&
          (query ? option.label === query : option.value === this.value()),
      );
      if (selected && selected.value !== this.value()) this.select(selected);
      else if (!selected && (this.value() !== null || query)) this.clear();
    }
    this.editing.set(false);
    this.clearBlurTimeout();
    this.blurTimeout = setTimeout(() => {
      this.blurTimeout = null;
      this.closeDropdown();
    }, 120);
    if (event) this.onBlurEvent.emit(event);
  }

  select(option: AutocompleteOption): void {
    if (option.disabled || this.effectiveDisabled() || this.readonly()) return;
    this.clearBlurTimeout();
    this.setInternalValue(option.value);
    this.editing.set(false);
    this.query.set(option.label);
    this.filterQuery.set(option.label);
    this.closeDropdown();
    this.cvaChange(option.value);
    this.onChange.emit({ value: option.value });
    this.onTouched();
    this.optionSelected.emit(option);
  }

  clear(event?: Event): void {
    event?.preventDefault();
    if (this.effectiveDisabled() || this.readonly()) return;
    this.clearBlurTimeout();
    this.setInternalValue(null);
    this.editing.set(false);
    this.query.set('');
    this.filterQuery.set('');
    this.closeDropdown();
    this.cvaChange(null);
    this.onChange.emit({ value: null });
    this.onClear.emit();
    this.onTouched();
  }

  onDocumentClick(event: MouseEvent): void {
    this.clearBlurTimeout();
    const panel = this.panel()?.nativeElement;
    if (
      !this.host.nativeElement.contains(event.target as Node) &&
      !panel?.contains(event.target as Node) &&
      (!panel || isTopOverlay(panel))
    )
      this.closeDropdown();
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.effectiveDisabled() || this.readonly()) return;
    if (this.composing || event.isComposing || event.keyCode === 229) return;
    const options = this.filteredOptions();
    if (event.key === 'Escape' && this.closeOnEscape() && this.isOpen()) {
      const panel = this.panel()?.nativeElement;
      if (panel && !isTopOverlay(panel)) return;
      event.preventDefault();
      event.stopPropagation();
      this.closeDropdown();
      return;
    }
    if (event.key === 'ArrowDown') {
      if (this.moveActive(1)) event.preventDefault();
      return;
    }
    if (event.key === 'ArrowUp') {
      if (this.moveActive(-1)) event.preventDefault();
      return;
    }
    if (event.key === 'Home' && this.isOpen()) {
      if (this.moveToBoundary('first')) event.preventDefault();
      return;
    }
    if (event.key === 'End' && this.isOpen()) {
      if (this.moveToBoundary('last')) event.preventDefault();
      return;
    }
    if (event.key === 'Enter' && this.isOpen() && this.activeIndex() >= 0) {
      const option = options[this.activeIndex()];
      if (option && !option.disabled) {
        event.preventDefault();
        this.select(option);
      }
    }
  }

  optionId(index: number): string {
    return `${this.effectiveId()}-option-${index}`;
  }

  private moveActive(direction: -1 | 1): boolean {
    const options = this.filteredOptions();
    if (!options.length) return false;
    let index = this.activeIndex();
    if (index < 0) index = direction === 1 ? -1 : 0;
    for (let i = 0; i < options.length; i += 1) {
      index = (index + direction + options.length) % options.length;
      if (!options[index]?.disabled) {
        this.activeIndex.set(index);
        this.openDropdown();
        return true;
      }
    }
    return false;
  }

  private moveToBoundary(direction: 'first' | 'last'): boolean {
    const options = this.filteredOptions();
    let index = -1;
    if (direction === 'first') {
      index = options.findIndex((option) => !option.disabled);
    } else {
      for (let i = options.length - 1; i >= 0; i -= 1) {
        if (!options[i]?.disabled) {
          index = i;
          break;
        }
      }
    }
    if (index < 0) return false;
    this.activeIndex.set(index);
    this.openDropdown();
    return true;
  }

  private firstEnabledIndex(): number {
    return this.filteredOptions().findIndex((option) => !option.disabled);
  }

  private openDropdown(): void {
    if (this.effectiveDisabled() || this.readonly() || this.isOpen()) return;
    this.isOpen.set(true);
    this.onShow.emit();
  }

  private closeDropdown(): void {
    this.clearOpenTimeout();
    if (!this.isOpen()) {
      this.activeIndex.set(-1);
      return;
    }
    this.isOpen.set(false);
    this.activeIndex.set(-1);
    if (!this.destroyRef.destroyed) this.onHide.emit();
  }

  private setInternalValue(value: string | null): void {
    this.lastValue = value;
    this.value.set(value);
  }

  private clearBlurTimeout(): void {
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
      this.blurTimeout = null;
    }
  }

  private clearOpenTimeout(): void {
    if (this.openTimeout) {
      clearTimeout(this.openTimeout);
      this.openTimeout = null;
    }
  }

  private positionPanel(panel: HTMLElement, parent: HTMLElement): void {
    if (parent === this.host.nativeElement) return;
    const anchor = this.host.nativeElement
      .querySelector('.orc-autocomplete__control')!
      .getBoundingClientRect();
    const ownerDocument = this.ownerDocument;
    const isBody = parent === ownerDocument.body;
    panel.classList.add('orc-autocomplete__list--detached');
    panel.style.inset = 'auto';
    panel.style.position = isBody ? 'fixed' : 'absolute';
    panel.style.width = `${anchor.width}px`;
    // A custom append target can be statically positioned. Absolute coordinates
    // belong to the actual containing block, not necessarily the DOM parent.
    const containingBlock = panel.offsetParent as HTMLElement | null;
    const parentRect = containingBlock?.getBoundingClientRect();
    const rootBlock =
      !containingBlock ||
      containingBlock === ownerDocument.body ||
      containingBlock === ownerDocument.documentElement;
    const offsetLeft = isBody
      ? 0
      : rootBlock
        ? -(ownerDocument.defaultView?.scrollX ?? 0)
        : parentRect!.left +
          containingBlock.clientLeft -
          containingBlock.scrollLeft;
    const offsetTop = isBody
      ? 0
      : rootBlock
        ? -(ownerDocument.defaultView?.scrollY ?? 0)
        : parentRect!.top +
          containingBlock.clientTop -
          containingBlock.scrollTop;
    const viewportHeight = ownerDocument.documentElement.clientHeight;
    const viewportWidth = ownerDocument.documentElement.clientWidth;
    const height = panel.getBoundingClientRect().height;
    const top =
      anchor.bottom + height > viewportHeight - 8 && anchor.top >= height + 8
        ? anchor.top - height
        : anchor.bottom - 1;
    const left = Math.max(
      8,
      Math.min(
        anchor.left,
        viewportWidth - panel.getBoundingClientRect().width - 8,
      ),
    );
    panel.style.left = `${left - offsetLeft}px`;
    panel.style.top = `${Math.max(8, top) - offsetTop}px`;
  }

  private resetPanelPosition(panel: HTMLElement): void {
    panel.classList.remove('orc-autocomplete__list--detached');
    panel.style.removeProperty('position');
    panel.style.removeProperty('left');
    panel.style.removeProperty('top');
    panel.style.removeProperty('width');
    panel.style.removeProperty('right');
    panel.style.removeProperty('inset');
  }
}
