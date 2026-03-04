import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductPage, ProductFilter, Category } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/products`;

  getProducts(filter: ProductFilter = {}): Observable<ProductPage> {
    let params = new HttpParams();
    if (filter.category) params = params.set('category', filter.category);
    if (filter.search) params = params.set('search', filter.search);
    if (filter.minPrice != null) params = params.set('minPrice', filter.minPrice.toString());
    if (filter.maxPrice != null) params = params.set('maxPrice', filter.maxPrice.toString());
    if (filter.sort) params = params.set('sort', filter.sort);
    if (filter.direction) params = params.set('direction', filter.direction);
    params = params.set('page', (filter.page ?? 0).toString());
    params = params.set('size', (filter.size ?? 12).toString());
    return this.http.get<ProductPage>(this.baseUrl, { params });
  }

  getProduct(id: number): Observable<ProductPage['content'][0]> {
    return this.http.get<ProductPage['content'][0]>(`${this.baseUrl}/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }
}
