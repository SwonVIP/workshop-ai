import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
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
  template: `
    <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
      <div class="relative flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder="Search products..."
          [value]="searchTerm()"
          (input)="onSearchInput($event)"
          class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      <select
        data-testid="category-filter"
        [value]="selectedCategory()"
        (change)="onCategoryChange($event)"
        class="px-3 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
      >
        <option value="">All Categories</option>
        @for (category of categories(); track category.id) {
          <option [value]="category.name">{{ category.name }}</option>
        }
      </select>

      <select
        data-testid="price-filter"
        [value]="selectedPriceRange()"
        (change)="onPriceRangeChange($event)"
        class="px-3 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
      >
        @for (range of priceRanges; track range.value) {
          <option [value]="range.value">{{ range.label }}</option>
        }
      </select>

      <select
        data-testid="sort-filter"
        [value]="selectedSort()"
        (change)="onSortChange($event)"
        class="px-3 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
      >
        @for (option of sortOptions; track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
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

    const priceRange = this.priceRanges.find(
      (r) => r.value === this.selectedPriceRange()
    );
    if (priceRange && priceRange.value) {
      filter.minPrice = priceRange.min;
      filter.maxPrice = priceRange.max;
    }

    const sortOption = this.sortOptions.find(
      (s) => s.value === this.selectedSort()
    );
    if (sortOption && sortOption.value) {
      filter.sort = sortOption.sort;
      filter.direction = sortOption.direction;
    }

    this.filterChange.emit(filter);
  }
}
