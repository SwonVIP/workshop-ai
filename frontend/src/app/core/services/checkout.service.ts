import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DeliverySlot,
  CouponResponse,
  CreateOrderRequest,
  OrderResponse,
} from '../models/checkout.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

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

  getDeliverySlots(): Observable<DeliverySlot[]> {
    return this.http.get<DeliverySlot[]>(`${this.baseUrl}/delivery-slots`);
  }

  validateCoupon(code: string): Observable<CouponResponse> {
    return this.http.post<CouponResponse>(`${this.baseUrl}/coupons/validate`, { code });
  }

  placeOrder(request: CreateOrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.baseUrl}/orders`, request, {
      headers: this.headers,
    });
  }

  getOrder(id: number): Observable<OrderResponse> {
    const params = new HttpParams().set('sessionId', this.getSessionId());
    return this.http.get<OrderResponse>(`${this.baseUrl}/orders/${id}`, {
      headers: this.headers,
      params,
    });
  }
}
