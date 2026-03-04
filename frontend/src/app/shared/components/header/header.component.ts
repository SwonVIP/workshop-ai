import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import {
  HlmSheet,
  HlmSheetContent,
  HlmSheetHeader,
  HlmSheetTitle,
  HlmSheetDescription,
  HlmSheetFooter,
  HlmSheetTrigger,
  HlmSheetClose,
  HlmSheetPortal,
} from '@spartan-ng/helm/sheet';
import { CartService } from '../../../core/services/cart.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    CurrencyPipe,
    HlmButton,
    HlmBadge,
    HlmSeparator,
    HlmSheet,
    HlmSheetContent,
    HlmSheetHeader,
    HlmSheetTitle,
    HlmSheetDescription,
    HlmSheetFooter,
    HlmSheetTrigger,
    HlmSheetClose,
    HlmSheetPortal,
    ThemeToggleComponent,
  ],
  template: `
    <header class="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50">
      <div class="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <a routerLink="/" class="flex items-center gap-2 text-xl font-bold text-foreground hover:text-primary transition-colors">
          <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
          Workshop Store
        </a>

        <nav class="flex items-center gap-2">
          <a hlmBtn variant="ghost" routerLink="/catalog" routerLinkActive="bg-accent text-accent-foreground"
             class="text-sm font-medium">
            Catalog
          </a>

          <app-theme-toggle />

          <hlm-sheet>
            <button hlmSheetTrigger side="right" hlmBtn variant="ghost" size="icon"
                    class="relative" aria-label="Shopping cart" data-testid="cart-trigger">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
              </svg>
              @if (cartItemCount() > 0) {
                <span data-testid="cart-badge" hlmBadge
                      class="absolute -top-1.5 -right-1.5 h-5 min-w-5 rounded-full px-1 flex items-center justify-center text-[10px]">
                  {{ cartItemCount() }}
                </span>
              }
            </button>

            <ng-template hlmSheetPortal>
            <hlm-sheet-content data-testid="cart-drawer">
              <div hlmSheetHeader>
                <h3 hlmSheetTitle>Shopping Cart</h3>
                <p hlmSheetDescription>
                  @if (cartItemCount() > 0) {
                    {{ cartItemCount() }} item{{ cartItemCount() > 1 ? 's' : '' }} in your cart
                  } @else {
                    Your cart is empty
                  }
                </p>
              </div>

              <div class="flex-1 overflow-y-auto px-4">
                @if (cart(); as cartData) {
                  @if (cartData.items.length > 0) {
                    <div class="space-y-1">
                      @for (item of cartData.items; track item.id) {
                        <div class="flex items-center gap-3 py-2.5">
                          <img [src]="item.product.imageUrl" [alt]="item.product.name"
                               class="w-12 h-12 rounded-md object-cover border border-border shrink-0" />
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-foreground truncate">{{ item.product.name }}</p>
                            <p class="text-xs text-muted-foreground">{{ item.subtotal | currency:'CHF':'symbol':'1.2-2' }}</p>
                          </div>
                          <div class="flex items-center gap-1 shrink-0">
                            <button hlmBtn variant="outline" size="icon" class="h-6 w-6"
                                    data-testid="drawer-qty-decrease"
                                    [disabled]="item.quantity <= 1"
                                    (click)="onUpdateQuantity(item.id, item.quantity - 1)">
                              <span class="text-xs">−</span>
                            </button>
                            <span class="text-xs font-medium w-5 text-center" data-testid="drawer-qty-value">{{ item.quantity }}</span>
                            <button hlmBtn variant="outline" size="icon" class="h-6 w-6"
                                    data-testid="drawer-qty-increase"
                                    (click)="onUpdateQuantity(item.id, item.quantity + 1)">
                              <span class="text-xs">+</span>
                            </button>
                          </div>
                          <button hlmBtn variant="ghost" size="icon" class="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                                  data-testid="drawer-remove-item"
                                  (click)="onRemoveItem(item.id)">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                        <hr hlmSeparator />
                      }
                    </div>
                  } @else {
                    <div class="flex flex-col items-center justify-center py-12 text-center">
                      <svg class="w-12 h-12 text-muted-foreground/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
                      </svg>
                      <p class="text-sm font-medium text-muted-foreground">No items yet</p>
                      <p class="text-xs text-muted-foreground/70 mt-1">Add products from the catalog</p>
                    </div>
                  }
                } @else {
                  <div class="flex flex-col items-center justify-center py-12 text-center">
                    <svg class="w-12 h-12 text-muted-foreground/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
                    </svg>
                    <p class="text-sm font-medium text-muted-foreground">No items yet</p>
                    <p class="text-xs text-muted-foreground/70 mt-1">Add products from the catalog</p>
                  </div>
                }
              </div>

              <div hlmSheetFooter>
                @if (cart(); as cartData) {
                  @if (cartData.items.length > 0) {
                    <hr hlmSeparator class="mb-2" />
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm font-medium text-muted-foreground">Total</span>
                      <span class="text-lg font-bold text-foreground">{{ cartData.totalPrice | currency:'CHF':'symbol':'1.2-2' }}</span>
                    </div>
                    <button hlmBtn hlmSheetClose routerLink="/checkout" class="w-full">
                      Proceed to Checkout
                    </button>
                    <button hlmBtn variant="outline" hlmSheetClose routerLink="/catalog" class="w-full">
                      Continue Shopping
                    </button>
                    <button hlmBtn variant="ghost" size="sm" class="w-full text-destructive hover:text-destructive mt-1"
                            data-testid="drawer-clear-cart"
                            (click)="onClearCart()">
                      Clear Cart
                    </button>
                  }
                }
              </div>
            </hlm-sheet-content>
            </ng-template>
          </hlm-sheet>
        </nav>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  private readonly cartService = inject(CartService);
  cartItemCount = this.cartService.itemCount;
  cart = this.cartService.cart;

  onUpdateQuantity(itemId: number, quantity: number): void {
    this.cartService.updateItem(itemId, { quantity }).subscribe({
      error: (err: unknown) => console.error('Failed to update cart item', err),
    });
  }

  onRemoveItem(itemId: number): void {
    this.cartService.removeItem(itemId).subscribe({
      error: (err: unknown) => console.error('Failed to remove cart item', err),
    });
  }

  onClearCart(): void {
    this.cartService.clearCart().subscribe({
      error: (err: unknown) => console.error('Failed to clear cart', err),
    });
  }
}
