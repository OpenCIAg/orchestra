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
  selector: 'orc-panel',
  standalone: true,
  template: `<section
    class="p-panel p-component orc-p2-panel"
    [class]="'p-panel p-component orc-p2-panel ' + styleClass()"
    [style]="style()"
    [class.collapsed]="collapsed()"
    [attr.aria-label]="ariaLabel() || null"
    [attr.aria-labelledby]="ariaLabel() ? null : headerId"
    [attr.data-pc-name]="'panel'"
  >
    <header
      class="orc-p2-panel__header"
      [class.toggleable]="toggleable()"
      [id]="headerId"
      (click)="toggle()"
    >
      <span class="orc-p2-panel__title"
        ><ng-content select="[orcPanelHeader]" />
        @if (!hasHeader()) {
          {{ header() }}
        }
      </span>
      @if (toggleable()) {
        <button
          type="button"
          class="orc-p2-panel__toggle"
          [attr.aria-expanded]="!collapsed()"
          [attr.aria-controls]="!collapsed() ? contentId : null"
          (click)="$event.stopPropagation(); toggle()"
          [attr.aria-label]="
            collapsed() ? effectiveExpandLabel() : effectiveCollapseLabel()
          "
        >
          {{ collapsed() ? '＋' : '−' }}
        </button>
      }
    </header>
    @if (!collapsed()) {
      <div class="orc-p2-panel__content" [id]="contentId"><ng-content /></div>
    }
  </section>`,
  styles: [
    ORC_SHARED_STYLES +
      `.orc-p2-panel{border:1px solid var(--orc-component-border);border-radius:.625rem;background:var(--orc-component-surface);overflow:hidden}.orc-p2-panel__header{display:flex;align-items:center;justify-content:space-between;min-height:2.75rem;padding:.65rem .85rem;background:var(--orc-component-surface-subtle);font-weight:600;cursor:default}.orc-p2-panel__header.toggleable{cursor:pointer}.orc-p2-panel__content{padding:.85rem}.orc-p2-panel__toggle{border:0;background:transparent;font-size:1.15rem;cursor:pointer}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelComponent {
  private static generatedIdSequence = 0;
  readonly headerId = `orc-panel-header-${++PanelComponent.generatedIdSequence}`;
  readonly contentId = `orc-panel-content-${PanelComponent.generatedIdSequence}`;
  readonly header = input('');
  /** @deprecated Compatibility input; this lightweight Panel uses `header` and projected `[orcPanelHeader]` content. */
  readonly legend = input<string | undefined>(undefined);
  readonly toggleable = input(false, { transform: booleanAttribute });
  readonly styleClass = input('');
  readonly style = input<Record<string, string> | null>(null);
  /** @deprecated Transition timing is fixed by the component stylesheet. */
  readonly transitionOptions = input('');
  readonly collapsed = model(false);
  readonly ariaLabel = input('');
  readonly expandLabel = input<string | undefined>(undefined);
  readonly collapseLabel = input<string | undefined>(undefined);
  readonly onBeforeToggle = output<{ collapsed: boolean }>();
  readonly onAfterToggle = output<{ collapsed: boolean }>();
  hasHeader(): boolean {
    return !!this.header();
  }
  effectiveExpandLabel(): string {
    return this.expandLabel() || 'Expand panel';
  }
  effectiveCollapseLabel(): string {
    return this.collapseLabel() || 'Collapse panel';
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
