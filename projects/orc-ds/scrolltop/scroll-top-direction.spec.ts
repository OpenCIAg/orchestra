import { TestBed } from '@angular/core/testing';
import { ScrollTopComponent } from '../p2/p2-primeng-gap-components';

/** Parent with fixed scroll geometry: 1000px of content in a 200px viewport. */
function scrollParent(scrollTop: number) {
  const parent = document.createElement('div');
  const calls: ScrollToOptions[] = [];
  Object.defineProperties(parent, {
    scrollTop: { configurable: true, writable: true, value: scrollTop },
    scrollHeight: { configurable: true, value: 1000 },
    clientHeight: { configurable: true, value: 200 },
  });
  parent.scrollTo = ((options: ScrollToOptions) =>
    calls.push(options)) as typeof parent.scrollTo;
  document.body.appendChild(parent);
  return { parent, calls };
}

function mount(parent: HTMLElement, inputs: Record<string, unknown>) {
  const fixture = TestBed.createComponent(ScrollTopComponent);
  parent.appendChild(fixture.nativeElement);
  fixture.componentRef.setInput('target', 'parent');
  for (const [k, v] of Object.entries(inputs))
    fixture.componentRef.setInput(k, v);
  fixture.detectChanges();
  return fixture;
}

describe('ScrollTopComponent direction', () => {
  it('direction="down" shows while content remains below and hides near the end', () => {
    const { parent } = scrollParent(0);
    const fixture = mount(parent, { direction: 'down', threshold: 100 });
    expect(fixture.componentInstance.visible()).toBeTrue();

    parent.scrollTop = 750; // 800 max − 750 = 50 left < threshold
    parent.dispatchEvent(new Event('scroll'));
    expect(fixture.componentInstance.visible()).toBeFalse();
    fixture.destroy();
    parent.remove();
  });

  it('scrolls the target to its end and names the action accordingly', () => {
    const { parent, calls } = scrollParent(0);
    const fixture = mount(parent, { direction: 'down', behavior: 'auto' });
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Scroll to bottom');
    expect(button.querySelector('orc-icon')).not.toBeNull();
    button.click();
    expect(calls).toEqual([{ top: 1000, behavior: 'auto' }]);
    fixture.destroy();
    parent.remove();
  });

  it('keeps the upward default: label, glyph and scroll to the top', () => {
    const { parent, calls } = scrollParent(600);
    const fixture = mount(parent, { behavior: 'auto' });
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Scroll to top');
    button.click();
    expect(calls).toEqual([{ top: 0, behavior: 'auto' }]);
    fixture.destroy();
    parent.remove();
  });
});
