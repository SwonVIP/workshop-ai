import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OrderSummaryComponent } from './order-summary.component';

describe('OrderSummaryComponent', () => {
  function createComponent(totalItems: number, totalPrice: number) {
    const fixture = TestBed.createComponent(OrderSummaryComponent);
    fixture.componentRef.setInput('totalItems', totalItems);
    fixture.componentRef.setInput('totalPrice', totalPrice);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderSummaryComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should display total price', () => {
    // given — an order summary with total price 179.98
    const fixture = createComponent(2, 179.98);

    // then — total price is displayed with CHF currency
    const totalEl = fixture.nativeElement.querySelector('[data-testid="cart-total"]');
    expect(totalEl).toBeInstanceOf(HTMLElement);
    expect(totalEl.textContent).toContain('CHF');
    expect(totalEl.textContent).toContain('179.98');
  });

  it('should display total item count', () => {
    // given — an order summary with 2 items
    const fixture = createComponent(2, 179.98);

    // then — item count is displayed with exact text
    const countEl = fixture.nativeElement.querySelector('[data-testid="cart-item-count"]');
    expect(countEl).toBeInstanceOf(HTMLElement);
    expect(countEl.textContent.trim()).toBe('2 items');
  });

  it('should display singular "item" when count is 1', () => {
    // given — an order summary with 1 item
    const fixture = createComponent(1, 89.99);

    // then — singular "item" is used
    const countEl = fixture.nativeElement.querySelector('[data-testid="cart-item-count"]');
    expect(countEl.textContent.trim()).toBe('1 item');
  });

  it('should display plural "items" when count is greater than 1', () => {
    // given — an order summary with 3 items
    const fixture = createComponent(3, 269.97);

    // then — plural "items" is used
    const countEl = fixture.nativeElement.querySelector('[data-testid="cart-item-count"]');
    expect(countEl.textContent.trim()).toBe('3 items');
  });

  it('should have a Go to Checkout link pointing to /checkout', () => {
    // given — an order summary
    const fixture = createComponent(2, 179.98);

    // then — the checkout button links to /checkout
    const checkoutLink = fixture.nativeElement.querySelector('[data-testid="checkout-button"]');
    expect(checkoutLink).toBeInstanceOf(HTMLAnchorElement);
    expect(checkoutLink.textContent.trim()).toContain('Go to Checkout');
    expect(checkoutLink.getAttribute('href')).toBe('/checkout');
  });
});
