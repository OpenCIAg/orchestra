import { TestBed } from '@angular/core/testing';
import { ProgressSpinnerComponent } from './progress-spinner.component';

describe('Progress spinner scaling', () => {
  it('keeps the complete ring inside its viewport at all supported numeric sizes', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerComponent);
    fixture.componentRef.setInput('animation', 'none');
    for (const size of [16, 24, 48, 96]) {
      fixture.componentRef.setInput('size', size);
      fixture.detectChanges();
      const svg: SVGSVGElement = fixture.nativeElement.querySelector('svg');
      const ring = svg.querySelector('circle')!.getBoundingClientRect();
      const viewport = svg.getBoundingClientRect();
      expect(viewport.width).toBe(size);
      expect(ring.left).toBeGreaterThanOrEqual(viewport.left);
      expect(ring.top).toBeGreaterThanOrEqual(viewport.top);
      expect(ring.right).toBeLessThanOrEqual(viewport.right);
      expect(ring.bottom).toBeLessThanOrEqual(viewport.bottom);
      expect(ring.width).toBeCloseTo(size * 0.8, 1);
    }
  });

  it('provides an accessible default name and supports a custom name', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerComponent);
    fixture.detectChanges();
    const svg: SVGSVGElement = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('aria-label')).toBe('Loading');
    fixture.componentRef.setInput('ariaLabel', 'Uploading invoice');
    fixture.detectChanges();
    expect(svg.getAttribute('aria-label')).toBe('Uploading invoice');
  });
});
