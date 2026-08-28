import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  TemplateRef,
  ViewContainerRef,
  inject,
  input,
  model,
  output,
  signal,
  computed,
  booleanAttribute,
  effect,
  forwardRef,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayConfig, OverlayRef, PositionStrategy, ConnectedPosition } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DropdownItem } from './dropdown.types';

let nextDropdownId = 0;

@Component({
  selector: 'orc-dropdown',
  standalone: true,
  imports: [],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DropdownComponent), multi: true }],
})
export class DropdownComponent implements AfterViewInit, ControlValueAccessor {
  readonly items = input<DropdownItem[]>([]);
  readonly inputId = input<string | undefined>(undefined);
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(undefined);
  readonly placement = input<string>('bottom-start');
  /** PrimeNG Dropdown/Select-compatible form mode. Menu mode remains the default. */
  readonly options = input<unknown[] | undefined>(undefined);
  readonly optionLabel = input<string | undefined>(undefined);
  readonly optionValue = input<string | undefined>(undefined);
  readonly optionDisabled = input<string | ((option: unknown) => boolean) | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly loading = input(false, { transform: booleanAttribute });
  readonly showClear = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly filter = input(false, { transform: booleanAttribute });
  readonly filterPlaceholder = input<string | undefined>(undefined);
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly clearAriaLabel = input<string | undefined>(undefined);
  readonly filterAriaLabel = input<string | undefined>(undefined);
  readonly optionsAriaLabel = input<string | undefined>(undefined);
  readonly loadingMessage = input<string | undefined>(undefined);
  readonly filterBy = input<string | undefined>(undefined);
  readonly scrollHeight = input('200px');
  readonly resetFilterOnHide = input(true, { transform: booleanAttribute });
  readonly label = input('');
  readonly value = model<unknown>(null);

  readonly itemSelect = output<DropdownItem>();
  readonly onChange = output<{ originalEvent: Event; value: unknown }>();
  readonly onShow = output<void>();
  readonly onHide = output<void>();
  readonly onClear = output<Event>();
  readonly onFocus = output<FocusEvent>();
  readonly onBlur = output<FocusEvent>();
  readonly filterChange = output<string>();

  private overlayRef: OverlayRef | null = null;
  private portal!: TemplatePortal<unknown>;
  private hostEl = inject(ElementRef);
  private viewContainerRef = inject(ViewContainerRef);
  private overlay = inject(Overlay);

  readonly dropdownPanel = viewChild.required<TemplateRef<unknown>>('dropdownPanel');
  readonly isOpen = signal(false);
  readonly visible = model(false);
  readonly filterValue = signal('');
  readonly cvaDisabled = signal(false);
  private readonly uniqueId = `orc-dropdown-${++nextDropdownId}`;
  readonly effectiveId = computed(() => this.inputId() || this.uniqueId);
  private onModelChange: (value: unknown) => void = () => {};
  onTouched: () => void = () => {};
  readonly formMode = computed(() => this.options() !== undefined);
  readonly filteredOptions = computed(() => {
    const term = this.filterValue().trim().toLowerCase();
    const options = this.options() ?? [];
    if (!term) return options;
    return options.filter(option => this.optionText(option).toLowerCase().includes(term));
  });
  readonly selectedLabel = computed(() => {
    const selected = (this.options() ?? []).find(option => this.optionValueOf(option) === this.value());
    return selected === undefined ? '' : this.optionText(selected);
  });

  constructor() {
    effect(() => {
      const requested = this.visible();
      if (requested && !this.isOpen() && this.formMode()) this.open();
      if (!requested && this.isOpen() && this.formMode()) this.close();
    });
  }

  ngAfterViewInit(): void {
    this.portal = new TemplatePortal(this.dropdownPanel(), this.viewContainerRef);
  }

