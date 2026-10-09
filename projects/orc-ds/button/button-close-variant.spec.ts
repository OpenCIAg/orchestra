import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <orc-button id="default" variant="close" />
    <orc-button id="named" variant="close" ariaLabel="Fechar aviso" />
    <orc-button id="text" variant="close">Fechar painel</orc-button>
    <orc-button id="primary">Salvar</orc-button>
  `,
})
class CloseVariantHost {}

describe('ButtonComponent variant="close"', () => {
  const button = (root: HTMLElement, id: string) =>
    root.querySelector(`orc-button#${id} button`) as HTMLButtonElement;
  const shown = (el: Element | null) =>
    !!el && getComputedStyle(el).display !== 'none';

  function render() {
    const fixture = TestBed.createComponent(CloseVariantHost);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
    return fixture;
  }

  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [CloseVariantHost] }),
  );

  it('draws the close glyph and is named "Close" when nothing is projected', () => {
    const fixture = render();
    const el = button(fixture.nativeElement, 'default');
    expect(el.querySelector('.orc-button__close-glyph svg')).not.toBeNull();
    expect(el.getAttribute('aria-label')).toBeNull();
    expect(shown(el.querySelector('.orc-button__close-fallback'))).toBeTrue();
    expect(el.textContent?.trim()).toBe('Close');
    fixture.nativeElement.remove();
  });

  it('uses projected text as the accessible name instead of the fallback', () => {
    const fixture = render();
    const el = button(fixture.nativeElement, 'text');
    expect(el.querySelector('.orc-button__text')?.textContent?.trim()).toBe(
      'Fechar painel',
    );
    expect(shown(el.querySelector('.orc-button__close-fallback'))).toBeFalse();
    fixture.nativeElement.remove();
  });

  it('keeps an explicit ariaLabel', () => {
    const fixture = render();
    expect(
      button(fixture.nativeElement, 'named').getAttribute('aria-label'),
    ).toBe('Fechar aviso');
    fixture.nativeElement.remove();
  });

  it('leaves the other variants untouched', () => {
    const fixture = render();
    const el = button(fixture.nativeElement, 'primary');
    expect(el.querySelector('.orc-button__close-glyph')).toBeNull();
    expect(el.querySelector('.orc-button__close-fallback')).toBeNull();
    expect(shown(el.querySelector('.orc-button__text'))).toBeTrue();
    fixture.nativeElement.remove();
  });
});
