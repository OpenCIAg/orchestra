import { TestBed } from '@angular/core/testing';
import { MeterGroupComponent } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the meter group family. The specs import the
 * component through the public `@ciag/orchestra/p2` surface and must pass
 * unchanged while the family moves to its canonical directory.
 */
describe('MeterGroup behavior parity', () => {
  const setup = (inputs: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(MeterGroupComponent);
    for (const [key, value] of Object.entries(inputs))
      fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return fixture;
  };

  const segments = (fixture: ReturnType<typeof setup>) =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '[role="meter"] span',
      ),
    );

  beforeEach(() => TestBed.configureTestingModule({}));

  it('renders one segment per value with proportional widths and title labels', () => {
    const fixture = setup({
      values: [
        { value: 30, label: 'Docs', color: 'red' },
        { value: 70, label: 'Code', color: 'blue' },
      ],
    });
    const segmentsRendered = segments(fixture);
    expect(segmentsRendered.length).toBe(2);
    expect(segmentsRendered[0].style.width).toBe('30%');
    expect(segmentsRendered[1].style.width).toBe('70%');
    expect(segmentsRendered[0].getAttribute('title')).toBe('Docs');
    expect(segmentsRendered[1].style.background).toBe('blue');
  });

  it('exposes the clamped total through the meter aria values', () => {
    const fixture = setup({
      values: [{ value: 40 }, { value: 90 }],
    });
    const meter = (fixture.nativeElement as HTMLElement).querySelector(
      '[role="meter"]',
    )!;
    expect(meter.getAttribute('aria-valuemin')).toBe('0');
    expect(meter.getAttribute('aria-valuemax')).toBe('100');
    expect(meter.getAttribute('aria-valuenow')).toBe('100');
  });

  it('falls back to the value alias and defaults when inputs are missing', () => {
    const fixture = setup({ value: [{ value: 25, label: 'Quarter' }] });
    expect(fixture.componentInstance.effectiveValues().length).toBe(1);
    expect(fixture.componentInstance.ariaValue()).toBe(25);
    expect(segments(fixture)[0].style.width).toBe('25%');

    const empty = setup();
    expect(empty.componentInstance.effectiveValues()).toEqual([]);
    expect(empty.componentInstance.total()).toBe(0);
    expect(empty.componentInstance.ariaValue()).toBe(0);
  });

  it('renders the label at the configured position with the value report', () => {
    const fixture = setup({
      values: [{ value: 50 }],
      label: 'Storage',
      labelPosition: 'start',
    });
    const root = (fixture.nativeElement as HTMLElement).querySelector(
      '.orc-p2-meter',
    )!;
    expect(
      (root.querySelector('small') as HTMLElement).previousElementSibling,
    ).toBeNull();
    expect(root.querySelector('small')?.textContent).toContain(
      'Storage 50/100',
    );

    fixture.componentRef.setInput('labelPosition', 'end');
    fixture.detectChanges();
    const endLabel = root.querySelector('small') as HTMLElement;
    expect(endLabel.previousElementSibling?.getAttribute('role')).toBe('meter');
  });

  it('normalizes non-finite and negative values to zero', () => {
    const fixture = setup({
      values: [
        { value: NaN as unknown as number },
        { value: -5 },
        { value: 10 },
      ],
    });
    expect(fixture.componentInstance.total()).toBe(10);
    const widths = segments(fixture).map((segment) => segment.style.width);
    expect(widths).toEqual(['0%', '0%', '10%']);
  });
});
