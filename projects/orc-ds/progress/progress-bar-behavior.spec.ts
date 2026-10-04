import { TestBed } from '@angular/core/testing';
import { ProgressBarComponent } from './progress-bar.component';
import { ProgressCircleComponent } from './progress-circle.component';

function reducedMotionRulesFor(selector: string): string {
  const matches: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        if (
          !(rule instanceof CSSMediaRule) ||
          !rule.conditionText.includes('prefers-reduced-motion')
        )
          continue;
        for (const nested of Array.from(rule.cssRules)) {
          if (nested.cssText.includes(selector)) matches.push(nested.cssText);
        }
      }
    } catch {
      // Cross-origin sheets are not relevant to component styles and can be unreadable.
    }
  }
  return matches.join(' ');
}

describe('ProgressBarComponent behavior', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [ProgressBarComponent] }),
  );

  it('keeps the zero value visible and names an unlabeled determinate bar', () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    fixture.componentRef.setInput('showValue', true);
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector(
      '.orc-progress-bar-host',
    ) as HTMLElement;
    const track = root.querySelector('.orc-progress-bar__track') as HTMLElement;
    expect(track.getAttribute('aria-label')).toBe('Progress');
    expect(
      root.querySelector('.orc-progress-bar__header')?.textContent,
    ).toContain('0%');
    expect(
      root.querySelector('.p-progressbar-label')?.textContent?.trim(),
    ).toBe('0%');
  });

  it('normalizes non-finite values consistently to zero', () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    fixture.componentRef.setInput('value', Number.POSITIVE_INFINITY);
    fixture.detectChanges();
    expect(fixture.componentInstance.normalizedValue()).toBe(0);

    fixture.componentRef.setInput('value', Number.NaN);
    fixture.detectChanges();
    expect(fixture.componentInstance.normalizedValue()).toBe(0);
  });

  it('uses the explicit accessible name and coerces boolean attributes', () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    fixture.componentRef.setInput('ariaLabel', 'Upload progress');
    fixture.componentRef.setInput('showValue', 'false');
    fixture.componentRef.setInput('rounded', 'false');
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector(
      '.orc-progress-bar-host',
    ) as HTMLElement;
    const track = root.querySelector('.orc-progress-bar__track') as HTMLElement;
    expect(track.getAttribute('aria-label')).toBe('Upload progress');
    expect(root.querySelector('.orc-progress-bar__header')).toBeNull();
    expect(root.classList).not.toContain('orc-progress-bar--rounded');

    fixture.componentRef.setInput('showValue', 'true');
    fixture.componentRef.setInput('rounded', 'true');
    fixture.detectChanges();
    expect(root.querySelector('.orc-progress-bar__header')).not.toBeNull();
    expect(root.classList).toContain('orc-progress-bar--rounded');
  });

  it('gives labeled markers an announcement contract and hides unlabeled guides', () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    fixture.componentRef.setInput('markers', [
      { value: 50, label: 'Halfway', tone: 'success' },
      { value: 75 },
    ]);
    fixture.detectChanges();

    const markers = fixture.nativeElement.querySelectorAll(
      '.orc-progress-bar__marker',
    ) as NodeListOf<HTMLElement>;
    expect(markers.length).toBe(2);
    expect(markers[0].getAttribute('role')).toBe('img');
    expect(markers[0].getAttribute('aria-label')).toBe('Halfway');
    expect(markers[0].getAttribute('aria-hidden')).toBeNull();
    expect(markers[0].dataset['tone']).toBe('success');
    expect(markers[1].getAttribute('role')).toBe('presentation');
    expect(markers[1].getAttribute('aria-hidden')).toBe('true');
    expect(markers[1].getAttribute('aria-label')).toBeNull();
  });

  it('declares reduced-motion rules that disable progress animation and transitions', () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    fixture.detectChanges();
    const css = reducedMotionRulesFor('.orc-progress-bar');
    expect(css).toContain('animation:');
    expect(css).toContain('none');
    expect(css).toContain('transition: none');
  });

  it('renders the documented xl size and composes style, color, and value inputs', () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    fixture.componentRef.setInput('size', 'xl');
    fixture.componentRef.setInput('variant', 'danger');
    fixture.componentRef.setInput('value', 46);
    fixture.componentRef.setInput('showValue', true);
    fixture.componentRef.setInput('unit', ' °C');
    fixture.componentRef.setInput('valuePrefix', '+');
    fixture.componentRef.setInput('color', 'rgb(1, 2, 3)');
    fixture.componentRef.setInput('customColor', ' rgb(4, 5, 6) ');
    fixture.componentRef.setInput('customTrackColor', ' rgb(7, 8, 9) ');
    fixture.componentRef.setInput('styleClass', ' consumer-progress ');
    fixture.componentRef.setInput('valueStyleClass', ' value-copy ');
    fixture.componentRef.setInput('style', { width: '80%' });
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector(
      '.orc-progress-bar-host',
    ) as HTMLElement;
    const track = root.querySelector('.orc-progress-bar__track') as HTMLElement;
    const fill = root.querySelector('.orc-progress-bar__fill') as HTMLElement;
    expect(root.classList).toContain('orc-progress-bar--xl');
    expect(root.classList).toContain('orc-progress-bar--error');
    expect(root.classList).toContain('consumer-progress');
    expect(root.style.width).toBe('80%');
    expect(getComputedStyle(track).height).toBe('16px');
    expect(track.style.backgroundColor).toBe('rgb(7, 8, 9)');
    expect(fill.style.backgroundColor).toBe('rgb(4, 5, 6)');
    expect(fill.style.width).toBe('46%');
    expect(root.querySelector('.value-copy')).toBeTruthy();
    expect(root.textContent).toContain('+46 °C');

    for (const [size, height] of [
      ['sm', '4px'],
      ['md', '8px'],
      ['lg', '12px'],
      ['xl', '16px'],
    ] as const) {
      fixture.componentRef.setInput('size', size);
      fixture.detectChanges();
      expect(root.classList).toContain(`orc-progress-bar--${size}`);
      expect(getComputedStyle(track).height).toBe(height);
    }

    for (const [variant, className] of [
      ['primary', 'orc-progress-bar--primary'],
      ['neutral', 'orc-progress-bar--neutral'],
      ['success', 'orc-progress-bar--success'],
      ['warning', 'orc-progress-bar--warning'],
      ['error', 'orc-progress-bar--error'],
      ['danger', 'orc-progress-bar--error'],
    ] as const) {
      fixture.componentRef.setInput('variant', variant);
      fixture.detectChanges();
      expect(root.classList).toContain(className);
    }

    fixture.componentRef.setInput('valueSuffix', ' pts');
    fixture.detectChanges();
    expect(root.textContent).toContain('+46 pts');
  });

  it('bounds segmented counts and exposes a valid zero-based progress range', () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('segments', 3.8);
    fixture.componentRef.setInput('currentSegment', 2.9);
    fixture.detectChanges();

    let progress = fixture.nativeElement.querySelector(
      '[role="progressbar"]',
    ) as HTMLElement;
    expect(
      fixture.nativeElement.querySelectorAll('.orc-progress-bar__segment-item'),
    ).toHaveSize(3);
    expect(progress.getAttribute('aria-valuemin')).toBe('0');
    expect(progress.getAttribute('aria-valuenow')).toBe('2');
    expect(progress.getAttribute('aria-valuemax')).toBe('3');
    expect(
      fixture.nativeElement.querySelectorAll(
        '.orc-progress-bar__segment-item--active',
      ),
    ).toHaveSize(2);

    fixture.componentRef.setInput('currentSegment', Number.POSITIVE_INFINITY);
    fixture.detectChanges();
    progress = fixture.nativeElement.querySelector(
      '[role="progressbar"]',
    ) as HTMLElement;
    expect(progress.getAttribute('aria-valuenow')).toBe('0');
    expect(
      fixture.nativeElement.querySelectorAll(
        '.orc-progress-bar__segment-item--active',
      ),
    ).toHaveSize(0);

    fixture.componentRef.setInput('currentSegment', -4);
    fixture.detectChanges();
    expect(progress.getAttribute('aria-valuenow')).toBe('0');

    fixture.componentRef.setInput('currentSegment', 99);
    fixture.detectChanges();
    progress = fixture.nativeElement.querySelector(
      '[role="progressbar"]',
    ) as HTMLElement;
    expect(progress.getAttribute('aria-valuenow')).toBe('3');
    expect(
      fixture.nativeElement.querySelectorAll(
        '.orc-progress-bar__segment-item--active',
      ),
    ).toHaveSize(3);

    fixture.componentRef.setInput('segments', 100_000);
    fixture.detectChanges();
    expect(component.segmentArray()).toHaveSize(100);
    fixture.componentRef.setInput('segments', Number.POSITIVE_INFINITY);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(component.segmentArray()).toEqual([]);
  });

  it('normalizes marker positions, ignores invalid values, and supports duplicate positions', () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    fixture.componentRef.setInput('markers', [
      { value: Number.NaN, label: 'Invalid' },
      { value: 150, label: '  Upper bound  ', tone: 'success' },
      { value: -10, label: 'Lower bound' },
      { value: 50, label: 'First marker' },
      { value: 50, label: 'Second marker' },
    ]);
    fixture.detectChanges();

    const markers = fixture.nativeElement.querySelectorAll(
      '.orc-progress-bar__marker',
    ) as NodeListOf<HTMLElement>;
    expect(markers).toHaveSize(4);
    expect(markers[0].style.left).toBe('100%');
    expect(markers[0].getAttribute('aria-label')).toBe('Upper bound');
    expect(markers[0].dataset['tone']).toBe('success');
    expect(getComputedStyle(markers[0]).color).not.toBe(
      getComputedStyle(markers[1]).color,
    );
    expect(markers[1].style.left).toBe('0%');
    expect(markers[2].style.left).toBe('50%');
    expect(markers[3].style.left).toBe('50%');
    expect(fixture.componentInstance.normalizedMarkers()).toHaveSize(4);
  });

  it('trims accessible labels and ignores invalid numeric custom heights', () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    fixture.componentRef.setInput('label', '   ');
    fixture.componentRef.setInput('ariaLabel', '   ');
    fixture.componentRef.setInput('ariaValueText', '   ');
    fixture.componentRef.setInput('customHeight', Number.POSITIVE_INFINITY);
    fixture.detectChanges();

    const progress = fixture.nativeElement.querySelector(
      '[role="progressbar"]',
    ) as HTMLElement;
    expect(progress.getAttribute('aria-label')).toBe('Progress');
    expect(progress.getAttribute('aria-valuetext')).toBe('0%');
    expect(progress.style.height).toBe('');
    expect(
      fixture.nativeElement.querySelector('.orc-progress-bar__header'),
    ).toBeNull();

    fixture.componentRef.setInput('label', '  Upload  ');
    fixture.componentRef.setInput('customHeight', '0.5rem');
    fixture.detectChanges();
    expect(progress.getAttribute('aria-label')).toBe('Upload');
    expect(progress.style.height).toBe('0.5rem');
    expect(
      fixture.nativeElement.querySelector('.orc-progress-bar__label')
        ?.textContent,
    ).toBe('Upload');

    fixture.componentRef.setInput('customHeight', 6);
    fixture.detectChanges();
    expect(progress.style.height).toBe('6px');
  });

  it('renders indeterminate mode without determinate values and honors text overrides', () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    fixture.componentRef.setInput('mode', 'indeterminate');
    fixture.componentRef.setInput('value', 72);
    fixture.componentRef.setInput('segments', 3);
    fixture.componentRef.setInput('currentSegment', 2);
    fixture.componentRef.setInput('showValue', true);
    fixture.componentRef.setInput('ariaLabel', '  Upload state  ');
    fixture.componentRef.setInput('ariaValueText', '  Upload is running  ');
    fixture.componentRef.setInput('color', 'rgb(9, 8, 7)');
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector(
      '.orc-progress-bar-host',
    ) as HTMLElement;
    const track = root.querySelector('.orc-progress-bar__track') as HTMLElement;
    const fill = root.querySelector('.orc-progress-bar__fill') as HTMLElement;
    expect(root.classList).toContain('orc-progress-bar--indeterminate');
    expect(root.querySelector('.orc-progress-bar__segments')).toBeNull();
    expect(root.querySelector('.orc-progress-bar__header')).toBeNull();
    expect(track.getAttribute('aria-valuenow')).toBeNull();
    expect(track.getAttribute('aria-valuemin')).toBeNull();
    expect(track.getAttribute('aria-valuemax')).toBeNull();
    expect(track.getAttribute('aria-label')).toBe('Upload state');
    expect(track.getAttribute('aria-valuetext')).toBe('Upload is running');
    expect(fill.style.width).toBe('');
    expect(fill.style.backgroundColor).toBe('rgb(9, 8, 7)');
  });
});

