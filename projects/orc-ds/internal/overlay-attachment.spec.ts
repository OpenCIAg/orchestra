import { overlayAttachmentTarget } from './overlay-attachment';

describe('overlayAttachmentTarget', () => {
  it('accepts a target from the anchor document realm', () => {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    try {
      const ownerDocument = frame.contentDocument;
      if (!ownerDocument)
        throw new Error('Expected same-origin iframe document');

      const anchor = ownerDocument.createElement('button');
      const target = ownerDocument.createElement('div');
      ownerDocument.body.append(anchor, target);

      expect(overlayAttachmentTarget(anchor, target, ownerDocument.body)).toBe(
        target,
      );
    } finally {
      frame.remove();
    }
  });

  it('retains body, self, selector, and fallback policies', () => {
    const anchor = document.createElement('button');
    const target = document.createElement('div');
    target.id = 'overlay-attachment-target';
    document.body.append(anchor, target);

    expect(overlayAttachmentTarget(anchor, 'body')).toBe(document.body);
    expect(overlayAttachmentTarget(anchor, 'self')).toBe(anchor);
    expect(overlayAttachmentTarget(anchor, '#overlay-attachment-target')).toBe(
      target,
    );
    expect(overlayAttachmentTarget(anchor, '#missing-target')).toBe(anchor);
    expect(overlayAttachmentTarget(anchor, '[invalid')).toBe(anchor);

    anchor.remove();
    target.remove();
  });
});
