import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RatingComponent } from './rating.component';

describe('RatingComponent DOM and CVA behavior', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingComponent],
    }).compileComponents();
  });

  function createRating(): ComponentFixture<RatingComponent> {
    const fixture = TestBed.createComponent(RatingComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('clamps CVA writes to the accessible range without emitting a user change', () => {
    const fixture = createRating();
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('max', 5);
    const changed = jasmine.createSpy('changed');
    component.registerOnChange(changed);

    component.writeValue(99);
    fixture.detectChanges();
    expect(component.value()).toBe(5);
    expect(
      fixture.nativeElement
        .querySelector('[role="slider"]')
        .getAttribute('aria-valuenow'),
    ).toBe('5');
    expect(changed).not.toHaveBeenCalled();

    component.writeValue(-2);
    fixture.detectChanges();
    expect(component.value()).toBe(0);
    component.writeValue(Number.POSITIVE_INFINITY);
    fixture.detectChanges();
    expect(component.value()).toBe(0);

    fixture.componentRef.setInput('max', Number.NaN);
    component.writeValue(3);
    fixture.detectChanges();
    expect(component.value()).toBe(0);
    expect(
      fixture.nativeElement
        .querySelector('[role="slider"]')
        .getAttribute('aria-valuemax'),
    ).toBe('0');
  });

  it('uses the advertised minimum when Home is pressed, including half-star mode', () => {
    const fixture = createRating();
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('allowHalf', true);
    component.writeValue(3.5);
    fixture.detectChanges();

    const slider = fixture.nativeElement.querySelector(
      '[role="slider"]',
    ) as HTMLElement;
    const event = new KeyboardEvent('keydown', {
      key: 'Home',
      bubbles: true,
      cancelable: true,
    });
    slider.dispatchEvent(event);
    fixture.detectChanges();

    expect(event.defaultPrevented).toBeTrue();
    expect(slider.getAttribute('aria-valuemin')).toBe('0');
    expect(slider.getAttribute('aria-valuenow')).toBe('0');
  });

  it('exposes both readonly states on the slider', () => {
    const fixture = createRating();
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    const slider = fixture.nativeElement.querySelector(
      '[role="slider"]',
    ) as HTMLElement;
    expect(slider.getAttribute('aria-readonly')).toBe('true');

    fixture.componentRef.setInput('readonly', false);
    fixture.detectChanges();
    expect(slider.getAttribute('aria-readonly')).toBe('false');
  });

  it('focuses the actual slider element when autofocus is enabled', () => {
    const fixture = TestBed.createComponent(RatingComponent);
    fixture.componentRef.setInput('autofocus', true);
    fixture.detectChanges();

    const slider = fixture.nativeElement.querySelector(
      '[role="slider"]',
    ) as HTMLElement;
    expect(document.activeElement).toBe(slider);
  });
});
