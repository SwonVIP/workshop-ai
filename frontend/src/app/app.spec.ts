import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have title Workshop Store', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.title).toBe('Workshop Store');
  });

  it('should render header and footer', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-header')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-footer')).toBeTruthy();
  });

  it('should have main content area with pt-16 for header offset', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const main = fixture.nativeElement.querySelector('main');
    expect(main).toBeTruthy();
    expect(main.classList).toContain('pt-16');
    expect(main.classList).toContain('min-h-screen');
  });
});
