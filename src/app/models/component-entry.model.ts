export type ComponentCategory =
  | 'Inputs'
  | 'Navigation'
  | 'Feedback'
  | 'Data Display'
  | 'Overlay'
  | 'Layout'
  | 'Typography';

export type ComponentStatus = 'stable' | 'beta' | 'experimental' | 'deprecated';

export interface ComponentEntry {
  id: string;
  name: string;
  description: string;
  category: ComponentCategory;
  status: ComponentStatus;
  tags: string[];
  icon: string; // SVG path or emoji/unicode
  route?: string;
}
