export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperType = 'numeric' | 'icon';
export type StepStatus = 'pending' | 'active' | 'completed' | 'loading' | 'error';

export interface StepItem {
  id?: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  status?: StepStatus;
  progress?: number;
  disabled?: boolean;
}
