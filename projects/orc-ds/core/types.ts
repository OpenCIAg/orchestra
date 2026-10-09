/** Component size scale shared by every family. Default is `'md'`. */
export type OrcSize = 'sm' | 'md' | 'lg';

/** Feedback tone (replaces `severity`). */
export type OrcTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

/** Ordered list of sizes, handy for docs and validation. */
export const ORC_SIZES: readonly OrcSize[] = ['sm', 'md', 'lg'];

/** Ordered list of tones, handy for docs and validation. */
export const ORC_TONES: readonly OrcTone[] = [
  'neutral',
  'info',
  'success',
  'warning',
  'danger',
];

/**
 * Option shape shared by the selection family (select, autocomplete,
 * listbox, segmented-control, tags-input…).
 */
export interface OrcOption<T = unknown> {
  /** Visible text and default accessible name. */
  label: string;
  /** Value written to the control/model when the option is chosen. */
  value: T;
  /** Disabled options stay visible but cannot be chosen. */
  disabled?: boolean;
  /** Group heading; consecutive options with the same group are grouped. */
  group?: string;
  /** Material Symbols icon name rendered through `orc-icon`. */
  icon?: string;
  /** Secondary text shown under the label. */
  description?: string;
}

/** Equality used to match values against options (default: `Object.is`). */
export type OrcCompareWith<T = unknown> = (a: T, b: T) => boolean;

/** Default `OrcCompareWith`: `Object.is`. */
export const orcDefaultCompareWith: OrcCompareWith<unknown> = (a, b) =>
  Object.is(a, b);
