import {
  computed,
  inject,
  InjectionToken,
  isSignal,
  Provider,
  Signal,
  signal,
} from '@angular/core';
import { ORC_LABELS_PT_BR, OrcLabels, OrcLabelsOverrides } from './labels';

/** Source accepted by `provideOrcLabels`: a (partial) object or a signal of one. */
export type OrcLabelsSource =
  OrcLabelsOverrides | OrcLabels | Signal<OrcLabelsOverrides | OrcLabels>;

/**
 * Resolved labels for the current injector. Holds a signal so a provider can
 * switch language at runtime; read it through `injectOrcLabels()`.
 * The root default is `ORC_LABELS_PT_BR`.
 */
export const ORC_LABELS = new InjectionToken<Signal<OrcLabels>>('ORC_LABELS', {
  providedIn: 'root',
  factory: () => signal(ORC_LABELS_PT_BR).asReadonly(),
});

/**
 * Merges `overrides` over `base`, group by group. Functions and arrays are
 * leaves and replace the base value; `undefined` keeps the base value.
 */
export function mergeOrcLabels(
  base: OrcLabels,
  overrides: OrcLabelsOverrides | OrcLabels | null | undefined,
): OrcLabels {
  if (!overrides) return base;
  const result = { ...base } as Record<string, Record<string, unknown>>;
  for (const [group, values] of Object.entries(overrides)) {
    if (!values || typeof values !== 'object') continue;
    const merged = { ...(result[group] ?? {}) };
    for (const [key, value] of Object.entries(values)) {
      if (value !== undefined) merged[key] = value;
    }
    result[group] = merged;
  }
  return result as unknown as OrcLabels;
}

/**
 * Overrides Orchestra's default texts for this injector and its children.
 *
 * Accepts a partial object, a complete language pack, a signal of either
 * (runtime language switch) or a factory run in an injection context. Nested
 * providers merge over their parent, so an app-wide provider and a
 * component-level provider compose.
 *
 * ```ts
 * bootstrapApplication(App, {
 *   providers: [provideOrcLabels({ common: { close: 'Sair' } })],
 * });
 * // Component-level override:
 * @Component({ providers: [provideOrcLabels({ table: { empty: 'Sem projetos' } })] })
 * // Factory (runs in an injection context):
 * provideOrcLabels(() => inject(MyI18n).orchestraLabels)
 * ```
 */
export function provideOrcLabels(
  source: OrcLabelsSource | (() => OrcLabelsSource),
): Provider {
  return {
    provide: ORC_LABELS,
    useFactory: (): Signal<OrcLabels> => {
      const parent =
        inject(ORC_LABELS, { skipSelf: true, optional: true }) ??
        signal(ORC_LABELS_PT_BR);
      const resolved =
        typeof source === 'function' && !isSignal(source)
          ? (source as () => OrcLabelsSource)()
          : source;
      return computed(() =>
        mergeOrcLabels(
          parent(),
          isSignal(resolved) ? resolved() : (resolved as OrcLabelsOverrides),
        ),
      );
    },
  };
}

/**
 * Reads the labels in effect for the calling component.
 * Must run in an injection context (field initializer or constructor).
 *
 * ```ts
 * protected readonly labels = injectOrcLabels();
 * // template: [attr.aria-label]="ariaLabel() ?? labels().dialog.close"
 * ```
 */
export function injectOrcLabels(): Signal<OrcLabels> {
  return inject(ORC_LABELS);
}
