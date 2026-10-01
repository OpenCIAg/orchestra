import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ButtonPageComponent } from './button-page.component';

describe('Button documentation', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [ButtonPageComponent],
      providers: [provideRouter([])],
    }),
  );

  it('renders both projected icons at the shared button size', () => {
    const fixture = TestBed.createComponent(ButtonPageComponent);
    fixture.detectChanges();
    const icons = Array.from(
      fixture.nativeElement.querySelectorAll('svg[iconLeft], svg[iconRight]'),
    ) as SVGElement[];
    expect(icons).toHaveSize(2);
    for (const icon of icons) {
      expect(icon.querySelector('path')).not.toBeNull();
      expect(icon.getBoundingClientRect().width).toBe(20);
      expect(icon.getBoundingClientRect().height).toBe(20);
    }
  });

  it('keeps icon-only previews named and excludes disabled clicks from the count', () => {
    const fixture = TestBed.createComponent(ButtonPageComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const button = fixture.nativeElement.querySelector(
      'orc-button button',
    ) as HTMLButtonElement;
    button.click();
    expect(component.clickCount()).toBe(1);
    component.playgroundIconOnly.set(true);
    component.playgroundDisabled.set(true);
    fixture.detectChanges();
    expect(button.getAttribute('aria-label')).toBe(component.playgroundText());
    button.click();
    expect(component.clickCount()).toBe(1);
  });
});
