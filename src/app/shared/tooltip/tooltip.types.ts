export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTheme = 'dark' | 'light';

export interface TooltipConfig {
  position?: TooltipPosition;
  theme?: TooltipTheme;
  showDelay?: number;
  hideDelay?: number;
  disabled?: boolean;
}
