import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
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

      // then — a UUID was stored in localStorage matching UUID v4 format
      const stored = localStorage.getItem('cart-session-id');
      expect(stored).toBeDefined();
      expect(stored).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

      httpMock.expectOne((req) => req.url === '/api/cart').flush(mockCart);
    });

    it('should reuse existing session UUID from localStorage', () => {
      // given — a pre-existing session id
      const existingId = 'pre-existing-uuid-1234';
      localStorage.setItem('cart-session-id', existingId);

      // when — a request is made
      service.getCart().subscribe();

      // then — the header carries the pre-existing id
      const req = httpMock.expectOne((r) => r.url === '/api/cart');
      expect(req.request.headers.get('X-CartEntity-Session')).toBe(existingId);
      req.flush(mockCart);

      // and localStorage still holds the same id
      expect(localStorage.getItem('cart-session-id')).toBe(existingId);
    });
  });

  // ── HTTP requests + headers ───────────────────────────────────────

  describe('HTTP requests and headers', () => {
    it('should send GET /api/cart with X-CartEntity-Session header', () => {
      // given — the service is ready
      service.getCart().subscribe();

      // when — we inspect the outgoing request
      const req = httpMock.expectOne((r) => r.url === '/api/cart');

      // then — method is GET and session header is present
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.has('X-CartEntity-Session')).toBe(true);
      req.flush(mockCart);
    });

    it('should send POST /api/cart/items with body and X-CartEntity-Session header', () => {
      // given — an add-to-cart request
      const body: AddToCartRequest = { productId: 42, quantity: 1 };

      // when — addItem is called
      service.addItem(body).subscribe();

      // then — POST to /api/cart/items with correct body and header
      const req = httpMock.expectOne((r) => r.url === '/api/cart/items');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      expect(req.request.headers.has('X-CartEntity-Session')).toBe(true);
      req.flush(mockCart);
    });

    it('should send PUT /api/cart/items/{id} with body and X-CartEntity-Session header', () => {
      // given — an update request
      const body: UpdateCartItemRequest = { quantity: 5 };
      const itemId = 10;

      // when — updateItem is called
      service.updateItem(itemId, body).subscribe();

      // then — PUT to /api/cart/items/10 with correct body and header
      const req = httpMock.expectOne((r) => r.url === '/api/cart/items/10');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      expect(req.request.headers.has('X-CartEntity-Session')).toBe(true);
      req.flush(mockCart);
    });

    it('should send DELETE /api/cart/items/{id} with X-CartEntity-Session header', () => {
      // given — an item id to remove
      const itemId = 10;

      // when — removeItem is called
      service.removeItem(itemId).subscribe();

      // then — DELETE to /api/cart/items/10 with header
      const req = httpMock.expectOne((r) => r.url === '/api/cart/items/10');
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.has('X-CartEntity-Session')).toBe(true);
      req.flush(null);

      // and — a follow-up GET /api/cart is issued to refresh
      httpMock.expectOne((r) => r.url === '/api/cart').flush(emptyCart);
    });
  });

  // ── Signal state management ───────────────────────────────────────

  describe('signal state management', () => {
    it('should update cart signal after getCart success', () => {
      // given — cart signal is initially null
      expect(service.cart()).toBeNull();

      // when — getCart succeeds
      service.getCart().subscribe();
      httpMock.expectOne((r) => r.url === '/api/cart').flush(mockCart);

      // then — cart signal holds the returned cart
      expect(service.cart()).toEqual(mockCart);
    });

    it('should update cart signal after addItem success', () => {
      // given — cart signal is initially null
      expect(service.cart()).toBeNull();

      // when — addItem succeeds
      service.addItem({ productId: 42, quantity: 1 }).subscribe();
      httpMock.expectOne((r) => r.url === '/api/cart/items').flush(mockCart);

      // then — cart signal holds the returned cart
      expect(service.cart()).toEqual(mockCart);
    });

    it('should update cart signal after updateItem success', () => {
      // given — cart signal is initially null
      expect(service.cart()).toBeNull();

      // when — updateItem succeeds
      service.updateItem(10, { quantity: 3 }).subscribe();
      httpMock.expectOne((r) => r.url === '/api/cart/items/10').flush(mockCart);

      // then — cart signal holds the returned cart
      expect(service.cart()).toEqual(mockCart);
    });

    it('should refresh cart signal after removeItem completes', () => {
      // given — cart signal starts null
      expect(service.cart()).toBeNull();

      // when — removeItem succeeds and triggers getCart refresh
      service.removeItem(10).subscribe();
      httpMock.expectOne((r) => r.url === '/api/cart/items/10').flush(null);

      // then — a GET /api/cart is issued to refresh
      const getReq = httpMock.expectOne((r) => r.url === '/api/cart');
      expect(getReq.request.method).toBe('GET');
      getReq.flush(emptyCart);

      // and — cart signal is updated with the refreshed cart
      expect(service.cart()).toEqual(emptyCart);
    });

    it('should load cart on loadCart call', () => {
      // given — cart signal starts null
      expect(service.cart()).toBeNull();

      // when — loadCart is called
      service.loadCart();

      // then — a GET /api/cart is issued
      const req = httpMock.expectOne((r) => r.url === '/api/cart');
      expect(req.request.method).toBe('GET');
      req.flush(mockCart);

      // and — cart signal holds the returned cart
      expect(service.cart()).toEqual(mockCart);
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
      httpMock.expectOne((r) => r.url === '/api/cart').flush(mockCart);

      // when — reading itemCount

      // then — itemCount equals totalItems from the cart
      expect(service.itemCount()).toBe(2);
    });
  });

  // ── clearCart ──────────────────────────────────────────────────────

  describe('clearCart', () => {
    it('should send DELETE /api/cart with X-CartEntity-Session header on clearCart', () => {
      // given — the service is ready
      service.clearCart().subscribe();

      // when — we inspect the outgoing request
      const req = httpMock.expectOne((r) => r.url === '/api/cart');

      // then — method is DELETE and session header is present
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.has('X-CartEntity-Session')).toBe(true);
      req.flush(emptyCart);
    });

    it('should update cart signal after clearCart success', () => {
      // given — cart signal is initially null
      expect(service.cart()).toBeNull();

      // when — clearCart succeeds
      service.clearCart().subscribe();
      httpMock.expectOne((r) => r.url === '/api/cart').flush(emptyCart);

      // then — cart signal holds the returned empty cart
      expect(service.cart()).toEqual(emptyCart);
    });
  });

  // ── cartItemsByProductId ──────────────────────────────────────────

  describe('cartItemsByProductId', () => {
    it('should build cartItemsByProductId map from cart items', () => {
      // given — a cart is loaded with items
      service.getCart().subscribe();
      httpMock.expectOne((r) => r.url === '/api/cart').flush(mockCart);

      // when — reading cartItemsByProductId
      const map = service.cartItemsByProductId();

      // then — map contains entry for product 42 with cartItemId 10 and quantity 2
      expect(map.size).toBe(1);
      expect(map.get(42)).toEqual({ cartItemId: 10, quantity: 2 });
    });

    it('should return empty map when cart is null', () => {
      // given — no cart loaded

      // when — reading cartItemsByProductId
      const map = service.cartItemsByProductId();

      // then — map is empty
      expect(map.size).toBe(0);
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
        .expectOne((r) => r.url === '/api/cart')
        .flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      // then — the error propagates to the subscriber with status and statusText
      expect(error).toBeDefined();
      expect(error.status).toBe(500);
      expect(error.statusText).toBe('Internal Server Error');
    });

    it('should propagate HTTP 500 error on addItem to subscriber', () => {
      // given — the API will return a server error
      let error: any;
      service.addItem({ productId: 1, quantity: 1 }).subscribe({ error: (e) => (error = e) });

      // when — the request fails with 500
      httpMock
        .expectOne((r) => r.url === '/api/cart/items')
        .flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      // then — the error propagates to the subscriber with status and statusText
      expect(error).toBeDefined();
      expect(error.status).toBe(500);
      expect(error.statusText).toBe('Internal Server Error');
    });

    it('should propagate HTTP 404 error on removeItem to subscriber', () => {
      // given — the item does not exist
      let error: any;
      service.removeItem(999).subscribe({ error: (e) => (error = e) });

      // when — the request fails with 404
      httpMock
        .expectOne((r) => r.url === '/api/cart/items/999')
        .flush('Not Found', { status: 404, statusText: 'Not Found' });

      // then — the error propagates to the subscriber with status and statusText
      expect(error).toBeDefined();
      expect(error.status).toBe(404);
      expect(error.statusText).toBe('Not Found');
    });

    it('should propagate network error (status 0) on getCart to subscriber', () => {
      // given — a network failure
      let error: any;
      service.getCart().subscribe({ error: (e) => (error = e) });

      // when — the request fails with a network error
      httpMock
        .expectOne((r) => r.url === '/api/cart')
        .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

      // then — the error propagates to the subscriber with status 0
      expect(error).toBeDefined();
      expect(error.status).toBe(0);
      expect(error.statusText).toBe('Unknown Error');
    });
  });
});
