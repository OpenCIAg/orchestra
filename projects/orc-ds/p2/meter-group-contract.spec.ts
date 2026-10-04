import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeterGroupComponent, MeterItem } from './p2-primeng-gap-components';

describe('MeterGroupComponent contract', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [MeterGroupComponent],
    }),
  );

  function widths(fixture: ComponentFixture<MeterGroupComponent>): number[] {
    const spans = fixture.nativeElement.querySelectorAll(
      '.orc-p2-meter__track span',
    ) as NodeListOf<HTMLElement>;
    return Array.from(spans).map(
      (span) => Number.parseFloat(span.style.width) || 0,
    );
  }

  function heights(fixture: ComponentFixture<MeterGroupComponent>): number[] {
    const spans = fixture.nativeElement.querySelectorAll(
      '.orc-p2-meter__track span',
    ) as NodeListOf<HTMLElement>;
    return Array.from(spans).map(
      (span) => Number.parseFloat(span.style.height) || 0,
    );
  }

  it('clamps the aggregate meter value and scales overfull segments to the track', () => {
    const fixture = TestBed.createComponent(MeterGroupComponent);
    fixture.componentRef.setInput('value', [
      { value: 70, color: '#0a0' },
      { value: 70, color: '#00a' },
    ]);
    fixture.componentRef.setInput('label', 'Capacity');
    fixture.componentRef.setInput('labelPosition', 'start');
    fixture.detectChanges();

    const meter = fixture.nativeElement.querySelector(
      '[role="meter"]',
    ) as HTMLElement;
    expect(fixture.componentInstance.total()).toBe(140);
    expect(meter.getAttribute('aria-valuemin')).toBe('0');
    expect(meter.getAttribute('aria-valuemax')).toBe('100');
    expect(meter.getAttribute('aria-valuenow')).toBe('100');
    expect(meter.getAttribute('aria-label')).toBe('Capacity');
    expect(
      fixture.nativeElement.querySelector('.orc-p2-meter__label')?.textContent,
    ).toContain('100/100');
    expect(widths(fixture)).toEqual([50, 50]);
    expect(
      widths(fixture).reduce((sum, width) => sum + width, 0),
    ).toBeLessThanOrEqual(100);
  });

  it('names the meter from ariaLabel before the visible label', () => {
    const fixture = TestBed.createComponent(MeterGroupComponent);
    fixture.componentRef.setInput('label', 'Usage');
    fixture.componentRef.setInput('ariaLabel', 'Current capacity');
    fixture.detectChanges();

    const meter = fixture.nativeElement.querySelector(
      '[role="meter"]',
    ) as HTMLElement;
    expect(meter.getAttribute('aria-label')).toBe('Current capacity');
    expect(
      fixture.nativeElement
        .querySelector('.orc-p2-meter')
        ?.getAttribute('aria-label'),
    ).toBeNull();
  });

  it('uses the visible label when ariaLabel is absent and a default name otherwise', () => {
    const labeled = TestBed.createComponent(MeterGroupComponent);
    labeled.componentRef.setInput('label', 'Usage');
    labeled.detectChanges();
    expect(
      (
        labeled.nativeElement.querySelector('[role="meter"]') as HTMLElement
      ).getAttribute('aria-label'),
    ).toBe('Usage');

    const unlabeled = TestBed.createComponent(MeterGroupComponent);
    unlabeled.detectChanges();
    expect(
      (
        unlabeled.nativeElement.querySelector('[role="meter"]') as HTMLElement
      ).getAttribute('aria-label'),
    ).toBe('Meter');
  });

  it('normalizes negative, non-finite, malformed, and missing segment values to zero', () => {
    const invalidValues = [
      { value: -10, label: 'negative' },
      { value: Number.NaN, label: 'nan' },
      { value: Number.POSITIVE_INFINITY, label: 'infinite' },
      { value: 'not-a-number' as unknown as number, label: 'malformed' },
      null as unknown as MeterItem,
    ];
    const fixture = TestBed.createComponent(MeterGroupComponent);
    fixture.componentRef.setInput('value', invalidValues);
    fixture.detectChanges();

    const meter = fixture.nativeElement.querySelector(
      '[role="meter"]',
    ) as HTMLElement;
    expect(
      fixture.componentInstance.effectiveValues().map((item) => item.value),
    ).toEqual([0, 0, 0, 0, 0]);
    expect(fixture.componentInstance.total()).toBe(0);
    expect(meter.getAttribute('aria-valuenow')).toBe('0');
    expect(widths(fixture)).toEqual([0, 0, 0, 0, 0]);
  });

  it('clamps a low aggregate value up to the configured minimum', () => {
    const fixture = TestBed.createComponent(MeterGroupComponent);
    fixture.componentRef.setInput('value', [{ value: 5 }]);
    fixture.componentRef.setInput('min', 10);
    fixture.componentRef.setInput('max', 20);
    fixture.detectChanges();

    const meter = fixture.nativeElement.querySelector(
      '[role="meter"]',
    ) as HTMLElement;
    expect(meter.getAttribute('aria-valuemin')).toBe('10');
    expect(meter.getAttribute('aria-valuemax')).toBe('20');
    expect(meter.getAttribute('aria-valuenow')).toBe('10');
  });

  it('keeps horizontal tracks in a row and honors horizontal label orientation', () => {
    const fixture = TestBed.createComponent(MeterGroupComponent);
    fixture.componentRef.setInput('value', [{ value: 25 }, { value: 25 }]);
    fixture.componentRef.setInput('label', 'Usage');
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector(
      '.orc-p2-meter',
    ) as HTMLElement;
    const track = fixture.nativeElement.querySelector(
      '.orc-p2-meter__track',
    ) as HTMLElement;
    const label = fixture.nativeElement.querySelector(
      '.orc-p2-meter__label',
    ) as HTMLElement;
    expect(root.classList.contains('orientation-horizontal')).toBeTrue();
    expect(root.classList.contains('label-orientation-horizontal')).toBeTrue();
    expect(getComputedStyle(track).flexDirection).toBe('row');
    expect(getComputedStyle(label).writingMode).toBe('horizontal-tb');
    expect(widths(fixture)).toEqual([25, 25]);
  });

  it('lays vertical tracks out as columns and rotates vertical labels', () => {
    const fixture = TestBed.createComponent(MeterGroupComponent);
    fixture.componentRef.setInput('value', [{ value: 25 }, { value: 75 }]);
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.componentRef.setInput('labelOrientation', 'vertical');
    fixture.componentRef.setInput('label', 'Usage');
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector(
      '.orc-p2-meter',
    ) as HTMLElement;
    const track = fixture.nativeElement.querySelector(
      '.orc-p2-meter__track',
    ) as HTMLElement;
    const label = fixture.nativeElement.querySelector(
      '.orc-p2-meter__label',
    ) as HTMLElement;
    expect(root.classList.contains('orientation-vertical')).toBeTrue();
    expect(root.classList.contains('label-orientation-vertical')).toBeTrue();
    expect(getComputedStyle(track).flexDirection).toBe('column');
    expect(getComputedStyle(label).writingMode).toBe('vertical-rl');
    expect(heights(fixture)).toEqual([25, 75]);
    expect(
      heights(fixture).reduce((sum, height) => sum + height, 0),
    ).toBeLessThanOrEqual(100);

    const trackHeight = track.getBoundingClientRect().height;
    const segmentHeights = Array.from(
      track.querySelectorAll('span'),
      (span) => span.getBoundingClientRect().height,
    );
    expect(trackHeight).toBeGreaterThan(0);
    expect(segmentHeights[0]).toBeCloseTo(trackHeight * 0.25, 0);
    expect(segmentHeights[1]).toBeCloseTo(trackHeight * 0.75, 0);
    expect(segmentHeights.reduce((sum, height) => sum + height, 0)).toBeCloseTo(
      trackHeight,
      0,
    );

    fixture.componentRef.setInput('style', { height: '200px' });
    fixture.detectChanges();
    const overriddenTrackHeight = track.getBoundingClientRect().height;
    const overriddenSegmentHeights = Array.from(
      track.querySelectorAll('span'),
      (span) => span.getBoundingClientRect().height,
    );
    expect(overriddenTrackHeight).toBeCloseTo(200, 0);
    expect(
      overriddenSegmentHeights.reduce((sum, height) => sum + height, 0),
    ).toBeCloseTo(overriddenTrackHeight, 0);
  });
});
