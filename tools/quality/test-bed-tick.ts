import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

/**
 * v19 backport of `TestBed.tick()` (public from v20 on): execute any pending
 * work required to synchronize model to UI. v19 has no single API for that —
 * a root change-detection pass covers views mounted outside a fixture (the
 * toast service's automatic outlet), and `flushEffects()` (v19's
 * developerPreview name for the same machinery) drains pending effects.
 */
export function testBedTick(): void {
  TestBed.inject(ApplicationRef).tick();
  TestBed.flushEffects();
}
