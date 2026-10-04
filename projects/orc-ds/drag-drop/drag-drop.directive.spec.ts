import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DraggableDirective, DroppableDirective } from './drag-drop.directive';

const SCOPE_MIME = 'application/x-orc-drag-scope';

@Component({
  standalone: true,
  imports: [DraggableDirective, DroppableDirective],
  template: `
    <div
      class="drag"
      [orcDraggable]="dragScope"
      [orcDraggableDisabled]="dragDisabled()"
      (onDragStart)="dragStarts = dragStarts + 1"
    ></div>
    <div
      class="drop"
      [orcDroppable]="dropScope"
      [orcDroppableDisabled]="dropDisabled()"
      (onDragEnter)="dragEnters = dragEnters + 1"
      (onDrop)="drops = drops + 1"
    ></div>
  `,
})
class DragDropHost {
  dragScope: string | string[] = 'cards';
  dropScope: string | string[] = 'cards';
  readonly dragDisabled = signal(false);
  readonly dropDisabled = signal(false);
  dragStarts = 0;
  dragEnters = 0;
  drops = 0;
}

class TestDataTransfer {
  effectAllowed: DataTransfer['effectAllowed'] = 'none';
  dropEffect: DataTransfer['dropEffect'] = 'none';
  readonly types: string[] = [];
  private readonly values = new Map<string, string>();

  setData(type: string, value: string): void {
    this.values.set(type, value);
    if (!this.types.includes(type)) this.types.push(type);
  }

  getData(type: string): string {
    return this.values.get(type) ?? '';
  }

  protectPayload(): void {
    this.values.clear();
  }
}

function dragEvent(type: string, transfer: TestDataTransfer): DragEvent {
  const event = new Event(type, {
    bubbles: true,
    cancelable: true,
  }) as DragEvent;
  Object.defineProperty(event, 'dataTransfer', {
    configurable: true,
    value: transfer,
  });
  return event;
}

describe('drag and drop directives', () => {
  let fixture: ComponentFixture<DragDropHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragDropHost],
    }).compileComponents();
    fixture = TestBed.createComponent(DragDropHost);
    fixture.detectChanges();
  });

  it('uses the private scope MIME marker and validates matching drops', () => {
    const host = fixture.componentInstance;
    const drag = fixture.nativeElement.querySelector('.drag') as HTMLElement;
    const drop = fixture.nativeElement.querySelector('.drop') as HTMLElement;
    const transfer = new TestDataTransfer();

    expect(drag.draggable).toBeTrue();
    expect(drag.dispatchEvent(dragEvent('dragstart', transfer))).toBeTrue();
    fixture.detectChanges();
    expect(transfer.getData(SCOPE_MIME)).toBe('cards');
    expect(host.dragStarts).toBe(1);

    expect(drop.dispatchEvent(dragEvent('dragenter', transfer))).toBeFalse();
    fixture.detectChanges();
    expect(host.dragEnters).toBe(1);
    expect(drop.classList).toContain('orc-droppable--active');

    expect(drop.dispatchEvent(dragEvent('dragover', transfer))).toBeFalse();
    expect(transfer.dropEffect).toBe('move');
    expect(drop.dispatchEvent(dragEvent('drop', transfer))).toBeFalse();
    fixture.detectChanges();
    expect(host.drops).toBe(1);
    expect(drop.classList).not.toContain('orc-droppable--active');
  });

  it('rejects mismatching scopes at dragenter and drop', () => {
    const host = fixture.componentInstance;
    const drop = fixture.nativeElement.querySelector('.drop') as HTMLElement;
    const transfer = new TestDataTransfer();
    transfer.setData(SCOPE_MIME, 'files');

    expect(drop.dispatchEvent(dragEvent('dragenter', transfer))).toBeTrue();
    expect(drop.dispatchEvent(dragEvent('drop', transfer))).toBeTrue();
    fixture.detectChanges();
    expect(host.dragEnters).toBe(0);
    expect(host.drops).toBe(0);
    expect(drop.classList).not.toContain('orc-droppable--active');
  });

  it('uses the MIME marker during protected dragover and validates the payload on drop', () => {
    const host = fixture.componentInstance;
    const drop = fixture.nativeElement.querySelector('.drop') as HTMLElement;
    const transfer = new TestDataTransfer();
    transfer.setData(SCOPE_MIME, 'cards');
    transfer.protectPayload();

    expect(drop.dispatchEvent(dragEvent('dragenter', transfer))).toBeFalse();
    fixture.detectChanges();
    expect(host.dragEnters).toBe(1);
    expect(drop.classList).toContain('orc-droppable--active');
    expect(drop.dispatchEvent(dragEvent('drop', transfer))).toBeTrue();
    expect(host.drops).toBe(0);
  });

  it('reacts to draggable disabled changes and exposes droppable disabled state', async () => {
    const host = fixture.componentInstance;
    const drag = fixture.nativeElement.querySelector('.drag') as HTMLElement;
    const drop = fixture.nativeElement.querySelector('.drop') as HTMLElement;
    const transfer = new TestDataTransfer();
    transfer.setData(SCOPE_MIME, 'cards');
    drop.dispatchEvent(dragEvent('dragenter', transfer));
    fixture.detectChanges();
    expect(drop.classList).toContain('orc-droppable--active');

    host.dragDisabled.set(true);
    host.dropDisabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(drag.draggable).toBeFalse();
    expect(drop.classList).toContain('orc-droppable--disabled');
    expect(drop.getAttribute('aria-disabled')).toBe('true');
    expect(drop.classList).not.toContain('orc-droppable--active');

    host.dragDisabled.set(false);
    host.dropDisabled.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(drag.draggable).toBeTrue();
    expect(drop.classList).not.toContain('orc-droppable--disabled');
    expect(drop.hasAttribute('aria-disabled')).toBeFalse();
  });
});
