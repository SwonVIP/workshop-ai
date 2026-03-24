import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { CheckoutService } from '../../../core/services/checkout.service';
import { CouponResponse } from '../../../core/models/checkout.model';

@Component({
  selector: 'app-coupon-input',
  imports: [FormsModule, HlmInput, HlmButton, HlmBadge],
  template: `
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-foreground">Coupon Code</h3>

      @if (!appliedCoupon()) {
        <div class="flex gap-2">
          <input
            hlmInput
            type="text"
            placeholder="Enter coupon code"
            class="flex-1"
            [(ngModel)]="couponCode"
            data-testid="coupon-input"
          />
          <button
            hlmBtn
            variant="outline"
            data-testid="coupon-apply-btn"
            [disabled]="!couponCode.trim() || loading()"
            (click)="applyCoupon()"
          >
            @if (loading()) {
              Applying...
            } @else {
              Apply
            }
          </button>
        </div>

        @if (errorMessage()) {
          <p class="text-sm text-destructive" data-testid="coupon-error">
            {{ errorMessage() }}
          </p>
        }
      } @else {
        <div data-testid="coupon-success">
          <p class="text-sm text-green-600 dark:text-green-400 mb-2">
            Coupon applied successfully!
          </p>
          <span
            hlmBadge
            variant="secondary"
            class="inline-flex items-center gap-1.5"
            data-testid="coupon-chip"
          >
            {{ appliedCoupon()!.code }} &mdash; {{ appliedCoupon()!.description }}
            <button
              class="ml-1 hover:text-destructive"
              data-testid="coupon-remove-btn"
              (click)="removeCoupon()"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        </div>
      }
    </div>
  `,
})
export class CouponInputComponent {
  private readonly checkoutService = inject(CheckoutService);

  readonly couponApplied = output<CouponResponse | null>();

  couponCode = '';
  readonly appliedCoupon = signal<CouponResponse | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  applyCoupon(): void {
    const code = this.couponCode.trim();
    if (!code) return;

    const current = this.appliedCoupon();
    if (current && current.code === code.toUpperCase()) {
      this.errorMessage.set('This code is already applied');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.checkoutService.validateCoupon(code).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.appliedCoupon.set(response);
        this.couponCode = '';
        this.couponApplied.emit(response);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('This code is not valid or has expired');
      },
    });
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
    this.couponApplied.emit(null);
  }

  /** Silently apply a coupon (e.g. auto-applied FREE_DELIVERY) */
  silentApply(response: CouponResponse): void {
    this.appliedCoupon.set(response);
    this.couponApplied.emit(response);
  }
}
