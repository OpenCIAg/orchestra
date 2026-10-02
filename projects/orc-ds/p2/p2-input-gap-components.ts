/**
 * Compatibility surface: the input-group-addon, icon-field and ifta-label
 * families live in their canonical directories; these re-exports keep every
 * p2 entry symbol unchanged.
 */
export { InputGroupAddonComponent } from '@ciag/orchestra/input-group-addon';
export { IconFieldComponent } from '@ciag/orchestra/icon-field';
export { IftaLabelComponent } from '@ciag/orchestra/ifta-label';

export { InplaceComponent } from './p2-inplace-component';
export { TerminalComponent } from './p2-terminal-component';
export type { TerminalLine } from './p2-terminal-component';
export { ImageCompareComponent } from './p2-image-compare-component';
