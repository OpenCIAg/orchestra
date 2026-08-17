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
:host { display: block; box-sizing: border-box; font-family: var(--font-sans, Inter, system-ui, sans-serif); }
*, *::before, *::after { box-sizing: border-box; }
button, input { font: inherit; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: .55; }
.orc-p2-muted { color: var(--orc-font-secondary, #64748b); }
.orc-p2-focus:focus-visible, button:focus-visible, input:focus-visible, [tabindex]:focus-visible { outline: 2px solid var(--orc-color-azul-eletrico, #2563eb); outline-offset: 2px; }
`;
