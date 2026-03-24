import { TestBed } from '@angular/core/testing';
import { PaymentFormComponent } from './payment-form.component';

describe('PaymentFormComponent', () => {
  function createComponent() {
    const fixture = TestBed.createComponent(PaymentFormComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentFormComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance).toBeInstanceOf(PaymentFormComponent);
  });

  it('should have an invalid form when all fields are empty', () => {
    // given — the component is created with default state
    const fixture = createComponent();

    // then — the form is invalid
    expect(fixture.componentInstance.form.valid).toBe(false);
  });

  it('should have a valid form when all fields are filled correctly', () => {
    // given — the component is created
    const fixture = createComponent();
    const form = fixture.componentInstance.form;

    // when — all fields are filled with valid values
    form.controls['cardName'].setValue('John Doe');
    form.controls['cardNumber'].setValue('4242 4242 4242 4242');
    form.controls['cardExpiry'].setValue('12/30');
    form.controls['cardCvv'].setValue('123');

    // then — the form is valid
    expect(form.valid).toBe(true);
  });

  it('should format card number with spaces every 4 digits', () => {
    // given — the component is rendered
    const fixture = createComponent();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('[data-testid="card-number-input"]');

    // when — the user types digits into the card number field
    input.value = '4242424242424242';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // then — the value is formatted with spaces
    expect(fixture.componentInstance.form.controls['cardNumber'].value).toBe('4242 4242 4242 4242');
    expect(input.value).toBe('4242 4242 4242 4242');
  });

  it('should strip non-digit characters from card number input', () => {
    // given — the component is rendered
    const fixture = createComponent();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('[data-testid="card-number-input"]');

    // when — the user types non-digit characters
    input.value = '4242-abcd-4242-4242-4242';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // then — only digits remain, formatted with spaces
    expect(fixture.componentInstance.form.controls['cardNumber'].value).toBe('4242 4242 4242 4242');
  });

  it('should reject card number that is not exactly 16 digits', () => {
    // given — the component is created
    const fixture = createComponent();
    const form = fixture.componentInstance.form;

    // when — fewer than 16 digits are entered
    form.controls['cardNumber'].setValue('4242 4242');
    form.controls['cardNumber'].markAsTouched();

    // then — the control is invalid
    expect(form.controls['cardNumber'].valid).toBe(false);
  });

  it('should accept card number that is exactly 16 digits with spaces', () => {
    // given — the component is created
    const fixture = createComponent();
    const form = fixture.componentInstance.form;

    // when — exactly 16 digits are entered (formatted)
    form.controls['cardNumber'].setValue('4242 4242 4242 4242');

    // then — the control is valid
    expect(form.controls['cardNumber'].valid).toBe(true);
  });

  it('should reject an expiry date in the past', () => {
    // given — the component is created
    const fixture = createComponent();
    const form = fixture.componentInstance.form;

    // when — a past date is entered
    form.controls['cardExpiry'].setValue('01/20');
    form.controls['cardExpiry'].markAsTouched();

    // then — the control is invalid with expiryPast error
    expect(form.controls['cardExpiry'].valid).toBe(false);
    expect(form.controls['cardExpiry'].hasError('expiryPast')).toBe(true);
  });

  it('should reject an expiry date with invalid month', () => {
    // given — the component is created
    const fixture = createComponent();
    const form = fixture.componentInstance.form;

    // when — an invalid month is entered
    form.controls['cardExpiry'].setValue('13/30');
    form.controls['cardExpiry'].markAsTouched();

    // then — the control is invalid with expiryFormat error
    expect(form.controls['cardExpiry'].valid).toBe(false);
    expect(form.controls['cardExpiry'].hasError('expiryFormat')).toBe(true);
  });

  it('should accept a valid future expiry date', () => {
    // given — the component is created
    const fixture = createComponent();
    const form = fixture.componentInstance.form;

    // when — a valid future date is entered
    form.controls['cardExpiry'].setValue('12/30');

    // then — the control is valid
    expect(form.controls['cardExpiry'].valid).toBe(true);
  });

  it('should auto-insert slash after two digits in expiry input', () => {
    // given — the component is rendered
    const fixture = createComponent();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('[data-testid="card-expiry-input"]');

    // when — user types two digits
    input.value = '12';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // then — slash is auto-inserted
    expect(input.value).toBe('12/');
  });

  it('should reject CVV that is not exactly 3 digits', () => {
    // given — the component is created
    const fixture = createComponent();
    const form = fixture.componentInstance.form;

    // when — fewer than 3 digits are entered
    form.controls['cardCvv'].setValue('12');
    form.controls['cardCvv'].markAsTouched();

    // then — the control is invalid
    expect(form.controls['cardCvv'].valid).toBe(false);
  });

  it('should accept CVV that is exactly 3 digits', () => {
    // given — the component is created
    const fixture = createComponent();
    const form = fixture.componentInstance.form;

    // when — exactly 3 digits are entered
    form.controls['cardCvv'].setValue('123');

    // then — the control is valid
    expect(form.controls['cardCvv'].valid).toBe(true);
  });

  it('should strip non-digit characters from CVV input', () => {
    // given — the component is rendered
    const fixture = createComponent();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('[data-testid="card-cvv-input"]');

    // when — user types non-digit characters
    input.value = '1a2b3c';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // then — only digits remain
    expect(input.value).toBe('123');
  });

  it('should display error message for card name when touched and empty', () => {
    // given — the component is rendered
    const fixture = createComponent();
    const form = fixture.componentInstance.form;

    // when — card name is touched but left empty
    form.controls['cardName'].markAsTouched();
    fixture.detectChanges();

    // then — error message is displayed
    const error = fixture.nativeElement.querySelector('[data-testid="card-name-error"]');
    expect(error).toBeInstanceOf(HTMLElement);
    expect(error.textContent).toContain('Cardholder name is required');
  });

  it('should display error message for card number when touched and invalid', () => {
    // given — the component is rendered
    const fixture = createComponent();
    const form = fixture.componentInstance.form;

    // when — card number is touched but left empty
    form.controls['cardNumber'].markAsTouched();
    fixture.detectChanges();

    // then — error message is displayed
    const error = fixture.nativeElement.querySelector('[data-testid="card-number-error"]');
    expect(error).toBeInstanceOf(HTMLElement);
    expect(error.textContent).toContain('Card number is required');
  });

  it('should display pattern error for card number when partially filled', () => {
    // given — the component is rendered
    const fixture = createComponent();
    const form = fixture.componentInstance.form;

    // when — card number is set to incomplete value and touched
    form.controls['cardNumber'].setValue('4242');
    form.controls['cardNumber'].markAsTouched();
    fixture.detectChanges();

    // then — pattern error message is displayed
    const error = fixture.nativeElement.querySelector('[data-testid="card-number-error"]');
    expect(error).toBeInstanceOf(HTMLElement);
    expect(error.textContent).toContain('Card number must be exactly 16 digits');
  });

  it('should display error message for expiry when touched and empty', () => {
    // given — the component is rendered
    const fixture = createComponent();
    const form = fixture.componentInstance.form;

    // when — expiry is touched but left empty
    form.controls['cardExpiry'].markAsTouched();
    fixture.detectChanges();

    // then — error message is displayed
    const error = fixture.nativeElement.querySelector('[data-testid="card-expiry-error"]');
    expect(error).toBeInstanceOf(HTMLElement);
    expect(error.textContent).toContain('Expiry date is required');
  });

  it('should display error message for CVV when touched and empty', () => {
    // given — the component is rendered
    const fixture = createComponent();
    const form = fixture.componentInstance.form;

    // when — CVV is touched but left empty
    form.controls['cardCvv'].markAsTouched();
    fixture.detectChanges();

    // then — error message is displayed
    const error = fixture.nativeElement.querySelector('[data-testid="card-cvv-error"]');
    expect(error).toBeInstanceOf(HTMLElement);
    expect(error.textContent).toContain('CVV is required');
  });

  it('should not display error messages when fields are untouched', () => {
    // given — the component is created with default state
    const fixture = createComponent();

    // then — no error messages are displayed
    expect(fixture.nativeElement.querySelector('[data-testid="card-name-error"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="card-number-error"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="card-expiry-error"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="card-cvv-error"]')).toBeNull();
  });

  it('should display the test mode badge', () => {
    // given — the component is rendered
    const fixture = createComponent();

    // then — the test mode badge is visible
    const badge = fixture.nativeElement.querySelector('[data-testid="test-mode-badge"]');
    expect(badge).toBeInstanceOf(HTMLElement);
    expect(badge.textContent).toContain('Test Mode - No real charges');
  });

  it('should emit formValid and formValue when form becomes valid', () => {
    // given — the component is created
    const fixture = createComponent();
    const component = fixture.componentInstance;
    const validEmissions: boolean[] = [];
    const valueEmissions: unknown[] = [];
    component.formValid.subscribe((v: boolean) => validEmissions.push(v));
    component.formValue.subscribe((v: unknown) => valueEmissions.push(v));

    // when — all fields are filled with valid values
    component.form.controls['cardName'].setValue('John Doe');
    component.form.controls['cardNumber'].setValue('4242 4242 4242 4242');
    component.form.controls['cardExpiry'].setValue('12/30');
    component.form.controls['cardCvv'].setValue('123');

    // then — formValid emits true and formValue emits the card data
    expect(validEmissions).toContain(true);
    expect(valueEmissions.length).toBeGreaterThan(0);
    expect(valueEmissions[valueEmissions.length - 1]).toEqual({
      cardNumber: '4242424242424242',
      cardExpiry: '12/30',
      cardCvv: '123',
      cardName: 'John Doe',
    });
  });

  it('should have proper labels associated with inputs', () => {
    // given — the component is rendered
    const fixture = createComponent();

    // then — each input has an associated label via for/id
    const labels = fixture.nativeElement.querySelectorAll('label');
    for (const label of labels) {
      const forAttr = label.getAttribute('for');
      expect(forAttr).toBeTruthy();
      const input = fixture.nativeElement.querySelector(`#${forAttr}`);
      expect(input).toBeInstanceOf(HTMLElement);
    }
  });

  it('should have proper autocomplete attributes on inputs', () => {
    // given — the component is rendered
    const fixture = createComponent();

    // then — each input has the correct autocomplete attribute
    expect(fixture.nativeElement.querySelector('[data-testid="card-name-input"]').getAttribute('autocomplete')).toBe('cc-name');
    expect(fixture.nativeElement.querySelector('[data-testid="card-number-input"]').getAttribute('autocomplete')).toBe('cc-number');
    expect(fixture.nativeElement.querySelector('[data-testid="card-expiry-input"]').getAttribute('autocomplete')).toBe('cc-exp');
    expect(fixture.nativeElement.querySelector('[data-testid="card-cvv-input"]').getAttribute('autocomplete')).toBe('cc-csc');
  });
});
