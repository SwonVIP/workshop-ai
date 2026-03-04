import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe],
  template: `
    <div
      data-testid="product-card"
      class="group flex flex-col bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div class="relative overflow-hidden">
        <img
          [src]="product().imageUrl"
          [alt]="product().name"
          class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span
          data-testid="category-badge"
          class="absolute top-2 left-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary"
        >
          {{ product().category.name }}
        </span>
      </div>
      <div class="flex flex-col flex-1 p-4">
        <h3 class="text-base font-semibold text-neutral-900 mb-1">
          {{ product().name }}
        </h3>
        <p
          data-testid="product-description"
          class="text-sm text-neutral-500 mb-3 line-clamp-2"
        >
          {{ product().description }}
        </p>
        <div class="mt-auto flex items-center justify-between">
          <span class="text-lg font-bold text-neutral-900">
            {{ product().price | currency: 'CHF' : 'symbol' : '1.2-2' }}
          </span>
          <button
            type="button"
            class="inline-flex items-center justify-center text-sm font-medium rounded-md px-3 py-1.5 bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
            (click)="onAddToCart()"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly addToCart = output<Product>();

  onAddToCart(): void {
    this.addToCart.emit(this.product());
  }
}
