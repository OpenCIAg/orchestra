import { Component, ViewEncapsulation, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BadgeComponent } from '../badge/badge.component';
import { BadgeStatus, BadgeVariant } from '../badge/badge.types';
import { ButtonComponent } from '../button/button.component';
import { TagComponent } from '../tag/tag.component';

@Component({
  imports: [BadgeComponent, ButtonComponent, TagComponent],
  styleUrl: './core.scss',
  encapsulation: ViewEncapsulation.None,
  template: `<section
      class="theme-scope"
      [attr.data-theme]="theme()"
      style="background:var(--orc-surface)"
    >
      <div
        class="surface"
        style="background:var(--orc-surface);color:var(--orc-text);box-shadow:var(--orc-shadow-overlay)"
      >
        Surface
      </div>
      <div
        class="nested"
        [attr.data-theme]="nested()"
        style="background:var(--orc-surface);color:var(--orc-text);box-shadow:var(--orc-shadow-overlay)"
      >
        Nested
      </div>
      @for (variant of variants; track variant) {
        @for (status of statuses; track status) {
          <orc-badge [variant]="variant" [status]="status" [text]="status" />
        }
      }
      <orc-button variant="danger">Delete</orc-button>
      <orc-tag severity="warning" value="Warning" />
      <div
        class="orc-sizing-probe"
        style="width:100px;padding:10px;border:2px solid"
      >
        <div style="width:60px;padding:10px;border:2px solid">Content</div>
      </div>
    </section>
    <div
      class="application-sizing-probe"
      style="width:100px;padding:10px;border:2px solid"
    >
      Application content
    </div>`,
})
class Host {
  theme = signal<'light' | 'dark' | null>('light');
  nested = signal<'light' | 'dark'>('dark');
  variants: BadgeVariant[] = ['soft', 'solid', 'outline', 'ghost', 'dot'];
  statuses: BadgeStatus[] = [
    'primary',
    'secondary',
    'neutral',
    'info',
    'success',
    'warning',
    'danger',
    'active',
    'inactive',
    'pending',
  ];
}

function rgba(css: string): number[] {
  return css.match(/[\d.]+/g)!.map(Number);
}
function composite(foreground: number[], background: number[]): number[] {
  const alpha = foreground[3] ?? 1;
  return foreground
    .slice(0, 3)
    .map((channel, index) => channel * alpha + background[index] * (1 - alpha));
}
function luminance(rgb: number[]): number {
  const linear = rgb
    .map((channel) => channel / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}
function contrast(element: HTMLElement, surface: HTMLElement): number {
  const style = getComputedStyle(element);
  const background = composite(
    rgba(style.backgroundColor),
    rgba(getComputedStyle(surface).backgroundColor),
  );
  const values = [
    luminance(composite(rgba(style.color), background)),
    luminance(background),
  ].sort((a, b) => a - b);
  return (values[1] + 0.05) / (values[0] + 0.05);
}

describe('Theme and component style contracts without the global reset', () => {
  let originalClass: string;
  let originalTheme: string | null;
  beforeEach(() => {
    originalClass = document.documentElement.className;
    originalTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
  });
  afterEach(() => {
    document.documentElement.className = originalClass;
    if (originalTheme === null)
      document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', originalTheme);
  });
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return {
      fixture,
      host: fixture.componentInstance,
      scope: fixture.nativeElement.querySelector('.theme-scope') as HTMLElement,
    };
  }

  it('resolves semantic surface, text and shadow aliases at each nested theme boundary', () => {
    const { fixture, host } = setup();
    const surface = fixture.nativeElement.querySelector('.surface');
    const nested = fixture.nativeElement.querySelector('.nested');
    expect(getComputedStyle(surface).backgroundColor).toBe(
      'rgb(255, 255, 255)',
    );
    expect(getComputedStyle(nested).backgroundColor).toBe('rgb(31, 31, 31)');
    expect(getComputedStyle(nested).color).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(nested).boxShadow).not.toBe(
      getComputedStyle(surface).boxShadow,
    );
    host.theme.set('dark');
    host.nested.set('light');
    fixture.detectChanges();
    expect(getComputedStyle(surface).backgroundColor).toBe('rgb(31, 31, 31)');
    expect(getComputedStyle(nested).backgroundColor).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(nested).color).toBe('rgb(20, 20, 20)');
    expect(getComputedStyle(nested).boxShadow).not.toBe(
      getComputedStyle(surface).boxShadow,
    );
  });

  it('honors explicit root theme classes and data attributes regardless of system preference', () => {
    const { fixture, host } = setup();
    host.theme.set(null);
    fixture.detectChanges();
    const surface = fixture.nativeElement.querySelector('.surface');
    document.documentElement.className = 'theme-light';
    expect(getComputedStyle(surface).backgroundColor).toBe(
      'rgb(255, 255, 255)',
    );
    document.documentElement.className = 'theme-dark';
    expect(getComputedStyle(surface).backgroundColor).toBe('rgb(31, 31, 31)');
    document.documentElement.setAttribute('data-theme', 'light');
    expect(getComputedStyle(surface).backgroundColor).toBe(
      'rgb(255, 255, 255)',
    );
    document.documentElement.className = 'theme-light';
    document.documentElement.setAttribute('data-theme', 'dark');
    expect(getComputedStyle(surface).backgroundColor).toBe('rgb(31, 31, 31)');
  });

  it('uses the real browser system preference when no explicit theme is present', () => {
    const { fixture, host } = setup();
    host.theme.set(null);
    fixture.detectChanges();
    const dark = matchMedia('(prefers-color-scheme: dark)').matches;
    const requested = (
      window as unknown as { __karma__?: { config?: { args?: string[] } } }
    ).__karma__?.config?.args?.[0];
    if (requested === 'light' || requested === 'dark')
      expect(dark)
        .withContext(`Browser must actually emulate ${requested} preference`)
        .toBe(requested === 'dark');
    expect(
      getComputedStyle(fixture.nativeElement.querySelector('.surface'))
        .backgroundColor,
    ).toBe(dark ? 'rgb(31, 31, 31)' : 'rgb(255, 255, 255)');
  });

  for (const theme of ['light', 'dark'] as const) {
    it(`keeps status text legible in ${theme} mode across all badge variants and danger buttons`, () => {
      const { fixture, host, scope } = setup();
      host.theme.set(theme);
      fixture.detectChanges();
      for (const element of fixture.nativeElement.querySelectorAll(
        '.orc-badge, .orc-button, .orc-tag',
      ) as NodeListOf<HTMLElement>) {
        expect(contrast(element, scope))
          .withContext(`${theme}: ${element.className}`)
          .toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  it('sizes component-owned subtrees consistently without resetting application boxes', () => {
    const { fixture } = setup();
    const owned = fixture.nativeElement.querySelector(
      '.orc-sizing-probe',
    ) as HTMLElement;
    const application = fixture.nativeElement.querySelector(
      '.application-sizing-probe',
    ) as HTMLElement;
    expect(owned.getBoundingClientRect().width).toBe(100);
    expect(
      (owned.firstElementChild as HTMLElement).getBoundingClientRect().width,
    ).toBe(60);
    expect(application.getBoundingClientRect().width).toBe(124);
  });
});
