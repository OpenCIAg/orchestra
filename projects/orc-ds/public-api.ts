/*
 * Root entry of @ciag/orchestra. It re-exports only the core surface
 * (providers, labels and shared types); every family is imported from its
 * own secondary entry point, e.g. `@ciag/orchestra/button`.
 */
export * from '@ciag/orchestra/core';
