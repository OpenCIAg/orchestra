import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { P2_SHARED_STYLES } from './p2-shared';
export { CalendarComponent } from './p2-calendar-component';
export type { CalendarDay } from './p2-calendar-component';
export { DateInputComponent } from './p2-date-input-component';
export { ComboboxComponent } from './p2-combobox-component';
export { ListboxComponent } from './p2-listbox-component';
export { MultiSelectComponent } from './p2-multi-select-component';

@Component({
  selector: 'orc-input-group',
  standalone: true,
  template: `<div
    class="orc-p2-input-group"
    [attr.role]="label().trim() ? 'group' : null"
    [attr.aria-label]="label().trim() || null"
  >
    <span class="prefix" [class.empty]="!prefix()">{{ prefix() }}</span>
    <div class="control"><ng-content /></div>
    <span class="suffix" [class.empty]="!suffix()">{{ suffix() }}</span>
  </div>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-p2-input-group { display: flex; align-items: stretch; width: 100%; min-height: 2.5rem; border: 1px solid var(--orc-component-border-strong); border-radius: .5rem; overflow: hidden; background: var(--orc-component-control); } .prefix, .suffix { display: inline-flex; align-items: center; padding-inline: .7rem; background: var(--orc-component-surface-subtle); color: var(--orc-component-text-secondary); font-size: .875rem; } .prefix.empty, .suffix.empty { display: none; } .control { display: flex; flex: 1; align-items: center; min-width: 0; } .control ::ng-deep input, .control ::ng-deep textarea, .control ::ng-deep select { width: 100%; border: 0; outline: 0; padding: .5rem .7rem; background: transparent; color: var(--orc-component-text); }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputGroupComponent {
  readonly label = input('');
  readonly prefix = input('');
  readonly suffix = input('');
}

export { TagsInputComponent } from './p2-tags-input-component';
