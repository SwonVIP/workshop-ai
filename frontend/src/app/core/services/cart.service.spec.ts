import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CartService } from './cart.service';
import { Cart, AddToCartRequest, UpdateCartItemRequest } from '../models/cart.model';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;

  const mockCart: Cart = {
    id: 1,
    sessionId: 'test-session-uuid',
    items: [
      {
        id: 10,
        product: { id: 42, name: 'Wireless Mouse', price: 29.99, imageUrl: '/images/mouse.jpg' },
        quantity: 2,
        subtotal: 59.98,
      },
    ],
    totalItems: 2,
    totalPrice: 59.98,
  };

  const emptyCart: Cart = {
    id: 2,
    sessionId: 'test-session-uuid',
    items: [],
    totalItems: 0,
    totalPrice: 0,
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ── Session management ────────────────────────────────────────────

  describe('session management', () => {
    it('should generate and store UUID in localStorage when no session exists', () => {
      // given — localStorage has no cart-session-id
      expect(localStorage.getItem('cart-session-id')).toBeNull();

      // when — a request is made (triggers getSessionId)
      service.getCart().subscribe();

      // then — a UUID was stored in localStorage
      const stored = localStorage.getItem('cart-session-id');
      expect(stored).toBeTruthy();
      expect(stored!.length).toBeGreaterThan(0);

      httpMock.expectOne(req => req.url === '/api/cart').flush(mockCart);
    });

    it('should reuse existing session UUID from localStorage', () => {
      // given — a pre-existing session id
      const existingId = 'pre-existing-uuid-1234';
      localStorage.setItem('cart-session-id', existingId);

      // when — a request is made
      service.getCart().subscribe();

      // then — the header carries the pre-existing id
      const req = httpMock.expectOne(r => r.url === '/api/cart');
      expect(req.request.headers.get('X-Cart-Session')).toBe(existingId);
      req.flush(mockCart);

      // and localStorage still holds the same id
      expect(localStorage.getItem('cart-session-id')).toBe(existingId);
    });
  });

  // ── HTTP requests + headers ───────────────────────────────────────

  describe('HTTP requests and headers', () => {
    it('should send GET /api/cart with X-Cart-Session header', () => {
      // given — the service is ready
      service.getCart().subscribe();

      // when — we inspect the outgoing request
      const req = httpMock.expectOne(r => r.url === '/api/cart');

      // then — method is GET and session header is present
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.has('X-Cart-Session')).toBe(true);
      req.flush(mockCart);
    });

    it('should send POST /api/cart/items with body and X-Cart-Session header', () => {
      // given — an add-to-cart request
      const body: AddToCartRequest = { productId: 42, quantity: 1 };

      // when — addItem is called
      service.addItem(body).subscribe();

      // then — POST to /api/cart/items with correct body and header
      const req = httpMock.expectOne(r => r.url === '/api/cart/items');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      expect(req.request.headers.has('X-Cart-Session')).toBe(true);
      req.flush(mockCart);
    });

    it('should send PUT /api/cart/items/{id} with body and X-Cart-Session header', () => {
      // given — an update request
      const body: UpdateCartItemRequest = { quantity: 5 };
      const itemId = 10;

      // when — updateItem is called
      service.updateItem(itemId, body).subscribe();

      // then — PUT to /api/cart/items/10 with correct body and header
      const req = httpMock.expectOne(r => r.url === '/api/cart/items/10');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      expect(req.request.headers.has('X-Cart-Session')).toBe(true);
      req.flush(mockCart);
    });

    it('should send DELETE /api/cart/items/{id} with X-Cart-Session header', () => {
      // given — an item id to remove
      const itemId = 10;

      // when — removeItem is called
      service.removeItem(itemId).subscribe();

      // then — DELETE to /api/cart/items/10 with header
      const req = httpMock.expectOne(r => r.url === '/api/cart/items/10');
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.has('X-Cart-Session')).toBe(true);
      req.flush(null);
    });
  });

  // ── Signal state management ───────────────────────────────────────

  describe('signal state management', () => {
    it('should update cart signal after getCart success', () => {
      // given — cart signal is initially null
      expect(service.cart()).toBeNull();

      // when — getCart succeeds
      service.getCart().subscribe();
      httpMock.expectOne(r => r.url === '/api/cart').flush(mockCart);

      // then — cart signal holds the returned cart
      expect(service.cart()).toEqual(mockCart);
    });

    it('should update cart signal after addItem success', () => {
      // given — cart signal is initially null
      expect(service.cart()).toBeNull();

      // when — addItem succeeds
      service.addItem({ productId: 42, quantity: 1 }).subscribe();
      httpMock.expectOne(r => r.url === '/api/cart/items').flush(mockCart);

      // then — cart signal holds the returned cart
      expect(service.cart()).toEqual(mockCart);
    });

    it('should update cart signal after updateItem success', () => {
      // given — cart signal is initially null
      expect(service.cart()).toBeNull();

      // when — updateItem succeeds
      service.updateItem(10, { quantity: 3 }).subscribe();
      httpMock.expectOne(r => r.url === '/api/cart/items/10').flush(mockCart);

      // then — cart signal holds the returned cart
      expect(service.cart()).toEqual(mockCart);
    });

    it('should NOT update cart signal after removeItem (DELETE returns void)', () => {
      // given — cart signal starts null
      expect(service.cart()).toBeNull();

      // when — removeItem succeeds (no tap on response)
      service.removeItem(10).subscribe();
      httpMock.expectOne(r => r.url === '/api/cart/items/10').flush(null);

      // then — cart signal is still null (removeItem has no tap)
      expect(service.cart()).toBeNull();
    });

    it('should return itemCount 0 when cart signal is null', () => {
      // given — no cart loaded

      // when — reading itemCount

      // then — itemCount is 0
      expect(service.itemCount()).toBe(0);
    });

    it('should compute itemCount from cart totalItems', () => {
      // given — a cart is loaded with totalItems = 2
      service.getCart().subscribe();
      httpMock.expectOne(r => r.url === '/api/cart').flush(mockCart);

      // when — reading itemCount

      // then — itemCount equals totalItems from the cart
      expect(service.itemCount()).toBe(2);
    });
  });

  // ── Error handling ────────────────────────────────────────────────

  describe('error handling', () => {
    it('should propagate HTTP 500 error on getCart to subscriber', () => {
      // given — the API will return a server error
      let error: any;
      service.getCart().subscribe({ error: (e) => (error = e) });

      // when — the request fails with 500
      httpMock
        .expectOne(r => r.url === '/api/cart')
        .flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      // then — the error propagates to the subscriber
      expect(error).toBeTruthy();
      expect(error.status).toBe(500);
    });

    it('should propagate HTTP 500 error on addItem to subscriber', () => {
      // given — the API will return a server error
      let error: any;
      service.addItem({ productId: 1, quantity: 1 }).subscribe({ error: (e) => (error = e) });

      // when — the request fails with 500
      httpMock
        .expectOne(r => r.url === '/api/cart/items')
        .flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      // then — the error propagates to the subscriber
      expect(error).toBeTruthy();
      expect(error.status).toBe(500);
    });

    it('should propagate HTTP 404 error on removeItem to subscriber', () => {
      // given — the item does not exist
      let error: any;
      service.removeItem(999).subscribe({ error: (e) => (error = e) });

      // when — the request fails with 404
      httpMock
        .expectOne(r => r.url === '/api/cart/items/999')
        .flush('Not Found', { status: 404, statusText: 'Not Found' });

      // then — the error propagates to the subscriber
      expect(error).toBeTruthy();
      expect(error.status).toBe(404);
    });

    it('should propagate network error (status 0) on getCart to subscriber', () => {
      // given — a network failure
      let error: any;
      service.getCart().subscribe({ error: (e) => (error = e) });

      // when — the request fails with a network error
      httpMock
        .expectOne(r => r.url === '/api/cart')
        .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

      // then — the error propagates to the subscriber
      expect(error).toBeTruthy();
      expect(error.status).toBe(0);
    });
  });
});
