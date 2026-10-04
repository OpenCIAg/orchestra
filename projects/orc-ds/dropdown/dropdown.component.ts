import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
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
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  Overlay,
  PositionStrategy,
  ConnectedPosition,
} from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import {
  attachListPickerOverlay,
  CvaControl,
  listPickerFieldValues,
  listPickerFilterFields,
  listPickerOptionDisabled,
  listPickerOptionLabel,
  listPickerOptionValue,
  listPickerReadFieldPath,
  listPickerValueMatchesFilter,
} from '@ciag/orchestra/internal';
import type { ListPickerOverlayHandle } from '@ciag/orchestra/internal';
import { DropdownItem } from './dropdown.types';

let nextDropdownId = 0;

@Component({
  selector: 'orc-dropdown',
  standalone: true,
  imports: [],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true,
    },
  ],
})
export class DropdownComponent extends CvaControl implements OnDestroy {
  readonly items = input<DropdownItem[]>([]);
  readonly inputId = input<string | undefined>(undefined);
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly placement = input<string>('bottom-start');
  /** PrimeNG Dropdown/Select-compatible form mode. Menu mode remains the default. */
  readonly options = input<unknown[] | undefined>(undefined);
  readonly optionLabel = input<string | undefined>(undefined);
  readonly optionValue = input<string | undefined>(undefined);
  readonly optionDisabled = input<
    string | ((option: unknown) => boolean) | undefined
  >(undefined);
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

  private overlayHandle: ListPickerOverlayHandle | null = null;
  private hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  private document = inject(DOCUMENT);
  private focusTimer?: ReturnType<typeof setTimeout>;
  private returnFocus: HTMLElement | null = null;
  private viewContainerRef = inject(ViewContainerRef);
  private overlay = inject(Overlay);

  readonly dropdownPanel = viewChild<TemplateRef<unknown>>('dropdownPanel');
  readonly isOpen = signal(false);
  readonly visible = model(false);
  readonly filterValue = signal('');
  private readonly uniqueId = `orc-dropdown-${++nextDropdownId}`;
  readonly effectiveId = computed(() => this.inputId() || this.uniqueId);
  readonly formMode = computed(() => this.options() !== undefined);
  readonly filteredOptions = computed(() => {
    const term = this.filterValue().trim();
    const options = this.options() ?? [];
    if (!term) return options;
    const fields = listPickerFilterFields(undefined, this.filterBy());
    return options.filter((option) =>
      fields?.length
        ? listPickerFieldValues(option, fields, listPickerReadFieldPath).some(
            (value) => listPickerValueMatchesFilter(value, term, 'contains'),
          )
        : listPickerValueMatchesFilter(
            this.optionText(option),
            term,
            'contains',
          ),
    );
  });
  readonly selectedLabel = computed(() => {
    const selected = (this.options() ?? []).find(
      (option) => this.optionValueOf(option) === this.value(),
    );
    return selected === undefined ? '' : this.optionText(selected);
  });

  constructor() {
    super();
    effect(() => {
      const requested = this.visible();
      this.dropdownPanel();
      if (requested && !this.isOpen()) this.open();
      if ((!requested || this.effectiveDisabled()) && this.isOpen())
        this.close();
    });
  }

  protected override isSelfDisabled(): boolean {
    return this.disabled();
  }

  open(): void {
    if (this.isOpen() || this.effectiveDisabled()) return;
    const template = this.dropdownPanel();
    if (!template) return;
    this.returnFocus = this.document.activeElement as HTMLElement | null;
    this.overlayHandle = attachListPickerOverlay({
      anchor: this.hostEl.nativeElement,
      content: template,
      viewContainerRef: this.viewContainerRef,
      overlay: this.overlay,
      documentRef: this.document,
      positionStrategy: () => this.createPositionStrategy(),
      onEscape: () => this.close(true),
      onBackdrop: () => this.close(),
      onParentClose: () => this.close(),
      targets: () =>
        [this.hostEl.nativeElement, this.overlayHandle?.overlayElement].filter(
          (element): element is HTMLElement => !!element,
        ),
      onOutside: () => this.close(),
      onAttached: (panel) => {
        this.isOpen.set(true);
        this.visible.set(true);
        this.onShow.emit();
        this.focusTimer = setTimeout(() => {
          this.focusTimer = undefined;
          (
            panel.querySelector<HTMLElement>('input') ??
            panel.querySelector<HTMLElement>(
              '[aria-selected="true"]:not([disabled])',
            ) ??
            panel.querySelector<HTMLElement>(
              '[role="menuitem"]:not([disabled]), [role="option"]:not([disabled])',
            )
          )?.focus();
        });
      },
    });
  }

