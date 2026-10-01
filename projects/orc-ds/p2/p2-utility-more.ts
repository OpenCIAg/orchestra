import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  Renderer2,
  RendererStyleFlags2,
  booleanAttribute,
  input,
  output,
} from '@angular/core';

@Directive({ selector: '[orcAnimateOnScroll]', standalone: true })
export class AnimateOnScrollDirective implements AfterViewInit, OnDestroy {
  readonly animationClass = input('orc-animate-visible');
  readonly once = input(true, { transform: booleanAttribute });
  readonly threshold = input(0.1);
  readonly visible = output<IntersectionObserverEntry>();
  private observer: IntersectionObserver | null = null;
  private destroyed = false;
  private completed = false;
  constructor(
    private readonly element: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
  ) {}
  ngAfterViewInit(): void {
    const threshold = this.threshold();
    if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1)
      throw new RangeError(
        'orcAnimateOnScroll threshold must be between 0 and 1.',
      );
    const Observer =
      this.element.nativeElement.ownerDocument.defaultView
        ?.IntersectionObserver;
    if (!Observer) {
      this.renderer.addClass(this.element.nativeElement, this.animationClass());
      this.completed = true;
      return;
    }
    this.observer = new Observer(
      (entries) =>
        entries.forEach((entry) => {
          if (this.destroyed || this.completed || !entry.isIntersecting) return;
          this.renderer.addClass(
            this.element.nativeElement,
            this.animationClass(),
          );
          this.visible.emit(entry);
          if (this.once()) {
            this.completed = true;
            this.observer?.unobserve(this.element.nativeElement);
          }
        }),
      { threshold },
    );
    this.observer.observe(this.element.nativeElement);
  }
  ngOnDestroy(): void {
    this.destroyed = true;
    this.observer?.disconnect();
    this.observer = null;
  }
}

@Directive({ selector: '[orcFocusTrap]', standalone: true })
export class FocusTrapDirective implements AfterViewInit, OnDestroy {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly autoFocus = input(false, { transform: booleanAttribute });
  private destroyed = false;
  private hostTabIndexAdded = false;

  constructor(private readonly element: ElementRef<HTMLElement>) {}

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

@Directive({ selector: '[orcUseStyle]', standalone: true })
export class UseStyleDirective implements OnDestroy {
  readonly styles = input<Record<string, string | number>>(
    {},
    { alias: 'orcUseStyle' },
  );
  constructor(
    private readonly element: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
  ) {}
  private readonly original = new Map<
    string,
    { value: string; priority: string }
  >();
  private applied = new Set<string>();
  ngOnChanges(): void {
    const next = this.styles() ?? {};
    for (const property of this.applied)
      if (!(property in next)) this.restore(property);
    for (const [property, value] of Object.entries(next)) {
      if (!this.original.has(property))
        this.original.set(property, {
          value: this.element.nativeElement.style.getPropertyValue(property),
          priority:
            this.element.nativeElement.style.getPropertyPriority(property),
        });
      const original = this.original.get(property)!;
      if (original.priority)
        this.renderer.setStyle(
          this.element.nativeElement,
          property,
          value,
          RendererStyleFlags2.Important,
        );
      else this.renderer.setStyle(this.element.nativeElement, property, value);
    }
    this.applied = new Set(Object.keys(next));
  }
  clear(): void {
    for (const property of this.applied) this.restore(property);
    this.applied.clear();
  }
  ngOnDestroy(): void {
    this.clear();
  }

  private restore(property: string): void {
    const original = this.original.get(property);
    if (original?.value && original.priority)
      this.renderer.setStyle(
        this.element.nativeElement,
        property,
        original.value,
        RendererStyleFlags2.Important,
      );
    else if (original?.value)
      this.renderer.setStyle(
        this.element.nativeElement,
        property,
        original.value,
      );
    else this.renderer.removeStyle(this.element.nativeElement, property);
    this.original.delete(property);
  }
}
