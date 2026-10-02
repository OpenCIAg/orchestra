// src/app/shared/select/select.component.ts

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  effect,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import {
  CvaControl,
  isTopOverlay,
  listenForOutsideInteraction,
  overlayAttachmentTarget,
  registerOverlay,
} from '@ciag/orchestra/internal';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  Overlay,
  OverlayConfig,
  OverlayRef,
  PositionStrategy,
  ConnectedPosition,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { SelectOption } from './select-option.model';
import { SelectStatus } from './select.types';
import { OptionComponent } from './option.component';
import { SELECT_HOST } from './select.tokens';

let nextSelectUniqueId = 0;

@Component({
  selector: 'orc-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: SELECT_HOST, useExisting: forwardRef(() => SelectComponent) },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent
  extends CvaControl
  implements AfterViewInit, OnDestroy
{
  private readonly uniqueId = `orc-select-${++nextSelectUniqueId}`;
  private hostEl = inject(ElementRef);
  private viewContainerRef = inject(ViewContainerRef);
  private overlay = inject(Overlay);
  private readonly document = inject(DOCUMENT);

  // ── Overlay References ─────────────────────────────────────
  private overlayRef: OverlayRef | null = null;
  private portal!: TemplatePortal<unknown>;
  private layerCleanup?: () => void;
  private outsideCleanup?: () => void;
  private focusTimer?: ReturnType<typeof setTimeout>;
  private blurTimer?: ReturnType<typeof setTimeout>;

  // ── Element Signals ────────────────────────────────────────
  readonly triggerEl = viewChild<ElementRef<HTMLDivElement>>('triggerEl');
  readonly searchInputRef =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');
  readonly dropdownPanel =
    viewChild.required<TemplateRef<unknown>>('dropdownPanel');

  // ── Content Children Options ───────────────────────────────
  readonly projectedOptions = contentChildren<OptionComponent>(
    forwardRef(() => OptionComponent),
    { descendants: true },
  );

  // ── Signal Inputs ──────────────────────────────────────────
  readonly id = input<string>('');
  readonly name = input<string>('');
  readonly placeholder = input<string | undefined>(undefined);
  readonly label = input<string>('');
  readonly helperText = input<string>('');
  readonly errorMessage = input<string>('');
  readonly status = input<SelectStatus>('default');
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly searchable = input(false, { transform: booleanAttribute });
  readonly searchPlaceholder = input<string | undefined>(undefined);
  readonly searchEmptyText = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly options = input<SelectOption[] | undefined>(undefined);
  // PrimeNG Select public inputs (the Orchestra names remain supported).
  readonly optionLabel = input<string | undefined>(undefined);
  readonly optionValue = input<string | undefined>(undefined);
  readonly optionDisabled = input<string | undefined>(undefined);
  readonly filter = input<boolean | undefined, unknown>(undefined, {
    transform: (value: unknown) =>
      value === undefined || value === null
        ? undefined
        : booleanAttribute(value),
  });
  readonly filterPlaceholder = input('');
  readonly filterLocale = input<string | undefined>(undefined);
  readonly filterBy = input<string | undefined>(undefined);
  readonly filterFields = input<string[] | undefined>(undefined);
  readonly filterMatchMode = input<
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'equals'
    | 'notEquals'
    | 'in'
    | 'lt'
    | 'lte'
    | 'gt'
    | 'gte'
  >('contains');
  readonly emptyFilterMessage = input<string | undefined>(undefined);
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly showClear = input(false, { transform: booleanAttribute });
  readonly inputId = input<string | undefined>(undefined);
  readonly style = input<Record<string, string> | undefined>(undefined);
  readonly styleClass = input('');
  readonly panelStyle = input<Record<string, string> | undefined>(undefined);
  readonly panelStyleClass = input('');
  readonly appendTo = input<unknown>(undefined);
  /**
   * @deprecated Compatibility input only; overlay options are not interpreted
   * by this implementation. Use the supported `appendTo` input for placement.
   */
  readonly overlayOptions = input<Record<string, unknown> | undefined>(
    undefined,
  );
  readonly tabindex = input<number | undefined>(undefined);
  readonly variant = input<'filled' | 'outlined'>('outlined');
  readonly size = input<'small' | 'large' | undefined>(undefined);
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly loadingIcon = input<string | undefined>(undefined);
  readonly loadingMessage = input<string | undefined>(undefined);
  readonly autofocus = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; the filter is focused when opened. */
  readonly autofocusFilter = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; editable text entry is not supported. */
  readonly editable = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; selected options always render a checkmark. */
  readonly checkmark = input(false, { transform: booleanAttribute });
  readonly dropdownIcon = input('');
  /** @deprecated Compatibility input only; grouped option data is not rendered. */
  readonly optionGroupLabel = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; grouped option data is not rendered. */
  readonly optionGroupChildren = input<string>('items');
  /** @deprecated Compatibility input only; the first option is not auto-selected. */
  readonly autoDisplayFirst = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; option groups are not rendered. */
  readonly group = input(false, { transform: booleanAttribute });
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly virtualScroll = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; virtual scrolling is not implemented. */
  readonly virtualScrollItemSize = input<number | undefined>(undefined);
  /** @deprecated Compatibility input only; virtual scrolling is not implemented. */
  readonly virtualScrollOptions = input<Record<string, unknown> | undefined>(
    undefined,
  );
  /** @deprecated Compatibility input only; virtual scrolling is not implemented. */
  readonly itemSize = input<number | undefined>(undefined);
  readonly dataKey = input<string | undefined>(undefined);
  readonly autoZIndex = input(true, { transform: booleanAttribute });
  readonly baseZIndex = input(0);
  readonly focusOnHover = input(true, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; focus does not select an option. */
  readonly selectOnFocus = input(false, { transform: booleanAttribute });
  readonly autoOptionFocus = input(false, { transform: booleanAttribute });
  readonly maxlength = input<number | undefined>(undefined);
  /** @deprecated Compatibility input only; panel transitions use library CSS. */
  readonly showTransitionOptions = input<string | undefined>(undefined);
  /** @deprecated Compatibility input only; panel transitions use library CSS. */
  readonly hideTransitionOptions = input<string | undefined>(undefined);
  readonly resetFilterOnHide = input(true, { transform: booleanAttribute });
  /** @deprecated Compatibility input only; tooltip rendering is not provided. */
  readonly tooltip = input('');
  /** @deprecated Compatibility input only; tooltip rendering is not provided. */
  readonly tooltipPosition = input<'top' | 'left' | 'right' | 'bottom'>(
    'right',
  );
  /** @deprecated Compatibility input only; tooltip rendering is not provided. */
  readonly tooltipPositionStyle = input('absolute');
  /** @deprecated Compatibility input only; tooltip rendering is not provided. */
  readonly tooltipStyleClass = input<string | undefined>(undefined);
  readonly scrollHeight = input('200px');

  // Acessibilidade WCAG
  readonly ariaLabel = input<string>('');
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly ariaFilterLabel = input<string | undefined>(undefined);
  readonly clearAriaLabel = input<string | undefined>(undefined);
  readonly removeOptionAriaLabel = input<string | undefined>(undefined);
  readonly ariaDescribedby = input<string>('');

  // ── Two-Way Model Signal ───────────────────────────────────
  readonly value = model<any>(undefined);

  // ── Signal Outputs ─────────────────────────────────────────
  readonly selectionChange = output<any>();
  readonly searchChange = output<string>();
  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly blur = output<FocusEvent>();
  readonly focus = output<FocusEvent>();
  readonly onChange = output<{ originalEvent: Event; value: any }>();
  readonly onFilter = output<{ originalEvent: Event; filter: string }>();
  readonly onShow = output<void>();
  readonly onHide = output<void>();
  readonly onClear = output<Event>();
  readonly onOptionSelect = output<{ originalEvent: Event; value: any }>();
  readonly onOptionUnselect = output<{ originalEvent: Event; value: any }>();
  readonly onClick = output<MouseEvent>();
  readonly onFocus = output<FocusEvent>();
  readonly onBlur = output<FocusEvent>();
  readonly onLazyLoad = output<{ first: number; last: number }>();

  // ── Internal State Signals ─────────────────────────────────
  readonly isOpen = signal<boolean>(false);
  readonly isFocused = signal<boolean>(false);
  readonly searchTerm = signal<string>('');
  readonly activeOptionIndex = signal<number>(-1);

  // ── Computeds ──────────────────────────────────────────────
  readonly effectiveId = computed(
    () => this.id() || this.inputId() || this.uniqueId,
  );
  readonly filterEnabled = computed(() => this.filter() ?? this.searchable());
  readonly listboxId = computed(() => `${this.effectiveId()}-listbox`);
  readonly activeOptionId = computed(() => {
    const index = this.activeOptionIndex();
    if (index < 0) return null;
    if (this.isDataMode()) {
      const option = this.filteredDataOptions()[index];
      return option && !this.isOptionDisabled(option)
        ? `${this.listboxId()}-option-${index}`
        : null;
    }
    const option = this.getVisibleOptions()[index];
    return option ? option.id() || option.defaultId : null;
  });
  readonly labelId = computed(() => `${this.effectiveId()}-label`);
  readonly helperId = computed(() => `${this.effectiveId()}-helper`);
  readonly errorId = computed(() => `${this.effectiveId()}-error`);

  readonly isInvalid = computed(
    () => this.status() === 'error' || !!this.errorMessage(),
  );

  readonly computedAriaDescribedBy = computed(() => {
    const ids: string[] = [];
    const externalDescription = this.ariaDescribedby().trim();
    if (externalDescription) ids.push(externalDescription);
    if (this.isInvalid() && this.errorMessage()) {
      ids.push(this.errorId());
    } else if (this.helperText()) {
      ids.push(this.helperId());
    }
    return ids.length ? ids.join(' ') : null;
  });
  readonly effectiveAriaLabel = computed(() => this.ariaLabel().trim() || null);
  readonly effectiveAriaLabelledBy = computed(
    () =>
      this.ariaLabelledBy()?.trim() ||
      (this.label().trim() ? this.labelId() : null),
  );
  readonly effectiveFilterPlaceholder = computed(
    () =>
      this.filterPlaceholder().trim() ||
      this.searchPlaceholder()?.trim() ||
      null,
  );
  readonly effectiveAriaFilterLabel = computed(
    () => this.ariaFilterLabel()?.trim() || 'Filter options',
  );
  readonly effectiveClearAriaLabel = computed(
    () => this.clearAriaLabel()?.trim() || 'Clear selection',
  );
  readonly effectiveRemoveOptionAriaLabel = computed(
    () => this.removeOptionAriaLabel()?.trim() || null,
  );

  /** Close an open panel when a parent changes the control into a state that
   * cannot interact with the list anymore. */
  private readonly closeWhenUnavailable = effect(() => {
    if ((this.effectiveDisabled() || this.readonly()) && this.isOpen()) {
      this.closePanel();
    }
  });

  /** Keep the visual active state aligned when projected options are hidden,
   * removed, or disabled after keyboard focus has landed on them. */
  private readonly syncProjectedActiveOption = effect(() => {
    if (this.isDataMode()) return;

    const visibleOptions = this.getVisibleOptions();
    const activeOption = visibleOptions[this.activeOptionIndex()] ?? null;
    this.projectedOptions().forEach((option) => {
      const isActive = option === activeOption;
      if (option.isActive() !== isActive) option.isActive.set(isActive);
    });
  });

  // Effective list of options either from inputs or projected components
  readonly dataOptions = computed<SelectOption[]>(() => {
    if (this.options() !== undefined) {
      return this.options() || [];
    }
    return [];
  });

  readonly isDataMode = computed(() => this.options() !== undefined);

  readonly hasVisibleOptions = computed(() =>
    this.isDataMode()
      ? this.filteredDataOptions().length > 0
      : this.projectedOptions().some((option) => !option.isHidden()),
  );

  readonly emptyStateMessage = computed(() =>
    this.searchTerm().trim()
      ? this.emptyFilterMessage() ||
        this.searchEmptyText() ||
        'No results found'
      : this.emptyMessage() || 'No options available',
  );

  // Filtered data options when searching
  readonly filteredDataOptions = computed<SelectOption[]>(() => {
    const list = this.dataOptions();
    const term = this.searchTerm().trim();
    if (!term) return list;
    return list.filter((opt) => {
      const fields =
        this.filterFields() ??
        (this.filterBy()
          ? this.filterBy()!
              .split(',')
              .map((f) => f.trim())
              .filter(Boolean)
          : undefined);
      const values = fields?.length
        ? fields
            .map((field) => String((opt as any)?.[field] ?? ''))
            .filter(Boolean)
        : [
            this.getOptionLabel(opt),
            String((opt as any)?.description ?? ''),
          ].filter(Boolean);
      return values.some((value) => this.matchesFilter(value, term));
    });
  });

  private matchesFilter(value: string, term: string): boolean {
    const normalized = value.toLocaleLowerCase(
      this.filterLocale() || undefined,
    );
    const query = term.toLocaleLowerCase(this.filterLocale() || undefined);
    switch (this.filterMatchMode()) {
      case 'startsWith':
        return normalized.startsWith(query);
      case 'endsWith':
        return normalized.endsWith(query);
      case 'equals':
        return normalized === query;
      case 'notEquals':
        return normalized !== query;
      case 'in':
        return query
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
          .includes(normalized);
      case 'lt':
        return this.compareNumericFilter(
          value,
          term,
          (left, right) => left < right,
        );
      case 'lte':
        return this.compareNumericFilter(
          value,
          term,
          (left, right) => left <= right,
        );
      case 'gt':
        return this.compareNumericFilter(
          value,
          term,
          (left, right) => left > right,
        );
      case 'gte':
        return this.compareNumericFilter(
          value,
          term,
          (left, right) => left >= right,
        );
      default:
        return normalized.includes(query);
    }
  }

  private compareNumericFilter(
    value: string,
    term: string,
    compare: (value: number, query: number) => boolean,
  ): boolean {
    const numericValue = Number(value);
    const numericQuery = Number(term);
    return (
      Number.isFinite(numericValue) &&
      Number.isFinite(numericQuery) &&
      compare(numericValue, numericQuery)
    );
  }

  getOptionValue(option: any): any {
    const key = this.optionValue();
    return key ? option?.[key] : (option?.value ?? option);
  }
  private toNativeFormValue(value: unknown): string {
    let nativeValue = value;
    if (this.isDataMode()) {
      const option = this.dataOptions().find((candidate) =>
        this.sameOptionValue(this.getOptionValue(candidate), value),
      );
      if (option) nativeValue = this.getOptionValue(option);
    }
    const key = this.dataKey();
    if (
      key &&
      typeof nativeValue === 'object' &&
      nativeValue !== null &&
      key in nativeValue
    ) {
      nativeValue = (nativeValue as Record<string, unknown>)[key];
    }
    return nativeValue == null ? '' : String(nativeValue);
  }
  sameOptionValue(left: any, right: any): boolean {
    const key = this.dataKey();
    if (!key || left == null || right == null) return left === right;
    const valueForKey = (value: any) =>
      typeof value === 'object' && value !== null && key in value
        ? value[key]
        : value;
    return valueForKey(left) === valueForKey(right);
  }
  isDataOptionSelected(option: SelectOption): boolean {
    const candidate = this.getOptionValue(option);
    const current = this.value();
    return this.multiple()
      ? Array.isArray(current) &&
          current.some((item) => this.sameOptionValue(item, candidate))
      : this.sameOptionValue(current, candidate);
  }
  getOptionLabel(option: any): string {
    const key = this.optionLabel();
    return String(
      key ? (option?.[key] ?? '') : (option?.label ?? option ?? ''),
    );
  }
  isOptionDisabled(option: any): boolean {
    const key = this.optionDisabled();
    return Boolean(key ? option?.[key] : option?.disabled);
  }

  // Selected Option Items for display
  readonly selectedItems = computed<
    { label: string; value: any; icon?: string; avatarUrl?: string }[]
  >(() => {
    const currentVal = this.value();
    if (currentVal === undefined || currentVal === null || currentVal === '') {
      return [];
    }

    const valArray = this.multiple()
      ? Array.isArray(currentVal)
        ? currentVal
        : [currentVal]
      : [currentVal];

    if (this.isDataMode()) {
      const allData = this.dataOptions();
      return valArray.map((v) => {
        const found = allData.find((opt) =>
          this.sameOptionValue(this.getOptionValue(opt), v),
        );
        return {
          label: found ? this.getOptionLabel(found) : String(v),
          value: v,
          icon: (found as any)?.icon,
          avatarUrl: (found as any)?.avatarUrl,
        };
      });
    }

    // Projected mode
    const proj = this.projectedOptions();
    return valArray.map((v) => {
      const found = proj.find((opt) => this.sameOptionValue(opt.value(), v));
      return {
        label: found ? found.getOptionText() : String(v),
        value: v,
        icon: found?.icon(),
        avatarUrl: found?.avatarUrl(),
      };
    });
  });

  /** Native form values mirror the selection without putting the name on a div. */
  readonly nativeFormValues = computed(() => {
    const current = this.value();
    const values = this.multiple()
      ? Array.isArray(current)
        ? current
        : []
      : current === undefined || current === null || current === ''
        ? []
        : [current];
    return values.map((value) => this.toNativeFormValue(value));
  });

  readonly hasValue = computed(() => this.selectedItems().length > 0);

  // ── ControlValueAccessor Implementation ───────────────────
  protected override isSelfDisabled(): boolean {
    return this.disabled();
  }

  constructor() {
    super();
    // Synchronize selection state to projected components whenever value or projected options change
    effect(() => {
      const val = this.value();
      const isMulti = this.multiple();
      const projOptions = this.projectedOptions();

      projOptions.forEach((opt) => {
        if (isMulti) {
          const arr = Array.isArray(val) ? val : [];
          opt.isSelected.set(
            arr.some((item) => this.sameOptionValue(item, opt.value())),
          );
        } else {
          opt.isSelected.set(this.sameOptionValue(val, opt.value()));
        }
      });
    });

    // Update visibility of projected options when searching
    effect(() => {
      if (this.isDataMode()) return;
      const term = this.searchTerm().trim();
      const projOptions = this.projectedOptions();

      projOptions.forEach((opt) => {
        if (!term) {
          opt.isHidden.set(false);
        } else {
          const desc = opt.description();
          const matches = [opt.getOptionText(), desc ?? ''].some((value) =>
            this.matchesFilter(value, term),
          );
          opt.isHidden.set(!matches);
        }
      });
    });
  }

  ngAfterViewInit(): void {
    this.portal = new TemplatePortal(
      this.dropdownPanel(),
      this.viewContainerRef,
    );
    if (this.autofocus()) {
      this.triggerEl()?.nativeElement.focus({ preventScroll: true });
    }
  }

  ngOnDestroy(): void {
    if (this.blurTimer !== undefined) clearTimeout(this.blurTimer);
    this.closePanel();
  }

  override writeValue(value: any): void {
    this.value.set(value);
  }

  // ── Overlay & Panel Methods ───────────────────────────────
  togglePanel(): void {
    if (this.effectiveDisabled() || this.readonly()) return;
    this.isOpen() ? this.closePanel() : this.openPanel();
  }

  openPanel(): void {
    if (this.isOpen() || this.effectiveDisabled() || this.readonly()) return;
    if (!this.portal) return;

    const triggerNative =
      this.triggerEl()?.nativeElement || this.hostEl.nativeElement;
    const triggerWidth = triggerNative.getBoundingClientRect().width;

    const positionStrategy = this.createPositionStrategy(triggerNative);
    const overlayConfig = new OverlayConfig({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy,
      minWidth: triggerWidth,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    this.overlayRef = this.overlay.create(overlayConfig);
    if (this.autoZIndex()) {
      this.overlayRef.hostElement.style.zIndex = String(
        Math.max(0, this.baseZIndex()) + 1000,
      );
    }
    this.overlayRef.backdropClick().subscribe(() => this.closePanel());
    this.overlayRef.keydownEvents().subscribe((event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.closePanel(true);
        event.stopPropagation();
      }
    });

    this.overlayRef.attach(this.portal);
    this.layerCleanup = registerOverlay(this.overlayRef.overlayElement, {
      anchor: triggerNative,
      onParentClose: () => this.closePanel(),
    });
    this.outsideCleanup = listenForOutsideInteraction(
      this.document,
      () => [this.hostEl.nativeElement, this.overlayRef?.overlayElement],
      (event) => this.onDocumentClick(event.target, event.type),
    );
    this.isOpen.set(true);
    if (this.autoOptionFocus()) this.navigateOption(1);
    this.opened.emit();
    this.onShow.emit();
    if (this.lazy() || this.virtualScroll())
      this.onLazyLoad.emit({
        first: 0,
        last: Math.max(0, this.dataOptions().length - 1),
      });

    if (this.filterEnabled()) {
      this.focusTimer = setTimeout(() => {
        this.focusTimer = undefined;
        this.searchInputRef()?.nativeElement?.focus();
      });
    }
  }

  closePanel(restoreFocus = false): void {
    if (!this.isOpen()) return;
    if (this.focusTimer !== undefined) clearTimeout(this.focusTimer);
    this.focusTimer = undefined;
    this.outsideCleanup?.();
    this.outsideCleanup = undefined;
    this.layerCleanup?.();
    this.layerCleanup = undefined;
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.isOpen.set(false);
    if (this.resetFilterOnHide()) this.searchTerm.set('');
    this.activeOptionIndex.set(-1);
    this.closed.emit();
    this.onHide.emit();
    if (restoreFocus)
      this.triggerEl()?.nativeElement.focus({ preventScroll: true });
  }

  private createPositionStrategy(origin: HTMLElement): PositionStrategy {
    const parent = overlayAttachmentTarget(origin, this.appendTo() ?? 'body');
    const positions: ConnectedPosition[] = [
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetY: 4,
      },
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
        offsetY: -4,
      },
    ];
    return this.overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPopoverLocation(
        parent === this.document.body
          ? 'global'
          : { type: 'parent', element: parent },
      )
      .withPositions(positions)
      .withPush(true);
  }

  // ── Selection Logic ───────────────────────────────────────
  onOptionSelected(optionComponent: OptionComponent, event?: Event): void {
    if (optionComponent.disabled()) return;
    this.selectValue(optionComponent.value(), event);
  }

  onDataOptionClick(option: SelectOption, event?: Event): void {
    if (this.isOptionDisabled(option)) return;
    this.selectValue(this.getOptionValue(option), event);
  }

  private selectValue(val: any, originalEvent?: Event): void {
    if (this.effectiveDisabled() || this.readonly()) return;
    if (this.multiple()) {
      const current = Array.isArray(this.value()) ? [...this.value()] : [];
      const index = current.findIndex((item) =>
        this.sameOptionValue(item, val),
      );
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(val);
      }
      this.value.set(current);
      this.cvaOnChange(current);
      this.selectionChange.emit(current);
      const event = originalEvent ?? new Event('change');
      this.onChange.emit({ originalEvent: event, value: current });
      (index > -1 ? this.onOptionUnselect : this.onOptionSelect).emit({
        originalEvent: event,
        value: val,
      });
    } else {
      this.value.set(val);
      this.cvaOnChange(val);
      this.selectionChange.emit(val);
      const event = originalEvent ?? new Event('change');
      this.onChange.emit({ originalEvent: event, value: val });
      this.onOptionSelect.emit({ originalEvent: event, value: val });
      this.closePanel(true);
    }
  }

  removeSelectedItem(itemValue: any, event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.effectiveDisabled() || this.readonly()) return;

    if (this.multiple()) {
      const current = Array.isArray(this.value()) ? [...this.value()] : [];
      const updated = current.filter(
        (v) => !this.sameOptionValue(v, itemValue),
      );
      this.value.set(updated);
      this.cvaOnChange(updated);
      this.selectionChange.emit(updated);
      this.onChange.emit({ originalEvent: event, value: updated });
      this.onOptionUnselect.emit({ originalEvent: event, value: itemValue });
    } else {
      this.clearValue(event);
    }
  }

  clearValue(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.effectiveDisabled() || this.readonly()) return;

    const clearedVal = this.multiple() ? [] : undefined;
    this.value.set(clearedVal);
    this.cvaOnChange(clearedVal);
    this.selectionChange.emit(clearedVal);
    this.onChange.emit({ originalEvent: event, value: clearedVal });
    this.onClear.emit(event);
  }

  setActiveOption(optionComponent: OptionComponent): void {
    if (!this.focusOnHover()) return;
    const list = this.getVisibleOptions();
    const idx = list.indexOf(optionComponent);
    if (idx !== -1) {
      this.activeOptionIndex.set(idx);
      this.updateActiveHighlight(list, idx);
    }
  }

  private getVisibleOptions(): OptionComponent[] {
    return this.projectedOptions().filter(
      (opt) => !opt.isHidden() && !opt.disabled(),
    );
  }

  private updateActiveHighlight(
    list: OptionComponent[],
    activeIdx: number,
  ): void {
    const activeOption = list[activeIdx];
    this.projectedOptions().forEach((option) => {
      option.isActive.set(option === activeOption);
    });
  }

  // ── Search Event Handler ──────────────────────────────────
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const val = target.value;
    this.searchTerm.set(val);
    this.searchChange.emit(val);
    this.onFilter.emit({ originalEvent: event, filter: val });
  }

  // ── Keyboard Navigation (WAI-ARIA Select) ────────────────
  onKeyDown(event: KeyboardEvent): void {
    if (this.effectiveDisabled() || this.readonly()) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.openPanel();
        } else {
          this.navigateOption(1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen()) {
          this.openPanel();
        } else {
          this.navigateOption(-1);
        }
        break;
      case 'Enter':
      case ' ':
        if (!this.searchable() || !this.isOpen()) {
          event.preventDefault();
        }
        if (!this.isOpen()) {
          this.openPanel();
        } else if (this.activeOptionIndex() >= 0) {
          event.preventDefault();
          this.confirmActiveOption();
        }
        break;
      case 'Tab':
        if (this.isOpen()) {
          this.closePanel();
        }
        break;
      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          event.stopPropagation();
          this.closePanel(true);
        }
        break;
    }
  }

  private navigateOption(direction: number): void {
    if (this.isDataMode()) {
      const optionsList = this.filteredDataOptions();
      if (!optionsList.some((option) => !this.isOptionDisabled(option))) return;
      let nextIndex = this.activeOptionIndex();
      do {
        nextIndex =
          (nextIndex + direction + optionsList.length) % optionsList.length;
      } while (this.isOptionDisabled(optionsList[nextIndex]));
      this.activeOptionIndex.set(nextIndex);
    } else {
      const visibleOpts = this.getVisibleOptions();
      if (visibleOpts.length === 0) return;
      let nextIndex = this.activeOptionIndex() + direction;
      if (nextIndex < 0) nextIndex = visibleOpts.length - 1;
      if (nextIndex >= visibleOpts.length) nextIndex = 0;
      this.activeOptionIndex.set(nextIndex);
      this.updateActiveHighlight(visibleOpts, nextIndex);
    }
  }

  private confirmActiveOption(): void {
    const idx = this.activeOptionIndex();
    if (idx < 0) return;

    if (this.isDataMode()) {
      const optionsList = this.filteredDataOptions();
      if (optionsList[idx] && !this.isOptionDisabled(optionsList[idx])) {
        this.selectValue(this.getOptionValue(optionsList[idx]));
      }
    } else {
      const visibleOpts = this.getVisibleOptions();
      if (visibleOpts[idx]) {
        this.selectValue(visibleOpts[idx].value());
      }
    }
  }

  onCompositeFocus(event: FocusEvent): void {
    if (this.blurTimer !== undefined) clearTimeout(this.blurTimer);
    this.blurTimer = undefined;
    const wasFocused = this.isFocused();
    this.isFocused.set(true);
    if (!wasFocused) {
      this.focus.emit(event);
      this.onFocus.emit(event);
    }
  }

  onCompositeFocusOut(event: FocusEvent): void {
    if (this.isFocusTargetInsideComposite(event.relatedTarget)) return;
    if (this.blurTimer !== undefined) clearTimeout(this.blurTimer);

    // A null relatedTarget is common when an overlay node is removed while
    // focus is changing. Check the settled active element before declaring blur.
    if (event.relatedTarget === null) {
      this.blurTimer = setTimeout(() => {
        this.blurTimer = undefined;
        if (this.isActiveElementInsideComposite()) return;
        this.finishCompositeBlur(event);
      });
      return;
    }

    this.finishCompositeBlur(event);
  }

  private isFocusTargetInsideComposite(target: EventTarget | null): boolean {
    if (!target) return false;
    const NodeConstructor = this.document.defaultView?.Node;
    if (!NodeConstructor || !(target instanceof NodeConstructor)) return false;
    const overlay = this.overlayRef?.overlayElement;
    return (
      this.hostEl.nativeElement.contains(target) || !!overlay?.contains(target)
    );
  }

  private isActiveElementInsideComposite(): boolean {
    return this.isFocusTargetInsideComposite(this.document.activeElement);
  }

  private finishCompositeBlur(event: FocusEvent): void {
    if (!this.isFocused()) return;
    this.isFocused.set(false);
    this.cvaOnTouched();
    this.blur.emit(event);
    this.onBlur.emit(event);
    if (this.isOpen()) this.closePanel();
  }

  onDocumentClick(target: EventTarget | null, eventType = 'click'): void {
    // Wait for a click rather than pointerdown so native focusout gets the
    // first chance to report a real composite blur.
    if (!this.isOpen() || eventType !== 'click') return;
    const host = this.hostEl.nativeElement;
    const hostNode = host.ownerDocument.defaultView?.Node;
    const insideHost =
      !!hostNode && target instanceof hostNode && host.contains(target);
    const overlay = this.overlayRef?.overlayElement;
    const overlayNode = overlay?.ownerDocument.defaultView?.Node;
    const insideOverlay =
      !!overlay &&
      !!overlayNode &&
      target instanceof overlayNode &&
      overlay.contains(target);
    if (insideHost || insideOverlay) return;
    if (overlay && !isTopOverlay(overlay)) return;

    // A click on a non-focusable outside target may remove the currently
    // focused panel without generating a useful browser focusout event.
    if (this.isActiveElementInsideComposite()) {
      const FocusEventConstructor = this.document.defaultView?.FocusEvent;
      if (FocusEventConstructor) {
        this.finishCompositeBlur(
          new FocusEventConstructor('blur', { relatedTarget: target }),
        );
      } else {
        this.isFocused.set(false);
        this.cvaOnTouched();
        this.closePanel();
      }
    } else {
      this.closePanel();
    }
  }
}
