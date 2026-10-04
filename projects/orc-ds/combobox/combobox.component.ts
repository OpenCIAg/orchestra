import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, PositionStrategy } from '@angular/cdk/overlay';
import {
  attachListPickerOverlay,
  CvaControl,
  listPickerActiveId,
  listPickerActiveIndex,
  listPickerEnabledIndexes,
  listPickerFirstEnabled,
  listPickerValueMatchesFilter,
  overlayAttachmentTarget,
  P2_PANEL_VARS,
  P2_SHARED_STYLES,
  stepListPickerActive,
} from '@ciag/orchestra/internal';
import type {
  ListPickerOverlayHandle,
  P2Option,
} from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-combobox',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComboboxComponent),
      multi: true,
    },
  ],
  templateUrl: './combobox.component.html',
  styles: [P2_SHARED_STYLES, P2_PANEL_VARS],
  styleUrl: './combobox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxComponent<T = unknown>
  extends CvaControl
  implements AfterViewInit
{
  private static nextId = 0;
  readonly inputId = `orc-combobox-${++ComboboxComponent.nextId}`;
  readonly listId = `${this.inputId}-listbox`;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly overlay = inject(Overlay);
  private readonly inputEl =
    viewChild<ElementRef<HTMLInputElement>>('inputEl');
  private readonly panelTemplate =
    viewChild.required<TemplateRef<unknown>>('panelTemplate');
  /** The panel template is only attachable once the host view exists. */
  private readonly panelReady = signal(false);
  private overlayHandle: ListPickerOverlayHandle | null = null;
  readonly options = input<P2Option<T>[]>([]);
  readonly value = model<T | null>(null);
  readonly query = model('');
  readonly open = model(false);
  readonly label = input('');
  readonly placeholder = input<string | undefined>(undefined);
  readonly helperText = input('');
  readonly emptyText = input<string | undefined>(undefined);
  readonly clearAriaLabel = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly optionSelected = output<P2Option<T>>();
  readonly activeIndex = signal(-1);
  readonly activeOptionIndex = computed(() =>
    listPickerActiveIndex(
      this.activeIndex(),
      this.filteredOptions().length,
      (index) => !!this.filteredOptions()[index].disabled,
    ),
  );

  private inputHasFocus = false;
  private userQueryEdited = false;
  private lastSynchronizedValue: T | null = null;

  constructor() {
    super();
    inject(DestroyRef).onDestroy(() => {
      this.overlayHandle?.dispose();
      this.overlayHandle = null;
    });
    effect(() => {
      const value = this.value();
      const options = this.options();
      if (this.userQueryEdited && Object.is(value, this.lastSynchronizedValue))
        return;
      this.userQueryEdited = false;
      this.lastSynchronizedValue = value;
      this.query.set(
        value == null
          ? ''
          : (options.find((option) => Object.is(option.value, value))?.label ??
              ''),
      );
    });
    effect(() => {
      if (this.effectiveDisabled()) {
        this.open.set(false);
        this.activeIndex.set(-1);
      }
    });
  }

  ngAfterViewInit(): void {
    this.panelReady.set(true);
  }

  readonly filteredOptions = computed(() => {
    const term = this.query().trim();
    if (!term) return this.options();
    return this.options().filter((option) =>
      listPickerValueMatchesFilter(option.label, term, 'contains'),
    );
  });

  optionId(index: number): string {
    return listPickerActiveId(this.listId, index) as string;
  }

  protected override isSelfDisabled(): boolean {
    return this.disabled();
  }

  writeValue(value: T | null): void {
    this.userQueryEdited = false;
    this.lastSynchronizedValue = value;
    this.value.set(value);
    this.query.set(
      value == null
        ? ''
        : (this.options().find((option) => Object.is(option.value, value))
            ?.label ?? ''),
    );
  }

  onInput(event: Event): void {
    if (this.effectiveDisabled()) return;
    const previousValue = this.value();
    this.userQueryEdited = true;
    this.lastSynchronizedValue = null;
    this.query.set((event.target as HTMLInputElement).value);
    if (previousValue !== null) {
      this.value.set(null);
      this.cvaOnChange(null);
    }
    this.open.set(true);
    this.ensureOverlay();
    this.activeIndex.set(this.firstEnabledIndex());
  }

  onFocus(): void {
    if (this.effectiveDisabled()) return;
    this.inputHasFocus = true;
    this.open.set(true);
    this.ensureOverlay();
    const selectedIndex = this.filteredOptions().findIndex(
      (option) => !option.disabled && Object.is(option.value, this.value()),
    );
    this.activeIndex.set(selectedIndex);
  }

  onBlur(): void {
    this.open.set(false);
    this.activeIndex.set(-1);
    if (!this.inputHasFocus) return;
    this.inputHasFocus = false;
    this.cvaOnTouched();
  }

  select(option: P2Option<T>): void {
    if (
      option.disabled ||
      this.effectiveDisabled() ||
      !this.options().includes(option)
    )
      return;
    const previousValue = this.value();
    this.userQueryEdited = false;
    this.lastSynchronizedValue = option.value;
    this.value.set(option.value);
    this.query.set(option.label);
    this.open.set(false);
    this.activeIndex.set(-1);
    if (!Object.is(previousValue, option.value)) this.cvaOnChange(option.value);
    this.optionSelected.emit(option);
  }

  clear(): void {
    if (this.effectiveDisabled()) return;
    const previousValue = this.value();
    this.userQueryEdited = false;
    this.lastSynchronizedValue = null;
    this.value.set(null);
    this.query.set('');
    this.open.set(false);
    this.activeIndex.set(-1);
    if (previousValue !== null) this.cvaOnChange(null);
  }

  isSelected(option: P2Option<T>): boolean {
    return Object.is(this.value(), option.value);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.open()) {
        event.preventDefault();
        this.dismiss();
      }
      return;
    }
    if (this.effectiveDisabled()) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      this.open.set(true);
      this.ensureOverlay();
      this.moveActive(delta);
    } else if (
      event.key === 'Enter' &&
      this.open() &&
      this.activeOptionIndex() >= 0
    ) {
      event.preventDefault();
      const option = this.filteredOptions()[this.activeOptionIndex()];
      if (option) this.select(option);
    }
  }

  private firstEnabledIndex(): number {
    return listPickerFirstEnabled(
      this.filteredOptions().length,
      (index) => !!this.filteredOptions()[index].disabled,
    );
  }

  private moveActive(delta: 1 | -1): void {
    const options = this.filteredOptions();
    const enabled = listPickerEnabledIndexes(
      options.length,
      (index) => !!options[index].disabled,
    );
    const next = stepListPickerActive(this.activeIndex(), delta, enabled, true);
    this.activeIndex.set(next ?? -1);
  }

  private dismiss(): void {
    if (!this.open()) return;
    this.overlayHandle?.dispose();
    this.overlayHandle = null;
    this.open.set(false);
    this.activeIndex.set(-1);
  }

  // Signal-driven attachment: direct writes to the open model must arm the
  // dismissal lifecycle too; idempotent against the open-path attach.
  private readonly overlayWatcher = effect(() => {
    if (this.open() && this.panelReady() && !this.overlayHandle) {
      this.ensureOverlay();
    } else if (!this.open() && this.overlayHandle) {
      this.overlayHandle.dispose();
      this.overlayHandle = null;
    }
  });

  /** Synchronous attachment: the dismissal contract does not wait for a render cycle. */
  private ensureOverlay(): void {
    if (this.overlayHandle || !this.panelReady()) return;
    const anchor = this.inputEl()?.nativeElement ?? this.host.nativeElement;
    const anchorWidth = anchor.getBoundingClientRect().width;
    this.overlayHandle = attachListPickerOverlay({
      anchor,
      content: this.panelTemplate(),
      viewContainerRef: this.viewContainerRef,
      overlay: this.overlay,
      positionStrategy: (origin) => this.createPositionStrategy(origin),
      minWidth: anchorWidth,
      onEscape: () => this.dismiss(),
      onBackdrop: () => this.dismiss(),
      onParentClose: () => this.dismiss(),
      documentEscape: () => this.dismiss(),
      targets: () =>
        [this.host.nativeElement, this.overlayHandle?.overlayElement].filter(
          (element): element is HTMLElement => !!element,
        ),
      onOutside: () => this.dismissFromOutside(),
    });
  }

  private createPositionStrategy(origin: HTMLElement): PositionStrategy {
    const parent = overlayAttachmentTarget(origin, 'body');
    const positions = [
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
    ] as const;
    return this.overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPopoverLocation(
        parent === origin.ownerDocument.body
          ? 'global'
          : { type: 'parent', element: parent },
      )
      .withPositions([...positions])
      .withPush(true);
  }

  /**
   * Outside pointer dismissal. The blur close handles the touched handshake
   * when focus actually moves; this covers the interactions that never blur
   * the input, which must still mark the control touched.
   */
  private dismissFromOutside(): void {
    if (!this.open()) return;
    this.dismiss();
    if (!this.inputHasFocus) return;
    this.inputHasFocus = false;
    this.cvaOnTouched();
  }
}
