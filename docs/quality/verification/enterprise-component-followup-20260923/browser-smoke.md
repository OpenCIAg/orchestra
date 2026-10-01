# Manual browser smoke check — 2026-09-23

The local docs app was served at `127.0.0.1:4301` and exercised manually in Chrome and Safari. This is a focused smoke check, not a replacement for the automated suite or a full browser/accessibility matrix.

## DateTime picker

- In both browsers, opening the `Agendamento` field displays the month grid and hour, minute, and second controls. Clicking outside the widget dismisses the popup, and Escape dismisses it as well.
- In Chrome at a 390 × 844 viewport, the popup stays within the horizontal viewport. Its content can be scrolled to reach the time controls when vertical space is constrained.

## Modal

- In both browsers, the default declarative modal closes on Escape and on a backdrop click.
- The modal configured with `closeOnBackdropClick=false` and `closeOnEscape=false` remains open after both actions.

Firefox and Edge desktop apps are not installed; the automated Playwright gate separately runs browser-managed Firefox and WebKit engines. The repository's Karma runner still launches Chrome only. The viewport check is browser emulation, not a physical mobile device. Screen-reader behavior, SSR hydration, and projected-view ownership remain unverified.

The [automated Playwright gate](browser-interactions.log) runs the DateTime outside-click regression, default/protected declarative-modal Escape/backdrop policies, and the Button icon-to-label gap in Chromium, Firefox, and WebKit; all twelve browser checks passed.
