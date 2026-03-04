import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { CartItem } from '../../../core/models/cart.model';

@Component({
  selector: 'app-cart-item-row',
  imports: [CurrencyPipe, HlmButton, HlmSeparator],
  template: `
    <div data-testid="cart-item-row" class="flex items-center gap-4 py-4">
      <img [src]="item().product.imageUrl" [alt]="item().product.name"
           class="w-16 h-16 rounded-lg object-cover border border-border shrink-0" />
      <div class="flex-1 min-w-0">
        <h3 class="text-sm font-semibold text-foreground truncate">{{ item().product.name }}</h3>
        <p class="text-xs text-muted-foreground">{{ item().product.price | currency:'CHF':'symbol':'1.2-2' }} each</p>
      </div>
      <div class="flex items-center gap-1.5 shrink-0">
        <button hlmBtn variant="outline" size="icon" class="h-7 w-7"
                data-testid="qty-decrease"
                aria-label="Decrease quantity"
                [disabled]="item().quantity <= 1"
                (click)="onDecrease()">
          <span class="text-sm">−</span>
        </button>
        <span class="text-sm font-medium w-8 text-center" data-testid="qty-value">{{ item().quantity }}</span>
        <button hlmBtn variant="outline" size="icon" class="h-7 w-7"
                data-testid="qty-increase"
                aria-label="Increase quantity"
                (click)="onIncrease()">
          <span class="text-sm">+</span>
        </button>
      </div>
      <span class="text-sm font-bold text-foreground w-24 text-right shrink-0">
        {{ item().subtotal | currency:'CHF':'symbol':'1.2-2' }}
      </span>
      <button hlmBtn variant="ghost" size="icon" class="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
              data-testid="remove-item"
              aria-label="Remove item"
              (click)="onRemove()">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    </div>
    <hr hlmSeparator />
  `,
})
export class CartItemRowComponent {
  readonly item = input.required<CartItem>();
  readonly quantityChange = output<{ itemId: number; quantity: number }>();
  readonly remove = output<number>();

  onIncrease(): void {
    this.quantityChange.emit({ itemId: this.item().id, quantity: this.item().quantity + 1 });
  }

  onDecrease(): void {
    if (this.item().quantity > 1) {
      this.quantityChange.emit({ itemId: this.item().id, quantity: this.item().quantity - 1 });
    }
  }

  onRemove(): void {
    this.remove.emit(this.item().id);
  }
}
