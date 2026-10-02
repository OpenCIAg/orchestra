import { TestBed } from '@angular/core/testing';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { NavigationShellComponent } from './navigation/navigation-shell.component';
import {
  ContextMenuComponent,
  SpeedDialComponent,
} from './p2/p2-overlay-components';
import { SplitButtonComponent } from './p2/p2-primeng-gap-components';
import { TreeSelectComponent } from './p2/p2-selection-components';

describe('owner-document global interaction listeners', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        ColorPickerComponent,
        NavigationShellComponent,
        ContextMenuComponent,
        SpeedDialComponent,
        SplitButtonComponent,
        TreeSelectComponent,
      ],
    }),
  );

  function iframe(): { frame: HTMLIFrameElement; document: Document } {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    const ownerDocument = frame.contentDocument;
    if (!ownerDocument) throw new Error('same-origin iframe unavailable');
    return { frame, document: ownerDocument };
  }

  it('dismisses ColorPicker from a click in its owner document', () => {
    const fixture = TestBed.createComponent(ColorPickerComponent);
    const { frame, document: ownerDocument } = iframe();
    ownerDocument.body.appendChild(
      ownerDocument.adoptNode(fixture.nativeElement),
    );
    fixture.detectChanges();
    fixture.componentInstance.toggle();
    const outside = ownerDocument.createElement('button');
    ownerDocument.body.appendChild(outside);
    outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(fixture.componentInstance.isOpen()).toBeFalse();
    fixture.destroy();
    frame.remove();
  });

  it('closes NavigationShell from Escape in its owner document', () => {
    const fixture = TestBed.createComponent(NavigationShellComponent);
    fixture.componentRef.setInput('open', true);
    const { frame, document: ownerDocument } = iframe();
    ownerDocument.body.appendChild(
      ownerDocument.adoptNode(fixture.nativeElement),
    );
    fixture.detectChanges();
    const closed = jasmine.createSpy('closed');
    fixture.componentInstance.requestClose.subscribe(closed);
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    ownerDocument.dispatchEvent(event);
    expect(event.defaultPrevented).toBeTrue();
    expect(closed).toHaveBeenCalledTimes(1);
    fixture.destroy();
    frame.remove();
  });

  it('dismisses ContextMenu, SpeedDial, TreeSelect, and SplitButton in their owner document', () => {
    const context = TestBed.createComponent(ContextMenuComponent);
    const contextRealm = iframe();
    contextRealm.document.body.appendChild(
      contextRealm.document.adoptNode(context.nativeElement),
    );
    context.detectChanges();
    context.componentInstance.open.set(true);
    contextRealm.document.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    );
    expect(context.componentInstance.open()).toBeFalse();

    const speed = TestBed.createComponent(SpeedDialComponent);
    const speedRealm = iframe();
    speedRealm.document.body.appendChild(
      speedRealm.document.adoptNode(speed.nativeElement),
    );
    speed.detectChanges();
    speed.componentInstance.show();
    speedRealm.document.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true }),
    );
    expect(speed.componentInstance.open()).toBeFalse();

    const tree = TestBed.createComponent(TreeSelectComponent);
    const treeRealm = iframe();
    treeRealm.document.body.appendChild(
      treeRealm.document.adoptNode(tree.nativeElement),
    );
    tree.detectChanges();
    tree.componentInstance.toggleOpen();
    treeRealm.document.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    expect(tree.componentInstance.open()).toBeFalse();

    const split = TestBed.createComponent(SplitButtonComponent);
    const splitRealm = iframe();
    splitRealm.document.body.appendChild(
      splitRealm.document.adoptNode(split.nativeElement),
    );
    split.detectChanges();
    split.componentInstance.open.set(true);
    splitRealm.document.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    );
    expect(split.componentInstance.isMenuOpen()).toBeFalse();

    context.destroy();
    speed.destroy();
    tree.destroy();
    split.destroy();
    contextRealm.frame.remove();
    speedRealm.frame.remove();
    treeRealm.frame.remove();
    splitRealm.frame.remove();
  });
});
