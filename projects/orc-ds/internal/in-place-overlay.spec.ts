import { registerOverlay } from './overlay-lifecycle';
import { attachInPlaceOverlay } from './in-place-overlay';

/**
 * Pins for the shared in-place-picker overlay lifecycle: outside
 * dismissal, topmost-aware Escape, registry participation, owner-document
 * binding and the idempotent dispose. The picker families pin the same
 * behaviors through their public components.
 */
describe('attachInPlaceOverlay', () => {
  function setup(documentRef: Document = document, root?: HTMLElement) {
    const host = documentRef.createElement('div');
    const panel = documentRef.createElement('div');
    host.appendChild(panel);
    (root ?? documentRef.body).appendChild(host);
    const calls = {
      escape: 0,
      outside: [] as Event[],
      parentClose: 0,
    };
    const handle = attachInPlaceOverlay({
      host,
      panel,
      documentRef,
      onEscape: () => {
        calls.escape += 1;
      },
      onOutside: (event) => {
        calls.outside.push(event);
      },
      onParentClose: () => {
        calls.parentClose += 1;
      },
    });
    const cleanup = () => {
      handle.dispose();
      host.remove();
    };
    return { host, panel, handle, calls, cleanup };
  }

  function pressEscape(documentRef: Document = document): boolean {
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      cancelable: true,
    });
    documentRef.dispatchEvent(event);
    return event.defaultPrevented;
  }

  function click(documentRef: Document, target: HTMLElement): void {
    const MouseEventConstructor =
      documentRef.defaultView?.MouseEvent ?? MouseEvent;
    target.dispatchEvent(
      new MouseEventConstructor('pointerdown', {
        bubbles: true,
        cancelable: true,
      }),
    );
    target.dispatchEvent(
      new MouseEventConstructor('click', {
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  it('dismisses for outside pointer interactions and stays open for inside ones', () => {
    const scene = setup();
    click(document, scene.panel);
    expect(scene.calls.outside).toEqual([]);

    const stranger = document.createElement('button');
    document.body.appendChild(stranger);
    click(document, stranger);
    expect(scene.calls.outside.length).toBe(2);
    stranger.remove();
    scene.cleanup();
  });

  it('preventDefaults and reports Escape only while the panel is topmost', () => {
    const scene = setup();
    expect(pressEscape()).toBeTrue();
    expect(scene.calls.escape).toBe(1);

    // A layer registered above the panel owns Escape; the panel must not
    // consume the event while it is not the topmost layer.
    const sibling = document.createElement('div');
    document.body.appendChild(sibling);
    const release = registerOverlay(sibling);
    expect(pressEscape()).toBeFalse();
    expect(scene.calls.escape).toBe(1);
    release();
    sibling.remove();

    expect(pressEscape()).toBeTrue();
    expect(scene.calls.escape).toBe(2);
    scene.cleanup();
  });

  it('closes through the registry when a containing parent layer releases', () => {
    const parent = document.createElement('div');
    document.body.appendChild(parent);
    const release = registerOverlay(parent);

    // The host lives inside the parent surface at registration time, so the
    // registry records the layer as the panel's parent.
    const scene = setup(document, parent);

    expect(scene.calls.parentClose).toBe(0);
    release();
    parent.remove();
    expect(scene.calls.parentClose).toBe(1);
    scene.cleanup();
  });

  it('binds to the panel owner document, not the global one', () => {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    const frameDocument = frame.contentDocument;
    if (!frameDocument) throw new Error('same-origin iframe unavailable');

    const scene = setup(frameDocument);
    // Outside interaction inside the owner realm dismisses.
    click(frameDocument, frameDocument.body);
    expect(scene.calls.outside.length).toBe(2);
    // Escape inside the owner realm reaches the panel.
    expect(pressEscape(frameDocument)).toBeTrue();
    // The main document never sees a listener for this panel.
    click(document, document.body);
    expect(pressEscape(document)).toBeFalse();
    expect(scene.calls.outside.length).toBe(2);
    expect(scene.calls.escape).toBe(1);

    frame.remove();
  });

  it('dispose is idempotent and stops every listener', () => {
    const scene = setup();
    scene.cleanup();
    scene.cleanup();

    const stranger = document.createElement('button');
    document.body.appendChild(stranger);
    click(document, stranger);
    expect(pressEscape()).toBeFalse();
    expect(scene.calls.outside).toEqual([]);
    expect(scene.calls.escape).toBe(0);
    stranger.remove();
  });
});
