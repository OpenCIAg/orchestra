export type TabVariant = 'line' | 'filled';

export type TabSize = 'sm' | 'md' | 'lg';

export type TabIconPosition = 'start' | 'end';

export interface TabChangeEvent {
  index: number;
  tab: any;
}
