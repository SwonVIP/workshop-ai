import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, switchMap } from 'rxjs';
import { Cart, AddToCartRequest, UpdateCartItemRequest } from '../models/cart.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/cart`;

  private readonly _cart = signal<Cart | null>(null);
  readonly cart = this._cart.asReadonly();
  readonly itemCount = computed(() => this._cart()?.totalItems ?? 0);

  private getSessionId(): string {
    let sessionId = localStorage.getItem('cart-session-id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('cart-session-id', sessionId);
    }
    return sessionId;
  }

  private get headers(): HttpHeaders {
    return new HttpHeaders({ 'X-CartEntity-Session': this.getSessionId() });
  }

  getCart(): Observable<Cart> {
    return this.http
      .get<Cart>(this.baseUrl, { headers: this.headers })
      .pipe(tap((cart) => this._cart.set(cart)));
  }

  addItem(request: AddToCartRequest): Observable<Cart> {
    return this.http
      .post<Cart>(`${this.baseUrl}/items`, request, { headers: this.headers })
      .pipe(tap((cart) => this._cart.set(cart)));
  }

  updateItem(itemId: number, request: UpdateCartItemRequest): Observable<Cart> {
    return this.http
      .put<Cart>(`${this.baseUrl}/items/${itemId}`, request, { headers: this.headers })
      .pipe(tap((cart) => this._cart.set(cart)));
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http
      .delete<void>(`${this.baseUrl}/items/${itemId}`, { headers: this.headers })
      .pipe(switchMap(() => this.getCart()));
  }

  clearCart(): Observable<Cart> {
    return this.http
      .delete<Cart>(this.baseUrl, { headers: this.headers })
      .pipe(tap((cart) => this._cart.set(cart)));
  }

  readonly cartItemsByProductId = computed(() => {
    const cart = this._cart();
    if (!cart) return new Map<number, { cartItemId: number; quantity: number }>();
    return new Map(
      cart.items.map((item) => [item.product.id, { cartItemId: item.id, quantity: item.quantity }]),
    );
  });

  loadCart(): void {
    this.getCart().subscribe();
  }
}
