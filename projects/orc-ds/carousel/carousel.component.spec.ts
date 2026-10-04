import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CarouselComponent } from './carousel.component';

describe('CarouselComponent', () => {
  const items = [{ label: '' }, { label: 'Second' }, { label: 'Third' }];

  it('gives icon-only controls and indicators stable accessible names and panel associations', () => {
    const fixture = TestBed.createComponent(CarouselComponent);
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(
      root.querySelector('.orc-carousel')?.getAttribute('aria-label'),
    ).toBe('Carousel');
    const previous = root.querySelector<HTMLButtonElement>(
      '.orc-carousel__arrow',
    );
    const next = root.querySelectorAll<HTMLButtonElement>(
      '.orc-carousel__arrow',
    )[1];
    const panel = root.querySelector<HTMLElement>('[role="tabpanel"]');
    const indicators = [
      ...root.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ];

    expect(previous?.getAttribute('aria-label')).toBe('Previous slide');
    expect(next?.getAttribute('aria-label')).toBe('Next slide');
    expect(
      root.querySelector('[role="tablist"]')?.getAttribute('aria-label'),
    ).toBe('Slides');
    expect(indicators[0]?.getAttribute('aria-label')).toBe('Slide 1');
    expect(indicators[1]?.getAttribute('aria-label')).toBe('Second');
    expect(indicators[0]?.getAttribute('aria-controls')).toBe(
      panel?.id ?? null,
    );
    expect(panel?.getAttribute('aria-labelledby')).toBe(indicators[0]?.id);
    expect(indicators[0]?.getAttribute('tabindex')).toBe('0');
    expect(indicators[1]?.getAttribute('tabindex')).toBe('-1');

    fixture.componentRef.setInput('showIndicators', false);
    fixture.detectChanges();
    const unassociatedPanel =
      root.querySelector<HTMLElement>('[role="tabpanel"]');
    expect(unassociatedPanel?.getAttribute('aria-labelledby')).toBeNull();
    expect(unassociatedPanel?.getAttribute('aria-label')).toBe('Slide 1');
  });

  it('falls back to useful names when consumer labels contain only whitespace', () => {
    const fixture = TestBed.createComponent(CarouselComponent);
    fixture.componentRef.setInput('items', [
      { label: '   ' },
      { label: 'Second' },
    ]);
    fixture.componentRef.setInput('ariaLabel', '   ');
    fixture.componentRef.setInput('previousLabel', '   ');
    fixture.componentRef.setInput('indicatorsLabel', '   ');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(
      root.querySelector('.orc-carousel')?.getAttribute('aria-label'),
    ).toBe('Carousel');
    expect(
      root.querySelector('.orc-carousel__arrow')?.getAttribute('aria-label'),
    ).toBe('Previous slide');
    expect(
      root.querySelector('[role="tablist"]')?.getAttribute('aria-label'),
    ).toBe('Slides');
    expect(root.querySelector('[role="tab"]')?.getAttribute('aria-label')).toBe(
      'Slide 1',
    );
  });

  it('uses activeIndex over a conflicting page update when both models change together', () => {
    const fixture = TestBed.createComponent(CarouselComponent);
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('activeIndex', 1);
    fixture.detectChanges();
    fixture.componentRef.setInput('page', 2);
    fixture.componentRef.setInput('activeIndex', 0);
    fixture.detectChanges();

    expect(fixture.componentInstance.safeIndex()).toBe(0);
    expect(fixture.componentInstance.activeItem()?.label).toBe('');
  });

  it('maps externally controlled pages to their first item and keeps activeIndex changes synchronized', () => {
    const fixture = TestBed.createComponent(CarouselComponent);
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('numScroll', 2);
    fixture.detectChanges();

    fixture.componentRef.setInput('page', 1);
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(2);
    expect(fixture.componentInstance.activeItem()?.label).toBe('Third');

    fixture.componentRef.setInput('activeIndex', 1);
    fixture.detectChanges();
    expect(fixture.componentInstance.page()).toBe(0);

    fixture.destroy();
  });

  it('normalizes controlled pages after invalid writes and item-list changes', () => {
    const fixture = TestBed.createComponent(CarouselComponent);
    fixture.componentRef.setInput('items', [...items, { label: 'Fourth' }]);
    fixture.componentRef.setInput('numVisible', 1);
    fixture.componentRef.setInput('numScroll', 1);
    fixture.detectChanges();

    fixture.componentRef.setInput('activeIndex', 3);
    fixture.detectChanges();
    fixture.componentRef.setInput('page', 99);
    fixture.detectChanges();
    expect(fixture.componentInstance.page()).toBe(3);
    expect(fixture.componentInstance.activeIndex()).toBe(3);

    fixture.componentRef.setInput('items', items.slice(0, 2));
    fixture.detectChanges();
    expect(fixture.componentInstance.page()).toBe(1);
    expect(fixture.componentInstance.activeIndex()).toBe(1);
    expect(fixture.componentInstance.safeIndex()).toBe(1);
  });

  it('reports the number of reachable page windows when scroll size is smaller than visible size', () => {
    const fixture = TestBed.createComponent(CarouselComponent);
    const manyItems = [
      { label: 'First' },
      { label: 'Second' },
      { label: 'Third' },
      { label: 'Fourth' },
      { label: 'Fifth' },
    ];
    fixture.componentRef.setInput('items', manyItems);
    fixture.componentRef.setInput('numVisible', 3);
    fixture.componentRef.setInput('numScroll', 1);
    fixture.detectChanges();

    const onPage = jasmine.createSpy('onPage');
    fixture.componentInstance.onPage.subscribe(onPage);
    fixture.componentInstance.goTo(4);

    expect(onPage).toHaveBeenCalledWith({
      first: 4,
      last: 4,
      page: 2,
      pageCount: 3,
    });
  });

  it('moves focus and selection through enabled indicators with arrows, Home, and End', () => {
    const fixture = TestBed.createComponent(CarouselComponent);
    fixture.componentRef.setInput('items', [
      { label: 'First' },
      { label: 'Disabled', disabled: true },
      { label: 'Third' },
    ]);
    fixture.componentRef.setInput('loop', false);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const indicators = [
      ...root.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ];
    const press = (target: HTMLButtonElement, key: string): KeyboardEvent => {
      const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(event);
      fixture.detectChanges();
      return event;
    };

    indicators[0].focus();
    const forward = press(indicators[0], 'ArrowRight');
    expect(forward.defaultPrevented).toBeTrue();
    expect(fixture.componentInstance.activeIndex()).toBe(2);
    expect(root.ownerDocument.activeElement).toBe(indicators[2]);
    expect(indicators[2].getAttribute('aria-selected')).toBe('true');
    expect(indicators[1].disabled).toBeTrue();

    press(indicators[2], 'ArrowRight');
    expect(fixture.componentInstance.activeIndex()).toBe(0);
    expect(root.ownerDocument.activeElement).toBe(indicators[0]);

    press(indicators[0], 'End');
    expect(fixture.componentInstance.activeIndex()).toBe(2);
    expect(root.ownerDocument.activeElement).toBe(indicators[2]);

    press(indicators[2], 'Home');
    expect(fixture.componentInstance.activeIndex()).toBe(0);
    expect(root.ownerDocument.activeElement).toBe(indicators[0]);
  });

  it('keeps vertical root navigation separate from its horizontal indicator tablist', () => {
    const fixture = TestBed.createComponent(CarouselComponent);
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.componentRef.setInput('loop', false);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const carousel = root.querySelector<HTMLElement>('.orc-carousel')!;
    const firstIndicator =
      root.querySelector<HTMLButtonElement>('[role="tab"]')!;
    const downFromIndicator = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    firstIndicator.focus();
    firstIndicator.dispatchEvent(downFromIndicator);
    fixture.detectChanges();

    expect(downFromIndicator.defaultPrevented).toBeFalse();
    expect(fixture.componentInstance.activeIndex()).toBe(0);
    expect(root.ownerDocument.activeElement).toBe(firstIndicator);

    carousel.focus();
    carousel.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(1);
  });

  it('emits slide/page lifecycle outputs from arrow and indicator controls', () => {
    const fixture = TestBed.createComponent(CarouselComponent);
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('numVisible', 2);
    fixture.componentRef.setInput('numScroll', 2);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const slideChange = jasmine.createSpy('slideChange');
    const pageChange = jasmine.createSpy('pageChange');
    const paused = jasmine.createSpy('paused');
    const played = jasmine.createSpy('played');
    component.slideChange.subscribe(slideChange);
    component.onPage.subscribe(pageChange);
    component.onPause.subscribe(paused);
    component.onPlay.subscribe(played);

    (
      fixture.nativeElement.querySelectorAll(
        '.orc-carousel__arrow',
      )[1] as HTMLButtonElement
    ).click();
    expect(slideChange).toHaveBeenCalledWith({ index: 1, item: items[1] });
    expect(pageChange).toHaveBeenCalledWith(
      jasmine.objectContaining({ first: 1, last: 2, page: 0 }),
    );

    (
      fixture.nativeElement.querySelectorAll(
        '[role="tab"]',
      )[2] as HTMLButtonElement
    ).click();
    expect(component.activeIndex()).toBe(2);
    expect(pageChange).toHaveBeenCalledWith(
      jasmine.objectContaining({ first: 2, last: 2, page: 1 }),
    );

    component.onMouseEnter();
    component.onMouseLeave();
    expect(paused).toHaveBeenCalledTimes(1);
    expect(played).not.toHaveBeenCalled();
    fixture.componentRef.setInput('autoplay', true);
    component.onMouseLeave();
    expect(played).toHaveBeenCalledTimes(1);
  });

  it('replaces autoplay when its interval changes and tears the timer down', fakeAsync(() => {
    const fixture = TestBed.createComponent(CarouselComponent);
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('autoplay', true);
    fixture.componentRef.setInput('autoplayInterval', 1000);
    fixture.detectChanges();

    tick(1000);
    expect(fixture.componentInstance.activeIndex()).toBe(1);

    fixture.componentRef.setInput('autoplayInterval', 2000);
    fixture.detectChanges();
    tick(1000);
    expect(fixture.componentInstance.activeIndex()).toBe(1);
    tick(1000);
    expect(fixture.componentInstance.activeIndex()).toBe(2);

    fixture.destroy();
    tick(4000);
    expect(fixture.componentInstance.activeIndex()).toBe(2);
  }));

  it('restarts autoplay when pause behavior changes while hovered', fakeAsync(() => {
    const fixture = TestBed.createComponent(CarouselComponent);
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('autoplay', true);
    fixture.componentRef.setInput('autoplayInterval', 1000);
    fixture.detectChanges();
    fixture.componentInstance.onMouseEnter();

    tick(1000);
    expect(fixture.componentInstance.activeIndex()).toBe(0);

    fixture.componentRef.setInput('pauseOnHover', false);
    fixture.detectChanges();
    tick(1000);
    expect(fixture.componentInstance.activeIndex()).toBe(1);
    fixture.destroy();
  }));
});
