import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GalleriaPageComponent } from './galleria-page.component';

describe('Galleria documentation', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [GalleriaPageComponent],
      providers: [provideRouter([])],
    }),
  );

  it('renders the controlled, accessible local-image example', () => {
    const fixture = TestBed.createComponent(GalleriaPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h1')?.textContent).toContain('Galleria');
    expect(root.querySelector('orc-galleria')).not.toBeNull();
    expect(
      root.querySelector('section[aria-label="Galeria de paisagens"]'),
    ).not.toBeNull();
    expect(root.querySelector('img')?.getAttribute('src')).toMatch(
      /^data:image\/svg\+xml/,
    );
    expect(
      root.querySelector('button[data-testid="preview-open"]')?.textContent,
    ).toContain('Abrir tela cheia');
    expect(
      root.querySelector('nav button[aria-label="Imagem anterior"]'),
    ).not.toBeNull();
    expect(
      root.querySelector('nav button[aria-label="Próxima imagem"]'),
    ).not.toBeNull();
  });

  it('keeps selection controlled across thumbnails, indicators, and item navigation', () => {
    const fixture = TestBed.createComponent(GalleriaPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const thumbnails =
      root.querySelectorAll<HTMLButtonElement>('.thumbs button');
    expect(thumbnails).toHaveSize(3);
    thumbnails[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(2);
    expect(
      root.querySelector('[data-testid="gallery-status"]')?.textContent,
    ).toContain('Paisagem âmbar');

    root
      .querySelector<HTMLButtonElement>(
        'nav button[aria-label="Imagem anterior"]',
      )
      ?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(1);
    expect(root.querySelector('.thumbs button.active')).not.toBeNull();

    root
      .querySelector<HTMLButtonElement>(
        'nav button[aria-label="Próxima imagem"]',
      )
      ?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(2);
  });

  it('opens and closes the named fullscreen preview from the live DOM', () => {
    const fixture = TestBed.createComponent(GalleriaPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    root
      .querySelector<HTMLButtonElement>('[data-testid="preview-open"]')
      ?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.fullScreen()).toBeTrue();
    expect(root.querySelector('.orc-galleria--fullscreen')).not.toBeNull();
    const close = root.querySelector<HTMLButtonElement>('.orc-galleria__close');
    expect(close?.getAttribute('aria-label')).toBe('Fechar galeria');

    close?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeFalse();
    expect(root.querySelector('.orc-galleria__mask')).toBeNull();
  });
});
