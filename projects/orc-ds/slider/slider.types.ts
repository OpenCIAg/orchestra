export type SliderValue = number | [number, number];

export type SliderSize = 'sm' | 'md' | 'lg';

export type SliderTooltipMode = 'auto' | 'always' | 'never';

export interface SliderMark {
  value: number;
  label?: string;
}

export interface ParsedSliderMark {
  value: number;
  percent: number;
  label: string;
}

export interface SliderChangeEvent {
  value: SliderValue;
}
