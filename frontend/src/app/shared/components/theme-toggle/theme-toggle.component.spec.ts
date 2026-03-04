import { TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService, ThemePreference } from '../../../core/services/theme.service';
import { signal } from '@angular/core';

describe('ThemeToggleComponent', () => {
  let mockThemeService: {
    currentTheme: ReturnType<typeof signal<ThemePreference>>;
    effectiveTheme: ReturnType<typeof signal<'light' | 'dark'>>;
    toggleTheme: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();

    mockThemeService = {
      currentTheme: signal<ThemePreference>('system'),
      effectiveTheme: signal<'light' | 'dark'>('light'),
      toggleTheme: vi.fn(),
    };
  });

  function createComponent() {
    TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
      providers: [{ provide: ThemeService, useValue: mockThemeService }],
    });
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('should create the component when rendered', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a button with theme-toggle test id when rendered', () => {
    const fixture = createComponent();
    const button = fixture.nativeElement.querySelector('[data-testid="theme-toggle"]');
    expect(button).toBeInstanceOf(HTMLElement);
  });

  it('should display moon icon when currentTheme is light', () => {
    // given — current theme is explicitly light → moon icon hints "switch to dark"
    mockThemeService.currentTheme = signal<ThemePreference>('light');
    mockThemeService.effectiveTheme = signal<'light' | 'dark'>('light');
    const fixture = createComponent();

    // then — moon icon is visible
    expect(fixture.nativeElement.querySelector('[data-testid="icon-moon"]')).toBeInstanceOf(SVGElement);
    expect(fixture.nativeElement.querySelector('[data-testid="icon-sun"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="icon-monitor"]')).toBeNull();
  });

  it('should display sun icon when currentTheme is dark', () => {
    // given — current theme is explicitly dark → sun icon hints "switch to light"
    mockThemeService.currentTheme = signal<ThemePreference>('dark');
    mockThemeService.effectiveTheme = signal<'light' | 'dark'>('dark');
    const fixture = createComponent();

    // then — sun icon is visible
    expect(fixture.nativeElement.querySelector('[data-testid="icon-sun"]')).toBeInstanceOf(SVGElement);
    expect(fixture.nativeElement.querySelector('[data-testid="icon-moon"]')).toBeNull();
  });

  it('should display monitor icon when currentTheme is system', () => {
    // given — current theme is system
    mockThemeService.currentTheme = signal<ThemePreference>('system');
    const fixture = createComponent();

    // then — monitor icon is visible
    expect(fixture.nativeElement.querySelector('[data-testid="icon-monitor"]')).toBeInstanceOf(SVGElement);
  });

  it('should call toggleTheme when button is clicked', () => {
    // given — component is rendered
    const fixture = createComponent();
    const button = fixture.nativeElement.querySelector('[data-testid="theme-toggle"]');

    // when — button is clicked
    button.click();

    // then — toggleTheme was called
    expect(mockThemeService.toggleTheme).toHaveBeenCalledOnce();
  });

  it('should have accessible aria-label when rendered', () => {
    const fixture = createComponent();
    const button = fixture.nativeElement.querySelector('[data-testid="theme-toggle"]');
    expect(button.getAttribute('aria-label')).toEqual(expect.any(String));
  });
});
