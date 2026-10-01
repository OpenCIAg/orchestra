import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CascadeSelectComponent } from './p2-cascade-select-component';
import { SelectButtonComponent } from './p2-form-gap-components';
import { TreeSelectComponent } from './p2-selection-components';

describe('P2 owner-document DOM contracts', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        CascadeSelectComponent,
        SelectButtonComponent,
        TreeSelectComponent,
      ],
    }),
  );

  function iframeDocument(): { frame: HTMLIFrameElement; document: Document } {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    const frameDocument = frame.contentDocument;
    if (!frameDocument) throw new Error('same-origin iframe unavailable');
    return { frame, document: frameDocument };
  }

  it('dismisses CascadeSelect for an outside target from its iframe realm', () => {
    const fixture = TestBed.createComponent(CascadeSelectComponent);
    const component = fixture.componentInstance;
    component.open.set(true);
    fixture.detectChanges();
    const { frame, document: frameDocument } = iframeDocument();
    const host = frameDocument.createElement('div');
    const outside = frameDocument.createElement('button');
    frameDocument.body.append(host, outside);
    (component as unknown as { host: ElementRef<HTMLElement> }).host =
      new ElementRef(host);

    (
      component as unknown as {
        onDocumentPointerDown: (event: Event) => void;
      }
    ).onDocumentPointerDown({ target: outside } as unknown as Event);

    expect(component.open()).toBeFalse();
    frame.remove();
    fixture.destroy();
  });

  it('does not touch SelectButton when focus stays inside its iframe owner', () => {
    const fixture = TestBed.createComponent(SelectButtonComponent<string>);
    const component = fixture.componentInstance;
    const touched = jasmine.createSpy('touched');
    component.registerOnTouched(touched);
    const { frame, document: frameDocument } = iframeDocument();
    const host = frameDocument.createElement('div');
    const next = frameDocument.createElement('button');
    host.appendChild(next);
    frameDocument.body.appendChild(host);
    (component as unknown as { host: ElementRef<HTMLElement> }).host =
      new ElementRef(host);

    component.onContainerFocusOut({
      currentTarget: host,
      relatedTarget: next,
    } as unknown as FocusEvent);

    expect(touched).not.toHaveBeenCalled();
    frame.remove();
    fixture.destroy();
  });

  it('keeps TreeSelect open for an inside click from its iframe owner', () => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    const component = fixture.componentInstance;
    component.open.set(true);
    fixture.detectChanges();
    const { frame, document: frameDocument } = iframeDocument();
    const host = frameDocument.createElement('div');
    const inside = frameDocument.createElement('button');
    host.appendChild(inside);
    frameDocument.body.appendChild(host);
    (component as unknown as { host: ElementRef<HTMLElement> }).host =
      new ElementRef(host);

    component.onDocumentClick({ target: inside } as unknown as MouseEvent);

    expect(component.open()).toBeTrue();
    frame.remove();
    fixture.destroy();
  });
});
