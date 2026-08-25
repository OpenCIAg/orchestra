export type ProgressMode = 'determinate' | 'indeterminate';

export type ProgressVariant =
  | 'primary'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'error'
  | 'danger';

export type ProgressSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ProgressMarker {
  value: number;
  label?: string;
  tone?: ProgressVariant;
}
