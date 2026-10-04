import { TestBed } from '@angular/core/testing';
import { TooltipComponent } from './tooltip.component';

describe('TooltipComponent', () => {
  it('keeps fit-content text inside the viewport and wraps long labels', () => {
    const fixture = TestBed.createComponent(TooltipComponent);
    fixture.componentInstance.text.set('tooltip'.repeat(80));
    fixture.detectChanges();

    const text = fixture.nativeElement.querySelector(
      '.orc-tooltip__text',
    ) as HTMLElement;
    const style = getComputedStyle(text);

    expect(style.maxWidth).not.toBe('none');
    expect(style.whiteSpace).toBe('normal');
    expect(style.overflowWrap).toBe('anywhere');
    expect(text.getBoundingClientRect().width).toBeLessThanOrEqual(
      window.innerWidth - 44 + 1,
    );
    expect(text.getBoundingClientRect().height).toBeGreaterThan(20);

    fixture.destroy();
  });
});
