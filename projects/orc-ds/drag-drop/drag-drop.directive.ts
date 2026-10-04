import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  booleanAttribute,
  effect,
  inject,
  input,
  output,
} from '@angular/core';

const SCOPE_MIME = 'application/x-orc-drag-scope';

function scopeMatches(
  target: string | readonly string[] | undefined,
  transfer: DataTransfer | null | undefined,
  requirePayload = false,
): boolean {
  if (!target) return true;
  const source = transfer?.getData(SCOPE_MIME);
  // During dragenter/dragover the browser protects the payload, but the
  // custom MIME marker remains visible through DataTransfer.types. Validate
  // the actual scope on drop, when getData is available.
  if (!source)
    return (
      !requirePayload && Array.from(transfer?.types ?? []).includes(SCOPE_MIME)
    );
  const left = Array.isArray(target) ? target : [target];
  const right = source
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return left.some((value) => right.includes(value));
}

@Directive({ selector: '[orcDraggable], [pDraggable]', standalone: true })
export class DraggableDirective implements AfterViewInit {
  readonly scope = input<string | string[] | undefined>(undefined, {
    alias: 'orcDraggable',
  });
  readonly pScope = input<string | string[] | undefined>(undefined, {
    alias: 'pDraggable',
  });
  readonly dragEffect = input<DataTransfer['effectAllowed']>('move');
  readonly dragHandle = input<string | undefined>(undefined);
  readonly disabled = input(false, {
    alias: 'orcDraggableDisabled',
    transform: booleanAttribute,
  });
  readonly pDisabled = input(false, {
    alias: 'pDraggableDisabled',
    transform: booleanAttribute,
  });
  readonly onDragStart = output<DragEvent>();
  readonly onDragEnd = output<DragEvent>();
  readonly onDrag = output<DragEvent>();

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    effect(() => {
      this.element.nativeElement.draggable = !this.isDisabled();
    });
  }
  ngAfterViewInit(): void {
    this.element.nativeElement.draggable = !this.isDisabled();
  }
  private isDisabled(): boolean {
    return this.disabled() || this.pDisabled();
  }
  @HostListener('dragstart', ['$event']) dragStart(event: DragEvent): void {
    if (this.isDisabled()) {
      event.preventDefault();
      return;
    }
    if (
      this.dragHandle() &&
      !(event.target as HTMLElement)?.closest(this.dragHandle()!)
    ) {
      event.preventDefault();
      return;
    }
    if (event.dataTransfer)
      event.dataTransfer.effectAllowed = this.dragEffect();
    const scopes = this.scope() ?? this.pScope();
    if (event.dataTransfer && scopes) {
      event.dataTransfer.setData(
        SCOPE_MIME,
        (Array.isArray(scopes) ? scopes : [scopes]).join(','),
      );
    }
    this.onDragStart.emit(event);
  }
  @HostListener('drag', ['$event']) drag(event: DragEvent): void {
    if (!this.isDisabled()) this.onDrag.emit(event);
  }
  @HostListener('dragend', ['$event']) dragEnd(event: DragEvent): void {
    if (!this.isDisabled()) this.onDragEnd.emit(event);
  }
}

@Directive({ selector: '[orcDroppable], [pDroppable]', standalone: true })
export class DroppableDirective implements AfterViewInit {
  readonly scope = input<string | string[] | undefined>(undefined, {
    alias: 'orcDroppable',
  });
  readonly pScope = input<string | string[] | undefined>(undefined, {
    alias: 'pDroppable',
  });
  readonly disabled = input(false, {
    alias: 'orcDroppableDisabled',
    transform: booleanAttribute,
  });
  readonly pDisabled = input(false, {
    alias: 'pDroppableDisabled',
    transform: booleanAttribute,
  });
  readonly dropEffect = input<DataTransfer['dropEffect']>('move');
  readonly onDragEnter = output<DragEvent>();
  readonly onDragLeave = output<DragEvent>();
  readonly onDrop = output<DragEvent>();
  private active = false;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    effect(() => {
      const disabled = this.isDisabled();
      this.element.nativeElement.setAttribute(
        'aria-dropeffect',
        this.dropEffect(),
      );
      if (disabled) this.active = false;
    });
  }
  ngAfterViewInit(): void {
    this.element.nativeElement.setAttribute(
      'aria-dropeffect',
      this.dropEffect(),
    );
  }
  @HostBinding('class.orc-droppable--active') get activeClass(): boolean {
    return this.active;
  }
  @HostBinding('class.orc-droppable--disabled') get disabledClass(): boolean {
    return this.isDisabled();
  }
  @HostBinding('attr.aria-disabled') get ariaDisabled(): string | null {
    return this.isDisabled() ? 'true' : null;
  }
  private isDisabled(): boolean {
    return this.disabled() || this.pDisabled();
  }
  @HostListener('dragover', ['$event']) dragOver(event: DragEvent): void {
    if (
      this.isDisabled() ||
      !scopeMatches(this.scope() ?? this.pScope(), event.dataTransfer)
    )
      return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = this.dropEffect();
  }
  @HostListener('dragenter', ['$event']) dragEnter(event: DragEvent): void {
    if (
      this.isDisabled() ||
      !scopeMatches(this.scope() ?? this.pScope(), event.dataTransfer)
    )
      return;
    event.preventDefault();
    this.active = true;
    this.onDragEnter.emit(event);
  }
  @HostListener('dragleave', ['$event']) dragLeave(event: DragEvent): void {
    if (this.isDisabled()) return;
    this.active = false;
    this.onDragLeave.emit(event);
  }
  @HostListener('drop', ['$event']) drop(event: DragEvent): void {
    if (
      this.isDisabled() ||
      !scopeMatches(this.scope() ?? this.pScope(), event.dataTransfer, true)
    )
      return;
    event.preventDefault();
    this.active = false;
    this.onDrop.emit(event);
  }
}