describe('ProgressCircleComponent behavior', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [ProgressCircleComponent] }),
  );

  it('provides a default name and coerces showValue and rounded inputs', () => {
    const fixture = TestBed.createComponent(ProgressCircleComponent);
    fixture.componentRef.setInput('showValue', 'true');
    fixture.componentRef.setInput('rounded', 'false');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const svg = root.querySelector('svg') as SVGSVGElement;
    expect(svg.getAttribute('aria-label')).toBe('Progress');
    expect(
      root.querySelector('.orc-progress-circle__value')?.textContent?.trim(),
    ).toBe('0%');
    expect(
      root
        .querySelector('.orc-progress-circle__fill')
        ?.getAttribute('stroke-linecap'),
    ).toBe('butt');
  });

  it('keeps size, stroke and progress geometry finite for invalid numeric inputs', () => {
    const fixture = TestBed.createComponent(ProgressCircleComponent);
    fixture.componentRef.setInput('value', Number.POSITIVE_INFINITY);
    fixture.componentRef.setInput('size', Number.POSITIVE_INFINITY);
    fixture.componentRef.setInput('strokeWidth', Number.POSITIVE_INFINITY);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.normalizedValue()).toBe(0);
    expect(component.pixelSize()).toBe(48);
    expect(Number.isFinite(component.computedStrokeWidth())).toBeTrue();
    expect(Number.isFinite(component.radius())).toBeTrue();
    expect(Number.isFinite(component.circumference())).toBeTrue();
    expect(Number.isFinite(component.strokeDashOffset())).toBeTrue();
  });

  it('normalizes numeric size attributes and accessible text fallbacks', () => {
    const fixture = TestBed.createComponent(ProgressCircleComponent);
    fixture.componentRef.setInput('size', '64');
    fixture.componentRef.setInput('value', 42);
    fixture.componentRef.setInput('label', ' Upload progress ');
    fixture.componentRef.setInput('ariaLabel', '   ');
    fixture.componentRef.setInput('ariaValueText', '   ');
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('svg') as SVGSVGElement;
    expect(fixture.componentInstance.pixelSize()).toBe(64);
    expect(svg.getAttribute('aria-label')).toBe('Upload progress');
    expect(svg.getAttribute('aria-valuetext')).toBe('42%');

    fixture.componentRef.setInput('size', 80);
    fixture.detectChanges();
    expect(fixture.componentInstance.pixelSize()).toBe(80);

    fixture.componentRef.setInput('ariaLabel', ' File upload ');
    fixture.componentRef.setInput('ariaValueText', ' 42 of 100 files ');
    fixture.detectChanges();
    expect(svg.getAttribute('aria-label')).toBe('File upload');
    expect(svg.getAttribute('aria-valuetext')).toBe('42 of 100 files');
  });

  it('renders indeterminate state without animation as a partial, unnamed-range arc', () => {
    const fixture = TestBed.createComponent(ProgressCircleComponent);
    fixture.componentRef.setInput('mode', 'indeterminate');
    fixture.componentRef.setInput('animation', 'none');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const svg = root.querySelector('svg') as SVGSVGElement;
    const fill = root.querySelector(
      '.orc-progress-circle__fill',
    ) as SVGCircleElement;
    const dash = fill
      .getAttribute('stroke-dasharray')
      ?.split(/\s+/)
      .map(Number);

    expect(root.firstElementChild?.classList).not.toContain(
      'orc-progress-circle--indeterminate',
    );
    expect(dash?.length).toBe(2);
    expect(dash?.[0]).toBeCloseTo(
      fixture.componentInstance.circumference() * 0.25,
    );
    expect(dash?.[1]).toBeCloseTo(
      fixture.componentInstance.circumference() * 0.75,
    );
    expect(svg.getAttribute('aria-valuenow')).toBeNull();
    expect(svg.getAttribute('aria-valuetext')).toBeNull();
  });

  it('applies every visual input to the rendered circle', () => {
    const fixture = TestBed.createComponent(ProgressCircleComponent);
    fixture.componentRef.setInput('value', 41.6);
    fixture.componentRef.setInput('size', 'xl');
    fixture.componentRef.setInput('strokeWidth', '8px');
    fixture.componentRef.setInput('variant', 'danger');
    fixture.componentRef.setInput('showValue', true);
    fixture.componentRef.setInput('valuePrefix', '$');
    fixture.componentRef.setInput('valueSuffix', ' items');
    fixture.componentRef.setInput('customColor', ' red ');
    fixture.componentRef.setInput('customTrackColor', ' blue ');
    fixture.componentRef.setInput('styleClass', ' compact-circle ');
    fixture.componentRef.setInput('style', { opacity: '0.5' });
    fixture.componentRef.setInput('fill', 'currentColor');
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector(
      '.orc-progress-circle-host',
    ) as HTMLElement;
    const svg = root.querySelector('svg') as SVGSVGElement;
    const track = root.querySelector(
      '.orc-progress-circle__track',
    ) as SVGCircleElement;
    const fill = root.querySelector(
      '.orc-progress-circle__fill',
    ) as SVGCircleElement;

    expect(root.classList).toContain('orc-progress-circle--error');
    expect(root.classList).toContain('compact-circle');
    expect(root.style.opacity).toBe('0.5');
    expect(root.style.width).toBe('96px');
    expect(fill.getAttribute('stroke-width')).toBe('8');
    expect(fill.style.stroke).toBe('red');
    expect(track.style.stroke).toBe('blue');
    expect(fill.style.fill).toBe('currentcolor');
    expect(
      root.querySelector('.orc-progress-circle__value')?.textContent?.trim(),
    ).toBe('$42 items');

    fixture.componentRef.setInput('mode', 'indeterminate');
    fixture.componentRef.setInput('animationDuration', '3s');
    fixture.detectChanges();
    expect(svg.style.animationDuration).toBe('3s');
    expect(fill.style.animationDuration).toBe('3s');
  });

  it('disables circular animation and transitions under reduced motion', () => {
    const fixture = TestBed.createComponent(ProgressCircleComponent);
    fixture.componentRef.setInput('mode', 'indeterminate');
    fixture.detectChanges();
    const css = reducedMotionRulesFor('.orc-progress-circle');
    expect(css).toContain('animation:');
    expect(css).toContain('none');
    expect(css).toContain('transition: none');
  });
});
