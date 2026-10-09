import { TestBed } from '@angular/core/testing';
import { GalleriaComponent, GalleryImage } from '@ciag/orchestra/galleria';

describe('GalleriaComponent DOM contract', () => {
  const images: GalleryImage[] = [
    {
      src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="2" height="2"%3E%3Crect width="2" height="2" fill="red"/%3E%3C/svg%3E',
      alt: 'One',
      title: 'First',
    },
    {
      src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="2" height="2"%3E%3Crect width="2" height="2" fill="green"/%3E%3C/svg%3E',
      alt: 'Two',
      title: 'Second',
    },
    {
      src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="2" height="2"%3E%3Crect width="2" height="2" fill="blue"/%3E%3C/svg%3E',
      alt: 'Three',
      title: 'Third',
    },
  ];

  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [GalleriaComponent] }),
  );

  it('renders item navigators with accessible defaults when labels are omitted', () => {
    const fixture = TestBed.createComponent(GalleriaComponent);
    fixture.componentRef.setInput('images', images);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(
      root.querySelector('nav button[aria-label="Previous image"]'),
    ).not.toBeNull();
    expect(
      root.querySelector('nav button[aria-label="Next image"]'),
    ).not.toBeNull();
  });

  it('disables both default item navigators for a single-image gallery', () => {
    const fixture = TestBed.createComponent(GalleriaComponent);
    fixture.componentRef.setInput('images', [images[0]]);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(
      (
        root.querySelector(
          'nav button[aria-label="Previous image"]',
        ) as HTMLButtonElement
      ).disabled,
    ).toBeTrue();
    expect(
      (
        root.querySelector(
          'nav button[aria-label="Next image"]',
        ) as HTMLButtonElement
      ).disabled,
    ).toBeTrue();
  });

  it('renders accessible image state, boundary navigators, and selected thumbnails', () => {
    const fixture = TestBed.createComponent(GalleriaComponent);
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('label', 'Product gallery');
    fixture.componentRef.setInput('previousLabel', 'Previous image');
    fixture.componentRef.setInput('nextLabel', 'Next image');
    fixture.componentRef.setInput('thumbnailLabel', 'Image');
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('section') as HTMLElement;
    const image = root.querySelector('figure img') as HTMLImageElement;
    const itemPrevious = root.querySelector(
      'nav button[aria-label="Previous image"]',
    ) as HTMLButtonElement;
    const itemNext = root.querySelector(
      'nav button[aria-label="Next image"]',
    ) as HTMLButtonElement;
    const thumbnails =
      root.querySelectorAll<HTMLButtonElement>('.thumbs button');

    expect(root.getAttribute('aria-label')).toBe('Product gallery');
    expect(image.src).toContain('data:image/svg+xml');
    expect(image.alt).toBe('One');
    expect(itemPrevious.disabled).toBeTrue();
    expect(itemNext.disabled).toBeFalse();
    expect(thumbnails).toHaveSize(3);
    expect(thumbnails[0].getAttribute('aria-current')).toBe('true');
    expect(thumbnails[1].getAttribute('aria-current')).toBeNull();

    itemNext.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(1);
    expect(
      (root.querySelector('figure img') as HTMLImageElement).src,
    ).toContain('data:image/svg+xml');
    expect(
      root.querySelectorAll('.orc-galleria__indicators [role="tab"]'),
    ).toHaveSize(3);
    expect(
      root
        .querySelector('.orc-galleria__indicators [aria-selected="true"]')
        ?.getAttribute('aria-label'),
    ).toBe('Go to image 2');
    expect(
      getComputedStyle(
        root.querySelector(
          '.orc-galleria__indicators [aria-selected="true"]',
        ) as HTMLButtonElement,
      ).backgroundColor,
    ).toBe('rgb(255, 255, 255)');
    expect(
      root
        .querySelectorAll<HTMLButtonElement>('.thumbs button')[1]
        .getAttribute('aria-current'),
    ).toBe('true');

    root.querySelectorAll<HTMLButtonElement>('.thumbs button')[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(2);
    expect(
      (root.querySelector('figure img') as HTMLImageElement).src,
    ).toContain('data:image/svg+xml');
  });

  it('supports circular keyboard navigation and fullscreen Escape dismissal', () => {
    const fixture = TestBed.createComponent(GalleriaComponent);
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('circular', true);
    fixture.componentRef.setInput('fullScreen', true);
    fixture.detectChanges();
    const section = fixture.nativeElement.querySelector(
      'section',
    ) as HTMLElement;
    expect(
      section.querySelector('.orc-galleria__close')?.getAttribute('aria-label'),
    ).toBe('Close gallery');

    const left = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      cancelable: true,
    });
    section.dispatchEvent(left);
    fixture.detectChanges();
    expect(left.defaultPrevented).toBeTrue();
    expect(fixture.componentInstance.activeIndex()).toBe(2);

    const home = new KeyboardEvent('keydown', {
      key: 'Home',
      cancelable: true,
    });
    section.dispatchEvent(home);
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(0);
    const escape = new KeyboardEvent('keydown', {
      key: 'Escape',
      cancelable: true,
    });
    section.dispatchEvent(escape);
    fixture.detectChanges();
    expect(escape.defaultPrevented).toBeTrue();
    expect(fixture.componentInstance.visible()).toBeFalse();
    expect(
      fixture.nativeElement.querySelector('.orc-galleria__content'),
    ).toBeNull();
  });

  it('contains fullscreen keyboard focus and restores focus after Escape', async () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const fixture = TestBed.createComponent(GalleriaComponent);
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('fullScreen', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const section = fixture.nativeElement.querySelector(
      'section',
    ) as HTMLElement;
    const close = section.querySelector(
      '.orc-galleria__close',
    ) as HTMLButtonElement;
    const controls = Array.from(
      section.querySelectorAll<HTMLButtonElement>('button:not([disabled])'),
    );
    expect(section.getAttribute('role')).toBe('dialog');
    expect(section.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement).toBe(close);

    controls[controls.length - 1].focus();
    const tab = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    controls[controls.length - 1].dispatchEvent(tab);
    expect(tab.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(close);

    const escape = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    section.dispatchEvent(escape);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.visible()).toBeFalse();
    expect(document.activeElement).toBe(trigger);

    fixture.destroy();
    trigger.remove();
  });

  it('provides keyboard tabs for per-image indicators', () => {
    const fixture = TestBed.createComponent(GalleriaComponent);
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('showThumbnails', false);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const indicators = root.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    expect(indicators[0].getAttribute('aria-selected')).toBe('true');
    expect(indicators[0].tabIndex).toBe(0);
    expect(indicators[1].tabIndex).toBe(-1);

    indicators[0].focus();
    const right = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    indicators[0].dispatchEvent(right);
    fixture.detectChanges();
    expect(right.defaultPrevented).toBeTrue();
    expect(fixture.componentInstance.activeIndex()).toBe(1);
    expect(document.activeElement).toBe(indicators[1]);
    expect(indicators[1].getAttribute('aria-selected')).toBe('true');
  });

  it('disables item navigation when there are fewer than two images, including circular mode', () => {
    const fixture = TestBed.createComponent(GalleriaComponent);
    fixture.componentRef.setInput('circular', true);
    fixture.detectChanges();
    let root = fixture.nativeElement as HTMLElement;
    expect(
      root
        .querySelector('nav button[aria-label="Previous image"]')
        ?.hasAttribute('disabled'),
    ).toBeTrue();
    expect(
      root
        .querySelector('nav button[aria-label="Next image"]')
        ?.hasAttribute('disabled'),
    ).toBeTrue();

    fixture.componentRef.setInput('images', [images[0]]);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
    expect(
      root
        .querySelector('nav button[aria-label="Previous image"]')
        ?.hasAttribute('disabled'),
    ).toBeTrue();
    expect(
      root
        .querySelector('nav button[aria-label="Next image"]')
        ?.hasAttribute('disabled'),
    ).toBeTrue();
  });

  it('honors thumbnail navigator and indicator placement inputs', () => {
    const fixture = TestBed.createComponent(GalleriaComponent);
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('showThumbnailNavigators', false);
    fixture.componentRef.setInput('showIndicatorsOnItem', true);
    fixture.componentRef.setInput('showItemNavigators', false);
    fixture.componentRef.setInput('changeItemOnIndicatorHover', true);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.orc-galleria__thumbnail-nav')).toBeNull();
    expect(
      root.querySelector('figure .orc-galleria__indicators'),
    ).not.toBeNull();
    expect(root.querySelector('nav .orc-galleria__indicators')).toBeNull();
    const thirdIndicator = root.querySelector(
      'figure .orc-galleria__indicators [aria-label="Go to image 3"]',
    ) as HTMLButtonElement;
    thirdIndicator.dispatchEvent(
      new MouseEvent('mouseenter', { bubbles: true }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(2);
  });

  it('places indicators and scrolls thumbnails without changing the active image', () => {
    const fixture = TestBed.createComponent(GalleriaComponent);
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('indicatorsPosition', 'left');
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const viewport = root.querySelector('.thumbs') as HTMLElement;
    const scrollBy = jasmine.createSpy('scrollBy');
    Object.defineProperty(viewport, 'scrollBy', { value: scrollBy });
    const thumbNext = root.querySelector(
      '.orc-galleria__thumbnail-nav[aria-label="Next thumbnails"]',
    ) as HTMLButtonElement;
    thumbNext.click();
    fixture.detectChanges();

    expect(scrollBy).toHaveBeenCalled();
    expect(fixture.componentInstance.activeIndex()).toBe(0);
    const indicator = root.querySelector(
      '.orc-galleria__indicators',
    ) as HTMLElement;
    expect(getComputedStyle(indicator).position).toBe('absolute');
    expect(getComputedStyle(indicator).left).toBe('8px');
  });

  it('hides non-fullscreen content when visible is false and restores it with show', () => {
    const fixture = TestBed.createComponent(GalleriaComponent);
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('fullScreen', false);
    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();
    let section = fixture.nativeElement.querySelector('section') as HTMLElement;
    expect(section.getAttribute('aria-hidden')).toBe('true');
    expect(section.getAttribute('tabindex')).toBe('-1');
    expect(section.querySelector('figure')).toBeNull();

    fixture.componentInstance.show();
    fixture.detectChanges();
    section = fixture.nativeElement.querySelector('section') as HTMLElement;
    expect(section.getAttribute('aria-hidden')).toBeNull();
    expect(section.querySelector('figure img')).not.toBeNull();
  });

  it('clamps the public index when the image list shrinks and stops autoplay on hide', () => {
    jasmine.clock().install();
    try {
      const fixture = TestBed.createComponent(GalleriaComponent);
      fixture.componentRef.setInput('images', images);
      fixture.componentRef.setInput('activeIndex', 2);
      fixture.componentRef.setInput('autoPlay', true);
      fixture.componentRef.setInput('transitionInterval', 10);
      fixture.detectChanges();
      fixture.componentInstance.startSlideShow();
      jasmine.clock().tick(10);
      expect(fixture.componentInstance.activeIndex()).toBe(2);

      fixture.componentRef.setInput('images', [images[0]]);
      fixture.detectChanges();
      expect(fixture.componentInstance.activeIndex()).toBe(0);
      fixture.componentRef.setInput('images', images);
      fixture.componentRef.setInput('activeIndex', 1.75);
      fixture.detectChanges();
      expect(fixture.componentInstance.activeIndex()).toBe(1);
      fixture.componentRef.setInput('activeIndex', Number.NaN);
      fixture.detectChanges();
      expect(fixture.componentInstance.activeIndex()).toBe(0);
      fixture.componentInstance.hide();
      jasmine.clock().tick(30);
      expect(fixture.componentInstance.activeIndex()).toBe(0);
      fixture.destroy();
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('keeps fullscreen content above a high base-z-index mask', () => {
    const fixture = TestBed.createComponent(GalleriaComponent);
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('fullScreen', true);
    fixture.componentRef.setInput('baseZIndex', 5000);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const section = root.querySelector('section') as HTMLElement;
    const mask = root.querySelector('.orc-galleria__mask') as HTMLElement;
    const content = root.querySelector('.orc-galleria__content') as HTMLElement;
    expect(getComputedStyle(section).zIndex).toBe('6000');
    expect(getComputedStyle(mask).zIndex).toBe('0');
    expect(getComputedStyle(content).zIndex).toBe('1');
  });

  it('keeps side thumbnails in a separate grid column from the main image', () => {
    for (const position of ['left', 'right'] as const) {
      const fixture = TestBed.createComponent(GalleriaComponent);
      fixture.componentRef.setInput('images', images);
      fixture.componentRef.setInput('thumbnailsPosition', position);
      fixture.detectChanges();

      const root = fixture.nativeElement as HTMLElement;
      const figure = root.querySelector('figure') as HTMLElement;
      const track = root.querySelector(
        '.orc-galleria__thumbnail-track',
      ) as HTMLElement;
      expect(figure).not.toBeNull();
      expect(track).not.toBeNull();
      expect(getComputedStyle(figure).gridRow).toBe('1');
      expect(getComputedStyle(track).gridRow).toBe('1');
      expect(getComputedStyle(figure).gridColumn).not.toBe(
        getComputedStyle(track).gridColumn,
      );
      fixture.destroy();
    }
  });

  it('supports all thumbnail and indicator placement values', () => {
    for (const position of ['bottom', 'top', 'left', 'right'] as const) {
      const fixture = TestBed.createComponent(GalleriaComponent);
      fixture.componentRef.setInput('images', images);
      fixture.componentRef.setInput('thumbnailsPosition', position);
      fixture.componentRef.setInput('indicatorsPosition', position);
      fixture.detectChanges();
      const section = fixture.nativeElement.querySelector(
        'section',
      ) as HTMLElement;
      expect(section.classList).toContain(`orc-galleria--thumbs-${position}`);
      expect(section.classList).toContain(
        `orc-galleria--indicators-${position}`,
      );
      fixture.destroy();
    }
  });

  it('stacks and scrolls side thumbnails vertically', () => {
    const fixture = TestBed.createComponent(GalleriaComponent);
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('thumbnailsPosition', 'right');
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const viewport = root.querySelector('.thumbs') as HTMLElement;
    const track = root.querySelector(
      '.orc-galleria__thumbnail-track',
    ) as HTMLElement;
    const scrollBy = jasmine.createSpy('scrollBy');
    Object.defineProperty(viewport, 'clientHeight', { value: 200 });
    Object.defineProperty(viewport, 'scrollBy', { value: scrollBy });

    expect(getComputedStyle(track).flexDirection).toBe('column');
    expect(getComputedStyle(viewport).flexDirection).toBe('column');
    fixture.componentInstance.scrollThumbnails(viewport, 1);
    expect(scrollBy).toHaveBeenCalledWith(
      jasmine.objectContaining({ top: 160, behavior: 'smooth' }),
    );
    expect(track.querySelector('button')?.textContent?.trim()).toBe('↑');
    expect(
      track
        .querySelectorAll('.orc-galleria__thumbnail-nav')[1]
        ?.textContent?.trim(),
    ).toBe('↓');
  });

  it('removes optional controls and thumbnail content when disabled', () => {
    const fixture = TestBed.createComponent(GalleriaComponent);
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('showItemNavigators', false);
    fixture.componentRef.setInput('showThumbnailNavigators', false);
    fixture.componentRef.setInput('showThumbnails', false);
    fixture.componentRef.setInput('showIndicators', false);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(
      root.querySelector('nav button[aria-label="Previous image"]'),
    ).toBeNull();
    expect(root.querySelector('.orc-galleria__thumbnail-track')).toBeNull();
    expect(root.querySelector('.orc-galleria__thumbnail-nav')).toBeNull();
    expect(root.querySelector('[role="tablist"]')).toBeNull();
  });

  it('trims accessible names and keeps image and thumbnail navigation labels distinct', () => {
    const fixture = TestBed.createComponent(GalleriaComponent);
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('label', ' Product gallery ');
    fixture.componentRef.setInput('roleDescription', ' carousel ');
    fixture.componentRef.setInput('previousLabel', ' Previous image ');
    fixture.componentRef.setInput('nextLabel', ' Next image ');
    fixture.componentRef.setInput('thumbnailLabel', ' Product image ');
    fixture.componentRef.setInput('fullScreen', true);
    fixture.componentRef.setInput('closeLabel', ' Close products ');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const section = root.querySelector('section') as HTMLElement;
    expect(section.getAttribute('aria-label')).toBe('Product gallery');
    expect(section.getAttribute('aria-roledescription')).toBe('carousel');
    expect(
      root.querySelector('.orc-galleria__close')?.getAttribute('aria-label'),
    ).toBe('Close products');
    expect(
      root
        .querySelector('nav button[aria-label="Previous image"]')
        ?.getAttribute('aria-label'),
    ).toBe('Previous image');
    expect(
      root.querySelector('[aria-label="Previous thumbnails"]'),
    ).not.toBeNull();
    expect(root.querySelector('[aria-label="Next thumbnails"]')).not.toBeNull();
    expect(root.querySelector('.thumbs')?.getAttribute('aria-label')).toBe(
      'Product image',
    );
    expect(
      root.querySelector('.thumbs button')?.getAttribute('aria-label'),
    ).toBe('Product image 1');
  });

  it('stops autoplay on a user selection only when configured', () => {
    jasmine.clock().install();
    try {
      const fixture = TestBed.createComponent(GalleriaComponent);
      fixture.componentRef.setInput('images', images);
      fixture.componentRef.setInput('autoPlay', true);
      fixture.componentRef.setInput('transitionInterval', 10);
      fixture.componentRef.setInput('shouldStopAutoplayByClick', true);
      fixture.detectChanges();
      fixture.componentInstance.startSlideShow();

      jasmine.clock().tick(10);
      expect(fixture.componentInstance.activeIndex()).toBe(1);
      jasmine.clock().tick(10);
      expect(fixture.componentInstance.activeIndex()).toBe(2);

      const firstThumbnail = fixture.nativeElement.querySelector(
        '.thumbs button',
      ) as HTMLButtonElement;
      firstThumbnail.click();
      fixture.detectChanges();
      jasmine.clock().tick(20);
      expect(fixture.componentInstance.activeIndex()).toBe(0);
      fixture.destroy();
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('applies hover visibility and consumer classes/styles', () => {
    const fixture = TestBed.createComponent(GalleriaComponent);
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('showItemNavigatorsOnHover', true);
    fixture.componentRef.setInput('containerClass', 'consumer-gallery');
    fixture.componentRef.setInput('containerStyle', { width: '80%' });
    fixture.componentRef.setInput('fullScreen', true);
    fixture.componentRef.setInput('maskClass', 'consumer-mask');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const section = root.querySelector('section') as HTMLElement;
    expect(section.classList).toContain('orc-galleria');
    expect(section.classList).toContain('consumer-gallery');
    expect(section.style.width).toBe('80%');
    expect(root.querySelector('.orc-galleria__mask')?.classList).toContain(
      'consumer-mask',
    );
    expect(
      root.querySelector('nav button[aria-label="Previous image"]'),
    ).toBeNull();

    section.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(
      root.querySelector('nav button[aria-label="Previous image"]'),
    ).not.toBeNull();
    section.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(
      root.querySelector('nav button[aria-label="Previous image"]'),
    ).toBeNull();
  });

  it('ignores non-finite and non-positive autoplay intervals', () => {
    jasmine.clock().install();
    try {
      const fixture = TestBed.createComponent(GalleriaComponent);
      fixture.componentRef.setInput('images', images);
      fixture.componentRef.setInput('autoPlay', true);
      fixture.componentRef.setInput(
        'transitionInterval',
        Number.POSITIVE_INFINITY,
      );
      fixture.detectChanges();
      expect(() => fixture.componentInstance.startSlideShow()).not.toThrow();
      jasmine.clock().tick(100);
      expect(fixture.componentInstance.activeIndex()).toBe(0);

      fixture.componentRef.setInput('transitionInterval', -1);
      fixture.detectChanges();
      fixture.componentInstance.startSlideShow();
      jasmine.clock().tick(100);
      expect(fixture.componentInstance.activeIndex()).toBe(0);
      fixture.destroy();
    } finally {
      jasmine.clock().uninstall();
    }
  });
});
