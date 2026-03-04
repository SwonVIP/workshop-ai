import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, HlmButton, HlmBadge, ...HlmCardImports],
  template: `
    <div
      hlmCard
      data-testid="product-card"
      class="group overflow-hidden transition-shadow hover:shadow-md"
    >
      <div class="relative aspect-[4/3] overflow-hidden">
        <img
          [src]="product().imageUrl"
          [alt]="product().name"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span
          data-testid="category-badge"
          hlmBadge
          variant="secondary"
          class="absolute top-3 left-3"
        >
          {{ product().category.name }}
        </span>
      </div>

      <div hlmCardContent class="flex flex-col flex-1">
        <h3 class="text-base font-semibold text-card-foreground line-clamp-1 mb-1">
          {{ product().name }}
        </h3>
        <p data-testid="product-description" class="text-sm text-muted-foreground line-clamp-2">
          {{ product().description }}
        </p>
      </div>

      <div hlmCardFooter class="flex items-center justify-between">
        <span data-testid="product-price" class="text-lg font-bold text-card-foreground">
          {{ product().price | currency: 'CHF' : 'symbol' : '1.2-2' }}
        </span>
        @if (cartQuantity() > 0) {
          <div class="flex items-center gap-1">
            <button
              hlmBtn
              variant="outline"
              size="icon"
              class="h-8 w-8"
              data-testid="card-qty-decrease"
              aria-label="Decrease quantity"
              (click)="onRemoveFromCart()"
            >
              <span class="text-sm">−</span>
            </button>
            <span data-testid="card-qty-value" class="text-sm font-semibold w-8 text-center">{{
              cartQuantity()
            }}</span>
            <button
              hlmBtn
              variant="outline"
              size="icon"
              class="h-8 w-8"
              data-testid="card-qty-increase"
              aria-label="Increase quantity"
              (click)="onAddToCart()"
            >
              <span class="text-sm">+</span>
            </button>
          </div>
        } @else {
          <button hlmBtn size="sm" (click)="onAddToCart()">Add to Cart</button>
        }
      </div>
    </div>
  `,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly cartQuantity = input<number>(0);
  readonly addToCart = output<Product>();
  readonly removeFromCart = output<Product>();

  onAddToCart(): void {
    this.addToCart.emit(this.product());
  }

  onRemoveFromCart(): void {
    this.removeFromCart.emit(this.product());
  }
}
