import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should display the store name', () => {
    // given - header component rendered
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    // then - "Workshop Store" is visible
    expect(fixture.nativeElement.textContent).toContain('Workshop Store');
  });

  it('should contain a link to /catalog', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const catalogLink = fixture.nativeElement.querySelector('a[href="/catalog"]');
    expect(catalogLink).toBeTruthy();
    expect(catalogLink.textContent).toContain('Catalog');
  });

  it('should contain a link to /cart', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const cartLink = fixture.nativeElement.querySelector('a[href="/cart"]');
    expect(cartLink).toBeTruthy();
  });

  it('should show cart item count when items exist', () => {
    // given - cart has 3 items
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentInstance.cartItemCount = signal(3);
    fixture.detectChanges();

    // then - badge shows "3"
    const badge = fixture.nativeElement.querySelector('[data-testid="cart-badge"]');
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain('3');
  });

  it('should not show cart badge when cart is empty', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentInstance.cartItemCount = signal(0);
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('[data-testid="cart-badge"]');
    expect(badge).toBeNull();
  });

  it('should have a fixed header element', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('header');
    expect(header).toBeTruthy();
    expect(header.classList).toContain('fixed');
  });
});
