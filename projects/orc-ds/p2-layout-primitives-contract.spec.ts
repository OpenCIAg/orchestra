import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ButtonGroupComponent } from '@ciag/orchestra/button-group';
import { SeparatorComponent } from '@ciag/orchestra/separator';
import { TextComponent } from '@ciag/orchestra/text';
import { VisuallyHiddenComponent } from '@ciag/orchestra/visually-hidden';

@Component({
  standalone: true,
  imports: [VisuallyHiddenComponent],
  template:
    '<orc-visually-hidden>Screen reader instructions</orc-visually-hidden>',
})
class VisuallyHiddenContentHost {}

describe('P2 layout primitive DOM contracts', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        ButtonGroupComponent,
        SeparatorComponent,
        TextComponent,
        VisuallyHiddenComponent,
      ],
    }),
  );

  it('labels button groups and applies vertical attached-control layout and end caps', () => {
    const fixture = TestBed.createComponent(ButtonGroupComponent);
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.componentRef.setInput('attached', '');
    fixture.componentRef.setInput('label', 'View options');
    fixture.detectChanges();

    const group = fixture.nativeElement.querySelector(
      '[role="group"]',
    ) as HTMLElement;
    group.innerHTML = '<button>First</button><button>Last</button>';
    fixture.detectChanges();

    expect(group.getAttribute('aria-label')).toBe('View options');
    expect(group.classList.contains('vertical')).toBeTrue();
    expect(group.classList.contains('attached')).toBeTrue();
    expect(getComputedStyle(group).flexDirection).toBe('column');
    expect(
      getComputedStyle(group.querySelector('button')!).borderTopLeftRadius,
    ).toBe('8px');
    expect(
      getComputedStyle(group.querySelectorAll('button')[1])
        .borderBottomRightRadius,
    ).toBe('8px');
  });

  it('exposes Separator orientation and label to assistive technology', () => {
    const fixture = TestBed.createComponent(SeparatorComponent);
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.componentRef.setInput('label', 'Section boundary');
    fixture.detectChanges();
    const separator = fixture.nativeElement.querySelector(
      '[role="separator"]',
    ) as HTMLElement;

    expect(separator.getAttribute('aria-orientation')).toBe('vertical');
    expect(separator.getAttribute('aria-label')).toBe('Section boundary');
    expect(separator.classList.contains('vertical')).toBeTrue();
    expect(separator.style.width).toBe('');
  });

  it('retains VisuallyHidden content in the accessibility tree while clipping its visual box', () => {
    const fixture = TestBed.createComponent(VisuallyHiddenContentHost);
    fixture.detectChanges();
    const hidden = fixture.nativeElement.querySelector(
      '.orc-p2-visually-hidden',
    ) as HTMLElement;
    expect(hidden.textContent).toBe('Screen reader instructions');
    expect(hidden.hasAttribute('aria-hidden')).toBeFalse();
    expect(hidden.hasAttribute('hidden')).toBeFalse();
    expect(getComputedStyle(hidden).position).toBe('absolute');
    expect(getComputedStyle(hidden).width).toBe('1px');
    expect(getComputedStyle(hidden).height).toBe('1px');
    expect(getComputedStyle(hidden).overflow).toBe('hidden');
  });

  it('sets Text size, muted state, and truncation from its public inputs', () => {
    const fixture = TestBed.createComponent(TextComponent);
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('muted', '');
    fixture.componentRef.setInput('truncate', 'true');
    fixture.detectChanges();
    const text = fixture.nativeElement.querySelector(
      '.orc-p2-text',
    ) as HTMLElement;

    expect(text.classList.contains('orc-p2-text--lg')).toBeTrue();
    expect(text.classList.contains('muted')).toBeTrue();
    expect(text.classList.contains('truncate')).toBeTrue();
    expect(getComputedStyle(text).fontSize).toBe('20px');
    expect(getComputedStyle(text).whiteSpace).toBe('nowrap');
  });
});
