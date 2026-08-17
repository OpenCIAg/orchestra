export type TimelineOrientation = 'vertical' | 'horizontal';
export type TimelineItemStatus = 'pending' | 'current' | 'completed' | 'error';

export interface TimelineItem {
  id?: string | number;
  title: string;
  description?: string;
  date?: string;
  icon?: string;
  status?: TimelineItemStatus;
}
