import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'orchestra-theme';

  private readonly _theme = signal<ThemeMode>(this.getInitialTheme());
  readonly theme = this._theme.asReadonly();

  constructor() {
    this.applyTheme(this._theme());
  }

  toggle(): void {
    this.setTheme(this._theme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: ThemeMode): void {
    this._theme.set(theme);
    this.applyTheme(theme);

    if (isPlatformBrowser(this.platformId)) {
      window.localStorage.setItem(this.storageKey, theme);
    }
  }

  private getInitialTheme(): ThemeMode {
    if (!isPlatformBrowser(this.platformId)) {
      return 'light';
    }

    const storedTheme = window.localStorage.getItem(this.storageKey);
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: ThemeMode): void {
    const root = this.document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.toggle('theme-light', theme === 'light');
    root.classList.toggle('theme-dark', theme === 'dark');
  }
}
