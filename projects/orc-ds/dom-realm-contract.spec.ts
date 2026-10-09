import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SelectButtonComponent } from '@ciag/orchestra/select-button';
import { TreeSelectComponent } from '@ciag/orchestra/tree-select';

describe('P2 owner-document DOM contracts', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [SelectButtonComponent, TreeSelectComponent],
    }),
  );

  function iframeDocument(): { frame: HTMLIFrameElement; document: Document } {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    const frameDocument = frame.contentDocument;
    if (!frameDocument) throw new Error('same-origin iframe unavailable');
    return { frame, document: frameDocument };
  }

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

    // The shared detached-picker lifecycle binds to the anchor's owner
    // document; events dispatched inside a foreign realm (an iframe) cannot
    // reach it, so the panel stays open. The helper-level owner-document
    // contract is pinned in internal/list-picker.spec.ts.
    inside.dispatchEvent(
      new frameDocument.defaultView!.MouseEvent('pointerdown', {
        bubbles: true,
      }),
    );
    inside.dispatchEvent(
      new frameDocument.defaultView!.MouseEvent('click', { bubbles: true }),
    );
    expect(component.open()).toBeTrue();
    frame.remove();
    fixture.destroy();
  });
});
