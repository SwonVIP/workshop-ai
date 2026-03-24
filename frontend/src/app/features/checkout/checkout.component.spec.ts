import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { CheckoutComponent } from './checkout.component';
import { CheckoutService } from '../../core/services/checkout.service';
import { CartService } from '../../core/services/cart.service';
import { Cart } from '../../core/models/cart.model';
import { OrderResponse, DeliverySlot } from '../../core/models/checkout.model';

describe('CheckoutComponent', () => {
  const mockSlots: DeliverySlot[] = [
    { id: 1, date: '2026-03-12', dayLabel: 'Today', startTime: '14:00', endTime: '16:00', price: 7.9 },
    { id: 2, date: '2026-03-12', dayLabel: 'Today', startTime: '18:00', endTime: '20:00', price: 5.9 },
  ];

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
        quantity: 1,
        subtotal: 59.99,
      },
    ],
    totalItems: 3,
    totalPrice: 119.97,
  };

  const emptyCart: Cart = {
    id: 2,
    sessionId: 'test-session',
    items: [],
    totalItems: 0,
    totalPrice: 0,
  };

  const mockOrder: OrderResponse = {
    id: 1,
    orderNumber: 'ORD-20260312-ABC123',
    status: 'CONFIRMED',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+41791234567',
    street: 'Bahnhofstrasse 1',
    city: 'Zurich',
    postalCode: '8001',
    deliverySlot: mockSlots[0],
    items: [
      { productName: 'Wireless Mouse', quantity: 2, unitPrice: 29.99, subtotal: 59.98 },
      { productName: 'Keyboard', quantity: 1, unitPrice: 59.99, subtotal: 59.99 },
    ],
    subtotal: 119.97,
    deliveryFee: 7.9,
    discount: 0,
    total: 127.87,
    createdAt: '2026-03-12T10:00:00Z',
  };

  function createMockCartService(cart: Cart | null = mockCart) {
    return {
      cart: signal<Cart | null>(cart),
      itemCount: signal(cart?.totalItems ?? 0),
      loadCart: vi.fn(),
      getCart: vi.fn().mockReturnValue(of(cart)),
      addItem: vi.fn().mockReturnValue(of({})),
      updateItem: vi.fn().mockReturnValue(of({})),
      removeItem: vi.fn().mockReturnValue(of(undefined)),
      clearCart: vi.fn().mockReturnValue(of({})),
      cartItemsByProductId: signal(new Map()),
    };
  }

  function createMockCheckoutService(order: OrderResponse = mockOrder) {
    return {
      placeOrder: vi.fn().mockReturnValue(of(order)),
      getOrder: vi.fn().mockReturnValue(of(order)),
      getDeliverySlots: vi.fn().mockReturnValue(of(mockSlots)),
      validateCoupon: vi.fn().mockReturnValue(of(null)),
    };
  }

  function setup(cart: Cart | null = mockCart, order: OrderResponse = mockOrder) {
    const mockCartService = createMockCartService(cart);
    const mockCheckoutService = createMockCheckoutService(order);

    TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        provideRouter([]),
        { provide: CartService, useValue: mockCartService },
        { provide: CheckoutService, useValue: mockCheckoutService },
      ],
    });

    const fixture = TestBed.createComponent(CheckoutComponent);
    fixture.detectChanges();
    return { fixture, mockCartService, mockCheckoutService };
  }

  // ── Rendering ───────────────────────────────────────────────────────

  it('should create the checkout component', () => {
    const { fixture } = setup();
    expect(fixture.componentInstance).toBeInstanceOf(CheckoutComponent);
  });

  it('should display checkout heading', () => {
    const { fixture } = setup();
    const heading = fixture.nativeElement.querySelector('h2');
    expect(heading).toBeInstanceOf(HTMLHeadingElement);
    expect(heading.textContent).toContain('Checkout');
  });

  it('should load cart on init', () => {
    const { mockCartService } = setup();
    expect(mockCartService.loadCart).toHaveBeenCalledTimes(1);
  });

  it('should load delivery slots on init', () => {
    const { mockCheckoutService } = setup();
    expect(mockCheckoutService.getDeliverySlots).toHaveBeenCalledTimes(1);
  });

  // ── Order Summary ──────────────────────────────────────────────────

  it('should display order summary with cart items', () => {
    const { fixture } = setup(mockCart);
    const summaryEl = fixture.nativeElement.querySelector('[data-testid="checkout-summary"]');
    expect(summaryEl).toBeTruthy();
    expect(summaryEl.textContent).toContain('Wireless Mouse');
    expect(summaryEl.textContent).toContain('Keyboard');
  });

  it('should display total price in order summary', () => {
    const { fixture } = setup(mockCart);
    const totalEl = fixture.nativeElement.querySelector('[data-testid="checkout-total"]');
    expect(totalEl).toBeTruthy();
    expect(totalEl.textContent).toContain('119.97');
  });

  // ── Form ──────────────────────────────────────────────────────

  it('should display delivery form with required fields', () => {
    const { fixture } = setup();
    const form = fixture.nativeElement.querySelector('form');
    expect(form).toBeTruthy();

    expect(fixture.nativeElement.querySelector('[data-testid="input-firstName"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="input-lastName"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="input-email"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="input-phone"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="input-street"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="input-city"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="input-postalCode"]')).toBeTruthy();
  });

  it('should have a place order button', () => {
    const { fixture } = setup();
    const btn = fixture.nativeElement.querySelector('[data-testid="place-order-btn"]');
    expect(btn).toBeTruthy();
    expect(btn.textContent).toContain('Place Order');
  });

  it('should disable place order button when form is invalid', () => {
    const { fixture } = setup();
    const btn = fixture.nativeElement.querySelector(
      '[data-testid="place-order-btn"]',
    ) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  // ── Form Submission ────────────────────────────────────────────────

  it('should call placeOrder with form data and delivery slot on submit', () => {
    const { fixture, mockCheckoutService } = setup();

    fixture.componentInstance.form.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+41791234567',
      street: 'Bahnhofstrasse 1',
      city: 'Zurich',
      postalCode: '8001',
    });
    fixture.componentInstance.selectedSlot.set(mockSlots[0]);
    fixture.detectChanges();

    fixture.componentInstance.onSubmit();

    expect(mockCheckoutService.placeOrder).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+41791234567',
      street: 'Bahnhofstrasse 1',
      city: 'Zurich',
      postalCode: '8001',
      deliverySlotId: 1,
    });
  });

  it('should navigate to confirmation page after successful order', () => {
    const { fixture } = setup();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.componentInstance.form.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+41791234567',
      street: 'Bahnhofstrasse 1',
      city: 'Zurich',
      postalCode: '8001',
    });
    fixture.componentInstance.selectedSlot.set(mockSlots[0]);
    fixture.componentInstance.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith(['/checkout/confirmation', 1]);
  });

  // ── Empty Cart ─────────────────────────────────────────────────────

  it('should show empty cart message when cart has no items', () => {
    const { fixture } = setup(emptyCart);
    const emptyState = fixture.nativeElement.querySelector('[data-testid="checkout-empty"]');
    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain('Your cart is empty');
  });

  it('should not show form when cart is empty', () => {
    const { fixture } = setup(emptyCart);
    const form = fixture.nativeElement.querySelector('form');
    expect(form).toBeFalsy();
  });

  // ── Error Handling ─────────────────────────────────────────────────

  it('should display error message when checkout fails', () => {
    const mockCartService = createMockCartService(mockCart);
    const mockCheckoutService = {
      placeOrder: vi.fn().mockReturnValue(throwError(() => ({ status: 500 }))),
      getOrder: vi.fn().mockReturnValue(of(mockOrder)),
      getDeliverySlots: vi.fn().mockReturnValue(of(mockSlots)),
      validateCoupon: vi.fn().mockReturnValue(of(null)),
    };

    TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        provideRouter([]),
        { provide: CartService, useValue: mockCartService },
        { provide: CheckoutService, useValue: mockCheckoutService },
      ],
    });

    const fixture = TestBed.createComponent(CheckoutComponent);
    fixture.detectChanges();

    fixture.componentInstance.form.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+41791234567',
      street: 'Bahnhofstrasse 1',
      city: 'Zurich',
      postalCode: '8001',
    });
    fixture.componentInstance.selectedSlot.set(mockSlots[0]);
    fixture.componentInstance.onSubmit();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('[data-testid="checkout-error"]');
    expect(errorEl).toBeTruthy();
  });
});
