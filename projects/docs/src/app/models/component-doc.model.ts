import type { ComponentEntry } from './component-entry.model';

export interface ComponentVariation {
  label: string;
  description: string;
}

/**
 * Hand-maintained usage guidance colocated with a component's catalog entry.
 * The API reference table is NOT part of this data: it is generated from
 * docs/quality/inventory.json by tools/docs/generate-component-api.mjs so the
 * documented API cannot drift from the source.
 */
export interface ComponentUsageDoc {
  /** Public import path, e.g. `@ciag/orchestra/date-picker`. */
  packagePath?: string;
  /** Quick-start markup snippet. */
  usage: string;
  /** Usage guidance shown under the covered states. */
  guidance: string;
  /** Essential states for visual review; synthesized by the page when absent. */
  variations?: readonly ComponentVariation[];
}

export interface ComponentDocData {
  entry: ComponentEntry;
  usageDoc?: ComponentUsageDoc;
}
