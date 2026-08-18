import { AfterViewInit, Directive, ElementRef, HostListener, booleanAttribute, input, output } from '@angular/core';

function scopeMatches(source: string | readonly string[] | undefined, target: string | readonly string[] | undefined): boolean {
  if (!source || !target) return true;
  const left = Array.isArray(source) ? source : [source];
  const right = Array.isArray(target) ? target : [target];
  return left.some(value => right.includes(value));
}

@Directive({ selector: '[orcDraggable], [pDraggable]', standalone: true })
export class DraggableDirective implements AfterViewInit {
  readonly scope = input<string | string[] | undefined>(undefined, { alias: 'orcDraggable' });
  readonly pScope = input<string | string[] | undefined>(undefined, { alias: 'pDraggable' });
  readonly dragEffect = input<DataTransfer['effectAllowed']>('move');
  readonly dragHandle = input<string | undefined>(undefined);
  readonly disabled = input(false, { alias: 'orcDraggableDisabled', transform: booleanAttribute });
  readonly pDisabled = input(false, { alias: 'pDraggableDisabled', transform: booleanAttribute });
  readonly onDragStart = output<DragEvent>();
  readonly onDragEnd = output<DragEvent>();
  readonly onDrag = output<DragEvent>();

  constructor(private readonly element: ElementRef<HTMLElement>) {}
  ngAfterViewInit(): void { this.element.nativeElement.draggable = !this.isDisabled(); }
  private isDisabled(): boolean { return this.disabled() || this.pDisabled(); }
  @HostListener('dragstart', ['$event']) dragStart(event: DragEvent): void {
    if (this.isDisabled()) { event.preventDefault(); return; }
    if (this.dragHandle() && !(event.target as HTMLElement)?.closest(this.dragHandle()!)) { event.preventDefault(); return; }
    if (event.dataTransfer) event.dataTransfer.effectAllowed = this.dragEffect();
    this.onDragStart.emit(event);
  }
  @HostListener('drag', ['$event']) drag(event: DragEvent): void { if (!this.isDisabled()) this.onDrag.emit(event); }
  @HostListener('dragend', ['$event']) dragEnd(event: DragEvent): void { if (!this.isDisabled()) this.onDragEnd.emit(event); }
}

@Directive({ selector: '[orcDroppable], [pDroppable]', standalone: true })
export class DroppableDirective implements AfterViewInit {
  readonly scope = input<string | string[] | undefined>(undefined, { alias: 'orcDroppable' });
  readonly pScope = input<string | string[] | undefined>(undefined, { alias: 'pDroppable' });
  readonly disabled = input(false, { alias: 'orcDroppableDisabled', transform: booleanAttribute });
  readonly pDisabled = input(false, { alias: 'pDroppableDisabled', transform: booleanAttribute });
  readonly dropEffect = input<DataTransfer['dropEffect']>('move');
  readonly onDragEnter = output<DragEvent>();
  readonly onDragLeave = output<DragEvent>();
  readonly onDrop = output<DragEvent>();
  private active = false;
  constructor(private readonly element: ElementRef<HTMLElement>) {}
  ngAfterViewInit(): void { this.element.nativeElement.setAttribute('aria-dropeffect', this.dropEffect()); }
  private isDisabled(): boolean { return this.disabled() || this.pDisabled(); }
  @HostListener('dragover', ['$event']) dragOver(event: DragEvent): void { if (this.isDisabled()) return; event.preventDefault(); if (event.dataTransfer) event.dataTransfer.dropEffect = this.dropEffect(); }
  @HostListener('dragenter', ['$event']) dragEnter(event: DragEvent): void { if (this.isDisabled() || !scopeMatches(this.scope() ?? this.pScope(), event.dataTransfer?.types)) return; event.preventDefault(); this.active = true; this.onDragEnter.emit(event); }
  @HostListener('dragleave', ['$event']) dragLeave(event: DragEvent): void { if (this.isDisabled()) return; this.active = false; this.onDragLeave.emit(event); }
  @HostListener('drop', ['$event']) drop(event: DragEvent): void { if (this.isDisabled()) return; event.preventDefault(); this.active = false; this.onDrop.emit(event); }
}
