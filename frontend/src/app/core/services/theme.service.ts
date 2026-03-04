import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemePreference = 'light' | 'dark' | 'system';

const VALID_THEMES: ThemePreference[] = ['light', 'dark', 'system'];
const STORAGE_KEY = 'theme-preference';
const CYCLE: Record<ThemePreference, ThemePreference> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly systemPrefersDark = signal(
    this.isBrowser ? window.matchMedia('(prefers-color-scheme: dark)').matches : false,
  );

  readonly currentTheme = signal<ThemePreference>(this.loadTheme());

  readonly effectiveTheme = computed<'light' | 'dark'>(() => {
    const theme = this.currentTheme();
    if (theme === 'light' || theme === 'dark') return theme;
    return this.systemPrefersDark() ? 'dark' : 'light';
  });

  constructor() {
    if (this.isBrowser) {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      mql.addEventListener('change', (e: MediaQueryListEvent) => {
        this.systemPrefersDark.set(e.matches);
      });
    }

    effect(() => {
      const effective = this.effectiveTheme();
      if (this.isBrowser) {
        document.documentElement.classList.toggle('dark', effective === 'dark');
      }
    });

    effect(() => {
      const theme = this.currentTheme();
      if (this.isBrowser) {
        localStorage.setItem(STORAGE_KEY, theme);
      }
    });
  }

  setTheme(theme: ThemePreference): void {
    this.currentTheme.set(theme);
  }

  toggleTheme(): void {
    this.currentTheme.update((t) => CYCLE[t]);
  }

  private loadTheme(): ThemePreference {
    if (!this.isBrowser) return 'system';
    const stored = localStorage.getItem(STORAGE_KEY);
    return VALID_THEMES.includes(stored as ThemePreference)
      ? (stored as ThemePreference)
      : 'system';
  }
}
