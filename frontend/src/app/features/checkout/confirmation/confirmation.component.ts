import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmH2 } from '@spartan-ng/helm/typography';
import { CheckoutService } from '../../../core/services/checkout.service';
import { OrderResponse } from '../../../core/models/checkout.model';
import { RegisterPromptComponent } from './register-prompt/register-prompt.component';

@Component({
  selector: 'app-confirmation',
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    HlmButton,
    ...HlmCardImports,
    HlmSeparator,
    HlmSkeleton,
    HlmH2,
    RegisterPromptComponent,
  ],
  template: `
    @if (loading()) {
      <div class="max-w-2xl mx-auto space-y-6">
        <div hlmSkeleton class="h-10 w-64 mx-auto"></div>
        <div hlmCard class="p-6 space-y-4">
          <div hlmSkeleton class="h-6 w-48"></div>
          <div hlmSkeleton class="h-4 w-full"></div>
          <div hlmSkeleton class="h-4 w-full"></div>
          <div hlmSkeleton class="h-4 w-3/4"></div>
        </div>
      </div>
    } @else if (order()) {
      <div class="max-w-2xl mx-auto">
        <!-- Success header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 hlmH2 class="mb-1">Order Confirmed!</h2>
          <p class="text-muted-foreground">Thank you for your order</p>
        </div>

        <div hlmCard class="p-6">
          <!-- Order number & status -->
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm text-muted-foreground">Order Number</span>
            <span class="font-semibold text-foreground" data-testid="order-number">
              {{ order()!.orderNumber }}
            </span>
          </div>

          <hr hlmSeparator class="my-4" />

          <!-- Delivery details -->
          <div class="space-y-3 mb-4">
            <h3 class="text-sm font-semibold text-foreground">Delivery</h3>
            <div class="text-sm text-muted-foreground">
              <p>{{ order()!.deliverySlot.date | date: 'fullDate' }}</p>
              <p>{{ order()!.deliverySlot.startTime }} - {{ order()!.deliverySlot.endTime }}</p>
            </div>
            <div class="text-sm text-muted-foreground">
              <p>{{ order()!.street }}@if (order()!.apartment) {, {{ order()!.apartment }}}</p>
              <p>{{ order()!.postalCode }} {{ order()!.city }}</p>
            </div>
          </div>

          <hr hlmSeparator class="my-4" />

          <!-- Items -->
          <div class="space-y-2 mb-4">
            <h3 class="text-sm font-semibold text-foreground">Items</h3>
            @for (item of order()!.items; track item.productName) {
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">
                  {{ item.productName }} x{{ item.quantity }}
                </span>
                <span class="text-foreground">
                  {{ item.subtotal | currency: 'CHF' : 'symbol' : '1.2-2' }}
                </span>
              </div>
            }
          </div>

          <hr hlmSeparator class="my-4" />

          <!-- Totals -->
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Subtotal</span>
              <span class="text-foreground">
                {{ order()!.subtotal | currency: 'CHF' : 'symbol' : '1.2-2' }}
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Delivery</span>
              <span class="text-foreground">
                {{ order()!.deliveryFee | currency: 'CHF' : 'symbol' : '1.2-2' }}
              </span>
            </div>
            @if (order()!.discount > 0) {
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Discount</span>
                <span class="text-green-600 dark:text-green-400">
                  - {{ order()!.discount | currency: 'CHF' : 'symbol' : '1.2-2' }}
                </span>
              </div>
            }
          </div>

          <hr hlmSeparator class="my-4" />

          <div class="flex justify-between items-center mb-6">
            <span class="text-base font-semibold text-card-foreground">Total</span>
            <span class="text-xl font-bold text-card-foreground" data-testid="order-total">
              {{ order()!.total | currency: 'CHF' : 'symbol' : '1.2-2' }}
            </span>
          </div>

          <a
            hlmBtn
            routerLink="/catalog"
            class="w-full text-center"
            data-testid="continue-shopping-btn"
          >
            Continue Shopping
          </a>
        </div>

        <app-register-prompt
          [email]="order()!.email"
          [orderId]="order()!.id"
        />
      </div>
    }
  `,
})
export class ConfirmationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly checkoutService = inject(CheckoutService);

  readonly order = signal<OrderResponse | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('orderId'));
    if (!orderId || isNaN(orderId)) {
      this.router.navigate(['/catalog']);
      return;
    }

    this.checkoutService.getOrder(orderId).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: () => {
        this.router.navigate(['/catalog']);
      },
    });
  }
}
