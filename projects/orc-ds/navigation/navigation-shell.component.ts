import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  booleanAttribute,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationItem } from './navigation.types';

@Component({
  selector: 'orc-navigation-shell',
  standalone: true,
  template: `@if (open()) {
      <button
        class="orc-navigation-shell__backdrop"
        type="button"
        [attr.aria-label]="closeAriaLabel()"
        (click)="requestClose.emit()"
      ></button>
    }
    <aside
      class="orc-navigation-shell"
      [class.orc-navigation-shell--rail]="rail()"
      [class.orc-navigation-shell--open]="open()"
    >
      <header class="orc-navigation-shell__brand">
        <ng-content select="[navigation-logo]" />
      </header>
      <nav [attr.aria-label]="ariaLabel()"><ng-content /></nav>
      <footer class="orc-navigation-shell__footer">
        <ng-content select="[navigation-footer]" />
      </footer>
    </aside>`,
  styles: [
    `
      :host {
        display: block;
      }
      .orc-navigation-shell {
        display: grid;
        grid-template-rows: auto 1fr auto;
        width: var(--orc-navigation-width, 17rem);
        min-height: 100%;
        background: var(--orc-surface-raised, var(--orc-surface, #fff));
        border-inline-end: 1px solid var(--orc-border-default, #e2e8f0);
        color: var(--orc-text, #0f172a);
      }
      .orc-navigation-shell__brand,
      .orc-navigation-shell__footer {
        padding: 1rem;
      }
      .orc-navigation-shell nav {
        padding: 0.5rem;
      }
      .orc-navigation-shell--rail {
        width: var(--orc-navigation-rail-width, 4.5rem);
      }
      .orc-navigation-shell__backdrop {
        display: none;
      }
      @media (max-width: 48rem) {
        .orc-navigation-shell__backdrop {
          display: block;
          position: fixed;
          inset: 0;
          z-index: calc(var(--z-drawer, 1000) - 1);
          border: 0;
          background: rgb(15 23 42 / 0.42);
        }
        .orc-navigation-shell {
          position: fixed;
          inset-block: 0;
          inset-inline-start: 0;
          z-index: var(--z-drawer, 1000);
          visibility: hidden;
          transform: translateX(-100%);
          transition:
            transform 0.2s ease,
            visibility 0s linear 0.2s;
        }
        .orc-navigation-shell--open {
          visibility: visible;
          transform: translateX(0);
          transition-delay: 0s;
        }
        :host-context([dir='rtl']) .orc-navigation-shell {
          transform: translateX(100%);
        }
        :host-context([dir='rtl']) .orc-navigation-shell--open {
          transform: translateX(0);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .orc-navigation-shell {
          transition: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationShellComponent implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly open = input(false, { transform: booleanAttribute });
  readonly rail = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>('Primary navigation');
  readonly closeAriaLabel = input('Close navigation');
  readonly requestClose = output<void>();
  private ownerDocument: Document | null = null;
  private readonly documentKeydown = (event: KeyboardEvent): void =>
    this.onDocumentKeydown(event);

  ngAfterViewInit(): void {
    const ownerDocument = this.host.nativeElement.ownerDocument;
    this.ownerDocument = ownerDocument;
    ownerDocument.addEventListener('keydown', this.documentKeydown);
  }

  ngOnDestroy(): void {
    this.ownerDocument?.removeEventListener('keydown', this.documentKeydown);
    this.ownerDocument = null;
  }

  onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.open() || event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    this.requestClose.emit();
  }
}

@Component({
  selector: 'orc-navigation-item',
  standalone: true,
  template: `
    @if (item().href && !item().disabled) {
      <a
        class="orc-navigation-item"
        [class.orc-navigation-item--active]="active()"
        [attr.href]="item().href"
        [attr.aria-current]="active() ? 'page' : null"
        (click)="select($event)"
      >
        <ng-container *ngTemplateOutlet="content" />
      </a>
    } @else {
      <button
        type="button"
        class="orc-navigation-item"
        [class.orc-navigation-item--active]="active()"
        [class.orc-navigation-item--disabled]="item().disabled"
        [disabled]="!!item().disabled"
        [attr.aria-current]="active() ? 'page' : null"
        (click)="select($event)"
      >
        <ng-container *ngTemplateOutlet="content" />
      </button>
    }
    <ng-template #content>
      @if (item().icon) {
        <span aria-hidden="true">{{ item().icon }}</span>
      }
      <span class="orc-navigation-item__label">{{ item().label }}</span>
      @if (item().badge !== undefined) {
        <span class="orc-navigation-item__badge">{{ item().badge }}</span>
      }
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .orc-navigation-item {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        width: 100%;
        min-height: 2.5rem;
        padding: 0.5rem 0.7rem;
        border: 0;
        border-radius: 0.5rem;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: start;
        text-decoration: none;
        cursor: pointer;
      }
      .orc-navigation-item:hover:not(:disabled),
      .orc-navigation-item--active {
        background: var(--orc-interactive-soft, #eff6ff);
        color: var(--orc-interactive-hover, #1d4ed8);
      }
      .orc-navigation-item:focus-visible {
        outline: 2px solid var(--orc-interactive, #1c6aed);
        outline-offset: 2px;
      }
      .orc-navigation-item:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .orc-navigation-item__badge {
        margin-inline-start: auto;
        font-size: 0.75rem;
      }
      .orc-navigation-item__label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class NavigationItemComponent {
  readonly item = input.required<NavigationItem>();
  readonly active = input(false, { transform: booleanAttribute });
  readonly activated = output<NavigationItem>();
  select(event: MouseEvent): void {
    if (this.item().disabled) {
      event.preventDefault();
      return;
    }
    this.activated.emit(this.item());
  }
}
