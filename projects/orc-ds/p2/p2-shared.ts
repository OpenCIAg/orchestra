export interface P2Option<T = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: string;
}

export type P2Size = 'sm' | 'md' | 'lg';
export type P2Orientation = 'horizontal' | 'vertical';

export const P2_SHARED_STYLES = `
:host {
  display: block;
  box-sizing: border-box;
  font-family: var(--font-sans, Inter, system-ui, sans-serif);
  --orc-component-surface: var(--orc-surface, var(--bg-app, #fff));
  --orc-component-surface-raised: var(--orc-surface-raised, var(--orc-component-surface));
  --orc-component-surface-subtle: var(--orc-surface-subtle, var(--bg-subtle, #f8fafc));
  --orc-component-surface-muted: var(--orc-surface-muted, var(--bg-muted, #f1f5f9));
  --orc-component-control: var(--orc-control-surface, var(--orc-component-surface));
  --orc-component-text: var(--orc-text, var(--text-primary, #0f172a));
  --orc-component-text-secondary: var(--orc-text-secondary, var(--text-secondary, #475569));
  --orc-component-text-muted: var(--orc-text-muted, var(--text-muted, #64748b));
  --orc-component-border: var(--orc-border-default, var(--border-default, #e2e8f0));
  --orc-component-border-strong: var(--orc-border-strong, var(--border-strong, #cbd5e1));
  --orc-component-interactive: var(--orc-interactive, #2563eb);
  --orc-component-interactive-hover: var(--orc-interactive-hover, #1d4ed8);
  --orc-component-interactive-soft: var(--orc-interactive-soft, #eff6ff);
  --orc-component-on-interactive: var(--orc-on-interactive, #fff);
  --orc-component-on-dark: var(--orc-on-dark, #fff);
  --orc-terminal-surface: var(--orc-terminal-bg, #0f172a);
  --orc-component-shadow-color: var(--orc-shadow-color, rgb(15 23 42 / 0.14));
  --orc-component-interactive-shadow: var(--orc-interactive-shadow, rgb(37 99 235 / 0.25));
  --orc-component-surface-overlay: var(--orc-surface-overlay, var(--orc-surface-raised));
  --orc-component-code-surface: var(--orc-code-surface, #0f172a);
  --orc-component-code-surface-raised: var(--orc-code-surface-raised, #1e293b);
  --orc-component-code-border: var(--orc-code-border, #334155);
  --orc-component-code-text: var(--orc-code-text, #e2e8f0);
  --orc-component-code-muted: var(--orc-code-muted, #94a3b8);
  --orc-component-code-accent: var(--orc-code-accent, #4ade80);
  --orc-component-status-info-bg: var(--orc-status-info-bg, #eff6ff);
  --orc-component-status-info-fg: var(--orc-status-info-fg, #1e3a8a);
  --orc-component-status-success-bg: var(--orc-status-success-bg, #dcfce7);
  --orc-component-status-success-fg: var(--orc-status-success-fg, #166534);
  --orc-component-status-warning-bg: var(--orc-status-warning-bg, #fef3c7);
  --orc-component-status-warning-fg: var(--orc-status-warning-fg, #92400e);
  --orc-component-status-danger-bg: var(--orc-status-danger-bg, #fee2e2);
  --orc-component-status-danger-fg: var(--orc-status-danger-fg, #991b1b);
  --orc-component-status-info-border: var(--orc-status-info-border, var(--orc-component-interactive));
  --orc-component-status-success-border: var(--orc-status-success-border, #86efac);
  --orc-component-status-warning-border: var(--orc-status-warning-border, #fcd34d);
  --orc-component-status-danger-border: var(--orc-status-danger-border, #fca5a5);
  --orc-component-danger: var(--orc-danger, #b91c1c);
  --orc-component-scrim: var(--orc-scrim, rgb(15 23 42 / 0.56));
  --orc-component-overlay-shadow: var(--orc-shadow-overlay, var(--shadow-lg));
}
*, *::before, *::after { box-sizing: border-box; }
button, input { font: inherit; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: .55; }
.orc-p2-muted { color: var(--orc-component-text-muted); }
.orc-p2-focus:focus-visible, button:focus-visible, input:focus-visible, [tabindex]:focus-visible { outline: 2px solid var(--orc-component-interactive); outline-offset: 2px; }
`;
