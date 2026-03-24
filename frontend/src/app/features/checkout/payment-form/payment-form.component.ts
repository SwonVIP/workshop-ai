import { Component, computed, effect, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmBadge } from '@spartan-ng/helm/badge';

export interface PaymentFormValue {
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardName: string;
}

function futureExpiryValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;

  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!match) return { expiryFormat: true };

  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { expiryPast: true };
  }

  return null;
}

@Component({
  selector: 'app-payment-form',
  imports: [ReactiveFormsModule, HlmInput, HlmLabel, HlmBadge],
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <svg
            class="w-5 h-5 text-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          <h3 class="text-lg font-semibold text-foreground">Payment</h3>
        </div>
        <span
          hlmBadge
          variant="outline"
          class="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
          data-testid="test-mode-badge"
        >
          Test Mode - No real charges
        </span>
      </div>

      <form [formGroup]="form" class="space-y-4">
        <div class="space-y-1.5">
          <label hlmLabel for="cardName">Cardholder Name</label>
          <input
            hlmInput
            id="cardName"
            formControlName="cardName"
            type="text"
            autocomplete="cc-name"
            placeholder="Full name on card"
            class="w-full"
            [attr.aria-describedby]="form.controls['cardName'].touched && form.controls['cardName'].invalid ? 'cardName-error' : null"
            data-testid="card-name-input"
          />
          @if (form.controls['cardName'].touched && form.controls['cardName'].hasError('required')) {
            <p id="cardName-error" class="text-sm text-destructive" data-testid="card-name-error">
              Cardholder name is required
            </p>
          }
        </div>

        <div class="space-y-1.5">
          <label hlmLabel for="cardNumber">Card Number</label>
          <input
            hlmInput
            id="cardNumber"
            formControlName="cardNumber"
            type="text"
            inputmode="numeric"
            autocomplete="cc-number"
            placeholder="1234 5678 9012 3456"
            maxlength="19"
            class="w-full"
            (input)="onCardNumberInput($event)"
            [attr.aria-describedby]="form.controls['cardNumber'].touched && form.controls['cardNumber'].invalid ? 'cardNumber-error' : null"
            data-testid="card-number-input"
          />
          @if (form.controls['cardNumber'].touched && form.controls['cardNumber'].invalid) {
            <p id="cardNumber-error" class="text-sm text-destructive" data-testid="card-number-error">
              @if (form.controls['cardNumber'].hasError('required')) {
                Card number is required
              } @else {
                Card number must be exactly 16 digits
              }
            </p>
          }
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label hlmLabel for="cardExpiry">Expiry Date</label>
            <input
              hlmInput
              id="cardExpiry"
              formControlName="cardExpiry"
              type="text"
              inputmode="numeric"
              autocomplete="cc-exp"
              placeholder="MM/YY"
              maxlength="5"
              class="w-full"
              (input)="onExpiryInput($event)"
              [attr.aria-describedby]="form.controls['cardExpiry'].touched && form.controls['cardExpiry'].invalid ? 'cardExpiry-error' : null"
              data-testid="card-expiry-input"
            />
            @if (form.controls['cardExpiry'].touched && form.controls['cardExpiry'].invalid) {
              <p id="cardExpiry-error" class="text-sm text-destructive" data-testid="card-expiry-error">
                @if (form.controls['cardExpiry'].hasError('required')) {
                  Expiry date is required
                } @else if (form.controls['cardExpiry'].hasError('expiryFormat')) {
                  Enter a valid date (MM/YY)
                } @else if (form.controls['cardExpiry'].hasError('expiryPast')) {
                  Card has expired
                }
              </p>
            }
          </div>

          <div class="space-y-1.5">
            <label hlmLabel for="cardCvv">CVV</label>
            <input
              hlmInput
              id="cardCvv"
              formControlName="cardCvv"
              type="text"
              inputmode="numeric"
              autocomplete="cc-csc"
              placeholder="123"
              maxlength="3"
              class="w-full"
              (input)="onCvvInput($event)"
              [attr.aria-describedby]="form.controls['cardCvv'].touched && form.controls['cardCvv'].invalid ? 'cardCvv-error' : null"
              data-testid="card-cvv-input"
            />
            @if (form.controls['cardCvv'].touched && form.controls['cardCvv'].invalid) {
              <p id="cardCvv-error" class="text-sm text-destructive" data-testid="card-cvv-error">
                @if (form.controls['cardCvv'].hasError('required')) {
                  CVV is required
                } @else {
                  CVV must be exactly 3 digits
                }
              </p>
            }
          </div>
        </div>
      </form>
    </div>
  `,
})
export class PaymentFormComponent {
  readonly formValid = output<boolean>();
  readonly formValue = output<PaymentFormValue>();

  private readonly fb = new FormBuilder();

  readonly form: FormGroup = this.fb.group({
    cardName: ['', [Validators.required]],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{4} \d{4} \d{4} \d{4}$/)]],
    cardExpiry: ['', [Validators.required, futureExpiryValidator]],
    cardCvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
  });

  private readonly isValid = computed(() => {
    // Force signal dependency via status tracking
    return this.form.valid;
  });

  constructor() {
    let previousValid: boolean | undefined;

    this.form.statusChanges.subscribe(() => {
      const valid = this.form.valid;
      if (valid !== previousValid) {
        previousValid = valid;
        this.formValid.emit(valid);
      }
      if (valid) {
        const raw = this.form.getRawValue();
        this.formValue.emit({
          cardNumber: raw.cardNumber.replace(/\s/g, ''),
          cardExpiry: raw.cardExpiry,
          cardCvv: raw.cardCvv,
          cardName: raw.cardName,
        });
      }
    });
  }

  onCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.form.controls['cardNumber'].setValue(formatted, { emitEvent: true });
    input.value = formatted;
  }

  onExpiryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let digits = input.value.replace(/\D/g, '').slice(0, 4);
    let formatted = digits;
    if (digits.length >= 3) {
      formatted = digits.slice(0, 2) + '/' + digits.slice(2);
    } else if (digits.length === 2 && !input.value.includes('/')) {
      formatted = digits + '/';
    }
    this.form.controls['cardExpiry'].setValue(formatted, { emitEvent: true });
    input.value = formatted;
  }

  onCvvInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 3);
    this.form.controls['cardCvv'].setValue(digits, { emitEvent: true });
    input.value = digits;
  }
}
