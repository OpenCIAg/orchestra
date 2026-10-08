import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  AspectRatioComponent,
  BoxComponent,
  ButtonGroupComponent,
  ContainerComponent,
  FlexComponent,
  GridComponent,
  SpaceComponent,
  StackComponent,
  TextComponent,
  VisuallyHiddenComponent,
} from './p2/p2-layout-components';

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
        AspectRatioComponent,
        BoxComponent,
        ButtonGroupComponent,
        ContainerComponent,
        FlexComponent,
        GridComponent,
        SpaceComponent,
        StackComponent,
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

  it('keeps Grid labels on a named group and makes automatic columns fit narrow containers', () => {
    const fixture = TestBed.createComponent(GridComponent);
    fixture.componentRef.setInput('label', 'Project cards');
    fixture.detectChanges();
    const grid = fixture.nativeElement.querySelector(
      '.orc-p2-grid',
    ) as HTMLElement;

    expect(grid.getAttribute('role')).toBe('group');
    expect(grid.getAttribute('aria-label')).toBe('Project cards');
    expect(fixture.componentInstance.columnsStyle()).toBe(
      'repeat(auto-fit, minmax(min(100%, 12rem), 1fr))',
    );

    fixture.componentRef.setInput('columns', '3');
    fixture.detectChanges();
    expect(fixture.componentInstance.columnsStyle()).toBe(
      'repeat(3, minmax(0, 1fr))',
    );

    fixture.componentRef.setInput('columns', 2.5);
    fixture.detectChanges();
    expect(fixture.componentInstance.columnsStyle()).toBe(
      'repeat(auto-fit, minmax(min(100%, 12rem), 1fr))',
    );

    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();
    expect(grid.hasAttribute('role')).toBeFalse();
    expect(grid.hasAttribute('aria-label')).toBeFalse();
  });

  it('applies aspect ratio and overflow inputs to the content wrapper', () => {
    const fixture = TestBed.createComponent(AspectRatioComponent);
    fixture.componentRef.setInput('ratio', '4 / 3');
    fixture.componentRef.setInput('overflow', 'visible');
    fixture.detectChanges();
    const frame = fixture.nativeElement.querySelector(
      '.orc-p2-aspect-ratio',
    ) as HTMLElement;

    expect(frame.style.aspectRatio).toBe('4 / 3');
    expect(frame.style.overflow).toBe('visible');
  });

  it('removes the max-width cap in fluid Containers while preserving padding and box sizing', () => {
    const fixture = TestBed.createComponent(ContainerComponent);
    fixture.componentRef.setInput('maxWidth', '48rem');
    fixture.componentRef.setInput('padding', '2rem');
    fixture.componentRef.setInput('fluid', '');
    fixture.detectChanges();
    const container = fixture.nativeElement.querySelector(
      '.orc-p2-container',
    ) as HTMLElement;

    expect(container.classList.contains('fluid')).toBeTrue();
    expect(container.style.maxWidth).toBe('');
    expect(container.style.paddingInline).toBe('2rem');
    expect(getComputedStyle(container).boxSizing).toBe('border-box');
  });

  it('maps Flex and Stack layout inputs to their flex styles', () => {
    const flexFixture = TestBed.createComponent(FlexComponent);
    flexFixture.componentRef.setInput('direction', 'row-reverse');
    flexFixture.componentRef.setInput('gap', '12px');
    flexFixture.componentRef.setInput('align', 'baseline');
    flexFixture.componentRef.setInput('justify', 'space-between');
    flexFixture.componentRef.setInput('wrap', '');
    flexFixture.detectChanges();
    const flex = flexFixture.nativeElement.querySelector(
      '.orc-p2-flex',
    ) as HTMLElement;
    expect(flex.style.flexDirection).toBe('row-reverse');
    expect(flex.style.gap).toBe('12px');
    expect(flex.style.alignItems).toBe('baseline');
    expect(flex.style.justifyContent).toBe('space-between');
    expect(flex.style.flexWrap).toBe('wrap');

    const stackFixture = TestBed.createComponent(StackComponent);
    stackFixture.componentRef.setInput('direction', 'row');
    stackFixture.componentRef.setInput('gap', '0.5rem');
    stackFixture.componentRef.setInput('align', 'center');
    stackFixture.componentRef.setInput('justify', 'space-between');
    stackFixture.detectChanges();
    const stack = stackFixture.nativeElement.querySelector(
      '.orc-p2-stack',
    ) as HTMLElement;
    expect(stack.style.flexDirection).toBe('row');
    expect(stack.style.gap).toBe('0.5rem');
    expect(stack.style.alignItems).toBe('center');
    expect(stack.style.justifyContent).toBe('space-between');
  });

  it('maps Space orientation, gap, and boolean wrapping without leaking invalid styles', () => {
    const fixture = TestBed.createComponent(SpaceComponent);
    fixture.componentRef.setInput('size', '0.75rem');
    fixture.componentRef.setInput('direction', 'column');
    fixture.componentRef.setInput('wrap', 'true');
    fixture.detectChanges();
    const space = fixture.nativeElement.querySelector(
      '.orc-p2-space',
    ) as HTMLElement;

    expect(space.style.flexDirection).toBe('column');
    expect(space.style.gap).toBe('0.75rem');
    expect(space.style.flexWrap).toBe('wrap');
  });

  it('applies Box spacing, surface, radius, and width inputs', () => {
    const fixture = TestBed.createComponent(BoxComponent);
    fixture.componentRef.setInput('padding', '1rem 2rem');
    fixture.componentRef.setInput('margin', '0 auto');
    fixture.componentRef.setInput('background', 'rgb(1, 2, 3)');
    fixture.componentRef.setInput('radius', '1rem');
    fixture.componentRef.setInput('width', '20rem');
    fixture.detectChanges();
    const box = fixture.nativeElement.querySelector(
      '.orc-p2-box',
    ) as HTMLElement;

    expect(box.style.padding).toBe('1rem 2rem');
    expect(box.style.margin).toBe('0px auto');
    expect(box.style.background).toBe('rgb(1, 2, 3)');
    expect(box.style.borderRadius).toBe('1rem');
    expect(box.style.width).toBe('20rem');
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
