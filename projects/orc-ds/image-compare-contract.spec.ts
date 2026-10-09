import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageCompareComponent } from '@ciag/orchestra/image-compare';

describe('ImageCompareComponent accessibility and slider contract', () => {
  let fixture: ComponentFixture<ImageCompareComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ImageCompareComponent] });
    fixture = TestBed.createComponent(ImageCompareComponent);
    fixture.detectChanges();
  });

  it('marks unspecified image descriptions decorative and names the range control', () => {
    const root = fixture.nativeElement as HTMLElement;
    const images = root.querySelectorAll('img');
    const group = root.querySelector('[role="group"]') as HTMLElement;
    const range = root.querySelector('input[type="range"]') as HTMLInputElement;

    expect(images.length).toBe(2);
    expect(images[0].getAttribute('alt')).toBe('');
    expect(images[1].getAttribute('alt')).toBe('');
    expect(group.getAttribute('aria-label')).toBeNull();
    expect(range.getAttribute('aria-label')).toBe('Image comparison position');
    expect(range.getAttribute('aria-valuetext')).toBe('50%');
  });

  it('keeps custom image alternatives and separates group and slider names', () => {
    fixture.componentRef.setInput('beforeAlt', 'Old bridge');
    fixture.componentRef.setInput('afterAlt', 'Restored bridge');
    fixture.componentRef.setInput('ariaLabel', 'Bridge restoration');
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const images = root.querySelectorAll('img');
    const range = root.querySelector('input[type="range"]') as HTMLInputElement;

    expect(images[0].getAttribute('alt')).toBe('Restored bridge');
    expect(images[1].getAttribute('alt')).toBe('Old bridge');
    expect(
      root.querySelector('[role="group"]')?.getAttribute('aria-label'),
    ).toBe('Bridge restoration');
    expect(range.getAttribute('aria-label')).toBe(
      'Bridge restoration position',
    );
  });

  it('clamps user input, reflects the percentage, and ignores nonfinite positions', () => {
    const range = fixture.nativeElement.querySelector(
      'input[type="range"]',
    ) as HTMLInputElement;
    const slides: number[] = [];
    fixture.componentInstance.onSlide.subscribe((value) => slides.push(value));

    range.value = '120';
    range.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.position()).toBe(100);
    expect(range.getAttribute('aria-valuetext')).toBe('100%');
    expect(slides).toEqual([100]);

    fixture.componentInstance.setPosition(-10);
    expect(fixture.componentInstance.position()).toBe(0);
    expect(slides).toEqual([100, 0]);

    fixture.componentInstance.setPosition(Number.NaN);
    expect(fixture.componentInstance.position()).toBe(0);
    expect(slides).toEqual([100, 0]);
  });
});
