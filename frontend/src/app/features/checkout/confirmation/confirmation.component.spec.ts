import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ConfirmationComponent } from './confirmation.component';
import { CheckoutService } from '../../../core/services/checkout.service';
import { OrderResponse } from '../../../core/models/checkout.model';

const mockOrder: OrderResponse = {
  id: 1,
  orderNumber: 'ORD-20260306-0001',
  status: 'CONFIRMED',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+41791234567',
  street: 'Bahnhofstrasse 1',
  city: 'Zurich',
  postalCode: '8001',
  deliverySlot: {
    id: 1,
    date: '2026-03-07',
    dayLabel: 'Saturday',
    startTime: '10:00',
    endTime: '12:00',
    price: 5.9,
  },
  items: [
    { productName: 'Organic Milk', quantity: 2, unitPrice: 3.5, subtotal: 7.0 },
    { productName: 'Sourdough Bread', quantity: 1, unitPrice: 4.9, subtotal: 4.9 },
  ],
  subtotal: 11.9,
  deliveryFee: 5.9,
  discount: 0,
  total: 17.8,
  createdAt: '2026-03-06T14:30:00Z',
};

describe('ConfirmationComponent', () => {
  function createComponent() {
    const fixture = TestBed.createComponent(ConfirmationComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    const mockCheckoutService = {
      getOrder: () => of(mockOrder),
    };

    await TestBed.configureTestingModule({
      imports: [ConfirmationComponent],
      providers: [
        provideRouter([]),
        { provide: CheckoutService, useValue: mockCheckoutService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'orderId' ? '1' : null),
              },
            },
          },
        },
      ],
    }).compileComponents();
  });

  it('should render order details with mock data', () => {
    // given — the component is created and order loaded
    const fixture = createComponent();

    // then — order details are displayed
    const orderNumber = fixture.nativeElement.querySelector('[data-testid="order-number"]');
    expect(orderNumber).toBeInstanceOf(HTMLElement);
    expect(orderNumber.textContent).toContain('ORD-20260306-0001');

    const orderTotal = fixture.nativeElement.querySelector('[data-testid="order-total"]');
    expect(orderTotal).toBeInstanceOf(HTMLElement);
    expect(orderTotal.textContent).toContain('17.80');

    const continueBtn = fixture.nativeElement.querySelector('[data-testid="continue-shopping-btn"]');
    expect(continueBtn).toBeInstanceOf(HTMLElement);
    expect(continueBtn.textContent).toContain('Continue Shopping');
  });
});
