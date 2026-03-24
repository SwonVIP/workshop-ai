import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SuggestionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/products/suggestions`;

  getSuggestions(): Observable<Product[]> {
    const sessionId = localStorage.getItem('cart-session-id');
    if (!sessionId) {
      return new Observable<Product[]>((subscriber) => {
        subscriber.next([]);
        subscriber.complete();
      });
    }
    const params = new HttpParams().set('sessionId', sessionId);
    return this.http.get<Product[]>(this.baseUrl, { params });
  }
}
