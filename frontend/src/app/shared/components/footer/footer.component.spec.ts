import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display current year', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();

    const year = new Date().getFullYear().toString();
    expect(fixture.nativeElement.textContent).toContain(year);
  });

  it('should have a footer element with muted background', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();

    const footer = fixture.nativeElement.querySelector('footer');
    expect(footer).toBeTruthy();
    expect(footer.classList).toContain('bg-muted');
  });

  it('should contain navigation links', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();

    const catalogLink = fixture.nativeElement.querySelector('a[href="/catalog"]');
    const cartLink = fixture.nativeElement.querySelector('a[href="/cart"]');
    expect(catalogLink).toBeTruthy();
    expect(cartLink).toBeTruthy();
  });
});
