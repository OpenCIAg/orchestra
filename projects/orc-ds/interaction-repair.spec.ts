import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeferDirective } from './defer/defer.directive';
import {
  DraggableDirective,
  DroppableDirective,
} from './drag-drop/drag-drop.directive';
import { SliderComponent } from './slider/slider.component';
import { FileUploaderComponent } from './file-uploader/file-uploader.component';

@Component({
  standalone: true,
  imports: [DeferDirective],
  template: `<div *orcDefer><span class="deferred">Ready</span></div>`,
})
class DeferHost {}

@Component({
  standalone: true,
  imports: [DraggableDirective, DroppableDirective],
  template: `<div orcDraggable="cards" (onDragStart)="started = true"></div>
    <div orcDroppable="cards"></div>`,
})
class DragHost {
  started = false;
}

describe('Interaction control repairs', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DeferDirective,
        DraggableDirective,
        DroppableDirective,
        SliderComponent,
        FileUploaderComponent,
        DeferHost,
        DragHost,
      ],
    }).compileComponents();
  });

  it('loads structural deferred content without observing a comment anchor', () => {
    const original = (window as any).IntersectionObserver;
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      value: undefined,
    });
    try {
      const fixture = TestBed.createComponent(DeferHost);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Ready');
    } finally {
      Object.defineProperty(window, 'IntersectionObserver', {
        configurable: true,
        value: original,
      });
    }
  });

  it('writes the configured drag scope and accepts a matching drop', () => {
    const fixture = TestBed.createComponent(DragHost);
    fixture.detectChanges();
    const draggable = fixture.debugElement
      .query(By.directive(DraggableDirective))
      .injector.get(DraggableDirective);
    const droppable = fixture.debugElement
      .query(By.directive(DroppableDirective))
      .injector.get(DroppableDirective);
    const values = new Map<string, string>();
    const transfer = {
      effectAllowed: '',
      dropEffect: '',
      setData: (key: string, value: string) => values.set(key, value),
      getData: (key: string) => values.get(key) || '',
    } as unknown as DataTransfer;
    const start = {
      preventDefault: () => {},
      target: fixture.nativeElement.children[0],
      dataTransfer: transfer,
    } as unknown as DragEvent;
    draggable.dragStart(start);
    expect(values.get('application/x-orc-drag-scope')).toBe('cards');
    let dropped = false;
    droppable.onDrop.subscribe(() => (dropped = true));
    droppable.drop({
      preventDefault: () => {},
      dataTransfer: transfer,
    } as unknown as DragEvent);
    expect(dropped).toBeTrue();
  });

  it('preserves zero as a valid range endpoint and renders vertical thumbs on the vertical axis', () => {
    const fixture: ComponentFixture<SliderComponent> =
      TestBed.createComponent(SliderComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('range', true);
    fixture.componentRef.setInput('orientation', 'vertical');
    component.writeValue([0, 0]);
    fixture.detectChanges();
    expect(component.currentEndValue()).toBe(0);
    expect(
      (
        fixture.nativeElement.querySelector(
          '.orc-slider-thumb--end',
        ) as HTMLElement
      ).style.bottom,
    ).toBe('0%');
  });

  it('renders and removes selected files through the CVA-backed list', () => {
    const fixture: ComponentFixture<FileUploaderComponent> =
      TestBed.createComponent(FileUploaderComponent);
    const component = fixture.componentInstance;
    const file = new File(['data'], 'report.txt', { type: 'text/plain' });
    component['handleFiles']([file]);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.orc-file-item__name').textContent,
    ).toContain('report.txt');
    const id = component.files()[0].id;
    component.onRemoveFile(id);
    expect(component.files()).toEqual([]);
  });
});
