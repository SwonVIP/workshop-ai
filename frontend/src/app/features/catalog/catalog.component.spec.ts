import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CatalogComponent } from './catalog.component';
import { SearchFilterBarComponent } from './search-filter-bar/search-filter-bar.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { PaginatedResponse, Product, Category } from '../../core/models/product.model';

describe('CatalogComponent', () => {
  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Headphones',
      description: 'Great sound',
      price: 89.99,
      imageUrl: 'https://placehold.co/400x300',
      category: { id: 1, name: 'Electronics', description: '' },
    },
    {
      id: 2,
      name: 'Running Shoes',
      description: 'Fast shoes',
      price: 129.99,
      imageUrl: 'https://placehold.co/400x300',
      category: { id: 2, name: 'Sports', description: '' },
    },
  ];

  const mockResponse: PaginatedResponse<Product> = {
    content: mockProducts,
    totalElements: 2,
    totalPages: 1,
    size: 12,
    number: 0,
    first: true,
    last: true,
  };

  const mockCategories: Category[] = [
    { id: 1, name: 'Electronics', description: '' },
    { id: 2, name: 'Sports', description: '' },
  ];

  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  /** Check if a URL contains the expected query param */
  function urlContains(url: string, param: string): boolean {
    return url.includes(param);
  }

  /**
   * Flush initial products + categories requests, then stabilize.
   */
  async function flushInitialRequests(
    fixture: ReturnType<typeof TestBed.createComponent<CatalogComponent>>,
    productsData: PaginatedResponse<Product> = mockResponse,
    categoriesData: Category[] = mockCategories
  ) {
    const catReq = httpMock.expectOne('/api/products/categories');
    catReq.flush(categoriesData);

    const prodReq = httpMock.expectOne(
      (req) => req.urlWithParams.includes('/api/products?')
    );
    prodReq.flush(productsData);

    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('should display the catalog page title', async () => {
    // given — the catalog component is rendered
    const fixture = TestBed.createComponent(CatalogComponent);
    fixture.detectChanges();
    await flushInitialRequests(fixture);

    // then — the page title is visible
    expect(fixture.nativeElement.textContent).toContain('Product Catalog');
  });

  it('should render product cards when products are loaded', async () => {
    // given — 2 products are returned by the API
    const fixture = TestBed.createComponent(CatalogComponent);
    fixture.detectChanges();
    await flushInitialRequests(fixture);

    // then — 2 product cards are rendered
    const cards = fixture.nativeElement.querySelectorAll('[data-testid="product-card"]');
    expect(cards.length).toBe(2);
  });

  it('should display product count showing current page range', async () => {
    // given — 2 products on page 1 of 1
    const fixture = TestBed.createComponent(CatalogComponent);
    fixture.detectChanges();
    await flushInitialRequests(fixture);

    // then — the count label is displayed with correct range via data-testid
    const countEl = fixture.nativeElement.querySelector('[data-testid="product-count"]');
    expect(countEl).toBeTruthy();
    expect(countEl.textContent).toContain('Showing');
    expect(countEl.textContent).toContain('1-2');
    expect(countEl.textContent).toContain('of 2');
  });

  it('should fetch products via httpResource on initialization', async () => {
    // given — the component is created
    const fixture = TestBed.createComponent(CatalogComponent);
    fixture.detectChanges();

    // then — categories request is made
    httpMock.expectOne('/api/products/categories').flush(mockCategories);

    // and — products request with page=0 and size=12
    const prodReq = httpMock.expectOne(
      (req) => req.urlWithParams.includes('/api/products?') &&
               urlContains(req.urlWithParams, 'page=0') &&
               urlContains(req.urlWithParams, 'size=12')
    );
    expect(prodReq).toBeTruthy();
    prodReq.flush(mockResponse);
    await fixture.whenStable();
  });

  it('should fetch categories via httpResource on initialization', async () => {
    // given — the component is created
    const fixture = TestBed.createComponent(CatalogComponent);
    fixture.detectChanges();

    // then — categories request is made
    const catReq = httpMock.expectOne('/api/products/categories');
    expect(catReq).toBeTruthy();
    catReq.flush(mockCategories);

    // cleanup
    httpMock.expectOne(
      (req) => req.urlWithParams.includes('/api/products?')
    ).flush(mockResponse);
    await fixture.whenStable();
  });

  it('should show empty state when no products match filters', async () => {
    // given — no products match
    const emptyResponse: PaginatedResponse<Product> = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 12,
      number: 0,
      first: true,
      last: true,
    };

    const fixture = TestBed.createComponent(CatalogComponent);
    fixture.detectChanges();
    await flushInitialRequests(fixture, emptyResponse);

    // then — empty state is displayed
    expect(fixture.nativeElement.textContent).toContain('No products found');
  });

  it('should show loading indicator in DOM before data is loaded', async () => {
    // given — the component is rendered and data hasn't arrived yet
    const fixture = TestBed.createComponent(CatalogComponent);
    fixture.detectChanges();

    // then — loading indicator is visible in the DOM
    const loadingEl = fixture.nativeElement.querySelector('[data-testid="loading-indicator"]');
    expect(loadingEl).toBeTruthy();

    // cleanup — flush pending requests
    await flushInitialRequests(fixture);
  });

  it('should display the responsive product grid', async () => {
    // given — products are loaded
    const fixture = TestBed.createComponent(CatalogComponent);
    fixture.detectChanges();
    await flushInitialRequests(fixture);

    // then — the grid container has responsive classes
    const grid = fixture.nativeElement.querySelector('[data-testid="product-grid"]');
    expect(grid).toBeTruthy();
    expect(grid.classList.contains('grid')).toBe(true);
  });

  it('should render the search filter bar', async () => {
    // given — the catalog component is rendered
    const fixture = TestBed.createComponent(CatalogComponent);
    fixture.detectChanges();
    await flushInitialRequests(fixture);

    // then — the search filter bar is present
    const filterBar = fixture.debugElement.query(By.directive(SearchFilterBarComponent));
    expect(filterBar).toBeTruthy();
  });

  it('should refetch products when filter changes are received', async () => {
    // given — the catalog component is rendered
    const fixture = TestBed.createComponent(CatalogComponent);
    fixture.detectChanges();
    await flushInitialRequests(fixture);

    // when — a filter change event is received
    const filterBar = fixture.debugElement.query(By.directive(SearchFilterBarComponent));
    filterBar.triggerEventHandler('filterChange', { category: 'Electronics' });
    fixture.detectChanges();

    // then — a new products request is made with category param
    const req = httpMock.expectOne(
      (r) => r.urlWithParams.includes('/api/products?') &&
             urlContains(r.urlWithParams, 'category=Electronics')
    );
    expect(req).toBeTruthy();
    req.flush(mockResponse);
    await fixture.whenStable();
  });

  it('should reset to page 0 when filters change', async () => {
    // given — the catalog component is rendered
    const fixture = TestBed.createComponent(CatalogComponent);
    fixture.detectChanges();
    await flushInitialRequests(fixture);

    // when — a filter changes
    const filterBar = fixture.debugElement.query(By.directive(SearchFilterBarComponent));
    filterBar.triggerEventHandler('filterChange', { search: 'shoes' });
    fixture.detectChanges();

    // then — page resets to 0
    const req = httpMock.expectOne(
      (r) => r.urlWithParams.includes('/api/products?') &&
             urlContains(r.urlWithParams, 'page=0') &&
             urlContains(r.urlWithParams, 'search=shoes')
    );
    expect(req).toBeTruthy();
    req.flush(mockResponse);
    await fixture.whenStable();
  });

  it('should update product grid when page changes via pagination', async () => {
    // given — catalog has multiple pages
    const multiPageResponse: PaginatedResponse<Product> = {
      content: mockProducts,
      totalElements: 50,
      totalPages: 5,
      size: 12,
      number: 0,
      first: true,
      last: false,
    };

    const fixture = TestBed.createComponent(CatalogComponent);
    fixture.detectChanges();
    await flushInitialRequests(fixture, multiPageResponse);

    // when — user navigates to page 1
    const pagination = fixture.debugElement.query(By.directive(PaginationComponent));
    pagination.triggerEventHandler('pageChange', 1);
    fixture.detectChanges();

    // then — products are fetched for page 1
    const req = httpMock.expectOne(
      (r) => r.urlWithParams.includes('/api/products?') &&
             urlContains(r.urlWithParams, 'page=1')
    );
    expect(req).toBeTruthy();
    req.flush(multiPageResponse);
    await fixture.whenStable();
  });

  it('should pass categories to the search filter bar', async () => {
    // given — the catalog component is rendered with categories loaded
    const fixture = TestBed.createComponent(CatalogComponent);
    fixture.detectChanges();
    await flushInitialRequests(fixture);

    // then — categories are passed to the filter bar
    const filterBar = fixture.debugElement.query(By.directive(SearchFilterBarComponent));
    expect(filterBar.componentInstance.categories()).toEqual(mockCategories);
  });

  it('should show pagination when there are multiple pages', async () => {
    // given — multiple pages of products
    const multiPageResponse: PaginatedResponse<Product> = {
      content: mockProducts,
      totalElements: 50,
      totalPages: 5,
      size: 12,
      number: 0,
      first: true,
      last: false,
    };

    const fixture = TestBed.createComponent(CatalogComponent);
    fixture.detectChanges();
    await flushInitialRequests(fixture, multiPageResponse);

    // then — pagination component is rendered
    const pagination = fixture.debugElement.query(By.directive(PaginationComponent));
    expect(pagination).toBeTruthy();
  });

  it('should hide pagination when there is only one page', async () => {
    // given — only one page of products
    const fixture = TestBed.createComponent(CatalogComponent);
    fixture.detectChanges();
    await flushInitialRequests(fixture);

    // then — pagination component is not rendered
    const pagination = fixture.debugElement.query(By.directive(PaginationComponent));
    expect(pagination).toBeFalsy();
  });

  it('should show error state when products API fails', async () => {
    // given — the component is rendered
    const fixture = TestBed.createComponent(CatalogComponent);
    fixture.detectChanges();

    // when — the products API returns an error
    httpMock.expectOne('/api/products/categories').flush(mockCategories);
    httpMock.expectOne(
      (r) => r.urlWithParams.includes('/api/products?')
    ).flush(
      'Server error',
      { status: 500, statusText: 'Internal Server Error' }
    );
    await fixture.whenStable();
    fixture.detectChanges();

    // then — error state is displayed
    const errorEl = fixture.nativeElement.querySelector('[data-testid="error-state"]');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Something went wrong');
  });

  it('should display correct range 13-24 on page 2 of 50 products', async () => {
    // given — 50 products, page 1 (0-indexed) with 12 per page
    const page2Response: PaginatedResponse<Product> = {
      content: mockProducts,
      totalElements: 50,
      totalPages: 5,
      size: 12,
      number: 1,
      first: false,
      last: false,
    };

    const fixture = TestBed.createComponent(CatalogComponent);
    fixture.detectChanges();
    await flushInitialRequests(fixture, {
      content: mockProducts,
      totalElements: 50,
      totalPages: 5,
      size: 12,
      number: 0,
      first: true,
      last: false,
    });

    // when — user navigates to page 1 (second page)
    const pagination = fixture.debugElement.query(By.directive(PaginationComponent));
    pagination.triggerEventHandler('pageChange', 1);
    fixture.detectChanges();

    const req = httpMock.expectOne(
      (r) => r.urlWithParams.includes('/api/products?') &&
             urlContains(r.urlWithParams, 'page=1')
    );
    req.flush(page2Response);
    await fixture.whenStable();
    fixture.detectChanges();

    // then — range shows 13-24
    const countEl = fixture.nativeElement.querySelector('[data-testid="product-count"]');
    expect(countEl).toBeTruthy();
    expect(countEl.textContent).toContain('13-24');
    expect(countEl.textContent).toContain('of 50');
  });

  it('should display 0 products when totalElements is 0', async () => {
    // given — API returns 0 products
    const emptyResponse: PaginatedResponse<Product> = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 12,
      number: 0,
      first: true,
      last: true,
    };

    const fixture = TestBed.createComponent(CatalogComponent);
    fixture.detectChanges();
    await flushInitialRequests(fixture, emptyResponse);

    // then — empty state is shown (no product-count element, shows "No products found")
    const countEl = fixture.nativeElement.querySelector('[data-testid="product-count"]');
    expect(countEl).toBeFalsy();
    expect(fixture.nativeElement.textContent).toContain('No products found');
  });
});
