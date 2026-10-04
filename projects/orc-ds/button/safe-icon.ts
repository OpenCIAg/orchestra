import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import createDOMPurify, { DOMPurify, WindowLike } from 'dompurify';

const purifiers = new WeakMap<Document, DOMPurify>();

/** SVG strings are an existing API. Only sanitized static SVG crosses Angular's trust boundary. */
export function safeIcon(
  icon: string | undefined,
  document: Document,
  sanitizer: DomSanitizer,
): { isSvg: boolean; content: string | SafeHtml } | null {
  if (!icon?.trim()) return null;
  if (!icon.trim().startsWith('<svg')) return { isSvg: false, content: icon };
  if (!document.defaultView) return null;
  let purifier = purifiers.get(document);
  if (!purifier) {
    purifier = createDOMPurify(document.defaultView as unknown as WindowLike);
    purifiers.set(document, purifier);
  }
  const sanitized = purifier.sanitize(icon, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: [
      'style',
      'foreignObject',
      'animate',
      'animateMotion',
      'animateTransform',
      'set',
    ],
    FORBID_ATTR: ['style'],
  });
  return { isSvg: true, content: sanitizer.bypassSecurityTrustHtml(sanitized) };
}
