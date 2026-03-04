import { TestBed } from '@angular/core/testing';
import { ThemeService, ThemePreference } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let matchMediaListeners: Map<string, ((e: MediaQueryListEvent) => void)[]>;
  let darkModeMatches: boolean;

  function createMockMatchMedia(overrideDarkMode?: boolean) {
    matchMediaListeners = new Map();
    if (overrideDarkMode !== undefined) {
      darkModeMatches = overrideDarkMode;
    }

    return vi.fn((query: string) => {
      const listeners: ((e: MediaQueryListEvent) => void)[] = [];
      matchMediaListeners.set(query, listeners);
      return {
        matches: query === '(prefers-color-scheme: dark)' ? darkModeMatches : false,
        media: query,
        addEventListener: vi.fn((_event: string, cb: (e: MediaQueryListEvent) => void) => {
          listeners.push(cb);
        }),
        removeEventListener: vi.fn(),
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList;
    });
  }

  function fireSystemThemeChange(prefersDark: boolean) {
    const listeners = matchMediaListeners.get('(prefers-color-scheme: dark)') ?? [];
    const event = { matches: prefersDark } as MediaQueryListEvent;
    listeners.forEach((cb) => cb(event));
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    darkModeMatches = false;
    window.matchMedia = createMockMatchMedia();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  function createService(): ThemeService {
    TestBed.configureTestingModule({});
    return TestBed.inject(ThemeService);
  }

  // ── Initialization ────────────────────────────────────────────────

  describe('initialization', () => {
    it('should default to system theme when no localStorage value exists', () => {
      // given — localStorage has no theme-preference
      expect(localStorage.getItem('theme-preference')).toBeNull();

      // when — service is created
      service = createService();

      // then — currentTheme is 'system'
      expect(service.currentTheme()).toBe('system');
    });

    it.each([
      ['light' as ThemePreference],
      ['dark' as ThemePreference],
      ['system' as ThemePreference],
    ])('should restore "%s" theme from localStorage when previously stored', (theme) => {
      // given — localStorage has a stored preference
      localStorage.setItem('theme-preference', theme);

      // when — service is created
      service = createService();

      // then — currentTheme matches stored value
      expect(service.currentTheme()).toBe(theme);
    });

    it('should fallback to system when localStorage contains invalid value', () => {
      // given — localStorage has an invalid value
      localStorage.setItem('theme-preference', 'invalid-value');

      // when — service is created
      service = createService();

      // then — currentTheme defaults to 'system'
      expect(service.currentTheme()).toBe('system');
    });
  });

  // ── effectiveTheme ────────────────────────────────────────────────

  describe('effectiveTheme', () => {
    it('should return "light" when currentTheme is "light"', () => {
      // given — theme set to light
      localStorage.setItem('theme-preference', 'light');
      service = createService();

      // then — effectiveTheme is light regardless of system preference
      expect(service.effectiveTheme()).toBe('light');
    });

    it('should return "dark" when currentTheme is "dark"', () => {
      // given — theme set to dark
      localStorage.setItem('theme-preference', 'dark');
      service = createService();

      // then — effectiveTheme is dark
      expect(service.effectiveTheme()).toBe('dark');
    });

    it('should return "dark" when currentTheme is "system" and system prefers dark', () => {
      // given — system prefers dark
      window.matchMedia = createMockMatchMedia(true);
      service = createService();

      // then — effectiveTheme resolves to dark
      expect(service.effectiveTheme()).toBe('dark');
    });

    it('should return "light" when currentTheme is "system" and system prefers light', () => {
      // given — system prefers light (default from beforeEach)
      service = createService();

      // then — effectiveTheme resolves to light
      expect(service.effectiveTheme()).toBe('light');
    });
  });

  // ── DOM class application ─────────────────────────────────────────

  describe('DOM class application', () => {
    it('should add "dark" class to <html> when effectiveTheme is dark', () => {
      // given — theme is dark
      localStorage.setItem('theme-preference', 'dark');

      // when — service initializes
      service = createService();
      TestBed.flushEffects();

      // then — <html> has dark class
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should remove "dark" class from <html> when effectiveTheme is light', () => {
      // given — <html> already has dark class, but theme is light
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme-preference', 'light');

      // when — service initializes
      service = createService();
      TestBed.flushEffects();

      // then — <html> no longer has dark class
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  // ── localStorage persistence ──────────────────────────────────────

  describe('localStorage persistence', () => {
    it('should persist theme to localStorage when setTheme is called', () => {
      // given — service initialized with default
      service = createService();

      // when — theme is set to dark
      service.setTheme('dark');
      TestBed.flushEffects();

      // then — localStorage is updated
      expect(localStorage.getItem('theme-preference')).toBe('dark');
    });

    it('should persist each theme change to localStorage', () => {
      // given — service initialized
      service = createService();

      // when — cycling through themes
      service.setTheme('light');
      TestBed.flushEffects();
      expect(localStorage.getItem('theme-preference')).toBe('light');

      service.setTheme('dark');
      TestBed.flushEffects();
      expect(localStorage.getItem('theme-preference')).toBe('dark');

      service.setTheme('system');
      TestBed.flushEffects();
      expect(localStorage.getItem('theme-preference')).toBe('system');
    });
  });

  // ── setTheme ──────────────────────────────────────────────────────

  describe('setTheme', () => {
    it.each([
      ['light' as ThemePreference],
      ['dark' as ThemePreference],
      ['system' as ThemePreference],
    ])('should set currentTheme to "%s" when setTheme is called', (theme) => {
      // given — service initialized
      service = createService();

      // when — setTheme is called
      service.setTheme(theme);

      // then — currentTheme matches
      expect(service.currentTheme()).toBe(theme);
    });
  });

  // ── toggleTheme ───────────────────────────────────────────────────

  describe('toggleTheme', () => {
    it('should cycle from light to dark when toggleTheme is called', () => {
      // given — theme is light
      localStorage.setItem('theme-preference', 'light');
      service = createService();

      // when — toggleTheme is called
      service.toggleTheme();

      // then — theme becomes dark
      expect(service.currentTheme()).toBe('dark');
    });

    it('should cycle from dark to system when toggleTheme is called', () => {
      // given — theme is dark
      localStorage.setItem('theme-preference', 'dark');
      service = createService();

      // when — toggleTheme is called
      service.toggleTheme();

      // then — theme becomes system
      expect(service.currentTheme()).toBe('system');
    });

    it('should cycle from system to light when toggleTheme is called', () => {
      // given — theme is system (default)
      service = createService();
      expect(service.currentTheme()).toBe('system');

      // when — toggleTheme is called
      service.toggleTheme();

      // then — theme becomes light
      expect(service.currentTheme()).toBe('light');
    });
  });

  // ── System preference change listener ─────────────────────────────

  describe('system preference change', () => {
    it('should update effectiveTheme when system preference changes and currentTheme is system', () => {
      // given — service in system mode, system starts light (default)
      service = createService();
      expect(service.effectiveTheme()).toBe('light');

      // when — system preference changes to dark
      fireSystemThemeChange(true);

      // then — effectiveTheme updates to dark
      expect(service.effectiveTheme()).toBe('dark');
    });

    it('should not affect effectiveTheme when system preference changes and currentTheme is explicit', () => {
      // given — theme explicitly set to light
      localStorage.setItem('theme-preference', 'light');
      service = createService();

      // when — system preference changes to dark
      fireSystemThemeChange(true);

      // then — effectiveTheme stays light (explicit override)
      expect(service.effectiveTheme()).toBe('light');
    });
  });
});
