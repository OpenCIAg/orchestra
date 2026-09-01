import { TestBed } from '@angular/core/testing';
import { IconComponent } from './icon.component';

describe('IconComponent', () => {
  it('renders a rounded Material Symbol by name', () => {
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', 'pin');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('.orc-icon');
    expect(icon.textContent.trim()).toBe('pin');
    expect(icon.style.fontFamily).toContain('Material Symbols Rounded');
    expect(icon.style.fontVariationSettings).toContain('"FILL" 0');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('maps style inputs to the Material Symbols axes', () => {
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('family', 'outlined');
    fixture.componentRef.setInput('fill', 'filled');
    fixture.componentRef.setInput('weight', 600);
    fixture.componentRef.setInput('grade', -25);
    fixture.componentRef.setInput('opticalSize', 32);
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('.orc-icon');
    expect(icon.style.fontFamily).toContain('Material Symbols Outlined');
    expect(icon.style.fontSize).toBe('32px');
    expect(icon.style.fontVariationSettings).toContain('"FILL" 1');
    expect(icon.style.fontVariationSettings).toContain('"wght" 600');
    expect(icon.style.fontVariationSettings).toContain('"GRAD" -25');
    expect(icon.style.fontVariationSettings).toContain('"opsz" 32');
  });

  it('uses an accessible name when provided', () => {
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', 'favorite');
    fixture.componentRef.setInput('ariaLabel', 'Favorito');
    fixture.componentRef.setInput('title', 'Favorito');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('.orc-icon');
    expect(icon.getAttribute('role')).toBe('img');
    expect(icon.getAttribute('aria-label')).toBe('Favorito');
    expect(icon.getAttribute('aria-hidden')).toBeNull();
    expect(icon.getAttribute('title')).toBe('Favorito');
  });
});
