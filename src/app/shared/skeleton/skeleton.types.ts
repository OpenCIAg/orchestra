export type SkeletonVariant = 'text' | 'circular' | 'rectangular';
export type SkeletonAnimation = 'shimmer' | 'pulse' | 'none';

export interface SkeletonConfig {
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  ariaLabel?: string;
}
