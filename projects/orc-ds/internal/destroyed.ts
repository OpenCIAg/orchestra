import { DestroyRef, inject } from '@angular/core';

/**
 * Angular 19 backport of `DestroyRef.destroyed` (public from v20 on): wraps
 * the caller's `DestroyRef` with a `destroyed` flag that flips when the
 * owning context is torn down, so async callbacks (clipboard promises,
 * timers, transitions) can bail out of post-destroy state writes.
 */
export function destroyableRef(
  ref?: DestroyRef,
): DestroyRef & { readonly destroyed: boolean } {
  const destroyRef = ref ?? inject(DestroyRef);
  let destroyed = false;
  destroyRef.onDestroy(() => (destroyed = true));
  // Prototype-linked so every DestroyRef member keeps resolving on the real
  // instance; only the `destroyed` getter is layered on top.
  return Object.create(destroyRef, {
    destroyed: { get: () => destroyed },
  }) as DestroyRef & { readonly destroyed: boolean };
}
