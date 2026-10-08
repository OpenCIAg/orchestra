import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DividerComponent } from './divider.component';

@Component({
  standalone: true,
  imports: [DividerComponent],
  template: `<orc-divider
    orientation="vertical"
    [decorative]="false"
    ariaLabel="Section boundary"
  >
    <span class="projected-divider-content">Projected</span>
  </orc-divider>`,
})
class ProjectedDividerHost {}

describe('DividerComponent static DOM behavior', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [DividerComponent] }),
  );

  function create(): ComponentFixture<DividerComponent> {
    const fixture = TestBed.createComponent(DividerComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders decorative dividers without separator semantics', () => {
    const fixture = create();
    const divider = fixture.nativeElement.querySelector(
      '.orc-divider',
    ) as HTMLElement;
    expect(divider.getAttribute('role')).toBeNull();
    expect(divider.getAttribute('aria-hidden')).toBe('true');
    expect(divider.getAttribute('aria-orientation')).toBeNull();
    expect(divider.classList).toContain('orc-divider--solid');
  });

  it('exposes semantic orientation and label while coercing boolean flags', () => {
    const fixture = create();
    fixture.componentRef.setInput('decorative', 'false');
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.componentRef.setInput('variant', 'dashed');
    fixture.componentRef.setInput('label', 'Or');
    fixture.componentRef.setInput('inset', '');
    fixture.detectChanges();
    const divider = fixture.nativeElement.querySelector(
      '.orc-divider',
    ) as HTMLElement;
    expect(divider.getAttribute('role')).toBe('separator');
    expect(divider.getAttribute('aria-orientation')).toBe('vertical');
    expect(divider.getAttribute('aria-label')).toBe('Or');
    expect(divider.getAttribute('aria-hidden')).toBeNull();
    expect(divider.classList).toContain('orc-divider--vertical');
    expect(divider.classList).toContain('orc-divider--dashed');
    expect(divider.classList).toContain('orc-divider--inset');
    expect(divider.querySelectorAll('.orc-divider__line').length).toBe(2);
  });

  it('preserves projected content in the static divider structure', () => {
    const fixture = TestBed.createComponent(ProjectedDividerHost);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.projected-divider-content')
        ?.textContent,
    ).toContain('Projected');
    const divider = fixture.nativeElement.querySelector(
      '.orc-divider',
    ) as HTMLElement;
    const children = Array.from(divider.children) as HTMLElement[];
    expect(children.map((child) => child.className)).toEqual([
      'orc-divider__line',
      'orc-divider__label',
      'orc-divider__line',
    ]);
    expect(children[1].textContent).toContain('Projected');
    expect(children[1].previousElementSibling?.className).toBe(
      'orc-divider__line',
    );
    expect(children[1].nextElementSibling?.className).toBe('orc-divider__line');
    expect(divider.getAttribute('role')).toBe('separator');
  });

  it('matches orc-separator selector for unified separator usage', () => {
    @Component({
      standalone: true,
      imports: [DividerComponent],
      template: `<orc-separator
        orientation="vertical"
        label="Boundary"
        [decorative]="false"
      />`,
    })
    class SeparatorHost {}

    const fixture = TestBed.createComponent(SeparatorHost);
    fixture.detectChanges();
    const divider = fixture.nativeElement.querySelector(
      '.orc-divider',
    ) as HTMLElement;
    expect(divider).not.toBeNull();
    expect(divider.getAttribute('role')).toBe('separator');
    expect(divider.getAttribute('aria-orientation')).toBe('vertical');
    expect(divider.getAttribute('aria-label')).toBe('Boundary');
  });
});
