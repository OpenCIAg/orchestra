import { focusMenuTarget, menuFocusTargets, stepMenuIndex } from './menu-keyboard';

describe('menu roving-focus helpers', () => {
  function menuHost(): HTMLElement {
    const host = document.createElement('div');
    host.innerHTML = `
      <button role="menuitem" data-i="0">First</button>
      <button role="menuitem" disabled data-i="1">Blocked</button>
      <a role="menuitem" aria-disabled="true" data-i="2">Aria blocked</a>
      <button role="menuitem" data-i="3">Last</button>
    `;
    document.body.appendChild(host);
    return host;
  }

  describe('menuFocusTargets', () => {
    it('returns enabled items in DOM order and skips disabled and aria-disabled', () => {
      const host = menuHost();
      try {
        const items = menuFocusTargets(
          host,
          '[role="menuitem"]:not(:disabled):not([aria-disabled="true"])',
        );
        expect(items.map((item) => item.dataset['i'])).toEqual(['0', '3']);
      } finally {
        host.remove();
      }
    });

    it('tolerates a missing host', () => {
      expect(menuFocusTargets(null, '[role="menuitem"]')).toEqual([]);
    });
  });

  describe('focusMenuTarget', () => {
    it('focuses the item the selector matches at the index', () => {
      const host = menuHost();
      try {
        focusMenuTarget(
          host,
          '[role="menuitem"]:not(:disabled):not([aria-disabled="true"])',
          1,
        );
        expect(
          (document.activeElement as HTMLElement | null)?.dataset['i'],
        ).toBe('3');
      } finally {
        host.remove();
      }
    });

    it('focuses nothing when the index has no match', () => {
      const host = menuHost();
      try {
        focusMenuTarget(host, '[role="menuitem"]', 99);
        expect(document.activeElement).toBe(document.body);
      } finally {
        host.remove();
      }
    });
  });

  describe('stepMenuIndex', () => {
    it('wraps around both ends by default', () => {
      expect(stepMenuIndex(2, 1, 3)).toBe(0);
      expect(stepMenuIndex(0, -1, 3)).toBe(2);
      expect(stepMenuIndex(1, 5, 3)).toBe(0);
    });

    it('clamps instead of wrapping when wrap is false', () => {
      expect(stepMenuIndex(2, 1, 3, false)).toBe(2);
      expect(stepMenuIndex(0, -1, 3, false)).toBe(0);
      expect(stepMenuIndex(1, 1, 3, false)).toBe(2);
    });

    it('pins empty menus to zero', () => {
      expect(stepMenuIndex(2, 1, 0)).toBe(0);
      expect(stepMenuIndex(2, 1, 0, false)).toBe(0);
    });
  });
});
