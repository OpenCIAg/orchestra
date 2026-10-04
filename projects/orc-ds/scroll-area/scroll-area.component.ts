import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnChanges,
  OnDestroy,
  Renderer2,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';

@Component({
  selector: 'orc-scroll-area',
  standalone: true,
  templateUrl: './scroll-area.component.html',
  styleUrl: './scroll-area.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollAreaComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  private readonly renderer = inject(Renderer2);
  readonly orientation = input<ScrollAreaOrientation>('vertical');
  readonly maxHeight = input<string | number>('240px');
  readonly maxWidth = input<string | number>('');
  readonly alwaysShowScrollbar = input(false, { transform: booleanAttribute });
  readonly label = input<string | undefined>('Scrollable content');
  readonly scrolled = output<{ top: number; left: number }>();
  readonly canScrollBack = signal(false);
  readonly canScrollForward = signal(false);
  readonly canScrollUp = signal(false);
  readonly canScrollDown = signal(false);
  readonly canScrollLeft = signal(false);
  readonly canScrollRight = signal(false);
  readonly viewportStyle = computed(() => ({
    'max-height': this.maxHeight() || null,
    'max-width': this.maxWidth() || null,
  }));
  readonly viewport = viewChild<ElementRef<HTMLElement>>('viewport');
  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private resizeListenerCleanup: (() => void) | null = null;

  ngAfterViewInit(): void {
    const target = this.viewport()?.nativeElement;
    if (!target) return;
    this.measure();
    const view = target.ownerDocument.defaultView;
    const ResizeObserverCtor = view?.ResizeObserver;
    if (ResizeObserverCtor) {
      this.resizeObserver = new ResizeObserverCtor(() => this.measure());
      this.observeContentSize();
    } else if (view) {
      this.resizeListenerCleanup = this.renderer.listen(view, 'resize', () =>
        this.measure(),
      );
    }
    const MutationObserverCtor = view?.MutationObserver;
    if (MutationObserverCtor) {
      this.mutationObserver = new MutationObserverCtor(() => {
        this.observeContentSize();
        this.measure();
      });
      this.mutationObserver.observe(target, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
  }

  ngOnChanges(): void {
    this.measure();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.mutationObserver?.disconnect();
    this.mutationObserver = null;
    this.resizeListenerCleanup?.();
    this.resizeListenerCleanup = null;
  }

  private observeContentSize(): void {
    const target = this.viewport()?.nativeElement;
    if (!target || !this.resizeObserver) return;
    this.resizeObserver.disconnect();
    this.resizeObserver.observe(target);
    for (const child of Array.from(target.children))
      this.resizeObserver.observe(child);
  }

  private measure(): void {
    const target = this.viewport()?.nativeElement;
    if (!target) return;
    this.updateScrollState(target);
  }

  private updateScrollState(target: HTMLElement): void {
    const orientation = this.orientation();
    const verticalEnabled = orientation !== 'horizontal';
    const horizontalEnabled = orientation !== 'vertical';
    const verticalBack = verticalEnabled && target.scrollTop > 0;
    const verticalForward =
      verticalEnabled &&
      target.scrollTop + target.clientHeight < target.scrollHeight - 1;
    const horizontalBack = horizontalEnabled && target.scrollLeft > 0;
    const horizontalForward =
      horizontalEnabled &&
      target.scrollLeft + target.clientWidth < target.scrollWidth - 1;

    this.canScrollUp.set(verticalBack);
    this.canScrollDown.set(verticalForward);
    this.canScrollLeft.set(horizontalBack);
    this.canScrollRight.set(horizontalForward);
    this.canScrollBack.set(
      orientation === 'horizontal'
        ? horizontalBack
        : orientation === 'both'
          ? horizontalBack || verticalBack
          : verticalBack,
    );
    this.canScrollForward.set(
      orientation === 'horizontal'
        ? horizontalForward
        : orientation === 'both'
          ? horizontalForward || verticalForward
          : verticalForward,
    );
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (target !== this.viewport()?.nativeElement) return;
    this.updateScrollState(target);
    this.scrolled.emit({ top: target.scrollTop, left: target.scrollLeft });
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const viewport = this.viewport()?.nativeElement;
    if (
      !viewport ||
      event.target !== viewport ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.defaultPrevented
    )
      return;
    const orientation = this.orientation();
    const vertical = orientation !== 'horizontal';
    const horizontal = orientation !== 'vertical';
    const behavior: ScrollBehavior =
      viewport.ownerDocument.defaultView?.matchMedia?.(
        '(prefers-reduced-motion: reduce)',
      ).matches
        ? 'auto'
        : 'smooth';
    const pageDown = event.key === 'PageDown';
    const pageUp = event.key === 'PageUp';
    const verticalDown = event.key === 'ArrowDown';
    const verticalUp = event.key === 'ArrowUp';
    const horizontalForward = event.key === 'ArrowRight';
    const horizontalBack = event.key === 'ArrowLeft';

    // Page keys follow the primary axis. In a both-axis viewport, the
    // directional keys provide access to the secondary horizontal axis.
    if ((pageDown || pageUp) && (vertical || horizontal)) {
      event.preventDefault();
      const amount = pageDown ? 1 : -1;
      viewport.scrollBy(
        vertical
          ? { top: amount * viewport.clientHeight, behavior }
          : { left: amount * viewport.clientWidth, behavior },
      );
      return;
    }

    if ((verticalDown || verticalUp) && vertical) {
      event.preventDefault();
      viewport.scrollBy({
        top: (verticalDown ? 1 : -1) * Math.max(1, viewport.clientHeight / 4),
        behavior,
      });
      return;
    }

    if ((horizontalForward || horizontalBack) && horizontal) {
      event.preventDefault();
      viewport.scrollBy({
        left:
          (horizontalForward ? 1 : -1) * Math.max(1, viewport.clientWidth / 4),
        behavior,
      });
    }
  }
}
