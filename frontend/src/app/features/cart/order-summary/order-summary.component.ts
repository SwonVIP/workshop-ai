import { Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSeparator } from '@spartan-ng/helm/separator';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, HlmButton, HlmSeparator, ...HlmCardImports],
  template: `
    <div hlmCard class="p-6">
      <h3 class="text-lg font-bold text-card-foreground mb-4">Order Summary</h3>
      <div class="space-y-2 mb-4">
        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground" data-testid="cart-item-count">{{ totalItems() }} item{{ totalItems() > 1 ? 's' : '' }}</span>
          <span class="text-foreground">{{ totalPrice() | currency:'CHF':'symbol':'1.2-2' }}</span>
        </div>
      </div>
      <hr hlmSeparator class="my-4" />
      <div class="flex justify-between items-center mb-6">
        <span class="text-base font-semibold text-card-foreground">Total</span>
        <span class="text-xl font-bold text-card-foreground" data-testid="cart-total">{{ totalPrice() | currency:'CHF':'symbol':'1.2-2' }}</span>
      </div>
      <a hlmBtn routerLink="/checkout" class="w-full text-center" data-testid="checkout-button">
        Go to Checkout
      </a>
    </div>
  `,
})
export class OrderSummaryComponent {
  readonly totalItems = input.required<number>();
  readonly totalPrice = input.required<number>();
}
