// src/app/shared/select/option.component.ts

import {
  AfterViewInit,
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
import { SELECT_HOST } from './select.tokens';

let nextOptionId = 0;

@Component({
  selector: 'orc-option',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './option.component.html',
  styleUrl: './option.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': "isSelectOption ? 'option' : null",
    '[id]': 'id() || defaultId',
    '[attr.aria-label]': 'isSelectOption ? accessibleName : null',
    '[attr.aria-selected]': 'isSelectOption ? isSelected() : null',
    '[attr.aria-disabled]': 'isSelectOption ? disabled() : null',
    '[class.is-selected]': 'isSelected()',
    '[class.is-active]': 'isActive()',
    '[class.is-hidden]': 'isHidden()',
    '[class.is-disabled]': 'disabled()',
  },
})
/**
 * An option rendered by Select's listbox.
 *
 * Project plain text or presentational content only. Interactive descendants
 * such as buttons and links are unsupported because the ARIA listbox option
 * pattern does not provide an interaction model for nested controls.
 */
export class OptionComponent implements AfterViewInit {
  private select = inject(SELECT_HOST, { optional: true });
  protected readonly elementRef = inject(ElementRef);
  readonly isSelectOption = this.select !== null;
  readonly defaultId = `orc-option-${++nextOptionId}`;
  private readonly contentReady = signal(false);

  // ── Signal Inputs ──────────────────────────────────────────
  readonly id = input<string>('');
  // Options can be projected before Angular has applied their inputs. Keep a
  // safe undefined default so select effects do not throw NG0950 during the
  // first change-detection pass; a missing value remains a valid empty option.
  readonly value = input<any>(undefined);
  readonly label = input<string>('');
  readonly description = input<string | undefined>(undefined);
  readonly icon = input<string | undefined>(undefined);
  readonly avatarUrl = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });

  // ── Internal State Signals ─────────────────────────────────
  readonly isSelected = signal<boolean>(false);
  readonly isActive = signal<boolean>(false);
  readonly isHidden = signal<boolean>(false);

  /**
   * Adds a name when an option has no visible content. Visible option text
   * remains the native accessible name, so it is never replaced by an
   * aria-label.
   */
  get accessibleName(): string | null {
    if (!this.contentReady()) return null;
    if (this.label().trim()) return null;

    const visibleText = this.elementRef.nativeElement
      .querySelector('.orc-option-content')
      ?.textContent?.trim();
    if (visibleText) return null;

    const value = this.value();
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
    return 'Option';
  }

  ngAfterViewInit(): void {
    this.contentReady.set(true);
    this.syncAccessibleName();
  }

  private syncAccessibleName(): void {
    if (!this.isSelectOption) return;
    const name = this.accessibleName;
    if (name) {
      this.elementRef.nativeElement.setAttribute('aria-label', name);
    } else {
      this.elementRef.nativeElement.removeAttribute('aria-label');
    }
  }

  // ── Computeds ──────────────────────────────────────────────
  readonly displayText = computed(() => {
    if (this.label()) return this.label();
    const nativeText = this.elementRef?.nativeElement?.textContent?.trim();
    return nativeText || String(this.value() ?? '');
  });

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.select) return;
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled()) return;
    this.select.onOptionSelected(this, event);
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
