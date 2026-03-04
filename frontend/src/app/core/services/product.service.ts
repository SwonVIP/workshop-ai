import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PaginatedResponse,
  Product,
  ProductFilter,
  Category,
} from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/products`;

  getProducts(
    filter: ProductFilter,
    page: number,
    size: number
  ): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filter.category) params = params.set('category', filter.category);
    if (filter.search) params = params.set('search', filter.search);
    if (filter.minPrice != null)
      params = params.set('minPrice', filter.minPrice.toString());
    if (filter.maxPrice != null)
      params = params.set('maxPrice', filter.maxPrice.toString());
    if (filter.sort)
      params = params.set(
        'sort',
        `${filter.sort},${filter.direction ?? 'asc'}`
      );

    return this.http.get<PaginatedResponse<Product>>(this.baseUrl, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }
}
