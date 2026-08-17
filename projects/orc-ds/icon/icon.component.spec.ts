import { TestBed } from '@angular/core/testing';
import { IconComponent, provideOrcIcons } from './icon.component';
import { orcHomeIcon } from '../icons/generated/home';

describe('IconComponent', () => {
  it('renders an imported rounded outline definition', () => {
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('icon', orcHomeIcon);
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('viewBox')).toBe('0 -960 960 960');
    expect(svg.querySelector('path').getAttribute('d')).toContain('M220-180');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  it('switches to the filled path without changing the icon definition', () => {
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('icon', orcHomeIcon);
    fixture.componentRef.setInput('fill', 'filled');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('path').getAttribute('d')).toContain('M160-180');
  });

  it('resolves explicitly registered names', () => {
    TestBed.configureTestingModule({ providers: [provideOrcIcons(orcHomeIcon)] });
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', 'home');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('path').getAttribute('d')).toContain('M220-180');
  });
});
