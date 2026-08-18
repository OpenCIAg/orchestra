// src/app/shared/select/select.component.ts

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
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
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayConfig, OverlayRef, PositionStrategy, ConnectedPosition } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { SelectOption } from './select-option.model';
import { SelectStatus } from './select.types';
import { OptionComponent } from './option.component';

let nextSelectUniqueId = 0;

@Component({
  selector: 'orc-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  private readonly uniqueId = `orc-select-${++nextSelectUniqueId}`;
  private hostEl = inject(ElementRef);
  private viewContainerRef = inject(ViewContainerRef);
  private overlay = inject(Overlay);

  // ── Overlay References ─────────────────────────────────────
  private overlayRef: OverlayRef | null = null;
  private portal!: TemplatePortal<unknown>;

  // ── Element Signals ────────────────────────────────────────
  readonly triggerEl = viewChild<ElementRef<HTMLDivElement>>('triggerEl');
  readonly searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  readonly dropdownPanel = viewChild.required<TemplateRef<unknown>>('dropdownPanel');

  // ── Content Children Options ───────────────────────────────
  readonly projectedOptions = contentChildren(OptionComponent, { descendants: true });

  // ── Signal Inputs ──────────────────────────────────────────
  readonly id = input<string>('');
  readonly name = input<string>('');
  readonly placeholder = input<string>('Selecione uma opção');
  readonly label = input<string>('');
  readonly helperText = input<string>('');
  readonly errorMessage = input<string>('');
  readonly status = input<SelectStatus>('default');
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly searchable = input(false, { transform: booleanAttribute });
  readonly searchPlaceholder = input<string>('Buscar...');
  readonly searchEmptyText = input<string>('Nenhum resultado encontrado');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly options = input<SelectOption[] | undefined>(undefined);
  // PrimeNG Select public inputs (the Orchestra names remain supported).
  readonly optionLabel = input<string | undefined>(undefined);
  readonly optionValue = input<string | undefined>(undefined);
  readonly optionDisabled = input<string | undefined>(undefined);
  readonly filter = input<boolean | undefined>(undefined, { transform: booleanAttribute });
  readonly filterPlaceholder = input('');
  readonly filterLocale = input<string | undefined>(undefined);
  readonly filterBy = input<string | undefined>(undefined);
  readonly filterFields = input<string[] | undefined>(undefined);
  readonly filterMatchMode = input<'contains' | 'startsWith' | 'endsWith' | 'equals' | 'notEquals' | 'in' | 'lt' | 'lte' | 'gt' | 'gte'>('contains');
  readonly emptyFilterMessage = input('Nenhum resultado encontrado');
  readonly emptyMessage = input('Nenhuma opção disponível');
  readonly showClear = input(false, { transform: booleanAttribute });
  readonly inputId = input<string | undefined>(undefined);
  readonly style = input<Record<string, string> | undefined>(undefined);
  readonly styleClass = input('');
  readonly panelStyle = input<Record<string, string> | undefined>(undefined);
  readonly panelStyleClass = input('');
  readonly appendTo = input<unknown>(undefined);
  readonly overlayOptions = input<Record<string, unknown> | undefined>(undefined);
  readonly tabindex = input<number | undefined>(undefined);
  readonly variant = input<'filled' | 'outlined'>('outlined');
  readonly size = input<'small' | 'large' | undefined>(undefined);
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly loadingIcon = input<string | undefined>(undefined);
  readonly autofocus = input(false, { transform: booleanAttribute });
  readonly autofocusFilter = input(false, { transform: booleanAttribute });
  readonly editable = input(false, { transform: booleanAttribute });
  readonly checkmark = input(false, { transform: booleanAttribute });
  readonly dropdownIcon = input('');
  readonly optionGroupLabel = input<string | undefined>(undefined);
  readonly optionGroupChildren = input<string>('items');
  readonly autoDisplayFirst = input(false, { transform: booleanAttribute });
  readonly group = input(false, { transform: booleanAttribute });
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly virtualScroll = input(false, { transform: booleanAttribute });
  readonly virtualScrollItemSize = input<number | undefined>(undefined);
  readonly virtualScrollOptions = input<Record<string, unknown> | undefined>(undefined);
  readonly itemSize = input<number | undefined>(undefined);
  readonly dataKey = input<string | undefined>(undefined);
  readonly autoZIndex = input(true, { transform: booleanAttribute });
  readonly baseZIndex = input(0);
  readonly focusOnHover = input(true, { transform: booleanAttribute });
  readonly selectOnFocus = input(false, { transform: booleanAttribute });
  readonly autoOptionFocus = input(false, { transform: booleanAttribute });
  readonly maxlength = input<number | undefined>(undefined);
  readonly showTransitionOptions = input<string | undefined>(undefined);
  readonly hideTransitionOptions = input<string | undefined>(undefined);
  readonly resetFilterOnHide = input(true, { transform: booleanAttribute });
  readonly tooltip = input('');
  readonly tooltipPosition = input<'top' | 'left' | 'right' | 'bottom'>('right');
  readonly tooltipPositionStyle = input('absolute');
  readonly tooltipStyleClass = input<string | undefined>(undefined);
  readonly scrollHeight = input('200px');

  // Acessibilidade WCAG
  readonly ariaLabel = input<string>('');
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly ariaFilterLabel = input<string | undefined>(undefined);
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
  readonly onClick = output<MouseEvent>();
  readonly onFocus = output<FocusEvent>();
  readonly onBlur = output<FocusEvent>();
  readonly onLazyLoad = output<{ first: number; last: number }>();

  // ── Internal State Signals ─────────────────────────────────
  readonly isOpen = signal<boolean>(false);
  readonly isFocused = signal<boolean>(false);
  readonly searchTerm = signal<string>('');
  protected readonly cvaDisabled = signal<boolean>(false);
  readonly activeOptionIndex = signal<number>(-1);

  // ── Computeds ──────────────────────────────────────────────
  readonly effectiveId = computed(() => this.id() || this.inputId() || this.uniqueId);
  readonly filterEnabled = computed(() => this.filter() ?? this.searchable());
  readonly listboxId = computed(() => `${this.effectiveId()}-listbox`);
  readonly helperId = computed(() => `${this.effectiveId()}-helper`);
  readonly errorId = computed(() => `${this.effectiveId()}-error`);

  readonly effectiveDisabled = computed(
    () => this.disabled() || this.cvaDisabled()
  );

  readonly isInvalid = computed(() => this.status() === 'error');

  readonly computedAriaDescribedBy = computed(() => {
    const ids: string[] = [];
    if (this.ariaDescribedby()) ids.push(this.ariaDescribedby());
    if (this.isInvalid() && this.errorMessage()) {
      ids.push(this.errorId());
    } else if (this.helperText()) {
      ids.push(this.helperId());
    }
    return ids.length ? ids.join(' ') : null;
  });

  // Effective list of options either from inputs or projected components
  readonly dataOptions = computed<SelectOption[]>(() => {
    if (this.options() !== undefined) {
      return this.options() || [];
    }
    return [];
  });

  readonly isDataMode = computed(() => this.options() !== undefined);

  // Filtered data options when searching
  readonly filteredDataOptions = computed<SelectOption[]>(() => {
    const list = this.dataOptions();
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return list;
    return list.filter((opt) => {
      const fields = this.filterFields() ?? (this.filterBy() ? this.filterBy()!.split(',').map((f) => f.trim()).filter(Boolean) : ['label', 'description']);
      const values = fields.map((field) => String((opt as any)?.[field] ?? '')).filter(Boolean);
      if (!values.length) values.push(this.getOptionLabel(opt));
      return values.some((value) => this.matchesFilter(value, term));
    });
  });

  private matchesFilter(value: string, term: string): boolean {
    const normalized = value.toLocaleLowerCase(this.filterLocale() || undefined);
    const query = term.toLocaleLowerCase(this.filterLocale() || undefined);
    switch (this.filterMatchMode()) {
      case 'startsWith': return normalized.startsWith(query);
      case 'endsWith': return normalized.endsWith(query);
      case 'equals': return normalized === query;
      case 'notEquals': return normalized !== query;
      default: return normalized.includes(query);
    }
  }

  getOptionValue(option: any): any { const key = this.optionValue(); return key ? option?.[key] : option?.value ?? option; }
  getOptionLabel(option: any): string { const key = this.optionLabel(); return String(key ? option?.[key] ?? '' : option?.label ?? option ?? ''); }
  isOptionDisabled(option: any): boolean { const key = this.optionDisabled(); return Boolean(key ? option?.[key] : option?.disabled); }

  // Selected Option Items for display
  readonly selectedItems = computed<{ label: string; value: any; icon?: string; avatarUrl?: string }[]>(() => {
    const currentVal = this.value();
    if (currentVal === undefined || currentVal === null || currentVal === '') {
      return [];
    }

    const valArray = this.multiple() ? (Array.isArray(currentVal) ? currentVal : [currentVal]) : [currentVal];

    if (this.isDataMode()) {
      const allData = this.dataOptions();
      return valArray.map((v) => {
        const found = allData.find((opt) => this.getOptionValue(opt) === v);
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
      const found = proj.find((opt) => opt.value() === v);
      return {
        label: found ? found.getOptionText() : String(v),
        value: v,
        icon: found?.icon(),
        avatarUrl: found?.avatarUrl(),
      };
    });
  });

  readonly hasValue = computed(() => this.selectedItems().length > 0);

  // ── ControlValueAccessor Implementation ───────────────────
  private onModelChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // Synchronize selection state to projected components whenever value or projected options change
    effect(() => {
      const val = this.value();
      const isMulti = this.multiple();
      const projOptions = this.projectedOptions();

      projOptions.forEach((opt) => {
        if (isMulti) {
          const arr = Array.isArray(val) ? val : [];
          opt.isSelected.set(arr.includes(opt.value()));
        } else {
          opt.isSelected.set(val === opt.value());
        }
      });
    });

    // Update visibility of projected options when searching
    effect(() => {
      if (this.isDataMode()) return;
      const term = this.searchTerm().trim().toLowerCase();
      const projOptions = this.projectedOptions();

      projOptions.forEach((opt) => {
        if (!term) {
          opt.isHidden.set(false);
        } else {
          const desc = opt.description();
          const matches = opt.getOptionText().toLowerCase().includes(term) ||
                          (desc ? desc.toLowerCase().includes(term) : false);
          opt.isHidden.set(!matches);
        }
      });
    });
  }

  ngAfterViewInit(): void {
    this.portal = new TemplatePortal(this.dropdownPanel(), this.viewContainerRef);
  }

  ngOnDestroy(): void {
    this.closePanel();
  }

  writeValue(value: any): void {
    this.value.set(value);
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // ── Overlay & Panel Methods ───────────────────────────────
  togglePanel(): void {
    if (this.effectiveDisabled() || this.readonly()) return;
    this.isOpen() ? this.closePanel() : this.openPanel();
  }

  openPanel(): void {
    if (this.isOpen() || this.effectiveDisabled() || this.readonly()) return;

    const triggerNative = this.triggerEl()?.nativeElement || this.hostEl.nativeElement;
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
    this.overlayRef.backdropClick().subscribe(() => this.closePanel());
    this.overlayRef.keydownEvents().subscribe((event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.closePanel();
        event.stopPropagation();
      }
    });

    this.overlayRef.attach(this.portal);
    this.isOpen.set(true);
    this.opened.emit();
    this.onShow.emit();

    if (this.filterEnabled()) {
      setTimeout(() => this.searchInputRef()?.nativeElement?.focus(), 50);
    }
  }

  closePanel(): void {
    if (!this.isOpen()) return;
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.isOpen.set(false);
    if (this.resetFilterOnHide()) this.searchTerm.set('');
    this.activeOptionIndex.set(-1);
    this.onTouched();
    this.closed.emit();
    this.onHide.emit();
  }

  private createPositionStrategy(origin: HTMLElement): PositionStrategy {
    const positions: ConnectedPosition[] = [
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
      { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
    ];
    return this.overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions(positions)
      .withPush(true);
  }

  // ── Selection Logic ───────────────────────────────────────
  onOptionSelected(optionComponent: OptionComponent): void {
    this.selectValue(optionComponent.value());
  }

  onDataOptionClick(option: SelectOption, event?: Event): void {
    if (this.isOptionDisabled(option)) return;
    this.selectValue(this.getOptionValue(option), event);
  }

  private selectValue(val: any, originalEvent?: Event): void {
    if (this.multiple()) {
      const current = Array.isArray(this.value()) ? [...this.value()] : [];
      const index = current.indexOf(val);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(val);
      }
      this.value.set(current);
      this.onModelChange(current);
      this.selectionChange.emit(current);
      this.onChange.emit({ originalEvent: originalEvent ?? new Event('change'), value: current });
    } else {
      this.value.set(val);
      this.onModelChange(val);
      this.selectionChange.emit(val);
      this.onChange.emit({ originalEvent: originalEvent ?? new Event('change'), value: val });
      this.closePanel();
    }
  }

  removeSelectedItem(itemValue: any, event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.effectiveDisabled() || this.readonly()) return;

    if (this.multiple()) {
      const current = Array.isArray(this.value()) ? [...this.value()] : [];
      const updated = current.filter((v) => v !== itemValue);
      this.value.set(updated);
      this.onModelChange(updated);
      this.selectionChange.emit(updated);
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
    this.onModelChange(clearedVal);
    this.selectionChange.emit(clearedVal);
    this.onClear.emit(event);
  }

  setActiveOption(optionComponent: OptionComponent): void {
    const list = this.getVisibleOptions();
    const idx = list.indexOf(optionComponent);
    if (idx !== -1) {
      this.activeOptionIndex.set(idx);
      this.updateActiveHighlight(list, idx);
    }
  }

  private getVisibleOptions(): OptionComponent[] {
    return this.projectedOptions().filter((opt) => !opt.isHidden() && !opt.disabled());
  }

  private updateActiveHighlight(list: OptionComponent[], activeIdx: number): void {
    list.forEach((opt, index) => {
      opt.isActive.set(index === activeIdx);
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
          event.stopPropagation();
          this.closePanel();
        }
        break;
    }
  }

  private navigateOption(direction: number): void {
    if (this.isDataMode()) {
      const optionsList = this.filteredDataOptions().filter((o) => !o.disabled);
      if (optionsList.length === 0) return;
      let nextIndex = this.activeOptionIndex() + direction;
      if (nextIndex < 0) nextIndex = optionsList.length - 1;
      if (nextIndex >= optionsList.length) nextIndex = 0;
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
      const optionsList = this.filteredDataOptions().filter((o) => !o.disabled);
      if (optionsList[idx]) {
        this.selectValue(optionsList[idx].value);
      }
    } else {
      const visibleOpts = this.getVisibleOptions();
      if (visibleOpts[idx]) {
        this.selectValue(visibleOpts[idx].value());
      }
    }
  }

  onTriggerFocus(event: FocusEvent): void {
    this.isFocused.set(true);
    this.focus.emit(event);
    this.onFocus.emit(event);
  }

  onTriggerBlur(event: FocusEvent): void {
    this.isFocused.set(false);
    this.onTouched();
    this.blur.emit(event);
    this.onBlur.emit(event);
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (!this.isOpen()) return;
    const insideHost = target instanceof Node && this.hostEl.nativeElement.contains(target);
    const insideOverlay = this.overlayRef?.overlayElement.contains(target as Node);
    if (!insideHost && !insideOverlay) {
      this.closePanel();
    }
  }
}
