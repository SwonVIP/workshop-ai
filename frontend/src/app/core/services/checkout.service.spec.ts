import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CheckoutService } from './checkout.service';
import {
  DeliverySlot,
  CouponResponse,
  CreateOrderRequest,
  OrderResponse,
} from '../models/checkout.model';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let httpMock: HttpTestingController;

  const mockSlots: DeliverySlot[] = [
    { id: 1, date: '2026-03-06', dayLabel: 'Today', startTime: '14:00', endTime: '16:00', price: 7.9 },
    { id: 2, date: '2026-03-06', dayLabel: 'Today', startTime: '18:00', endTime: '20:00', price: 5.9 },
  ];

  const mockCoupon: CouponResponse = {
    code: 'SAVE10',
    type: 'PERCENTAGE',
    value: 10,
    description: '10% off your order',
  };

  const mockOrderResponse: OrderResponse = {
    id: 42,
    orderNumber: 'ORD-001',
    status: 'CONFIRMED',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+41791234567',
    street: 'Main St 1',
    city: 'Zurich',
    postalCode: '8001',
    deliverySlot: mockSlots[0],
    items: [{ productName: 'Mouse', quantity: 2, unitPrice: 29.99, subtotal: 59.98 }],
    subtotal: 59.98,
    deliveryFee: 7.9,
    discount: 0,
    total: 67.88,
    createdAt: '2026-03-06T12:00:00Z',
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CheckoutService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ── getDeliverySlots ────────────────────────────────────────────

  describe('getDeliverySlots', () => {
    it('should send GET /api/delivery-slots', () => {
      // given — the service is ready
      service.getDeliverySlots().subscribe();

      // when — we inspect the outgoing request
      const req = httpMock.expectOne((r) => r.url === '/api/delivery-slots');

      // then — method is GET
      expect(req.request.method).toBe('GET');
      req.flush(mockSlots);
    });

    it('should return delivery slots on success', () => {
      // given — the service is ready
      let result: DeliverySlot[] = [];
      service.getDeliverySlots().subscribe((slots) => (result = slots));

      // when — the request succeeds
      httpMock.expectOne((r) => r.url === '/api/delivery-slots').flush(mockSlots);

      // then — the returned slots match
      expect(result).toEqual(mockSlots);
    });
  });

  // ── validateCoupon ──────────────────────────────────────────────

  describe('validateCoupon', () => {
    it('should send POST /api/coupons/validate with code in body', () => {
      // given — a coupon code
      service.validateCoupon('SAVE10').subscribe();

      // when — we inspect the outgoing request
      const req = httpMock.expectOne((r) => r.url === '/api/coupons/validate');

      // then — method is POST with correct body
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ code: 'SAVE10' });
      req.flush(mockCoupon);
    });

    it('should return coupon response on success', () => {
      // given — the service is ready
      let result: CouponResponse | undefined;
      service.validateCoupon('SAVE10').subscribe((c) => (result = c));

      // when — the request succeeds
      httpMock.expectOne((r) => r.url === '/api/coupons/validate').flush(mockCoupon);

      // then — the returned coupon matches
      expect(result).toEqual(mockCoupon);
    });
  });

  // ── placeOrder ──────────────────────────────────────────────────

  describe('placeOrder', () => {
    const orderRequest: CreateOrderRequest = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+41791234567',
      street: 'Main St 1',
      city: 'Zurich',
      postalCode: '8001',
      deliverySlotId: 1,
    };

    it('should send POST /api/orders with body and X-CartEntity-Session header', () => {
      // given — an order request
      service.placeOrder(orderRequest).subscribe();

      // when — we inspect the outgoing request
      const req = httpMock.expectOne((r) => r.url === '/api/orders');

      // then — method is POST with correct body and header
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(orderRequest);
      expect(req.request.headers.has('X-CartEntity-Session')).toBe(true);
      req.flush(mockOrderResponse);
    });

    it('should return order response on success', () => {
      // given — the service is ready
      let result: OrderResponse | undefined;
      service.placeOrder(orderRequest).subscribe((o) => (result = o));

      // when — the request succeeds
      httpMock.expectOne((r) => r.url === '/api/orders').flush(mockOrderResponse);

      // then — the returned order matches
      expect(result).toEqual(mockOrderResponse);
    });
  });

  // ── getOrder ────────────────────────────────────────────────────

  describe('getOrder', () => {
    it('should send GET /api/orders/{id} with sessionId param and X-CartEntity-Session header', () => {
      // given — an order id
      service.getOrder(42).subscribe();

      // when — we inspect the outgoing request
      const req = httpMock.expectOne((r) => r.url.startsWith('/api/orders/42'));

      // then — method is GET with correct header and query param
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.has('X-CartEntity-Session')).toBe(true);
      expect(req.request.params.has('sessionId')).toBe(true);
      req.flush(mockOrderResponse);
    });

    it('should return order response on success', () => {
      // given — the service is ready
      let result: OrderResponse | undefined;
      service.getOrder(42).subscribe((o) => (result = o));

      // when — the request succeeds
      httpMock.expectOne((r) => r.url.startsWith('/api/orders/42')).flush(mockOrderResponse);

      // then — the returned order matches
      expect(result).toEqual(mockOrderResponse);
    });
  });

  // ── Error handling ──────────────────────────────────────────────

  describe('error handling', () => {
    it('should propagate HTTP 500 error on placeOrder to subscriber', () => {
      // given — the API will return a server error
      let error: any;
      service.placeOrder({
        firstName: 'A', lastName: 'B', email: 'a@b.com', phone: '123',
        street: 'St', city: 'City', postalCode: '1234', deliverySlotId: 1,
      }).subscribe({ error: (e) => (error = e) });

      // when — the request fails with 500
      httpMock
        .expectOne((r) => r.url === '/api/orders')
        .flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      // then — the error propagates to the subscriber
      expect(error).toBeDefined();
      expect(error.status).toBe(500);
    });

    it('should propagate HTTP 400 error on validateCoupon to subscriber', () => {
      // given — the API will return a bad request error
      let error: any;
      service.validateCoupon('INVALID').subscribe({ error: (e) => (error = e) });

      // when — the request fails with 400
      httpMock
        .expectOne((r) => r.url === '/api/coupons/validate')
        .flush('Bad Request', { status: 400, statusText: 'Bad Request' });

      // then — the error propagates to the subscriber
      expect(error).toBeDefined();
      expect(error.status).toBe(400);
    });
  });
});
