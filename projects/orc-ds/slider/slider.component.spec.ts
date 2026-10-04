import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SliderComponent } from './slider.component';

describe('SliderComponent server-safe pointer ownership', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [SliderComponent] }),
  );

  it('owns global drag listeners through the document window and removes them on teardown', () => {
    const fixture: ComponentFixture<SliderComponent> =
      TestBed.createComponent(SliderComponent);
    fixture.detectChanges();
    const track = fixture.nativeElement.querySelector(
      '.orc-slider-track-container',
    ) as HTMLElement;
    spyOn(track, 'getBoundingClientRect').and.returnValue({
      left: 0,
      top: 0,
      right: 100,
      bottom: 32,
      width: 100,
      height: 32,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    const add = spyOn(window, 'addEventListener').and.callThrough();
    const remove = spyOn(window, 'removeEventListener').and.callThrough();

    track.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        pointerId: 4,
        clientX: 50,
      }),
    );
    expect(add).toHaveBeenCalledWith('pointermove', jasmine.any(Function));
    fixture.destroy();
    expect(remove).toHaveBeenCalledWith('pointermove', jasmine.any(Function));
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('normalizes zero, malformed, reversed, and out-of-range CVA values', () => {
    const fixture = TestBed.createComponent(SliderComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('range', true);
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 10);
    component.writeValue([4, 0]);
    expect(component.value()).toEqual([0, 4]);
    expect(component.normalizedValues()).toEqual([0, 4]);

    component.writeValue([100, -5]);
    expect(component.value()).toEqual([0, 10]);
    component.writeValue([0, 0]);
    expect(component.value()).toEqual([0, 0]);
    component.writeValue([null, undefined]);
    expect(component.value()).toEqual([0, 10]);
    component.writeValue(null);
    expect(component.value()).toEqual([0, 10]);
  });

  it('uses a one-unit fallback span for an invalid configured range', () => {
    const fixture = TestBed.createComponent(SliderComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('range', true);
    fixture.componentRef.setInput('min', 10);
    fixture.componentRef.setInput('max', 5);
    component.writeValue([10, 5]);
    expect(component.hasInvalidRange()).toBeTrue();
    expect(component.maxVal()).toBe(11);
    expect(component.normalizedValues()).toEqual([10, 10]);

    fixture.componentRef.setInput('min', Number.NaN);
    fixture.componentRef.setInput('max', 100);
    fixture.componentRef.setInput('step', Number.POSITIVE_INFINITY);
    fixture.detectChanges();
    expect(component.hasInvalidRange()).toBeTrue();
    expect(component.maxVal()).toBe(1);
    expect(component.stepVal()).toBe(1);
  });

  it('ignores unrelated pointers during an active drag', () => {
    const fixture = TestBed.createComponent(SliderComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const track = fixture.nativeElement.querySelector(
      '.orc-slider-track-container',
    ) as HTMLElement;
    spyOn(track, 'getBoundingClientRect').and.returnValue({
      left: 0,
      top: 0,
      right: 100,
      bottom: 20,
      width: 100,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    track.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        pointerId: 7,
        clientX: 20,
      }),
    );
    const started = component.currentEndValue();
    window.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 8, clientX: 90 }),
    );
    expect(component.currentEndValue()).toBe(started);
    window.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 7, clientX: 90 }),
    );
    expect(component.currentEndValue()).toBe(90);
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 8 }));
    expect(component['isDragging']()).toBeTrue();
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 7 }));
    expect(component['isDragging']()).toBeFalse();
  });

  it('uses the vertical axis for thumb, fill, ticks, pointer, and keyboard changes', () => {
    const fixture = TestBed.createComponent(SliderComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.componentRef.setInput('showTicks', true);
    component.writeValue(25);
    fixture.detectChanges();
    const thumb = fixture.nativeElement.querySelector(
      '.orc-slider-thumb--end',
    ) as HTMLElement;
    const fill = fixture.nativeElement.querySelector(
      '.orc-slider-fill',
    ) as HTMLElement;
    const tick = fixture.nativeElement.querySelector(
      '.orc-slider-tick',
    ) as HTMLElement;
    expect(thumb.style.bottom).toBe('25%');
    expect(fill.style.bottom).toBe('0%');
    expect(fill.style.height).toBe('25%');
    expect(tick.style.bottom).toBe('0%');
    expect(tick.style.left).toBe('');

    const track = fixture.nativeElement.querySelector(
      '.orc-slider-track-container',
    ) as HTMLElement;
    spyOn(track, 'getBoundingClientRect').and.returnValue({
      left: 0,
      top: 0,
      right: 20,
      bottom: 100,
      width: 20,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    track.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        pointerId: 9,
        clientY: 0,
      }),
    );
    expect(component.currentEndValue()).toBe(100);
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 9 }));
    component.writeValue(50);
    fixture.detectChanges();
    thumb.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(component.currentEndValue()).toBe(51);
  });

  it('focuses the primary thumb once for autofocus and does not emit a misleading attribute', async () => {
    const fixture = TestBed.createComponent(SliderComponent);
    fixture.componentRef.setInput('autofocus', true);
    fixture.detectChanges();
    await fixture.whenStable();
    const thumb = fixture.nativeElement.querySelector(
      '.orc-slider-thumb--end',
    ) as HTMLElement;
    expect(document.activeElement).toBe(thumb);
    expect(thumb.hasAttribute('autofocus')).toBeFalse();
  });

  it('does not focus after autofocus is disabled or its view is destroyed', async () => {
    const disabledFixture = TestBed.createComponent(SliderComponent);
    disabledFixture.componentRef.setInput('autofocus', true);
    disabledFixture.detectChanges();
    const disabledThumb = disabledFixture.nativeElement.querySelector(
      '.orc-slider-thumb--end',
    ) as HTMLElement;
    const disabledFocus = spyOn(disabledThumb, 'focus');
    disabledFixture.componentInstance.setDisabledState(true);
    await Promise.resolve();
    expect(disabledFocus).not.toHaveBeenCalled();
    disabledFixture.destroy();

    const destroyedFixture = TestBed.createComponent(SliderComponent);
    destroyedFixture.componentRef.setInput('autofocus', true);
    destroyedFixture.detectChanges();
    const destroyedThumb = destroyedFixture.nativeElement.querySelector(
      '.orc-slider-thumb--end',
    ) as HTMLElement;
    const destroyedFocus = spyOn(destroyedThumb, 'focus');
    destroyedFixture.destroy();
    await Promise.resolve();
    expect(destroyedFocus).not.toHaveBeenCalled();
  });
});
