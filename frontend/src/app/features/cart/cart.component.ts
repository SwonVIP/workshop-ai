import { Component, OnInit, inject } from '@angular/core';
import { CartItemRowComponent } from './cart-item-row/cart-item-row.component';
import { OrderSummaryComponent } from './order-summary/order-summary.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmH2, HlmMuted } from '@spartan-ng/helm/typography';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [CartItemRowComponent, OrderSummaryComponent, EmptyStateComponent, HlmButton, HlmH2, HlmMuted],
  template: `
    <div>
      <h2 hlmH2 class="mb-1">Shopping Cart</h2>
      <p hlmMuted class="mb-6">Review your items and proceed to checkout</p>

      @if (cart(); as cartData) {
        @if (cartData.items.length > 0) {
          <div class="flex items-center justify-between mb-6">
            <p class="text-sm text-muted-foreground">{{ cartData.totalItems }} item{{ cartData.totalItems > 1 ? 's' : '' }} in your cart</p>
            <button hlmBtn variant="outline" size="sm" data-testid="clear-cart"
                    class="text-destructive hover:text-destructive"
                    (click)="onClearCart()">
              Clear Cart
            </button>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2">
              @for (item of cartData.items; track item.id) {
                <app-cart-item-row
                  [item]="item"
                  (quantityChange)="onQuantityChange($event)"
                  (remove)="onRemove($event)"
                />
              }
            </div>
            <div class="lg:sticky lg:top-24">
              <app-order-summary
                [totalItems]="cartData.totalItems"
                [totalPrice]="cartData.totalPrice"
              />
            </div>
          </div>
        } @else {
          <app-empty-state
            data-testid="cart-empty-state"
            title="Your cart is empty"
            message="Looks like you haven't added any products yet."
            actionLabel="Browse Products"
            actionLink="/catalog"
          />
        }
      } @else {
        <app-empty-state
          data-testid="cart-empty-state"
          title="Your cart is empty"
          message="Looks like you haven't added any products yet."
          actionLabel="Browse Products"
          actionLink="/catalog"
        />
      }
    </div>
  `,
})
export class CartComponent implements OnInit {
  private readonly cartService = inject(CartService);
  readonly cart = this.cartService.cart;

  ngOnInit(): void {
    this.cartService.loadCart();
  }

  onQuantityChange(event: { itemId: number; quantity: number }): void {
    this.cartService.updateItem(event.itemId, { quantity: event.quantity }).subscribe();
  }

  onRemove(itemId: number): void {
    this.cartService.removeItem(itemId).subscribe();
  }

  onClearCart(): void {
    this.cartService.clearCart().subscribe();
  }
}
