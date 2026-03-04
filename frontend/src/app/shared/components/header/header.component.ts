import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-200 z-50">
      <div class="max-w-screen-xl mx-auto px-4 h-full flex items-center justify-between">
        <a routerLink="/" class="text-xl font-bold text-primary">
          Workshop Store
        </a>
        <nav class="flex items-center gap-6">
          <a routerLink="/catalog" routerLinkActive="text-primary font-semibold"
             class="text-neutral-700 hover:text-primary transition-colors">
            Catalog
          </a>
          <a routerLink="/cart" class="relative text-neutral-700 hover:text-primary transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
            </svg>
            @if (cartItemCount() > 0) {
              <span data-testid="cart-badge"
                    class="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-white p-0 flex items-center justify-center text-xs">
                {{ cartItemCount() }}
              </span>
            }
          </a>
        </nav>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  private readonly cartService = inject(CartService);
  cartItemCount = this.cartService.itemCount;
}
