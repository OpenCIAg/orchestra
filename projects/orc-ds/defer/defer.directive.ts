import {
  AfterViewInit,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  inject,
  output,
} from '@angular/core';

@Directive({ selector: '[orcDefer], [pDefer]', standalone: true })
export class DeferDirective implements AfterViewInit, OnDestroy {
  readonly onLoad = output<Event>();
  private observer?: IntersectionObserver;
  private view?: EmbeddedViewRef<unknown>;
  private loaded = false;
  private destroyed = false;

  private readonly template = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly container = inject(ViewContainerRef);
  private readonly host = inject<ElementRef<Node>>(ElementRef);

  ngAfterViewInit(): void {
    const anchor = this.host.nativeElement;
    const view = anchor.ownerDocument?.defaultView;
    const ObserverConstructor = view?.IntersectionObserver;
    if (!ObserverConstructor) {
      this.load();
      return;
    }
    // Structural directives are attached to an ng-template comment. Observe a
    // real containing element when available; IntersectionObserver rejects
    // comment nodes in browsers.
    const ElementConstructor = anchor.ownerDocument?.defaultView?.Element;
    const target =
      ElementConstructor && anchor instanceof ElementConstructor
        ? anchor
        : anchor.parentElement;
    if (!target) {
      this.load();
      return;
    }
    this.observer = new ObserverConstructor((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) this.load();
    });
    this.observer.observe(target);
  }

  shouldLoad(): boolean {
    return !this.loaded;
  }
  isLoaded(): boolean {
    return this.loaded;
  }
  load(event?: Event): void {
    if (this.loaded || this.destroyed) return;
    this.loaded = true;
    this.view = this.container.createEmbeddedView(this.template);
    this.onLoad.emit(event ?? new Event('load'));
    this.observer?.disconnect();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.observer?.disconnect();
    this.view?.destroy();
  }
}
