import { TestBed } from '@angular/core/testing';
import { GalleriaComponent, GalleryImage } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the galleria family. The specs import the
 * component through the public `@ciag/orchestra/p2` surface and must pass
 * unchanged while the family moves to its canonical directory.
 */
describe('Galleria behavior parity', () => {
  const images: GalleryImage[] = [
    { src: 'one.png', alt: 'One', title: 'First' },
    { src: 'two.png', alt: 'Two' },
    { src: 'three.png', alt: 'Three' },
  ];

  const setup = (inputs: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(GalleriaComponent);
    fixture.componentRef.setInput('images', images);
    for (const [key, value] of Object.entries(inputs))
      fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => TestBed.configureTestingModule({}));

  it('renders the active image with its title and the thumbnail track', () => {
    const fixture = setup();
    const figure = (fixture.nativeElement as HTMLElement).querySelector(
      'figure',
    );
    expect(figure?.querySelector('img')?.getAttribute('src')).toBe('one.png');
    expect(figure?.querySelector('figcaption')?.textContent?.trim()).toBe(
      'First',
    );
    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.thumbs button')
        .length,
    ).toBe(3);
  });

  it('navigates with the next and previous buttons, stops at the ends without circular', () => {
    const fixture = setup();
    const changes: unknown[] = [];
    fixture.componentInstance.imageChange.subscribe(changes.push.bind(changes));

    const navButtons = Array.from(
      (
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLButtonElement>('nav button'),
    );
    expect(navButtons[0].disabled).toBeTrue();

    navButtons[navButtons.length - 1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(1);
    expect(changes.length).toBe(1);

    navButtons[navButtons.length - 1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(2);
    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('figure img')
        ?.getAttribute('src'),
    ).toBe('three.png');
    expect(
      Array.from(
        (
          fixture.nativeElement as HTMLElement
        ).querySelectorAll<HTMLButtonElement>('nav button'),
      ).at(-1)!.disabled,
    ).toBeTrue();
  });

  it('wraps navigation when circular is enabled', () => {
    const fixture = setup({ circular: true });
    fixture.componentInstance.previous();
    expect(fixture.componentInstance.activeIndex()).toBe(2);
    fixture.componentInstance.next();
    expect(fixture.componentInstance.activeIndex()).toBe(0);
  });

  it('jumps through indicators and moves focus across them with arrow keys', () => {
    const fixture = setup();
    const indicators = Array.from(
      (
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLButtonElement>('[role="tablist"] [role="tab"]'),
    );
    indicators[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(2);

    indicators[2].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(0);
  });

  it('hides the fullscreen gallery on Escape and restores visibility through show()', () => {
    const fixture = setup({ fullScreen: true });
    const section = (fixture.nativeElement as HTMLElement).querySelector(
      'section',
    )!;
    section.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeFalse();

    fixture.componentInstance.show();
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeTrue();
  });

  it('walks images with the arrow keys on the gallery host', () => {
    const fixture = setup();
    const section = (fixture.nativeElement as HTMLElement).querySelector(
      'section',
    )!;
    section.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(1);

    section.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(2);
  });
});
