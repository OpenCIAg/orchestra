export interface OrcIconPath {
  readonly d: string;
  readonly fillRule?: 'nonzero' | 'evenodd';
  readonly clipRule?: 'nonzero' | 'evenodd';
}

export interface OrcIconDefinition {
  readonly name: string;
  readonly viewBox: string;
  readonly paths: readonly OrcIconPath[];
  readonly filledPaths?: readonly OrcIconPath[];
  readonly rank?: number;
  readonly popularity?: number;
  readonly categories?: readonly string[];
  readonly tags?: readonly string[];
}

/** Kept as a broad alias for source compatibility; Material Symbols names use snake_case. */
export type IconName = string;
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
export type IconFill = 'outline' | 'filled';
