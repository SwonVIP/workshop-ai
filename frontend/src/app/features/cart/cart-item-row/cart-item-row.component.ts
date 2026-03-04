import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { CartItem } from '../../../core/models/cart.model';

@Component({
  selector: 'app-cart-item-row',
  standalone: true,
  imports: [CurrencyPipe, HlmButton, HlmSeparator],
  template: `
    <div data-testid="cart-item-row" class="flex gap-4 py-4">
      <img [src]="item().product.imageUrl" [alt]="item().product.name"
           class="w-20 h-20 rounded-lg object-cover border border-border" />
      <div class="flex-1 min-w-0">
        <h3 class="text-sm font-semibold text-foreground truncate">{{ item().product.name }}</h3>
        <p class="text-sm text-muted-foreground">{{ item().product.price | currency:'CHF':'symbol':'1.2-2' }} each</p>
        <div class="flex items-center gap-2 mt-2">
          <button hlmBtn variant="outline" size="icon" class="h-7 w-7"
                  data-testid="qty-decrease"
                  [disabled]="item().quantity <= 1"
                  (click)="onDecrease()">
            <span class="text-sm">−</span>
          </button>
          <span class="text-sm font-medium w-8 text-center" data-testid="qty-value">{{ item().quantity }}</span>
          <button hlmBtn variant="outline" size="icon" class="h-7 w-7"
                  data-testid="qty-increase"
                  (click)="onIncrease()">
            <span class="text-sm">+</span>
          </button>
        </div>
      </div>
      <div class="flex flex-col items-end justify-between">
        <span class="text-sm font-bold text-foreground">{{ item().subtotal | currency:'CHF':'symbol':'1.2-2' }}</span>
        <button hlmBtn variant="ghost" size="sm" class="text-destructive hover:text-destructive"
                data-testid="remove-item"
                (click)="onRemove()">
          Remove
        </button>
      </div>
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
