import { inject } from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';

/**
 * Returns a unique, SSR-stable DOM id such as `orc-select-3`.
 *
 * Backed by the CDK `_IdGenerator`, which namespaces ids by `APP_ID`, so the
 * server and the hydrated client produce the same sequence and multiple apps
 * on one page never collide. Must run in an injection context.
 *
 * ```ts
 * protected readonly panelId = orcId('orc-select-panel');
 * ```
 */
export function orcId(prefix = 'orc-'): string {
  const normalized = prefix.endsWith('-') ? prefix : `${prefix}-`;
  return inject(_IdGenerator).getId(normalized);
}
