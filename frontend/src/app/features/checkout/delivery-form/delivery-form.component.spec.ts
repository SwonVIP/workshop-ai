import { TestBed } from '@angular/core/testing';
import { DeliveryFormComponent } from './delivery-form.component';

describe('DeliveryFormComponent', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [DeliveryFormComponent],
    });

    const fixture = TestBed.createComponent(DeliveryFormComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  it('should create the delivery form component', () => {
    const { component } = setup();
    expect(component).toBeInstanceOf(DeliveryFormComponent);
  });

  it('should render all required form fields', () => {
    const { fixture } = setup();
    const el = fixture.nativeElement;

    expect(el.querySelector('[data-testid="input-firstName"]')).toBeInstanceOf(HTMLInputElement);
    expect(el.querySelector('[data-testid="input-lastName"]')).toBeInstanceOf(HTMLInputElement);
    expect(el.querySelector('[data-testid="input-email"]')).toBeInstanceOf(HTMLInputElement);
    expect(el.querySelector('[data-testid="input-phone"]')).toBeInstanceOf(HTMLInputElement);
    expect(el.querySelector('[data-testid="input-street"]')).toBeInstanceOf(HTMLInputElement);
    expect(el.querySelector('[data-testid="input-apartment"]')).toBeInstanceOf(HTMLInputElement);
    expect(el.querySelector('[data-testid="input-city"]')).toBeInstanceOf(HTMLInputElement);
    expect(el.querySelector('[data-testid="input-postalCode"]')).toBeInstanceOf(HTMLInputElement);
    expect(el.querySelector('[data-testid="input-deliveryInstructions"]')).toBeInstanceOf(
      HTMLTextAreaElement,
    );
  });

  // ── Validation: required fields ─────────────────────────────────

  describe('required field validation', () => {
    it('should show error for firstName when touched and empty', () => {
      const { fixture, component } = setup();

      component.form.controls.firstName.markAsTouched();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('[data-testid="error-firstName"]');
      expect(error).toBeInstanceOf(HTMLElement);
      expect(error.textContent).toContain('First name is required');
    });

    it('should show error for lastName when touched and empty', () => {
      const { fixture, component } = setup();

      component.form.controls.lastName.markAsTouched();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('[data-testid="error-lastName"]');
      expect(error).toBeInstanceOf(HTMLElement);
      expect(error.textContent).toContain('Last name is required');
    });

    it('should show error for email when touched and empty', () => {
      const { fixture, component } = setup();

      component.form.controls.email.markAsTouched();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('[data-testid="error-email"]');
      expect(error).toBeInstanceOf(HTMLElement);
      expect(error.textContent).toContain('Email is required');
    });

    it('should show error for phone when touched and empty', () => {
      const { fixture, component } = setup();

      component.form.controls.phone.markAsTouched();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('[data-testid="error-phone"]');
      expect(error).toBeInstanceOf(HTMLElement);
      expect(error.textContent).toContain('Phone is required');
    });

    it('should show error for street when touched and empty', () => {
      const { fixture, component } = setup();

      component.form.controls.street.markAsTouched();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('[data-testid="error-street"]');
      expect(error).toBeInstanceOf(HTMLElement);
      expect(error.textContent).toContain('Street address is required');
    });

    it('should show error for city when touched and empty', () => {
      const { fixture, component } = setup();

      component.form.controls.city.markAsTouched();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('[data-testid="error-city"]');
      expect(error).toBeInstanceOf(HTMLElement);
      expect(error.textContent).toContain('City is required');
    });

    it('should show error for postalCode when touched and empty', () => {
      const { fixture, component } = setup();

      component.form.controls.postalCode.markAsTouched();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('[data-testid="error-postalCode"]');
      expect(error).toBeInstanceOf(HTMLElement);
      expect(error.textContent).toContain('Postal code is required');
    });
  });

  // ── Validation: patterns ────────────────────────────────────────

  describe('pattern validation', () => {
    it('should show email format error for invalid email', () => {
      const { fixture, component } = setup();

      component.form.controls.email.setValue('not-an-email');
      component.form.controls.email.markAsTouched();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('[data-testid="error-email"]');
      expect(error).toBeInstanceOf(HTMLElement);
      expect(error.textContent).toContain('valid email');
    });

    it('should not show error for valid email', () => {
      const { fixture, component } = setup();

      component.form.controls.email.setValue('john@example.com');
      component.form.controls.email.markAsTouched();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('[data-testid="error-email"]');
      expect(error).toBeNull();
    });

    it('should show postalCode format error for non-4-digit value', () => {
      const { fixture, component } = setup();

      component.form.controls.postalCode.setValue('123');
      component.form.controls.postalCode.markAsTouched();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('[data-testid="error-postalCode"]');
      expect(error).toBeInstanceOf(HTMLElement);
      expect(error.textContent).toContain('4 digits');
    });

    it('should not show error for valid 4-digit postalCode', () => {
      const { fixture, component } = setup();

      component.form.controls.postalCode.setValue('8001');
      component.form.controls.postalCode.markAsTouched();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('[data-testid="error-postalCode"]');
      expect(error).toBeNull();
    });

    it('should show phone format error for invalid phone', () => {
      const { fixture, component } = setup();

      component.form.controls.phone.setValue('abc');
      component.form.controls.phone.markAsTouched();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('[data-testid="error-phone"]');
      expect(error).toBeInstanceOf(HTMLElement);
      expect(error.textContent).toContain('valid phone');
    });

    it('should not show error for valid phone number', () => {
      const { fixture, component } = setup();

      component.form.controls.phone.setValue('+41 79 123 45 67');
      component.form.controls.phone.markAsTouched();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('[data-testid="error-phone"]');
      expect(error).toBeNull();
    });
  });

  // ── No errors for optional fields ───────────────────────────────

  describe('optional fields', () => {
    it('should not require apartment', () => {
      const { fixture, component } = setup();

      component.form.controls.apartment.markAsTouched();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('[data-testid="error-apartment"]');
      expect(error).toBeNull();
    });

    it('should not require deliveryInstructions', () => {
      const { component } = setup();

      expect(component.form.controls.deliveryInstructions.valid).toBe(true);
    });
  });

  // ── Form validity ───────────────────────────────────────────────

  describe('form validity', () => {
    it('should be invalid when empty', () => {
      const { component } = setup();
      expect(component.form.valid).toBe(false);
    });

    it('should be valid when all required fields are filled correctly', () => {
      const { component } = setup();

      component.form.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+41791234567',
        street: 'Main St 1',
        city: 'Zurich',
        postalCode: '8001',
      });

      expect(component.form.valid).toBe(true);
    });
  });

  // ── markAllTouched ──────────────────────────────────────────────

  describe('markAllTouched', () => {
    it('should show all errors after markAllTouched is called', () => {
      const { fixture, component } = setup();

      component.markAllTouched();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[data-testid="error-firstName"]')).toBeInstanceOf(
        HTMLElement,
      );
      expect(fixture.nativeElement.querySelector('[data-testid="error-lastName"]')).toBeInstanceOf(
        HTMLElement,
      );
      expect(fixture.nativeElement.querySelector('[data-testid="error-email"]')).toBeInstanceOf(
        HTMLElement,
      );
      expect(fixture.nativeElement.querySelector('[data-testid="error-phone"]')).toBeInstanceOf(
        HTMLElement,
      );
      expect(fixture.nativeElement.querySelector('[data-testid="error-street"]')).toBeInstanceOf(
        HTMLElement,
      );
      expect(fixture.nativeElement.querySelector('[data-testid="error-city"]')).toBeInstanceOf(
        HTMLElement,
      );
      expect(
        fixture.nativeElement.querySelector('[data-testid="error-postalCode"]'),
      ).toBeInstanceOf(HTMLElement);
    });
  });
});
