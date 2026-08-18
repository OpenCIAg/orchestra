export type SkeletonVariant = 'text' | 'circular' | 'rectangular';
export type SkeletonAnimation = 'shimmer' | 'pulse' | 'wave' | 'none';

export interface SkeletonConfig {
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  shape?: 'rectangle' | 'square' | 'circle';
  size?: string | number;
  styleClass?: string;
  style?: Record<string, string | number>;
  ariaLabel?: string;
}
