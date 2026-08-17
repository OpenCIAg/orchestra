export type CarouselOrientation = 'horizontal' | 'vertical';

export interface CarouselItem {
  id?: string | number;
  label: string;
  description?: string;
  image?: string;
  alt?: string;
  disabled?: boolean;
}
