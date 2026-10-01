export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTheme = 'dark' | 'light';

/**
 * @deprecated `TooltipDirective.tooltipOptions` is a compatibility no-op.
 * Configure the supported tooltip properties with individual directive inputs.
 */
export interface TooltipConfig {
  position?: TooltipPosition;
  theme?: TooltipTheme;
  showDelay?: number;
  hideDelay?: number;
  disabled?: boolean;
}
