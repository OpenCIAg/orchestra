import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  booleanAttribute,
  inject,
  input,
} from '@angular/core';

/**
 * Internal focus trap of the confirm dialog (not exported from the entry).
 */
@Directive({ selector: '[orcConfirmDialogFocusTrap]', standalone: true })
export class ConfirmDialogFocusTrapDirective
  implements AfterViewInit, OnDestroy
{
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly autoFocus = input(false, { transform: booleanAttribute });
  private destroyed = false;
  private hostTabIndexAdded = false;

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  ngAfterViewInit(): void {
    if (!this.disabled() && this.autoFocus()) {
      queueMicrotask(() => {
        if (this.destroyed || this.disabled() || !this.host().isConnected)
          return;
        const focusable = this.focusables();
        if (focusable.length) focusable[0].focus();
        else this.focusHost();
      });
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled() || event.key !== 'Tab' || this.destroyed) return;

    const focusable = this.focusables();
    const host = this.host();
    const activeElement = host.ownerDocument.activeElement;
    if (!focusable.length) {
      event.preventDefault();
      this.focusHost();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (activeElement === host) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    const host = this.host();
    if (this.hostTabIndexAdded && host.getAttribute('tabindex') === '-1') {
      host.removeAttribute('tabindex');
    }
  }

  private host(): HTMLElement {
    return this.element.nativeElement;
  }

  private focusHost(): void {
    this.ensureHostTabIndex();
    this.host().focus();
  }

  private ensureHostTabIndex(): void {
    const host = this.host();
    if (!host.hasAttribute('tabindex')) {
      host.setAttribute('tabindex', '-1');
      this.hostTabIndexAdded = true;
    }
  }

  private focusables(): HTMLElement[] {
    return Array.from(
      this.host().querySelectorAll<HTMLElement>(
        'button,[href],input,select,textarea,[contenteditable="true"],[tabindex]',
      ),
    ).filter((item) => item.tabIndex >= 0 && !this.isUnavailable(item));
  }

  private isUnavailable(item: HTMLElement): boolean {
    const host = this.host();
    let current: HTMLElement | null = item;
    while (current) {
      const inert = (current as HTMLElement & { inert?: boolean }).inert;
      const style =
        current.ownerDocument.defaultView?.getComputedStyle(current);
      if (
        current.hidden ||
        current.hasAttribute('hidden') ||
        current.hasAttribute('inert') ||
        inert ||
        current.getAttribute('aria-hidden') === 'true' ||
        style?.display === 'none' ||
        style?.visibility === 'hidden'
      ) {
        return true;
      }
      if (current !== item && current.getAttribute('aria-disabled') === 'true')
        return true;
      if (
        current !== item &&
        current.tagName === 'FIELDSET' &&
        (current as HTMLFieldSetElement).disabled
      )
        return true;
      if (current === host) break;
      current = current.parentElement;
    }

    return (
      item.hasAttribute('disabled') ||
      (item as HTMLInputElement).disabled === true ||
      item.getAttribute('aria-disabled') === 'true'
    );
  }
}
