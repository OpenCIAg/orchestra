import { TestBed } from '@angular/core/testing';
import { TypographyComponent } from '@ciag/orchestra/typography';

describe('TypographyComponent DOM contract', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [TypographyComponent] }),
  );

  function createFixture() {
    const fixture = TestBed.createComponent(TypographyComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders supported semantic tags and falls back to span for unsupported values', () => {
    const fixture = createFixture();

    fixture.componentRef.setInput('as', 'h1');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('span')).toBeNull();

    fixture.componentRef.setInput('as', 'h4');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('h1')).toBeNull();
  });

  it('binds size, weight, color, and truncate styling', () => {
    const fixture = createFixture();
    fixture.componentRef.setInput('as', 'p');
    fixture.componentRef.setInput('size', 'xl');
    fixture.componentRef.setInput('weight', 700);
    fixture.componentRef.setInput('color', 'rebeccapurple');
    fixture.componentRef.setInput('truncate', true);
    fixture.detectChanges();

    const typography = fixture.nativeElement.querySelector('p') as HTMLElement;
    expect(typography.classList.contains('orc-p2-typography')).toBeTrue();
    expect(typography.classList.contains('orc-p2-typography--xl')).toBeTrue();
    expect(typography.classList.contains('truncate')).toBeTrue();
    expect(typography.style.fontWeight).toBe('700');
    expect(typography.style.color).toBe('rebeccapurple');
  });

  it('updates the rendered element and style contract when inputs change', () => {
    const fixture = createFixture();
    fixture.componentRef.setInput('as', 'h2');
    fixture.componentRef.setInput('size', 'sm');
    fixture.componentRef.setInput('weight', '600');
    fixture.componentRef.setInput('color', 'tomato');
    fixture.componentRef.setInput('truncate', true);
    fixture.detectChanges();

    let typography = fixture.nativeElement.querySelector('h2') as HTMLElement;
    expect(typography.classList.contains('orc-p2-typography--sm')).toBeTrue();
    expect(typography.classList.contains('truncate')).toBeTrue();
    expect(typography.style.fontWeight).toBe('600');
    expect(typography.style.color).toBe('tomato');

    fixture.componentRef.setInput('as', 'p');
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('color', 'teal');
    fixture.componentRef.setInput('truncate', false);
    fixture.detectChanges();

    typography = fixture.nativeElement.querySelector('p') as HTMLElement;
    expect(typography.classList.contains('orc-p2-typography--lg')).toBeTrue();
    expect(typography.classList.contains('truncate')).toBeFalse();
    expect(typography.style.color).toBe('teal');
  });
});
