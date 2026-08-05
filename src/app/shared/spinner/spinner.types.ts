export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerVariant = 'primary' | 'secondary' | 'neutral' | 'white';
export type SpinnerType = 'ring' | 'star' | 'dots';
export type SpinnerTextPosition = 'right' | 'bottom';

export interface SpinnerConfig {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  type?: SpinnerType;
  text?: string;
  textPosition?: SpinnerTextPosition;
  fullScreen?: boolean;
  backdrop?: boolean;
  ariaLabel?: string;
}
