/**
 * Compatibility surface: the shared p2 styling and option primitives now
 * live in the internal entry point so canonical component directories can
 * consume them without importing the p2 monolith.
 */
export { P2_SHARED_STYLES } from '@ciag/orchestra/internal';
export type { P2Option, P2Size, P2Orientation } from '@ciag/orchestra/internal';
