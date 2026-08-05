export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type AvatarShape = 'circular' | 'rounded' | 'square';

export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export type AvatarStatusPosition = 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';

export type AvatarColorVariant =
  | 'default'
  | 'primary'
  | 'royal'
  | 'orange'
  | 'purple'
  | 'cyan'
  | 'auto';

export interface AvatarItem {
  src?: string;
  name?: string;
  initials?: string;
  alt?: string;
  status?: AvatarStatus;
  colorVariant?: AvatarColorVariant;
}
