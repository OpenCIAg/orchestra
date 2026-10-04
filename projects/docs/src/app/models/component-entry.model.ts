export type ComponentCategory =
  | 'Inputs'
  | 'Navigation'
  | 'Feedback'
  | 'Data Display'
  | 'Overlay'
  | 'Layout'
  | 'Typography'
  | 'Utility';

export type ComponentStatus = 'stable' | 'beta' | 'experimental' | 'deprecated';

export interface ComponentEntry {
  id: string;
  name: string;
  description: string;
  category: ComponentCategory;
  status: ComponentStatus;
  tags: string[];
  icon: string; // Material Symbol name, rendered by <orc-icon>
  route?: string;
}
