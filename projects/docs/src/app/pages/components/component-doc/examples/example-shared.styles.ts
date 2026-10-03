/**
 * Shared styles for the colocated live-example components rendered by the
 * generic documentation page. Each example declares these styles in its own
 * component scope so every example stays an independent lazy chunk without
 * global style leakage. Extracted from the former 4,388-line generic page.
 */
export const EXAMPLE_STYLES = `
.example-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.example-grid {
  display: grid;
  gap: var(--space-4);
}
.example-grid--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.example-grid--three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.example {
  min-width: 0;
  padding: var(--space-4);
  background: var(--bg-app);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
}

.example--muted {
  background: var(--bg-subtle);
}
.example--centered {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: var(--space-4);
  text-align: center;
}
.example__label {
  display: block;
  margin-bottom: var(--space-3);
  color: var(--text-muted);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.example p,
.example__caption {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  line-height: 1.55;
}
.example code,
.state-note code {
  color: var(--orc-color-azul-eletrico);
  font-family: var(--font-mono);
  font-size: 0.75rem;
}
.example > code {
  display: block;
  margin-top: var(--space-3);
}

.native-control {
  width: 100%;
  min-height: 40px;
  padding: 8px 11px;
  box-sizing: border-box;
  color: var(--text-primary);
  background: var(--orc-fill-input, var(--bg-app));
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font: inherit;
  outline: none;

  &:focus {
    border-color: var(--orc-color-azul-eletrico);
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--orc-color-azul-eletrico) 12%, transparent);
  }
}
.native-control--error {
  border-color: var(--color-error);
}
.native-control--textarea {
  resize: vertical;
}

.native-label {
  display: block;
  margin: 0 0 6px;
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
}
.native-label + .native-label {
  margin-top: var(--space-3);
}

.doc-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 40px;
  padding: 0 14px;
  color: var(--orc-on-interactive);
  background: var(--orc-color-azul-eletrico);
  border: 1px solid var(--orc-color-azul-eletrico);
  border-radius: var(--radius-md);
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    filter var(--transition-fast),
    background var(--transition-fast);

  &:hover {
    filter: brightness(0.94);
  }
  &:focus-visible {
    outline: 3px solid
      color-mix(in srgb, var(--orc-color-azul-eletrico) 25%, transparent);
    outline-offset: 2px;
  }
}
.doc-button--secondary {
  color: var(--text-primary);
  background: var(--bg-app);
  border-color: var(--border-default);
}
.doc-button__chevron {
  margin-right: calc(var(--space-2) * -1);
}

.state-note {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: var(--space-3);
  background: var(--bg-app);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
}
.state-note strong {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
}
.state-note span {
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.popover-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
}
.popover-copy,
.drawer-copy,
.collapsible-copy {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.toolbar-action {
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  color: var(--text-primary);
  background: var(--bg-app);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-size: 1.1rem;
  cursor: pointer;
}
.toolbar-action:focus-visible {
  outline: 3px solid
    color-mix(in srgb, var(--orc-color-azul-eletrico) 20%, transparent);
  outline-offset: 2px;
}

.color-value {
  display: grid;
  place-items: center;
  min-height: 38px;
  margin-top: var(--space-3);
  color: #fff;
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.divider-demo {
  gap: var(--space-4);
}
.divider-vertical-example {
  min-height: 110px;
}
.divider-vertical-wrap {
  display: flex;
  align-items: center;
  justify-content: space-around;
  min-height: 55px;
  color: var(--text-secondary);
  font-size: 0.8125rem;
}
.divider-vertical-wrap orc-divider,
.divider-vertical-wrap orc-separator {
  align-self: stretch;
}

.image-demo .example {
  overflow: hidden;
}

.form-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-4);
}
.feedback-line {
  margin: var(--space-3) 0 0;
  color: var(--color-success);
  font-size: 0.8125rem;
}

@media (max-width: 680px) {
  .example-grid--two,
  .example-grid--three {
    grid-template-columns: 1fr;
  }
}
`;
