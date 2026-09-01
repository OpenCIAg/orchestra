/** Material Symbols names use the Google Fonts snake_case ligature name. */
export type IconName = string;
export type IconFamily = 'outlined' | 'rounded' | 'sharp';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
export type IconFill = 'outline' | 'filled';
export type IconWeight = number;
export type IconGrade = number;
export type IconOpticalSize = number | 'auto';

export interface OrcMaterialSymbolMetadata {
  readonly name: string;
  readonly rank: number;
  readonly popularity: number;
  readonly categories: readonly string[];
  readonly tags: readonly string[];
  readonly codepoint?: number;
  readonly version?: number;
}
