/**
 * The library's one size vocabulary.
 *
 * `sm | md | lg` is the canonical scale shared by every sized control;
 * the modal adds the documented extras (`xl | fullScreen | custom`).
 * The PrimeNG-era `small | large` values are deprecated aliases kept
 * through the compatibility window and removed at the 23.0.0 gate.
 */
export type CanonicalSize = 'sm' | 'md' | 'lg';

/**
 * Public size-input type during the compatibility window: accepts both the
 * canonical vocabulary and the deprecated `small | large` aliases. Every
 * widened control normalizes through {@link normalizeSize}.
 */
export type SizeInput = CanonicalSize | 'small' | 'large' | undefined;

/**
 * Normalizes a size value onto the canonical vocabulary: the deprecated
 * `small`/`large` aliases map to `sm`/`lg`, canonical values pass through,
 * and anything else (including `undefined` and out-of-vocabulary values)
 * yields `undefined`, which every control renders as its default (middle)
 * size.
 */
export function normalizeSize(value: SizeInput): CanonicalSize | undefined {
  switch (value) {
    case 'small':
      return 'sm';
    case 'large':
      return 'lg';
    case 'sm':
    case 'md':
    case 'lg':
      return value;
    default:
      return undefined;
  }
}
