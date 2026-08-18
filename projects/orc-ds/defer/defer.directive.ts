import { AfterViewInit, Directive, ElementRef, EmbeddedViewRef, OnDestroy, TemplateRef, ViewContainerRef, output } from '@angular/core';

@Directive({ selector: '[orcDefer], [pDefer]', standalone: true })
export class DeferDirective implements AfterViewInit, OnDestroy {
  readonly onLoad = output<Event>();
  private observer?: IntersectionObserver;
  private view?: EmbeddedViewRef<unknown>;
  private loaded = false;

  constructor(
    private readonly template: TemplateRef<unknown>,
    private readonly container: ViewContainerRef,
    private readonly host: ElementRef<HTMLElement>,
  ) {}

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') { this.load(); return; }
    this.observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) this.load();
    });
    this.observer.observe(this.host.nativeElement);
  }

  shouldLoad(): boolean { return !this.loaded; }
  isLoaded(): boolean { return this.loaded; }
  load(event?: Event): void {
    if (this.loaded) return;
    this.loaded = true;
    this.view = this.container.createEmbeddedView(this.template);
    this.onLoad.emit(event ?? new Event('load'));
    this.observer?.disconnect();
  }

  ngOnDestroy(): void { this.observer?.disconnect(); this.view?.destroy(); }
}
