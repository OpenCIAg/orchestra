import { TestBed } from '@angular/core/testing';
import { focusElement } from '../../../tools/quality/test-focus-events';
import { TagComponent, TagVariant } from './tag.component';

describe('Tag accessibility and visual contract', () => {
  function create(
    variant: TagVariant = 'neutral',
    inputs: Record<string, unknown> = {},
  ) {
    const fixture = TestBed.createComponent(TagComponent);
    fixture.componentRef.setInput('variant', variant);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    return fixture;
  }

  function host(fixture: ReturnType<typeof create>): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('styles secondary and contrast variants through semantic theme variables', () => {
    const fixture = create('secondary');
    const element = host(fixture);
    element.style.setProperty('--orc-surface-muted', 'rgb(12, 34, 56)');
    element.style.setProperty('--orc-text-secondary', 'rgb(220, 230, 240)');
    element.style.setProperty('--orc-border-default', 'rgb(70, 80, 90)');
    element.style.setProperty('--bg-inverse', 'rgb(20, 20, 20)');
    element.style.setProperty('--text-inverse', 'rgb(245, 245, 245)');
    fixture.detectChanges();

    const tag = host(fixture).querySelector<HTMLElement>('.orc-tag')!;
    expect(tag.classList).toContain('orc-tag--secondary');
    expect(getComputedStyle(tag).backgroundColor).toBe('rgb(12, 34, 56)');
    expect(getComputedStyle(tag).color).toBe('rgb(220, 230, 240)');

    fixture.componentRef.setInput('variant', 'contrast');
    fixture.detectChanges();
    expect(tag.classList).toContain('orc-tag--contrast');
    expect(getComputedStyle(tag).backgroundColor).toBe('rgb(20, 20, 20)');
    expect(getComputedStyle(tag).color).toBe('rgb(245, 245, 245)');
    fixture.destroy();
  });

  it('provides a useful fallback accessible name and preserves both removal outputs', () => {
    const fixture = create('neutral', { removable: true });
    const button = host(fixture).querySelector<HTMLButtonElement>('button')!;
    const removed = jasmine.createSpy('removed');
    const onRemove = jasmine.createSpy('onRemove');
    fixture.componentInstance.removed.subscribe(removed);
    fixture.componentInstance.onRemove.subscribe(onRemove);

    expect(button.getAttribute('aria-label')).toBe('Remove tag');
    button.click();

    expect(removed).toHaveBeenCalledOnceWith('');
    expect(onRemove).toHaveBeenCalledOnceWith({ value: '' });
    fixture.destroy();
  });

  it('shows a visible focus indicator on the keyboard-removal control', () => {
    const fixture = create('neutral', { removable: true });
    const button = host(fixture).querySelector<HTMLButtonElement>('button')!;
    focusElement(button);

    const style = getComputedStyle(button);
    expect(style.outlineStyle).toBe('solid');
    expect(style.outlineWidth).toBe('2px');
    expect(style.outlineColor).not.toBe('rgba(0, 0, 0, 0)');
    fixture.destroy();
  });

  it('keeps disabled removable tags inert', () => {
    const fixture = create('neutral', { removable: true, disabled: true });
    const removed = jasmine.createSpy('removed');
    const onRemove = jasmine.createSpy('onRemove');
    fixture.componentInstance.removed.subscribe(removed);
    fixture.componentInstance.onRemove.subscribe(onRemove);

    fixture.componentInstance.remove(new MouseEvent('click'));

    expect(removed).not.toHaveBeenCalled();
    expect(onRemove).not.toHaveBeenCalled();
    expect(
      host(fixture).querySelector<HTMLButtonElement>('button')!.disabled,
    ).toBeTrue();
    fixture.destroy();
  });
});