  close(restoreFocus = false): void {
    if (!this.isOpen()) return;
    this.disposeOverlay();
    this.isOpen.set(false);
    this.visible.set(false);
    if (this.resetFilterOnHide()) this.filterValue.set('');
    this.cvaOnTouched();
    this.onHide.emit();
    if (restoreFocus && this.returnFocus?.isConnected) this.returnFocus.focus();
  }

  toggle(): void {
    if (this.isOpen()) this.close();
    else this.open();
  }

  onItemClick(item: DropdownItem, $event: MouseEvent): void {
    if (item.disabled || this.effectiveDisabled()) {
      $event.stopPropagation();
      return;
    }
    this.itemSelect.emit(item);
    item.action?.();
    this.close(true);
  }

  optionText(option: unknown): string {
    return listPickerOptionLabel(
      option,
      this.optionLabel(),
      listPickerReadFieldPath,
    );
  }

  optionValueOf(option: unknown): unknown {
    return listPickerOptionValue(
      option,
      this.optionValue(),
      listPickerReadFieldPath,
    );
  }

  isOptionDisabled(option: unknown): boolean {
    return listPickerOptionDisabled(
      option,
      this.optionDisabled(),
      listPickerReadFieldPath,
    );
  }

  selectOption(option: unknown, event: Event): void {
    if (
      this.effectiveDisabled() ||
      this.loading() ||
      this.isOptionDisabled(option)
    )
      return;
    const value = this.optionValueOf(option);
    this.value.set(value);
    this.cvaOnChange(value);
    this.onChange.emit({ originalEvent: event, value });
    this.close(true);
  }

  clearValue(event: Event): void {
    if (this.effectiveDisabled() || this.loading()) return;
    this.cvaOnTouched();
    this.value.set(null);
    this.cvaOnChange(null);
    this.onChange.emit({ originalEvent: event, value: null });
    this.onClear.emit(event);
  }

  onFilterInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterValue.set(value);
    this.filterChange.emit(value);
  }

  writeValue(value: unknown): void {
    this.value.set(value);
  }

  onItemKeydown(event: KeyboardEvent): void {
    const current = event.currentTarget as HTMLButtonElement;
    const menu = current.closest<HTMLElement>(
      '[role="menu"], [role="listbox"]',
    );
    const buttons = Array.from(
      menu?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]:not([disabled]), [role="option"]:not([disabled])',
      ) ?? [],
    );
    const index = buttons.indexOf(current);
    if (!buttons.length || index < 0) return;
    const target =
      event.key === 'ArrowDown'
        ? buttons[(index + 1) % buttons.length]
        : event.key === 'ArrowUp'
          ? buttons[(index - 1 + buttons.length) % buttons.length]
          : event.key === 'Home'
            ? buttons[0]
            : event.key === 'End'
              ? buttons[buttons.length - 1]
              : undefined;
    if (target) {
      event.preventDefault();
      target.focus();
    }
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
        return [
          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top',
          },
        ];
      case 'top-start':
        return [
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
          },
        ];
      case 'top-end':
        return [
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'bottom',
          },
        ];
      default:
        return [
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
          },
        ];
    }
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.open();
    }
  }

  onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close(true);
    } else if (event.key === 'Tab') {
      // Restore the trigger before default Tab advances to the next control.
      this.close(true);
    } else if (
      (event.target as HTMLElement).matches('input') &&
      event.key === 'ArrowDown'
    ) {
      event.preventDefault();
      this.overlayHandle?.overlayElement
        ?.querySelector<HTMLElement>('[role="option"]:not([disabled])')
        ?.focus();
    }
  }

  private disposeOverlay(): void {
    if (this.focusTimer !== undefined) clearTimeout(this.focusTimer);
    this.focusTimer = undefined;
    this.overlayHandle?.dispose();
    this.overlayHandle = null;
  }

  ngOnDestroy(): void {
    this.disposeOverlay();
  }
}
