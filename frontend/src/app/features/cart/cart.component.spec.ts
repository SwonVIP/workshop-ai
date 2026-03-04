import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { CartComponent } from './cart.component';
import { CartService } from '../../core/services/cart.service';
import { Cart } from '../../core/models/cart.model';

describe('CartComponent', () => {
  const mockCart: Cart = {
    id: 1,
    sessionId: 'test-session',
    items: [
      {
        id: 10,
        product: { id: 42, name: 'Wireless Mouse', price: 29.99, imageUrl: '/images/mouse.jpg' },
        quantity: 2,
        subtotal: 59.98,
      },
      {
        id: 11,
        product: { id: 43, name: 'Keyboard', price: 59.99, imageUrl: '/images/keyboard.jpg' },
        quantity: 2,
        subtotal: 119.98,
      },
    ],
    totalItems: 4,
    totalPrice: 179.96,
  };

  const emptyCart: Cart = {
    id: 2,
    sessionId: 'test-session',
    items: [],
    totalItems: 0,
    totalPrice: 0,
  };

  function createMockCartService(cart: Cart | null = mockCart) {
    return {
      cart: signal<Cart | null>(cart),
      itemCount: signal(cart?.totalItems ?? 0),
      loadCart: vi.fn(),
      updateItem: vi.fn().mockReturnValue(of({})),
      removeItem: vi.fn().mockReturnValue(of(undefined)),
      addItem: vi.fn().mockReturnValue(of({})),
      getCart: vi.fn().mockReturnValue(of({})),
    };
  }

  function setup(cart: Cart | null = mockCart) {
    const mockCartService = createMockCartService(cart);

    TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [
        provideRouter([]),
        { provide: CartService, useValue: mockCartService },
      ],
    });

    const fixture = TestBed.createComponent(CartComponent);
    fixture.detectChanges();
    return { fixture, mockCartService };
  }

  it('should display cart items when cart has products', () => {
    // given — a cart with 2 items
    const { fixture } = setup(mockCart);

    // then — 2 cart item rows are rendered
    const rows = fixture.nativeElement.querySelectorAll('[data-testid="cart-item-row"]');
    expect(rows.length).toBe(2);
  });

  it('should display empty state when cart is empty', () => {
    // given — an empty cart
    const { fixture } = setup(emptyCart);

    // then — empty state is displayed
    expect(fixture.nativeElement.textContent).toContain('Your cart is empty');
    expect(fixture.nativeElement.textContent).toContain('Browse Products');
  });

  it('should display empty state when cart is null', () => {
    // given — no cart loaded
    const { fixture } = setup(null);

    // then — empty state is displayed
    expect(fixture.nativeElement.textContent).toContain('Your cart is empty');
    expect(fixture.nativeElement.textContent).toContain('Browse Products');
  });

  it('should display order summary with correct totals', () => {
    // given — a cart with products
    const { fixture } = setup(mockCart);

    // then — order summary displays correct total
    const totalEl = fixture.nativeElement.querySelector('[data-testid="cart-total"]');
    expect(totalEl).toBeTruthy();
    expect(totalEl.textContent).toContain('179.96');

    const countEl = fixture.nativeElement.querySelector('[data-testid="cart-item-count"]');
    expect(countEl).toBeTruthy();
    expect(countEl.textContent).toContain('4');
  });

  it('should call cartService.updateItem when quantity changes', () => {
    // given — a cart with items
    const { fixture, mockCartService } = setup(mockCart);

    // when — quantity change event is triggered
    fixture.componentInstance.onQuantityChange({ itemId: 10, quantity: 3 });

    // then — updateItem is called with correct args
    expect(mockCartService.updateItem).toHaveBeenCalledWith(10, { quantity: 3 });
  });

  it('should call cartService.removeItem when item is removed', () => {
    // given — a cart with items
    const { fixture, mockCartService } = setup(mockCart);

    // when — remove event is triggered
    fixture.componentInstance.onRemove(10);

    // then — removeItem is called with correct item id
    expect(mockCartService.removeItem).toHaveBeenCalledWith(10);
  });

  it('should call cartService.loadCart on init', () => {
    // given/when — the component initializes
    const { mockCartService } = setup(mockCart);

    // then — loadCart was called
    expect(mockCartService.loadCart).toHaveBeenCalled();
  });
});