  open(): void {
    if (this.isOpen() || this.disabled() || this.cvaDisabled()) return;
    const positionStrategy = this.createPositionStrategy();
    const overlayConfig = new OverlayConfig({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
    this.overlayRef = this.overlay.create(overlayConfig);
    this.overlayRef.backdropClick().subscribe(() => this.close());
    this.overlayRef.keydownEvents().subscribe((event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.close();
        event.stopPropagation();
      }
    });
    this.overlayRef.attach(this.portal);
    this.isOpen.set(true);
    this.visible.set(true);
    if (this.formMode()) this.onShow.emit();
    setTimeout(() => this.overlayRef?.overlayElement.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')?.focus());
  }

  close(): void {
    if (!this.isOpen()) return;
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.isOpen.set(false);
    this.visible.set(false);
    if (this.resetFilterOnHide()) this.filterValue.set('');
    if (this.formMode()) this.onHide.emit();
  }

  toggle(): void {
    this.isOpen() ? this.close() : this.open();
  }

  onItemClick(item: DropdownItem, $event: MouseEvent): void {
    if (item.disabled) {
      $event.stopPropagation();
      return;
    }
    if (item.children?.length) {
      return;
    }
    this.itemSelect.emit(item);
    item.action?.();
    this.close();
  }

  optionText(option: unknown): string {
    const key = this.optionLabel();
    return String(key ? (option as Record<string, unknown>)?.[key] ?? '' : (option as any)?.label ?? option ?? '');
  }

  optionValueOf(option: unknown): unknown {
    const key = this.optionValue();
    return key ? (option as Record<string, unknown>)?.[key] : (option as any)?.value ?? option;
  }

  isOptionDisabled(option: unknown): boolean {
    const rule = this.optionDisabled();
    return typeof rule === 'function' ? rule(option) : Boolean(rule ? (option as Record<string, unknown>)?.[rule] : (option as any)?.disabled);
  }

  selectOption(option: unknown, event: Event): void {
    if (this.isOptionDisabled(option)) return;
    const value = this.optionValueOf(option);
    this.value.set(value);
    this.onModelChange(value);
    this.onChange.emit({ originalEvent: event, value });
    this.close();
  }

  clearValue(event: Event): void {
    this.value.set(null);
    this.onModelChange(null);
    this.onChange.emit({ originalEvent: event, value: null });
    this.onClear.emit(event);
  }

  onFilterInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterValue.set(value);
    this.filterChange.emit(value);
  }

  writeValue(value: unknown): void { this.value.set(value); }
  registerOnChange(fn: (value: unknown) => void): void { this.onModelChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.cvaDisabled.set(disabled); }

  onItemKeydown(event: KeyboardEvent): void {
    const current = event.currentTarget as HTMLButtonElement;
    const menu = current.closest<HTMLElement>('[role="menu"], [role="listbox"]');
    const buttons = Array.from(menu?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled]), [role="option"]:not([disabled])') ?? []);
    const index = buttons.indexOf(current);
    if (!buttons.length || index < 0) return;
    const target = event.key === 'ArrowDown' ? buttons[(index + 1) % buttons.length]
      : event.key === 'ArrowUp' ? buttons[(index - 1 + buttons.length) % buttons.length]
      : event.key === 'Home' ? buttons[0]
      : event.key === 'End' ? buttons[buttons.length - 1]
      : undefined;
    if (target) { event.preventDefault(); target.focus(); }
  }

  private createPositionStrategy(): PositionStrategy {
    const positions = this.getConnectedPositions();
    return this.overlay
      .position()
      .flexibleConnectedTo(this.hostEl)
      .withPositions(positions)
      .withFlexibleDimensions(false)
      .withPush(true);
  }

  private getConnectedPositions(): ConnectedPosition[] {
    switch (this.placement()) {
      case 'bottom-end':
        return [{ originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' }];
      case 'top-start':
        return [{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }];
      case 'top-end':
        return [{ originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' }];
      default:
        return [{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }];
    }
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (!this.isOpen()) return;
    const inside = target instanceof Node && this.hostEl.nativeElement.contains(target);
    if (!inside) this.close();
  }
}
