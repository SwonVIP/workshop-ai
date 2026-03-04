import { Component, computed, inject, signal, linkedSignal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ProductCardComponent } from './product-card/product-card.component';
import { SearchFilterBarComponent } from './search-filter-bar/search-filter-bar.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmH2 } from '@spartan-ng/helm/typography';
import { HlmMuted } from '@spartan-ng/helm/typography';
import {
  Product,
  ProductFilter,
  PaginatedResponse,
  Category,
} from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-catalog',
  imports: [
    ProductCardComponent,
    SearchFilterBarComponent,
    PaginationComponent,
    EmptyStateComponent,
    HlmSkeleton,
    HlmH2,
    HlmMuted,
  ],
  template: `
    <div>
      <h2 hlmH2 class="mb-1">Product Catalog</h2>
      <p hlmMuted class="mb-6">Browse our selection of quality products</p>

      <div class="mb-6">
        <app-search-filter-bar
          [categories]="categories()"
          (filterChange)="onFilterChange($event)"
        />
      </div>

      @if (productsResource.isLoading()) {
        <div data-testid="loading-indicator" class="space-y-6">
          <div class="flex items-center justify-between">
            <div hlmSkeleton class="h-5 w-48"></div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @for (i of skeletonCards; track i) {
              <div class="rounded-xl border border-border bg-card overflow-hidden">
                <div hlmSkeleton class="h-48 w-full rounded-none"></div>
                <div class="p-4 space-y-3">
                  <div hlmSkeleton class="h-5 w-16 rounded-full"></div>
                  <div hlmSkeleton class="h-5 w-3/4"></div>
                  <div hlmSkeleton class="h-4 w-full"></div>
                  <div class="flex items-center justify-between pt-2">
                    <div hlmSkeleton class="h-6 w-20"></div>
                    <div hlmSkeleton class="h-8 w-24 rounded-md"></div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      } @else if (productsResource.error()) {
        <div data-testid="error-state" class="flex flex-col items-center py-16 text-center">
          <div
            class="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4"
          >
            <svg
              class="w-8 h-8 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p class="text-lg font-semibold text-foreground mb-2">Something went wrong</p>
          <p class="text-sm text-muted-foreground">
            Unable to load products. Please try again later.
          </p>
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
          <p class="text-sm text-muted-foreground" data-testid="product-count">
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
              [cartQuantity]="getCartQuantity(product.id)"
              (addToCart)="onAddToCart($event)"
              (removeFromCart)="onRemoveFromCart($event)"
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

  readonly skeletonCards = Array.from({ length: 8 }, (_, i) => i);

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

  readonly productsResource = httpResource<PaginatedResponse<Product>>(this.productsUrl, {
    defaultValue: {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: this.pageSize,
      number: 0,
      first: true,
      last: true,
    },
  });

  readonly categoriesResource = httpResource<Category[]>(() => `${this.baseUrl}/categories`, {
    defaultValue: [],
  });

  readonly categories = computed(() => this.categoriesResource.value());
  readonly products = computed(() => this.productsResource.value().content);
  readonly totalPages = computed(() => this.productsResource.value().totalPages);
  readonly totalElements = computed(() => this.productsResource.value().totalElements);
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

  private readonly cartService = inject(CartService);

  getCartQuantity(productId: number): number {
    return this.cartService.cartItemsByProductId().get(productId)?.quantity ?? 0;
  }

  onAddToCart(product: Product): void {
    this.cartService.addItem({ productId: product.id, quantity: 1 }).subscribe({
      error: (err: unknown) => console.error('Failed to add item to cart', err),
    });
  }

  onRemoveFromCart(product: Product): void {
    const entry = this.cartService.cartItemsByProductId().get(product.id);
    if (!entry) return;
    if (entry.quantity > 1) {
      this.cartService.updateItem(entry.cartItemId, { quantity: entry.quantity - 1 }).subscribe({
        error: (err: unknown) => console.error('Failed to update cart item', err),
      });
    } else {
      this.cartService.removeItem(entry.cartItemId).subscribe({
        error: (err: unknown) => console.error('Failed to remove cart item', err),
      });
    }
  }
}
