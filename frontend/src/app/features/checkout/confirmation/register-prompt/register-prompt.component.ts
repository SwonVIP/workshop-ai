import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { CustomerService } from '../../../../core/services/customer.service';

@Component({
  selector: 'app-register-prompt',
  imports: [FormsModule, HlmInput, HlmButton, ...HlmCardImports],
  template: `
    @if (success()) {
      <div
        hlmCard
        class="mt-6 p-6 text-center"
        data-testid="register-success"
      >
        <div
          class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 mb-3"
        >
          <svg
            class="w-5 h-5 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p class="text-sm font-medium text-foreground">Account created!</p>
        <p class="text-sm text-muted-foreground mt-1">
          Your details have been saved for next time.
        </p>
      </div>
    } @else {
      <div hlmCard class="mt-6 p-6" data-testid="register-prompt">
        <h3 class="text-sm font-semibold text-foreground mb-1">
          Save your details
        </h3>
        <p class="text-sm text-muted-foreground mb-4">
          Set a password to save your details for next time
        </p>

        <div class="flex gap-2">
          <input
            hlmInput
            type="password"
            placeholder="Choose a password"
            class="flex-1"
            [(ngModel)]="password"
            data-testid="register-password-input"
          />
          <button
            hlmBtn
            data-testid="register-submit-btn"
            [disabled]="!password.trim() || loading()"
            (click)="register()"
          >
            @if (loading()) {
              Creating...
            } @else {
              Create Account
            }
          </button>
        </div>

        @if (errorMessage()) {
          <p
            class="text-sm text-destructive mt-2"
            data-testid="register-error"
          >
            {{ errorMessage() }}
          </p>
        }
      </div>
    }
  `,
})
export class RegisterPromptComponent {
  private readonly customerService = inject(CustomerService);

  readonly email = input.required<string>();
  readonly orderId = input.required<number>();

  password = '';
  readonly loading = signal(false);
  readonly success = signal(false);
  readonly errorMessage = signal('');

  register(): void {
    const trimmedPassword = this.password.trim();
    if (!trimmedPassword) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.customerService
      .register({
        email: this.email(),
        password: trimmedPassword,
        orderId: this.orderId(),
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set(true);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          if (err.status === 409) {
            this.errorMessage.set(
              'An account already exists for this email',
            );
          } else {
            this.errorMessage.set(
              'Something went wrong. Please try again.',
            );
          }
        },
      });
  }
}
