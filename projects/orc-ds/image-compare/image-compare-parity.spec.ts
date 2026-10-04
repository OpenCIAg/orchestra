import { TestBed } from '@angular/core/testing';
import { ImageCompareComponent } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the image compare family. The specs import the
 * component through the public `@ciag/orchestra/p2` surface and must pass
 * unchanged while the family moves to its canonical directory.
 */
describe('ImageCompare behavior parity', () => {
  const setup = (inputs: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(ImageCompareComponent);
    for (const [key, value] of Object.entries(inputs))
      fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => TestBed.configureTestingModule({}));

  it('renders the after image full-bleed and the before image clipped to the position', () => {
    const fixture = setup({
      before: 'before.png',
      after: 'after.png',
      beforeAlt: 'Before',
      afterAlt: 'After',
      position: 30,
    });
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('img.after')?.getAttribute('src')).toBe(
      'after.png',
    );
    expect(root.querySelector('img.after')?.getAttribute('alt')).toBe('After');
    const beforeWrapper = root.querySelector<HTMLElement>('div.before')!;
    expect(beforeWrapper.style.width).toBe('30%');
    expect(beforeWrapper.querySelector('img')?.getAttribute('src')).toBe(
      'before.png',
    );
    expect(beforeWrapper.querySelector('img')?.getAttribute('alt')).toBe(
      'Before',
    );
  });

  it('reports the accessible position through the range input', () => {
    const fixture = setup({ ariaLabel: 'Compare', position: 40 });
    const range = (fixture.nativeElement as HTMLElement).querySelector(
      'input',
    )!;
    expect(range.getAttribute('aria-label')).toBe('Compare position');
    expect(range.getAttribute('aria-valuetext')).toBe('40%');
    expect(range.getAttribute('min')).toBe('0');
    expect(range.getAttribute('max')).toBe('100');
  });

  it('clamps slider input to 0–100 and emits onSlide with the normalized value', () => {
    const fixture = setup();
    const slides: number[] = [];
    fixture.componentInstance.onSlide.subscribe(slides.push.bind(slides));

    const range = (fixture.nativeElement as HTMLElement).querySelector(
      'input',
    )!;
    range.value = '150';
    range.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.position()).toBe(100);
    expect(slides).toEqual([100]);

    range.value = '-5';
    range.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.position()).toBe(0);
    expect(slides).toEqual([100, 0]);
  });

  it('exposes the group role and configured aspect ratio', () => {
    const fixture = setup({ aspectRatio: '4 / 3', tabindex: -1 });
    const root = (fixture.nativeElement as HTMLElement).querySelector('div')!;
    expect(root.getAttribute('role')).toBe('group');
    expect(root.style.aspectRatio).toBe('4 / 3');
    expect(root.getAttribute('tabindex')).toBe('-1');
  });
});
