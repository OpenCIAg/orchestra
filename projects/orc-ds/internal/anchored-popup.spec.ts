import { attachAnchoredPopup } from './anchored-popup';

describe('attachAnchoredPopup owner-document observers', () => {
  it('constructs ResizeObserver from the anchor owner window', () => {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    const ownerDocument = frame.contentDocument;
    const ownerWindow = frame.contentWindow;
    if (!ownerDocument || !ownerWindow)
      throw new Error('same-origin iframe unavailable');
    const parent = ownerDocument.createElement('div');
    const anchor = ownerDocument.createElement('button');
    const panel = ownerDocument.createElement('div');
    parent.append(anchor, panel);
    ownerDocument.body.appendChild(parent);

    class FrameResizeObserver {
      static instances: FrameResizeObserver[] = [];
      constructor(_callback: ResizeObserverCallback) {
        FrameResizeObserver.instances.push(this);
      }
      observe(_target: Element): void {}
      disconnect(): void {}
      unobserve(_target: Element): void {}
    }
    const original = (ownerWindow as unknown as { ResizeObserver?: unknown })
      .ResizeObserver;
    Object.defineProperty(ownerWindow, 'ResizeObserver', {
      configurable: true,
      value: FrameResizeObserver,
    });
    try {
      const detach = attachAnchoredPopup(anchor, panel);
      expect(FrameResizeObserver.instances.length).toBe(1);
      detach();
    } finally {
      Object.defineProperty(ownerWindow, 'ResizeObserver', {
        configurable: true,
        value: original,
      });
      frame.remove();
    }
  });
});
