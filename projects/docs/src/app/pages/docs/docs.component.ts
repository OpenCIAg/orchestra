import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../../shared/footer/footer.component';
import { BadgeComponent } from '@ciag/orchestra/badge';
import { ButtonComponent } from '@ciag/orchestra/button';
import { CardBodyComponent, CardComponent, CardHeaderComponent } from '@ciag/orchestra/card';
import { ChipComponent } from '@ciag/orchestra/chip';
import { DividerComponent } from '@ciag/orchestra/divider';

interface ZincSwatch {
  name: string;
  token: string;
  hex: string;
  light: boolean;
}

interface SpacingStep {
  token: string;
  value: string;
  px: number;
}

interface RadiusStep {
  token: string;
  value: string;
}

interface BgToken {
  token: string;
  value: string;
  use: string;
  bordered?: boolean;
}

interface BrandColor {
  name: string;
  token: string;
  hex: string;
  textLight: boolean; // true = usar texto preto sobre essa cor
}

type AssetFormat = 'svg';

interface CiagLogoGroup {
  id: string;
  label: string;
  darkBg: boolean;
  formats: Record<AssetFormat, string>; // formato → path
}


@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [
    RouterModule,
    FooterComponent,
    BadgeComponent,
    ButtonComponent,
    CardBodyComponent,
    CardComponent,
    CardHeaderComponent,
    ChipComponent,
    DividerComponent,
  ],
  templateUrl: './docs.component.html',
  styleUrl: './docs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private scrollListener?: () => void;

  readonly activeSection = signal<string>('overview');

  readonly sectionIds: string[] = [
    'overview',
    'principles',
    'logo',
    'colors',
    'typography',
    'spacing',
    'shadows',
    'assets',
    'tokens',
    'dos',
    'donts',
  ];

  readonly tokensCopied = signal(false);
  readonly copiedColor = signal<string | null>(null);

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollSpy();
    }
  }

  ngOnDestroy(): void {
    if (this.scrollListener && isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  private initScrollSpy(): void {
    const hash = window.location.hash.replace('#', '');
    if (hash && this.sectionIds.includes(hash)) {
      this.activeSection.set(hash);
    } else {
      this.updateActiveSection();
    }

    let ticking = false;
    this.scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.updateActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  private updateActiveSection(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Se estiver no final da página, ativa a última seção
    if (scrollPosition + windowHeight >= documentHeight - 50) {
      const lastSection = this.sectionIds[this.sectionIds.length - 1];
      if (this.activeSection() !== lastSection) {
        this.activeSection.set(lastSection);
      }
      return;
    }

    // Offset para compensar o header sticky (56px) + respiro
    const offset = 100;
    let current = this.sectionIds[0];

    for (const id of this.sectionIds) {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top;
        if (top <= offset) {
          current = id;
        } else {
          break;
        }
      }
    }

    if (this.activeSection() !== current) {
      this.activeSection.set(current);
    }
  }

  scrollToSection(id: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.activeSection.set(id);
    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState(null, '', '#' + id);
      }
    }
  }

  copyColor(hex: string): void {
    navigator.clipboard.writeText(hex).then(() => {
      this.copiedColor.set(hex);
      setTimeout(() => this.copiedColor.set(null), 1800);
    });
  }

  // ── CIAg logo groups ─────────────────────────────────────────
  readonly ciagGroups: CiagLogoGroup[] = [
    {
      id: 'ciag-white',
      label: 'CIAg — Versão branca',
      darkBg: true,
      formats: {
        svg: '/assets/ciag-white.svg',
      },
    },
  ];

  // formato selecionado por card: { azul: 'svg', branco: 'svg' }
  readonly ciagFormat = signal<Record<string, AssetFormat>>({
    'ciag-white': 'svg',
  });

  getCiagFormat(id: string): AssetFormat {
    return this.ciagFormat()[id] ?? 'svg';
  }

  setCiagFormat(id: string, fmt: AssetFormat): void {
    this.ciagFormat.update(prev => ({ ...prev, [id]: fmt }));
  }

  getCiagPath(group: CiagLogoGroup): string {
    return group.formats[this.getCiagFormat(group.id)];
  }

  // ── Font selection ───────────────────────────────────────────
  readonly selectedFont = signal<'poppins' | 'jetbrains'>('poppins');

  readonly brandColors: BrandColor[] = [
    { name: 'Azul Elétrico', token: '--orc-color-azul-eletrico', hex: '#1C6AED', textLight: false },
    { name: 'Azul Royal', token: '--orc-color-azul-royal', hex: '#0406AB', textLight: false },
    { name: 'Laranja', token: '--orc-color-laranja', hex: '#FF6A1C', textLight: false },
    { name: 'Ciano', token: '--orc-color-ciano', hex: '#1CEDB9', textLight: true },
    { name: 'Roxo Lavender', token: '--orc-color-roxo-lavender', hex: '#6A1CED', textLight: false },
    { name: 'Azul Navy', token: '--orc-color-azul-navy', hex: '#004B77', textLight: false },
  ];

  readonly statusColors = [
    { name: 'Accent',  token: '--color-accent',  hex: '#141414', bg: '#141414' },
    { name: 'Success', token: '--color-success',  hex: '#006F4A', bg: '#006F4A' },
    { name: 'Error',   token: '--color-error',    hex: '#FB2C36', bg: '#FB2C36' },
    { name: 'Warning', token: '--color-warning',  hex: '#FE9A00', bg: '#FE9A00' },
    { name: 'Info',    token: '--color-info',     hex: '#2B7FFF', bg: '#2B7FFF' },
  ];

  readonly zincScale: ZincSwatch[] = [
    { name: 'Bg', token: '--orc-bg', hex: '#FFFFFF', light: true },
    { name: 'Th', token: '--orc-th', hex: '#F9F9F9', light: true },
    { name: 'Highlight', token: '--orc-highlight-cinza-claro', hex: '#EDEDED', light: true },
    { name: 'Secondary-Bg', token: '--orc-secondary-bg', hex: '#D9D9D9', light: true },
    { name: 'Fonte-Secondary', token: '--orc-font-secondary', hex: '#666666', light: false },
    { name: 'Fonte-Main', token: '--orc-font-main', hex: '#141414', light: false },
  ];

  readonly backgroundTokens: BgToken[] = [
    { token: '--orc-bg', value: '#FFFFFF', use: 'Fundo principal da aplicação', bordered: true },
    { token: '--orc-th', value: '#F9F9F9', use: 'Cabeçalho de tabela, fundo sutil', bordered: true },
    { token: '--orc-fill-input', value: '#FFFFFF', use: 'Fundo de inputs e campos de formulário', bordered: true },
    { token: '--orc-fill-modal', value: '#FFFFFF', use: 'Fundo de modais e overlays', bordered: true },
    { token: '--orc-highlight-cinza-claro', value: '#EDEDED', use: 'Highlights, hover states, chips', bordered: true },
    { token: '--orc-secondary-bg', value: '#D9D9D9', use: 'Fundo secundário, divisores', bordered: true },
    { token: '--orc-border', value: '#D9D9D9', use: 'Bordas padrão', bordered: true },
    { token: '--orc-font-secondary', value: '#666666', use: 'Texto secundário, labels, metadados' },
    { token: '--orc-font-main', value: '#141414', use: 'Texto principal' },
    { token: '--orc-opposite-bw', value: '#FFFFFF', use: 'Cor oposta ao modo atual (B&W)', bordered: true },
  ];

  readonly spacingScale: SpacingStep[] = [
    { token: '--space-1', value: '0.25rem', px: 4 },
    { token: '--space-2', value: '0.5rem', px: 8 },
    { token: '--space-3', value: '0.75rem', px: 12 },
    { token: '--space-4', value: '1rem', px: 16 },
    { token: '--space-5', value: '1.25rem', px: 20 },
    { token: '--space-6', value: '1.5rem', px: 24 },
    { token: '--space-8', value: '2rem', px: 32 },
    { token: '--space-10', value: '2.5rem', px: 40 },
    { token: '--space-12', value: '3rem', px: 48 },
    { token: '--space-16', value: '4rem', px: 64 },
    { token: '--space-20', value: '5rem', px: 80 },
  ];

  readonly radiusScale: RadiusStep[] = [
    { token: '--radius-sm', value: '0.375rem' },  // 6px
    { token: '--radius-md', value: '0.625rem' },  // 10px — base
    { token: '--radius-lg', value: '0.875rem' },  // 14px
    { token: '--radius-xl', value: '1.25rem' },  // 20px
    { token: '--radius-full', value: '9999px' },
  ];

  readonly tokensCode = `:root {
  /* ── Brand tokens — Light ───────────────────── */
  --orc-bg:                    #FFFFFF;
  --orc-font-main:             #141414;
  --orc-secondary-bg:          #D9D9D9;
  --orc-font-secondary:        #666666;
  --orc-border:                #D9D9D9;
  --orc-fill-input:            #FFFFFF;
  --orc-th:                    #F9F9F9;
  --orc-fill-modal:            #FFFFFF;
  --orc-highlight-cinza-claro: #EDEDED;
  --orc-opposite-bw:           #FFFFFF;

  /* ── Brand colors (identidade visual) ───────── */
  --orc-color-azul-eletrico:   #1C6AED;
  --orc-color-azul-royal:      #0406AB;
  --orc-color-laranja:         #FF6A1C;
  --orc-color-ciano:           #1CEDB9;
  --orc-color-roxo-lavender:   #6A1CED;
  --orc-color-azul-navy:       #004B77;

  /* ── Accent ─────────────────────────────────── */
  --color-accent:       #141414;
  --color-accent-hover: #2a2a2a;
  --color-accent-fg:    #FFFFFF;

  /* ── Semantic ───────────────────────────────── */
  --color-success: #006F4A;
  --color-error:   #FB2C36;
  --color-warning: #FE9A00;
  --color-info:    #2B7FFF;

  /* ── Aliases para componentes ───────────────── */
  --bg-app:         var(--orc-bg);
  --bg-subtle:      var(--orc-th);
  --bg-muted:       var(--orc-highlight-cinza-claro);
  --bg-inverse:     var(--orc-font-main);
  --border-default: var(--orc-border);
  --border-strong:  var(--orc-secondary-bg);
  --text-primary:   var(--orc-font-main);
  --text-secondary: var(--orc-font-secondary);
  --text-muted:     #999999;
  --text-inverse:   var(--orc-bg);

  /* ── Typography ─────────────────────────────── */
  --font-sans: 'Poppins', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* ── Spacing ────────────────────────────────── */
  --space-1: 0.25rem; --space-2: 0.5rem;
  --space-3: 0.75rem; --space-4: 1rem;
  --space-5: 1.25rem; --space-6: 1.5rem;
  --space-8: 2rem;    --space-10: 2.5rem;
  --space-12: 3rem;   --space-16: 4rem;
  --space-20: 5rem;

  /* ── Border Radius ──────────────────────────── */
  --radius-sm:   0.375rem; /*  6px — sutil         */
  --radius-md:   0.625rem; /* 10px — padrão base   */
  --radius-lg:   0.875rem; /* 14px — cards         */
  --radius-xl:   1.25rem;  /* 20px — modais        */
  --radius-full: 9999px;   /* pílulas e avatares   */

  /* ── Shadows ────────────────────────────────── */
  --shadow-sm: 0 1px 2px rgba(0,0,0,.06);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,.08),
               0 2px 4px -1px rgba(0,0,0,.04);

  /* ── Transitions ────────────────────────────── */
  --transition-fast: 120ms ease;
  --transition-base: 200ms ease;
}

/* ── Dark mode ──────────────────────────────────── */
@media (prefers-color-scheme: dark) {
  :root {
    --orc-bg:                    #1F1F1F;
    --orc-font-main:             #FFFFFF;
    --orc-secondary-bg:          #424242;
    --orc-font-secondary:        #F8F8F8;
    --orc-border:                #333333;
    --orc-fill-input:            #1A1A1A;
    --orc-th:                    #2A2A2A;
    --orc-fill-modal:            #1F1F1F;
    --orc-highlight-cinza-claro: #535353;
    --orc-opposite-bw:           #141414;

    --color-accent:       #FFFFFF;
    --color-accent-hover: #F8F8F8;
    --color-accent-fg:    #141414;
    --text-muted:         #888888;
  }
}`;

  copyTokens(): void {
    navigator.clipboard.writeText(this.tokensCode).then(() => {
      this.tokensCopied.set(true);
      setTimeout(() => this.tokensCopied.set(false), 2000);
    });
  }
}
