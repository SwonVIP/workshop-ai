import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { HlmInput } from '@spartan-ng/helm/input';
import { Category, ProductFilter } from '../../../core/models/product.model';

interface PriceRange {
  label: string;
  value: string;
  min?: number;
  max?: number;
}

interface SortOption {
  label: string;
  value: string;
  sort: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-search-filter-bar',
  imports: [HlmInput],
  template: `
    <div class="rounded-lg border border-border bg-card p-4">
      <div class="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div class="relative flex-1 min-w-[200px]">
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            hlmInput
            type="text"
            placeholder="Search products..."
            [value]="searchTerm()"
            (input)="onSearchInput($event)"
            class="w-full pl-10"
          />
        </div>

        <select
          data-testid="category-filter"
          aria-label="Filter by category"
          [value]="selectedCategory()"
          (change)="onCategoryChange($event)"
          class="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
        >
          <option value="">All Categories</option>
          @for (category of categories(); track category.id) {
            <option [value]="category.name">{{ category.name }}</option>
          }
        </select>

        <select
          data-testid="price-filter"
          aria-label="Filter by price range"
          [value]="selectedPriceRange()"
          (change)="onPriceRangeChange($event)"
          class="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
        >
          @for (range of priceRanges; track range.value) {
            <option [value]="range.value">{{ range.label }}</option>
          }
        </select>

        <select
          data-testid="sort-filter"
          aria-label="Sort products"
          [value]="selectedSort()"
          (change)="onSortChange($event)"
          class="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
        >
          @for (option of sortOptions; track option.value) {
            <option [value]="option.value">{{ option.label }}</option>
          }
        </select>
      </div>
    </div>
  `,
})
export class SearchFilterBarComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = input<Category[]>([]);
  readonly filterChange = output<ProductFilter>();

  readonly searchTerm = signal('');
  readonly selectedCategory = signal('');
  readonly selectedPriceRange = signal('');
  readonly selectedSort = signal('');

  readonly priceRanges: PriceRange[] = [
    { label: 'Any Price', value: '' },
    { label: 'Under CHF 25', value: '0-25', min: 0, max: 25 },
    { label: 'CHF 25-50', value: '25-50', min: 25, max: 50 },
    { label: 'CHF 50-100', value: '50-100', min: 50, max: 100 },
    { label: 'Over CHF 100', value: '100-', min: 100 },
  ];

  readonly sortOptions: SortOption[] = [
    { label: 'Default', value: '', sort: '', direction: 'asc' },
    { label: 'Name A-Z', value: 'name-asc', sort: 'name', direction: 'asc' },
    { label: 'Name Z-A', value: 'name-desc', sort: 'name', direction: 'desc' },
    { label: 'Price Low-High', value: 'price-asc', sort: 'price', direction: 'asc' },
    { label: 'Price High-Low', value: 'price-desc', sort: 'price', direction: 'desc' },
  ];

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }
    });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.emitFilter();
    }, 300);
  }

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategory.set(value);
    this.emitFilter();
  }

  onPriceRangeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedPriceRange.set(value);
    this.emitFilter();
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedSort.set(value);
    this.emitFilter();
  }

  private emitFilter(): void {
    const filter: ProductFilter = {};

    const search = this.searchTerm();
    if (search) {
      filter.search = search;
    }

    const category = this.selectedCategory();
    if (category) {
      filter.category = category;
    }

    const priceRange = this.priceRanges.find((r) => r.value === this.selectedPriceRange());
    if (priceRange && priceRange.value) {
      filter.minPrice = priceRange.min;
      filter.maxPrice = priceRange.max;
    }

    const sortOption = this.sortOptions.find((s) => s.value === this.selectedSort());
    if (sortOption && sortOption.value) {
      filter.sort = sortOption.sort;
      filter.direction = sortOption.direction;
    }

    this.filterChange.emit(filter);
  }
}
