export type AccordionVariant = 'default' | 'separated' | 'bordered';

export interface AccordionToggleEvent {
  id: string;
  expanded: boolean;
  originalEvent?: Event;
  index?: number;
}
