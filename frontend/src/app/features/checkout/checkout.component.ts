import { Component, OnInit, inject, signal, viewChild, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmH2, HlmMuted } from '@spartan-ng/helm/typography';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { CartService } from '../../core/services/cart.service';
import { CheckoutService } from '../../core/services/checkout.service';
import { ReturningUserComponent } from './returning-user/returning-user.component';
import { DeliveryFormComponent } from './delivery-form/delivery-form.component';
import { DeliverySlotPickerComponent } from './delivery-slot-picker/delivery-slot-picker.component';
import { CouponInputComponent } from './coupon-input/coupon-input.component';
import { PaymentFormComponent, PaymentFormValue } from './payment-form/payment-form.component';
import { SuggestionsComponent } from './suggestions/suggestions.component';
import { DeliverySlot, CouponResponse, CreateOrderRequest } from '../../core/models/checkout.model';
import { CustomerResponse } from '../../core/models/customer.model';

@Component({
  selector: 'app-checkout',
  imports: [
    CurrencyPipe,
    HlmButton,
    ...HlmCardImports,
    HlmSeparator,
    HlmH2,
    HlmMuted,
    HlmSkeleton,
    EmptyStateComponent,
    ReturningUserComponent,
    DeliveryFormComponent,
    DeliverySlotPickerComponent,
    CouponInputComponent,
    PaymentFormComponent,
    SuggestionsComponent,
  ],
  template: `
    <div>
      <h2 hlmH2 class="mb-1">Checkout</h2>
      <p hlmMuted class="mb-6">Complete your order</p>

      @if (cart(); as cartData) {
        @if (cartData.items.length > 0) {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left column: forms -->
            <div class="lg:col-span-2 space-y-8">
              <!-- Returning User -->
              <div hlmCard class="p-6" data-testid="returning-user-card">
                <app-returning-user
                  (identified)="onCustomerIdentified($event)"
                />
              </div>

              <!-- Delivery Form -->
              <div hlmCard class="p-6">
                <app-delivery-form
                  (formValidity)="onDeliveryFormValidity($event)"
                  (formValue)="onDeliveryFormValue($event)"
                />
              </div>

              <!-- Delivery Slot Picker -->
              <div hlmCard class="p-6">
                @if (slotsLoading()) {
                  <h3 class="text-lg font-semibold text-foreground mb-4">Delivery Time</h3>
                  <div class="space-y-3">
                    <div hlmSkeleton class="h-5 w-32"></div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      @for (i of skeletonSlots; track i) {
                        <div hlmSkeleton class="h-16 rounded-lg"></div>
                      }
                    </div>
                  </div>
                } @else {
                  <app-delivery-slot-picker
                    [slots]="deliverySlots()"
                    (slotSelected)="onSlotSelected($event)"
                  />
                }
              </div>

              <!-- Coupon Input -->
              <div hlmCard class="p-6" data-testid="coupon-section">
                <app-coupon-input
                  (couponApplied)="onCouponApplied($event)"
                />
              </div>

              <!-- Payment Form -->
              <div hlmCard class="p-6" data-testid="payment-section">
                <app-payment-form
                  (formValid)="onPaymentFormValidity($event)"
                  (formValue)="onPaymentFormValue($event)"
                />
              </div>
            </div>

            <!-- Right column: summary (sticky) -->
            <div class="lg:sticky lg:top-24 lg:self-start">
              <div hlmCard class="p-6" data-testid="checkout-summary">
                <h3 class="text-lg font-bold text-card-foreground mb-4">Order Summary</h3>

                <div class="space-y-2 mb-4">
                  @for (item of cartData.items; track item.id) {
                    <div class="flex justify-between text-sm">
                      <span class="text-muted-foreground">
                        {{ item.product.name }} x{{ item.quantity }}
                      </span>
                      <span class="text-foreground">{{
                        item.subtotal | currency: 'CHF' : 'symbol' : '1.2-2'
                      }}</span>
                    </div>
                  }
                </div>

                <hr hlmSeparator class="my-4" />

                <div class="space-y-2 mb-4">
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">Subtotal</span>
                    <span class="text-foreground">{{
                      cartData.totalPrice | currency: 'CHF' : 'symbol' : '1.2-2'
                    }}</span>
                  </div>
                  @if (selectedSlot()) {
                    <div class="flex justify-between text-sm">
                      <span class="text-muted-foreground">Delivery</span>
                      <span class="text-foreground">{{
                        selectedSlot()!.price | currency: 'CHF' : 'symbol' : '1.2-2'
                      }}</span>
                    </div>
                  } @else {
                    <div class="flex justify-between text-sm">
                      <span class="text-muted-foreground">Delivery</span>
                      <span class="text-muted-foreground italic">Select a slot</span>
                    </div>
                  }
                  @if (appliedCoupon()) {
                    <div class="flex justify-between text-sm">
                      <span class="text-muted-foreground">Discount</span>
                      <span class="text-green-600 dark:text-green-400">
                        - {{ discountAmount() | currency: 'CHF' : 'symbol' : '1.2-2' }}
                      </span>
                    </div>
                  }
                </div>

                <hr hlmSeparator class="my-4" />

                <div class="flex justify-between items-center mb-6">
                  <span class="text-base font-semibold text-card-foreground">Total</span>
                  <span
                    class="text-xl font-bold text-card-foreground"
                    data-testid="checkout-total"
                  >
                    {{ orderTotal() | currency: 'CHF' : 'symbol' : '1.2-2' }}
                  </span>
                </div>

                <!-- Desktop Place Order button -->
                <button
                  hlmBtn
                  class="w-full hidden lg:block"
                  data-testid="place-order-btn"
                  [disabled]="!canPlaceOrder() || submitting()"
                  (click)="onPlaceOrder()"
                >
                  @if (submitting()) {
                    Placing Order...
                  } @else {
                    Place Order
                  }
                </button>

                @if (errorMessage()) {
                  <div
                    class="mt-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm"
                    data-testid="order-error"
                  >
                    {{ errorMessage() }}
                  </div>
                }
              </div>

              <!-- Suggestions (desktop only) -->
              <div class="mt-6 hidden lg:block" data-testid="suggestions-section">
                <app-suggestions />
              </div>
            </div>
          </div>

          <!-- Suggestions (mobile only, before Place Order) -->
          <div class="mt-8 lg:hidden">
            <app-suggestions />
          </div>

          <!-- Mobile sticky bottom bar -->
          <div
            class="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 lg:hidden z-50"
            data-testid="mobile-bottom-bar"
          >
            <div class="flex items-center justify-between max-w-7xl mx-auto">
              <div>
                <span class="text-sm text-muted-foreground">Total</span>
                <span class="block text-lg font-bold text-foreground">{{
                  orderTotal() | currency: 'CHF' : 'symbol' : '1.2-2'
                }}</span>
              </div>
              <button
                hlmBtn
                data-testid="place-order-btn-mobile"
                [disabled]="!canPlaceOrder() || submitting()"
                (click)="onPlaceOrder()"
              >
                @if (submitting()) {
                  Placing Order...
                } @else {
                  Place Order
                }
              </button>
            </div>
          </div>
          <!-- Spacer for mobile sticky bar -->
          <div class="h-20 lg:hidden"></div>
        } @else {
          <app-empty-state
            title="Your cart is empty"
            message="Add some products before checking out."
            actionLabel="Browse Products"
            actionLink="/catalog"
          />
        }
      } @else {
        <app-empty-state
          title="Your cart is empty"
          message="Add some products before checking out."
          actionLabel="Browse Products"
          actionLink="/catalog"
        />
      }
    </div>
  `,
})
export class CheckoutComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly checkoutService = inject(CheckoutService);
  private readonly router = inject(Router);

  readonly deliveryFormComponent = viewChild(DeliveryFormComponent);
  readonly couponInputComponent = viewChild(CouponInputComponent);

  readonly cart = this.cartService.cart;
  readonly deliverySlots = signal<DeliverySlot[]>([]);
  readonly slotsLoading = signal(true);
  readonly selectedSlot = signal<DeliverySlot | null>(null);
  readonly deliveryFormValid = signal(false);
  readonly deliveryFormValue = signal<Record<string, unknown>>({});
  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  readonly paymentFormValid = signal(false);
  readonly paymentFormValue = signal<PaymentFormValue | null>(null);
  readonly appliedCoupon = signal<CouponResponse | null>(null);
  readonly freeDeliveryApplied = signal(false);

  readonly skeletonSlots = Array.from({ length: 6 }, (_, i) => i);

  readonly discountAmount = computed(() => {
    const coupon = this.appliedCoupon();
    if (!coupon) return 0;
    const subtotal = this.cart()?.totalPrice ?? 0;
    const deliveryFee = this.selectedSlot()?.price ?? 0;

    switch (coupon.type) {
      case 'PERCENTAGE':
        return subtotal * (coupon.value / 100);
      case 'FIXED_AMOUNT':
        return coupon.value;
      case 'FREE_DELIVERY':
        return deliveryFee;
      default:
        return 0;
    }
  });

  ngOnInit(): void {
    this.cartService.loadCart();
    this.checkoutService.getDeliverySlots().subscribe({
      next: (slots) => {
        this.deliverySlots.set(slots);
        this.slotsLoading.set(false);
      },
      error: () => {
        this.slotsLoading.set(false);
      },
    });

    this.tryAutoApplyFreeDelivery();
  }

  onDeliveryFormValidity(valid: boolean): void {
    this.deliveryFormValid.set(valid);
  }

  onDeliveryFormValue(value: Record<string, unknown>): void {
    this.deliveryFormValue.set(value);
  }

  onSlotSelected(slot: DeliverySlot): void {
    this.selectedSlot.set(slot);
  }

  onPaymentFormValidity(valid: boolean): void {
    this.paymentFormValid.set(valid);
  }

  onPaymentFormValue(value: PaymentFormValue): void {
    this.paymentFormValue.set(value);
  }

  onCustomerIdentified(customer: CustomerResponse): void {
    const form = this.deliveryFormComponent();
    if (form) {
      form.patchValues({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        street: customer.street,
        apartment: customer.apartment,
        city: customer.city,
        postalCode: customer.postalCode,
      });
    }
  }

  onCouponApplied(coupon: CouponResponse | null): void {
    this.appliedCoupon.set(coupon);
    if (coupon === null) {
      this.freeDeliveryApplied.set(false);
    }
  }

  canPlaceOrder(): boolean {
    return this.deliveryFormValid() && this.selectedSlot() !== null && this.paymentFormValid();
  }

  orderTotal(): number {
    const cartTotal = this.cart()?.totalPrice ?? 0;
    const deliveryFee = this.selectedSlot()?.price ?? 0;
    const discount = this.discountAmount();
    return Math.max(0, cartTotal + deliveryFee - discount);
  }

  onPlaceOrder(): void {
    const form = this.deliveryFormComponent();
    if (form) {
      form.markAllTouched();
    }

    if (!this.canPlaceOrder()) return;

    this.submitting.set(true);
    this.errorMessage.set('');

    const formVal = this.deliveryFormValue();
    const payment = this.paymentFormValue();
    const coupon = this.appliedCoupon();

    const request: CreateOrderRequest = {
      firstName: formVal['firstName'] as string,
      lastName: formVal['lastName'] as string,
      email: formVal['email'] as string,
      phone: formVal['phone'] as string,
      street: formVal['street'] as string,
      apartment: (formVal['apartment'] as string) || undefined,
      city: formVal['city'] as string,
      postalCode: formVal['postalCode'] as string,
      deliveryInstructions: (formVal['deliveryInstructions'] as string) || undefined,
      deliverySlotId: this.selectedSlot()!.id,
      couponCode: coupon?.code,
    };

    this.checkoutService.placeOrder(request).subscribe({
      next: (order) => {
        this.submitting.set(false);
        this.cartService.loadCart();
        this.router.navigate(['/checkout/confirmation', order.id]);
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        const httpErr = err as { error?: { message?: string } };
        this.errorMessage.set(
          httpErr?.error?.message ?? 'Something went wrong. Please try again.',
        );
      },
    });
  }

  private tryAutoApplyFreeDelivery(): void {
    // Check periodically once cart loads; use a simple interval-free approach
    const checkAndApply = () => {
      const cartData = this.cart();
      if (!cartData || this.freeDeliveryApplied() || this.appliedCoupon()) return;

      if (cartData.totalPrice >= 99) {
        this.checkoutService.validateCoupon('FREE_DELIVERY').subscribe({
          next: (response) => {
            if (!this.appliedCoupon()) {
              this.freeDeliveryApplied.set(true);
              const couponInput = this.couponInputComponent();
              if (couponInput) {
                couponInput.silentApply(response);
              } else {
                this.appliedCoupon.set(response);
              }
            }
          },
          error: () => {
            // Silently ignore if FREE_DELIVERY coupon doesn't exist
          },
        });
      }
    };

    // Try after a short delay to allow cart to load
    setTimeout(checkAndApply, 1000);
  }
}
