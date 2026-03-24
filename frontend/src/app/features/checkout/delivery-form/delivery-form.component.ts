import { Component, output, computed, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';

@Component({
  selector: 'app-delivery-form',
  imports: [ReactiveFormsModule, HlmInput, HlmLabel],
  template: `
    <section data-testid="delivery-form">
      <h3 class="text-lg font-semibold text-foreground mb-4">Delivery Information</h3>
      <form [formGroup]="form" class="space-y-4">
        <!-- First / Last Name -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label hlmLabel for="firstName">First Name</label>
            <input
              hlmInput
              id="firstName"
              formControlName="firstName"
              placeholder="First name"
              class="w-full mt-1"
              data-testid="input-firstName"
              (blur)="onTouched()"
            />
            @if (showError('firstName')) {
              <p class="text-destructive text-sm mt-1" data-testid="error-firstName">
                First name is required.
              </p>
            }
          </div>
          <div>
            <label hlmLabel for="lastName">Last Name</label>
            <input
              hlmInput
              id="lastName"
              formControlName="lastName"
              placeholder="Last name"
              class="w-full mt-1"
              data-testid="input-lastName"
              (blur)="onTouched()"
            />
            @if (showError('lastName')) {
              <p class="text-destructive text-sm mt-1" data-testid="error-lastName">
                Last name is required.
              </p>
            }
          </div>
        </div>

        <!-- Email -->
        <div>
          <label hlmLabel for="email">Email</label>
          <input
            hlmInput
            id="email"
            type="email"
            formControlName="email"
            placeholder="you@example.com"
            class="w-full mt-1"
            data-testid="input-email"
            (blur)="onTouched()"
          />
          @if (showError('email')) {
            <p class="text-destructive text-sm mt-1" data-testid="error-email">
              @if (form.controls.email.errors?.['required']) {
                Email is required.
              } @else {
                Please enter a valid email address.
              }
            </p>
          }
        </div>

        <!-- Phone -->
        <div>
          <label hlmLabel for="phone">Phone</label>
          <input
            hlmInput
            id="phone"
            type="tel"
            formControlName="phone"
            placeholder="+41 79 123 45 67"
            class="w-full mt-1"
            data-testid="input-phone"
            (blur)="onTouched()"
          />
          @if (showError('phone')) {
            <p class="text-destructive text-sm mt-1" data-testid="error-phone">
              @if (form.controls.phone.errors?.['required']) {
                Phone is required.
              } @else {
                Please enter a valid phone number.
              }
            </p>
          }
        </div>

        <!-- Street -->
        <div>
          <label hlmLabel for="street">Street Address</label>
          <input
            hlmInput
            id="street"
            formControlName="street"
            placeholder="Street and number"
            class="w-full mt-1"
            data-testid="input-street"
            (blur)="onTouched()"
          />
          @if (showError('street')) {
            <p class="text-destructive text-sm mt-1" data-testid="error-street">
              Street address is required.
            </p>
          }
        </div>

        <!-- Apartment (optional) -->
        <div>
          <label hlmLabel for="apartment">Apartment / Suite (optional)</label>
          <input
            hlmInput
            id="apartment"
            formControlName="apartment"
            placeholder="Apt, suite, unit, etc."
            class="w-full mt-1"
            data-testid="input-apartment"
          />
        </div>

        <!-- City / Postal Code -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label hlmLabel for="city">City</label>
            <input
              hlmInput
              id="city"
              formControlName="city"
              placeholder="City"
              class="w-full mt-1"
              data-testid="input-city"
              (blur)="onTouched()"
            />
            @if (showError('city')) {
              <p class="text-destructive text-sm mt-1" data-testid="error-city">
                City is required.
              </p>
            }
          </div>
          <div>
            <label hlmLabel for="postalCode">Postal Code</label>
            <input
              hlmInput
              id="postalCode"
              formControlName="postalCode"
              placeholder="1234"
              class="w-full mt-1"
              data-testid="input-postalCode"
              (blur)="onTouched()"
            />
            @if (showError('postalCode')) {
              <p class="text-destructive text-sm mt-1" data-testid="error-postalCode">
                @if (form.controls.postalCode.errors?.['required']) {
                  Postal code is required.
                } @else {
                  Postal code must be 4 digits.
                }
              </p>
            }
          </div>
        </div>

        <!-- Delivery Instructions (optional) -->
        <div>
          <label hlmLabel for="deliveryInstructions">Delivery Instructions (optional)</label>
          <textarea
            id="deliveryInstructions"
            formControlName="deliveryInstructions"
            placeholder="Ring the doorbell twice, leave at the door, etc."
            rows="3"
            class="file:text-foreground placeholder:text-muted-foreground border-input focus-visible:border-ring focus-visible:ring-ring/50 flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm mt-1"
            data-testid="input-deliveryInstructions"
          ></textarea>
        </div>
      </form>
    </section>
  `,
})
export class DeliveryFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly formValidity = output<boolean>();
  readonly formValue = output<Record<string, unknown>>();

  private _submitAttempted = false;

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-()]{7,}$/)]],
    street: ['', [Validators.required]],
    apartment: [''],
    city: ['', [Validators.required]],
    postalCode: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
    deliveryInstructions: [''],
  });

  constructor() {
    this.form.statusChanges.subscribe(() => {
      this.formValidity.emit(this.form.valid);
      this.formValue.emit(this.form.getRawValue());
    });
  }

  patchValues(data: Partial<Record<string, string>>): void {
    this.form.patchValue(data);
  }

  markAllTouched(): void {
    this._submitAttempted = true;
    this.form.markAllAsTouched();
  }

  showError(field: string): boolean {
    const control = this.form.get(field);
    if (!control) return false;
    return control.invalid && (control.touched || this._submitAttempted);
  }

  onTouched(): void {
    this.formValidity.emit(this.form.valid);
    this.formValue.emit(this.form.getRawValue());
  }
}
