import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  RegisterRequest,
  CustomerResponse,
  IdentifyRequest,
} from '../models/customer.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/customers`;

  register(request: RegisterRequest): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(`${this.baseUrl}/register`, request);
  }

  identify(request: IdentifyRequest): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(`${this.baseUrl}/identify`, request);
  }
}
