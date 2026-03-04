import { Component, computed, signal, linkedSignal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ProductCardComponent } from './product-card/product-card.component';
import { SearchFilterBarComponent } from './search-filter-bar/search-filter-bar.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import {
  Product,
  ProductFilter,
  PaginatedResponse,
  Category,
} from '../../core/models/product.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-catalog',
  imports: [
    ProductCardComponent,
    SearchFilterBarComponent,
    PaginationComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="max-w-[var(--max-width-content)] mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-neutral-900 mb-6">Product Catalog</h1>

      <div class="mb-6">
        <app-search-filter-bar
          [categories]="categories()"
          (filterChange)="onFilterChange($event)"
        />
      </div>

      @if (productsResource.isLoading()) {
        <div data-testid="loading-indicator" class="flex justify-center items-center py-16">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      } @else if (productsResource.error()) {
        <div data-testid="error-state" class="flex flex-col items-center py-16 text-center">
          <p class="text-lg font-semibold text-red-600 mb-2">Something went wrong</p>
          <p class="text-sm text-neutral-500">Unable to load products. Please try again later.</p>
        </div>
      } @else if (products().length === 0) {
        <app-empty-state
          title="No products found"
          message="Try adjusting your filters or search terms to find what you're looking for."
          actionLabel="Clear Filters"
          actionLink="/catalog"
        />
      } @else {
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm text-neutral-500" data-testid="product-count">
            Showing {{ rangeStart() }}-{{ rangeEnd() }} of {{ totalElements() }} products
          </p>
        </div>

        <div
          data-testid="product-grid"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          @for (product of products(); track product.id) {
            <app-product-card
              [product]="product"
              (addToCart)="onAddToCart($event)"
            />
          }
        </div>

        @if (totalPages() > 1) {
          <app-pagination
            [currentPage]="page()"
            [totalPages]="totalPages()"
            (pageChange)="onPageChange($event)"
          />
        }
      }
    </div>
  `,
})
export class CatalogComponent {
  private readonly baseUrl = `${environment.apiBaseUrl}/products`;
  private readonly pageSize = 12;

  readonly filter = signal<ProductFilter>({});

  readonly page = linkedSignal({
    source: this.filter,
    computation: () => 0,
  });

  private readonly productsUrl = computed(() => {
    const f = this.filter();
    const p = this.page();
    let url = `${this.baseUrl}?page=${p}&size=${this.pageSize}`;
    if (f.category) url += `&category=${encodeURIComponent(f.category)}`;
    if (f.search) url += `&search=${encodeURIComponent(f.search)}`;
    if (f.minPrice != null) url += `&minPrice=${f.minPrice}`;
    if (f.maxPrice != null) url += `&maxPrice=${f.maxPrice}`;
    if (f.sort) url += `&sort=${f.sort},${f.direction ?? 'asc'}`;
    return url;
  });

  readonly productsResource = httpResource<PaginatedResponse<Product>>(
    this.productsUrl,
    {
      defaultValue: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: this.pageSize,
        number: 0,
        first: true,
        last: true,
      },
    }
  );

  readonly categoriesResource = httpResource<Category[]>(
    () => `${this.baseUrl}/categories`,
    { defaultValue: [] }
  );

  readonly categories = computed(() => this.categoriesResource.value());
  readonly products = computed(() => this.productsResource.value().content);
  readonly totalPages = computed(() => this.productsResource.value().totalPages);
  readonly totalElements = computed(() => this.productsResource.value().totalElements);
  readonly isLoading = computed(() => this.productsResource.isLoading());

  readonly rangeStart = computed(() => {
    const total = this.totalElements();
    if (total === 0) return 0;
    return this.page() * this.pageSize + 1;
  });

  readonly rangeEnd = computed(() => {
    const start = this.page() * this.pageSize;
    return Math.min(start + this.pageSize, this.totalElements());
  });

  onFilterChange(newFilter: ProductFilter): void {
    this.filter.set(newFilter);
  }

  onPageChange(newPage: number): void {
    this.page.set(newPage);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAddToCart(_product: Product): void {
    // Cart integration — Epic 3
  }
}
