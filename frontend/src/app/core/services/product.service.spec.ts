import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProductService } from './product.service';
import {
  Product,
  Category,
  PaginatedResponse,
  ProductFilter,
} from '../models/product.model';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const mockCategory: Category = {
    id: 1,
    name: 'Electronics',
    description: 'Electronic devices',
  };

  const mockProduct: Product = {
    id: 42,
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse',
    price: 29.99,
    imageUrl: '/images/mouse.jpg',
    category: mockCategory,
  };

  const mockPage: PaginatedResponse<Product> = {
    content: [mockProduct],
    totalElements: 1,
    totalPages: 1,
    size: 12,
    number: 0,
    first: true,
    last: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getProducts', () => {
    it('should fetch paginated products with default page and size params', () => {
      // Given
      const filter: ProductFilter = {};
      const page = 0;
      const size = 12;

      // When
      service.getProducts(filter, page, size).subscribe((result) => {
        // Then
        expect(result).toEqual(mockPage);
      });

      const req = httpMock.expectOne(
        (r) => r.url === '/api/products'
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('12');
      req.flush(mockPage);
    });

    it('should include category filter in query params', () => {
      // Given
      const filter: ProductFilter = { category: 'Electronics' };
      const page = 0;
      const size = 12;

      // When
      service.getProducts(filter, page, size).subscribe();

      // Then
      const req = httpMock.expectOne(
        (r) => r.url === '/api/products'
      );
      expect(req.request.params.get('category')).toBe('Electronics');
      req.flush(mockPage);
    });

    it('should include search term in query params', () => {
      // Given
      const filter: ProductFilter = { search: 'mouse' };
      const page = 0;
      const size = 12;

      // When
      service.getProducts(filter, page, size).subscribe();

      // Then
      const req = httpMock.expectOne(
        (r) => r.url === '/api/products'
      );
      expect(req.request.params.get('search')).toBe('mouse');
      req.flush(mockPage);
    });

    it('should include minPrice and maxPrice in query params', () => {
      // Given
      const filter: ProductFilter = { minPrice: 10, maxPrice: 50 };
      const page = 0;
      const size = 12;

      // When
      service.getProducts(filter, page, size).subscribe();

      // Then
      const req = httpMock.expectOne(
        (r) => r.url === '/api/products'
      );
      expect(req.request.params.get('minPrice')).toBe('10');
      expect(req.request.params.get('maxPrice')).toBe('50');
      req.flush(mockPage);
    });

    it('should include sort param in Spring format (sort=field,direction)', () => {
      // Given
      const filter: ProductFilter = { sort: 'price', direction: 'desc' };
      const page = 0;
      const size = 12;

      // When
      service.getProducts(filter, page, size).subscribe();

      // Then
      const req = httpMock.expectOne(
        (r) => r.url === '/api/products'
      );
      expect(req.request.params.get('sort')).toBe('price,desc');
      req.flush(mockPage);
    });

    it('should default sort direction to asc when only sort field is provided', () => {
      // Given
      const filter: ProductFilter = { sort: 'name' };
      const page = 0;
      const size = 12;

      // When
      service.getProducts(filter, page, size).subscribe();

      // Then
      const req = httpMock.expectOne(
        (r) => r.url === '/api/products'
      );
      expect(req.request.params.get('sort')).toBe('name,asc');
      req.flush(mockPage);
    });

    it('should exclude undefined and empty filter values from query params', () => {
      // Given
      const filter: ProductFilter = {
        category: '',
        search: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        sort: undefined,
      };
      const page = 1;
      const size = 24;

      // When
      service.getProducts(filter, page, size).subscribe();

      // Then
      const req = httpMock.expectOne(
        (r) => r.url === '/api/products'
      );
      expect(req.request.params.get('category')).toBeNull();
      expect(req.request.params.get('search')).toBeNull();
      expect(req.request.params.get('minPrice')).toBeNull();
      expect(req.request.params.get('maxPrice')).toBeNull();
      expect(req.request.params.get('sort')).toBeNull();
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('size')).toBe('24');
      req.flush(mockPage);
    });

    it('should include minPrice when value is 0', () => {
      // Given
      const filter: ProductFilter = { minPrice: 0 };
      const page = 0;
      const size = 12;

      // When
      service.getProducts(filter, page, size).subscribe();

      // Then
      const req = httpMock.expectOne(
        (r) => r.url === '/api/products'
      );
      expect(req.request.params.get('minPrice')).toBe('0');
      req.flush(mockPage);
    });

    it('should include maxPrice param when value is zero', () => {
      // given — a filter with maxPrice set to 0
      const filter: ProductFilter = { maxPrice: 0 };

      // when — requesting products
      service.getProducts(filter, 0, 12).subscribe();

      // then — maxPrice=0 is included in query params
      const req = httpMock.expectOne(r => r.url === '/api/products' && r.params.get('maxPrice') === '0');
      expect(req.request.method).toBe('GET');
      req.flush(mockPage);
    });

    it('should include all filter params when all filters are provided', () => {
      // given — a filter with all fields set
      const filter: ProductFilter = { category: 'Electronics', search: 'headphones', minPrice: 50, maxPrice: 200, sort: 'price', direction: 'desc' };

      // when — requesting products
      service.getProducts(filter, 1, 24).subscribe();

      // then — all params are present
      const req = httpMock.expectOne(r =>
        r.url === '/api/products'
        && r.params.get('category') === 'Electronics'
        && r.params.get('search') === 'headphones'
        && r.params.get('minPrice') === '50'
        && r.params.get('maxPrice') === '200'
        && r.params.get('sort') === 'price,desc'
        && r.params.get('page') === '1'
        && r.params.get('size') === '24');
      expect(req.request.method).toBe('GET');
      req.flush(mockPage);
    });

    it('should not include sort param when direction is provided without sort field', () => {
      // given — a filter with direction but no sort
      const filter: ProductFilter = { direction: 'desc' };

      // when — requesting products
      service.getProducts(filter, 0, 12).subscribe();

      // then — sort param is NOT included
      const req = httpMock.expectOne(r => r.url === '/api/products' && !r.params.has('sort'));
      expect(req.request.method).toBe('GET');
      req.flush(mockPage);
    });
  });

  describe('getCategories', () => {
    it('should fetch all categories', () => {
      // Given
      const mockCategories: Category[] = [
        mockCategory,
        { id: 2, name: 'Books', description: 'Physical and digital books' },
      ];

      // When
      service.getCategories().subscribe((result) => {
        // Then
        expect(result).toEqual(mockCategories);
        expect(result.length).toBe(2);
      });

      const req = httpMock.expectOne('/api/products/categories');
      expect(req.request.method).toBe('GET');
      req.flush(mockCategories);
    });
  });

  // ── Error handling ────────────────────────────────────────────────

  describe('error handling', () => {
    it('should propagate HTTP 500 error to subscriber on getProducts', () => {
      // given — the API will return a server error
      let error: any;
      service.getProducts({}, 0, 12).subscribe({ error: (e) => (error = e) });

      // when — the request fails with 500
      httpMock
        .expectOne(r => r.url === '/api/products')
        .flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      // then — the error propagates to the subscriber with status and statusText
      expect(error).toBeDefined();
      expect(error.status).toBe(500);
      expect(error.statusText).toBe('Internal Server Error');
    });

    it('should propagate HTTP 500 error to subscriber on getCategories', () => {
      // given — the API will return a server error
      let error: any;
      service.getCategories().subscribe({ error: (e) => (error = e) });

      // when — the request fails with 500
      httpMock
        .expectOne('/api/products/categories')
        .flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      // then — the error propagates to the subscriber with status and statusText
      expect(error).toBeDefined();
      expect(error.status).toBe(500);
      expect(error.statusText).toBe('Internal Server Error');
    });

    it('should propagate network error (status 0) to subscriber on getProducts', () => {
      // given — a network failure
      let error: any;
      service.getProducts({}, 0, 12).subscribe({ error: (e) => (error = e) });

      // when — the request fails with a network error
      httpMock
        .expectOne(r => r.url === '/api/products')
        .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

      // then — the error propagates to the subscriber with status 0
      expect(error).toBeDefined();
      expect(error.status).toBe(0);
      expect(error.statusText).toBe('Unknown Error');
    });
  });
});
