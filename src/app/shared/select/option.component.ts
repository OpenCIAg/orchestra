// src/app/shared/select/option.component.ts

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectComponent } from './select.component';

let nextOptionId = 0;

@Component({
  selector: 'app-option, orc-option',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './option.component.html',
  styleUrl: './option.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'option',
    '[id]': 'id() || defaultId',
    '[attr.aria-selected]': 'isSelected()',
    '[attr.aria-disabled]': 'disabled()',
    '[class.is-selected]': 'isSelected()',
    '[class.is-active]': 'isActive()',
    '[class.is-disabled]': 'disabled()',
  },
})
export class OptionComponent {
  private select = inject(SelectComponent, { optional: true });
  protected readonly elementRef = inject(ElementRef);
  readonly defaultId = `orc-option-${++nextOptionId}`;

  // ── Signal Inputs ──────────────────────────────────────────
  readonly id = input<string>('');
  readonly value = input.required<any>();
  readonly label = input<string>('');
  readonly description = input<string | undefined>(undefined);
  readonly icon = input<string | undefined>(undefined);
  readonly avatarUrl = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });

  // ── Internal State Signals ─────────────────────────────────
  readonly isSelected = signal<boolean>(false);
  readonly isActive = signal<boolean>(false);
  readonly isHidden = signal<boolean>(false);

  // ── Computeds ──────────────────────────────────────────────
  readonly displayText = computed(() => {
    if (this.label()) return this.label();
    const nativeText = this.elementRef?.nativeElement?.textContent?.trim();
    return nativeText || String(this.value() ?? '');
  });

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled()) return;
    if (this.select) {
      this.select.onOptionSelected(this);
    }
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.disabled() || !this.select) return;
    this.select.setActiveOption(this);
  }

  getOptionText(): string {
    return this.displayText();
  }
}
