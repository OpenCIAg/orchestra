import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';
import { ORC_SHARED_STYLES } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-fieldset',
  standalone: true,
  template: `<fieldset
    class="p-fieldset p-component orc-p2-fieldset"
    [class]="'p-fieldset p-component orc-p2-fieldset ' + styleClass()"
    [style]="style()"
    [class.collapsed]="collapsed()"
    [attr.aria-label]="ariaLabel() || null"
    [attr.aria-labelledby]="ariaLabel() ? null : legendId"
    [attr.data-pc-name]="'fieldset'"
  >
    <legend [id]="legendId">
      {{ legend() }}
      @if (toggleable()) {
        <button
          type="button"
          [attr.aria-expanded]="!collapsed()"
          [attr.aria-controls]="!collapsed() ? contentId : null"
          (click)="toggle()"
          [attr.aria-label]="
            collapsed() ? effectiveExpandLabel() : effectiveCollapseLabel()
          "
        >
          {{ collapsed() ? '＋' : '−' }}
        </button>
      }
    </legend>
    @if (!collapsed()) {
      <div class="content" [id]="contentId"><ng-content /></div>
    }
  </fieldset>`,
  styles: [
    ORC_SHARED_STYLES +
      `.orc-p2-fieldset{min-width:0;margin:0;padding:0;border:1px solid var(--orc-component-border);border-radius:.625rem;background:var(--orc-component-surface);color:var(--orc-component-text)}.orc-p2-fieldset legend{padding:0 .45rem;font-weight:600}.orc-p2-fieldset legend button{margin-inline-start:.5rem;border:0;background:transparent;cursor:pointer}.orc-p2-fieldset .content{padding:.85rem}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldsetComponent {
  private static generatedIdSequence = 0;
  readonly legendId = `orc-fieldset-legend-${++FieldsetComponent.generatedIdSequence}`;
  readonly contentId = `orc-fieldset-content-${FieldsetComponent.generatedIdSequence}`;
  readonly legend = input('');
  readonly toggleable = input(false, { transform: booleanAttribute });
  readonly collapsed = model(false);
  readonly styleClass = input('');
  readonly style = input<Record<string, string> | null>(null);
  readonly ariaLabel = input('');
  readonly expandLabel = input<string | undefined>(undefined);
  readonly collapseLabel = input<string | undefined>(undefined);
  readonly onBeforeToggle = output<{ collapsed: boolean }>();
  readonly onAfterToggle = output<{ collapsed: boolean }>();
  effectiveExpandLabel(): string {
    return this.expandLabel() || 'Expand fieldset';
  }
  effectiveCollapseLabel(): string {
    return this.collapseLabel() || 'Collapse fieldset';
  }
  toggle(): void {
    if (!this.toggleable()) return;
    const next = !this.collapsed();
    this.onBeforeToggle.emit({ collapsed: next });
    this.collapsed.set(next);
    this.onAfterToggle.emit({ collapsed: next });
  }
  expand(): void {
    if (this.collapsed()) this.toggle();
  }
  collapse(): void {
    if (!this.collapsed()) this.toggle();
  }
}
