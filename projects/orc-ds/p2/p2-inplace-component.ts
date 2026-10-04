import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { P2_SHARED_STYLES } from './p2-shared';

@Component({
  selector: 'orc-inplace',
  standalone: true,
  template: `@if (!active()) {
      <button
        #displayButton
        type="button"
        class="display"
        [class]="'display ' + normalizedStyleClass()"
        [disabled]="disabled()"
        [attr.aria-disabled]="preventClick() && !disabled() ? 'true' : null"
        [attr.aria-label]="labelText() || null"
        (click)="activate($event)"
        (keydown)="onDisplayKeydown($event)"
        (keyup)="onDisplayKeyup($event)"
      >
        <ng-content select="[orcInplaceDisplay]">{{
          displayFallbackText()
        }}</ng-content>
      </button>
    } @else {
      <div
        #contentContainer
        class="content"
        [class]="'content ' + normalizedStyleClass()"
        role="group"
        [attr.aria-label]="labelText() || 'Edit content'"
        tabindex="-1"
        (keydown)="onContentKeydown($event)"
      >
        <ng-content select="[orcInplaceContent]" /><ng-content />
        @if (closable()) {
          <button
            type="button"
            class="close"
            (click)="deactivate($event)"
            [disabled]="disabled()"
            [attr.aria-label]="closeAccessibleLabel()"
          >
            <span aria-hidden="true">×</span>
          </button>
        }
      </div>
    }`,
  styles: [
    P2_SHARED_STYLES +
      `.display{border:0;background:transparent;padding:.35rem;color:var(--orc-component-interactive);text-decoration:underline;cursor:pointer}.display:disabled,.display[aria-disabled="true"]{cursor:not-allowed;opacity:.65}.content{position:relative;display:flex;align-items:center;gap:.5rem}.close{border:0;background:transparent;cursor:pointer}.close:disabled{cursor:not-allowed;opacity:.65}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InplaceComponent {
  readonly active = model(false);
  readonly closable = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly preventClick = input(false, { transform: booleanAttribute });
  readonly label = input<string | undefined>(undefined);
  readonly closeLabel = input<string | undefined>(undefined);
  readonly styleClass = input('');
  readonly activated = output<void>();
  readonly deactivated = output<void>();
  readonly onActivate = output<Event>();
  readonly onDeactivate = output<Event>();
  readonly labelText = computed(() => this.label()?.trim() || '');
  readonly displayFallbackText = computed(() => this.labelText() || 'Edit');
  readonly closeAccessibleLabel = computed(
    () => this.closeLabel()?.trim() || 'Close',
  );
  readonly normalizedStyleClass = computed(() => this.styleClass().trim());

  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly displayButton =
    viewChild<ElementRef<HTMLButtonElement>>('displayButton');
  private readonly contentContainer =
    viewChild<ElementRef<HTMLDivElement>>('contentContainer');
  private previousActive = this.active();
  private previousClosable = this.closable();
  private previousDisabled = this.disabled();
  private hasObservedActive = false;

  constructor() {
    // The active model can also be changed by a parent. Keep focus and the
    // transition outputs in sync for those changes without duplicating the
    // synchronous work done by activate/deactivate.
    effect(() => this.observeActiveChange(this.active()), {
      injector: this.injector,
    });
    effect(() => this.observeClosableChange(this.closable()), {
      injector: this.injector,
    });
    effect(() => this.observeDisabledChange(this.disabled()), {
      injector: this.injector,
    });
  }

  activate(event?: Event): void {
    if (this.disabled() || this.preventClick()) return;
    this.transition(true, event);
  }

  deactivate(event?: Event): void {
    if (this.disabled()) return;
    this.transition(false, event);
  }

  onDisplayKeydown(event: KeyboardEvent): void {
    if (this.disabled() || this.preventClick()) return;
    if (event.key === 'Enter' && !event.repeat) {
      event.preventDefault();
      this.activate(event);
    } else if (event.key === ' ' || event.key === 'Spacebar') {
      // Match native button behavior: Space activates on keyup and does not
      // scroll the page while the display control is pressed.
      event.preventDefault();
    }
  }

  onDisplayKeyup(event: KeyboardEvent): void {
    if (
      (event.key !== ' ' && event.key !== 'Spacebar') ||
      this.disabled() ||
      this.preventClick()
    ) {
      return;
    }
    event.preventDefault();
    this.activate(event);
  }

  onContentKeydown(event: KeyboardEvent): void {
    if (
      event.key !== 'Escape' ||
      event.isComposing ||
      event.keyCode === 229 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      !this.active() ||
      this.disabled()
    ) {
      return;
    }
    this.deactivate(event);
    event.preventDefault();
  }

  private transition(next: boolean, event?: Event): void {
    if (this.active() === next) return;

    const restoreFocus = !next && this.hasFocusInContent();
    this.previousActive = next;
    this.active.set(next);
    this.emitTransition(next, event);
    this.scheduleFocus(next, restoreFocus);
  }

  private observeActiveChange(next: boolean): void {
    if (!this.hasObservedActive) {
      this.hasObservedActive = true;
      const changedBeforeFirstRender = this.previousActive !== next;
      const restoreFocus = !next && this.hasFocusInContent();
      this.previousActive = next;
      if (changedBeforeFirstRender && next) this.scheduleFocus(true);
      else if (changedBeforeFirstRender && restoreFocus)
        this.scheduleFocus(false, true);
      return;
    }
    if (this.previousActive === next) return;

    const restoreFocus = !next && this.hasFocusInContent();
    this.previousActive = next;
    this.emitTransition(next);
    this.scheduleFocus(next, restoreFocus);
  }

  private observeClosableChange(next: boolean): void {
    if (this.previousClosable === next) return;
    const content = this.contentContainer()?.nativeElement;
    const hadFocusOnRemovedClose =
      !!content &&
      this.active() &&
      this.previousClosable &&
      !next &&
      content.querySelector('.close') === content.ownerDocument.activeElement;
    this.previousClosable = next;
    if (!hadFocusOnRemovedClose) return;

    this.scheduleCloseFocusFallback();
  }

  private observeDisabledChange(next: boolean): void {
    if (this.previousDisabled === next) return;
    const content = this.contentContainer()?.nativeElement;
    const hadFocusOnClose =
      !!content &&
      this.active() &&
      !this.previousDisabled &&
      next &&
      content.querySelector('.close') === content.ownerDocument.activeElement;
    this.previousDisabled = next;
    if (hadFocusOnClose) this.scheduleCloseFocusFallback();
  }

  private scheduleCloseFocusFallback(): void {
    afterNextRender(
      () => {
        if (
          this.destroyRef.destroyed ||
          !this.active() ||
          (this.closable() && !this.disabled())
        )
          return;
        this.focusEditControl();
      },
      { injector: this.injector },
    );
  }

  private emitTransition(active: boolean, event?: Event): void {
    if (active) {
      this.activated.emit();
      if (event) this.onActivate.emit(event);
      return;
    }
    this.deactivated.emit();
    if (event) this.onDeactivate.emit(event);
  }

  private scheduleFocus(active: boolean, restoreFocus = false): void {
    afterNextRender(
      () => {
        if (this.destroyRef.destroyed || this.active() !== active) return;
        if (active) {
          this.focusEditControl();
        } else if (restoreFocus) {
          this.displayButton()?.nativeElement.focus();
        }
      },
      { injector: this.injector },
    );
  }

  private focusEditControl(): void {
    const content = this.contentContainer()?.nativeElement;
    if (!content) return;

    const selector =
      'input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(
      content.querySelectorAll<HTMLElement>(selector),
    ).find((candidate) => candidate.getAttribute('aria-disabled') !== 'true');
    (focusable ?? content).focus();
  }

  private hasFocusInContent(): boolean {
    const content = this.contentContainer()?.nativeElement;
    return !!content && content.contains(content.ownerDocument.activeElement);
  }
}
