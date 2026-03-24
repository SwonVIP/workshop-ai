import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CouponInputComponent } from './coupon-input.component';
import { environment } from '../../../../environments/environment';

describe('CouponInputComponent', () => {
  let httpMock: HttpTestingController;

  function createComponent() {
    const fixture = TestBed.createComponent(CouponInputComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouponInputComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should render input and apply button', () => {
    // given — the component is created
    const fixture = createComponent();

    // then — input and button are present
    const input = fixture.nativeElement.querySelector('[data-testid="coupon-input"]');
    const button = fixture.nativeElement.querySelector('[data-testid="coupon-apply-btn"]');
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect(button).toBeInstanceOf(HTMLButtonElement);
  });

  it('should show error on invalid coupon', () => {
    // given — the component is created
    const fixture = createComponent();
    const component = fixture.componentInstance;

    // when — an invalid coupon is submitted
    component.couponCode = 'INVALID';
    component.applyCoupon();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/coupons/validate`);
    req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    // then — error message is displayed
    const error = fixture.nativeElement.querySelector('[data-testid="coupon-error"]');
    expect(error).toBeInstanceOf(HTMLElement);
    expect(error.textContent).toContain('This code is not valid or has expired');
  });

  it('should show chip on valid coupon', () => {
    // given — the component is created
    const fixture = createComponent();
    const component = fixture.componentInstance;

    // when — a valid coupon is submitted
    component.couponCode = 'SAVE10';
    component.applyCoupon();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/coupons/validate`);
    req.flush({ code: 'SAVE10', type: 'FIXED_AMOUNT', value: 10, description: 'CHF 10 off' });
    fixture.detectChanges();

    // then — coupon chip is displayed
    const chip = fixture.nativeElement.querySelector('[data-testid="coupon-chip"]');
    expect(chip).toBeInstanceOf(HTMLElement);
    expect(chip.textContent).toContain('SAVE10');

    const success = fixture.nativeElement.querySelector('[data-testid="coupon-success"]');
    expect(success).toBeInstanceOf(HTMLElement);
  });
});
