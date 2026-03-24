import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmButton } from '@spartan-ng/helm/button';
import { CustomerService } from '../../../core/services/customer.service';
import { CustomerResponse } from '../../../core/models/customer.model';

@Component({
  selector: 'app-returning-user',
  imports: [FormsModule, HlmInput, HlmButton],
  template: `
    @if (!dismissed()) {
      <div class="space-y-4" data-testid="returning-user-section">
        <button
          class="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          data-testid="returning-user-toggle"
          [attr.aria-expanded]="expanded()"
          aria-controls="returning-user-form-panel"
          (click)="expanded.set(!expanded())"
        >
          <svg
            class="w-4 h-4 transition-transform"
            [class.rotate-90]="expanded()"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          Returning customer?
        </button>

        @if (expanded()) {
          <div class="space-y-3 pl-6" id="returning-user-form-panel" data-testid="returning-user-form">
            <input
              hlmInput
              type="email"
              placeholder="Enter your email"
              aria-label="Email address"
              class="w-full"
              [(ngModel)]="email"
              data-testid="returning-email-input"
            />
            <div class="flex gap-2">
              <input
                hlmInput
                type="password"
                placeholder="Enter your password"
                aria-label="Password"
                class="flex-1"
                [(ngModel)]="password"
                data-testid="returning-password-input"
                (keydown.enter)="onSignIn()"
              />
              <button
                hlmBtn
                variant="outline"
                data-testid="returning-signin-btn"
                [disabled]="!email.trim() || !password.trim() || loading()"
                (click)="onSignIn()"
              >
                @if (loading()) {
                  Signing in...
                } @else {
                  Sign In
                }
              </button>
            </div>

            @if (errorMessage()) {
              <p
                class="text-sm text-destructive"
                role="alert"
                aria-live="polite"
                data-testid="returning-error"
              >
                {{ errorMessage() }}
              </p>
            }
          </div>
        }
      </div>
    } @else if (isIdentified()) {
      <p
        class="text-sm text-muted-foreground flex items-center gap-1.5"
        data-testid="returning-identified-message"
      >
        <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Welcome back, {{ customerName() }}!
      </p>
    } @else {
      <p
        class="text-sm text-muted-foreground italic"
        data-testid="returning-guest-message"
      >
        Continuing as guest
      </p>
    }
  `,
})
export class ReturningUserComponent {
  private readonly customerService = inject(CustomerService);

  readonly identified = output<CustomerResponse>();

  email = '';
  password = '';

  readonly expanded = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly dismissed = signal(false);
  readonly isIdentified = signal(false);
  readonly customerName = signal('');
  readonly failedAttempts = signal(0);

  private readonly maxAttempts = 3;

  onSignIn(): void {
    const trimmedEmail = this.email.trim();
    const trimmedPassword = this.password.trim();
    if (!trimmedEmail || !trimmedPassword) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.customerService
      .identify({ email: trimmedEmail, password: trimmedPassword })
      .subscribe({
        next: (customer) => {
          this.loading.set(false);
          this.identified.emit(customer);
          this.customerName.set(customer.firstName);
          this.isIdentified.set(true);
          this.dismissed.set(true);
        },
        error: () => {
          this.loading.set(false);
          const attempts = this.failedAttempts() + 1;
          this.failedAttempts.set(attempts);

          if (attempts >= this.maxAttempts) {
            this.dismissed.set(true);
          } else {
            this.errorMessage.set('Unable to sign in. Please try again.');
            this.password = '';
          }
        },
      });
  }
}
