import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { P2_SHARED_STYLES } from './p2-shared';

@Component({
  selector: 'orc-input-group-addon',
  standalone: true,
  template: `<span class="orc-input-addon"><ng-content /></span>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-input-addon{display:inline-flex;align-items:center;min-height:2.5rem;padding:0 .7rem;border:1px solid var(--orc-component-border-strong);background:var(--orc-component-surface-subtle);color:var(--orc-component-text-secondary)}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputGroupAddonComponent {}

@Component({
  selector: 'orc-icon-field',
  standalone: true,
  template: `<div class="orc-icon-field">
    <span class="icon" aria-hidden="true">{{ icon() }}</span
    ><ng-content />
  </div>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-icon-field{position:relative;display:flex;align-items:center;width:100%;min-width:0}.orc-icon-field .icon{position:absolute;inset-inline-start:.7rem;z-index:1;color:var(--orc-component-text-muted);pointer-events:none}.orc-icon-field ::ng-deep input{padding-inline-start:2rem}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconFieldComponent {
  readonly icon = input('⌕');
}

@Component({
  selector: 'orc-ifta-label',
  standalone: true,
  template: `<div class="orc-ifta"><ng-content /></div>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-ifta{position:relative;display:block;padding-top:.75rem}.orc-ifta ::ng-deep > label{position:absolute;top:0;inset-inline-start:.65rem;padding:0 .2rem;background:var(--orc-component-surface);color:var(--orc-component-text-muted);font-size:.75rem}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IftaLabelComponent {}

export { InplaceComponent } from './p2-inplace-component';
export { TerminalComponent } from './p2-terminal-component';
export type { TerminalLine } from './p2-terminal-component';
export { ImageCompareComponent } from './p2-image-compare-component';
