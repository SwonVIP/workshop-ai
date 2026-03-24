import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReturningUserComponent } from './returning-user.component';
import { CustomerResponse } from '../../../core/models/customer.model';
import { environment } from '../../../../environments/environment';

describe('ReturningUserComponent', () => {
  let httpMock: HttpTestingController;

  const mockCustomer: CustomerResponse = {
    id: 1,
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    phone: '+41 79 123 45 67',
    street: 'Bahnhofstrasse 1',
    apartment: '3A',
    city: 'Zurich',
    postalCode: '8001',
  };

  function createComponent() {
    const fixture = TestBed.createComponent(ReturningUserComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturningUserComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should render collapsed toggle button', () => {
    // given — the component is created
    const fixture = createComponent();

    // then — toggle button is visible, form is not
    const toggle = fixture.nativeElement.querySelector('[data-testid="returning-user-toggle"]');
    expect(toggle).toBeInstanceOf(HTMLElement);
    expect(toggle.textContent).toContain('Returning customer?');

    const form = fixture.nativeElement.querySelector('[data-testid="returning-user-form"]');
    expect(form).toBeNull();
  });

  it('should show both email and password fields when expanded', () => {
    // given — the component is created
    const fixture = createComponent();
    const component = fixture.componentInstance;

    // when — the toggle is clicked
    component.expanded.set(true);
    fixture.detectChanges();

    // then — both email and password inputs are visible together
    const emailInput = fixture.nativeElement.querySelector('[data-testid="returning-email-input"]');
    const passwordInput = fixture.nativeElement.querySelector('[data-testid="returning-password-input"]');
    const signInBtn = fixture.nativeElement.querySelector('[data-testid="returning-signin-btn"]');
    expect(emailInput).toBeInstanceOf(HTMLInputElement);
    expect(passwordInput).toBeInstanceOf(HTMLInputElement);
    expect(signInBtn).toBeInstanceOf(HTMLButtonElement);
    expect(signInBtn.textContent).toContain('Sign In');
  });

  it('should emit identified event on successful sign in', () => {
    // given — the component is expanded with email and password
    const fixture = createComponent();
    const component = fixture.componentInstance;
    component.expanded.set(true);
    component.email = 'jane@example.com';
    component.password = 'secret123';
    fixture.detectChanges();

    // when — identify succeeds
    const emitSpy = vi.spyOn(component.identified, 'emit');
    component.onSignIn();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/customers/identify`);
    expect(req.request.body).toEqual({ email: 'jane@example.com', password: 'secret123' });
    req.flush(mockCustomer);
    fixture.detectChanges();

    // then — identified event is emitted with customer data
    expect(emitSpy).toHaveBeenCalledWith(mockCustomer);
    expect(component.dismissed()).toBe(true);

    // and — "Welcome back" message is shown with customer name
    const welcomeMsg = fixture.nativeElement.querySelector('[data-testid="returning-identified-message"]');
    expect(welcomeMsg).toBeInstanceOf(HTMLElement);
    expect(welcomeMsg.textContent).toContain('Welcome back, Jane!');

    // and — "Continuing as guest" is NOT shown
    const guestMsg = fixture.nativeElement.querySelector('[data-testid="returning-guest-message"]');
    expect(guestMsg).toBeNull();
  });

  it('should show error message on failed sign in', () => {
    // given — the component is expanded with credentials
    const fixture = createComponent();
    const component = fixture.componentInstance;
    component.expanded.set(true);
    component.email = 'jane@example.com';
    component.password = 'wrong';
    fixture.detectChanges();

    // when — identify returns 404
    component.onSignIn();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/customers/identify`);
    req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    // then — generic error message is shown
    const error = fixture.nativeElement.querySelector('[data-testid="returning-error"]');
    expect(error).toBeInstanceOf(HTMLElement);
    expect(error.textContent).toContain('Unable to sign in');
    expect(component.failedAttempts()).toBe(1);
  });

  it('should dismiss after 3 failed attempts', () => {
    // given — the component is expanded with 2 prior failures
    const fixture = createComponent();
    const component = fixture.componentInstance;
    component.expanded.set(true);
    component.email = 'jane@example.com';
    component.failedAttempts.set(2);
    fixture.detectChanges();

    // when — a third failed attempt occurs
    component.password = 'wrong-again';
    component.onSignIn();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/customers/identify`);
    req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    // then — component is dismissed with guest message
    expect(component.dismissed()).toBe(true);
    const guestMsg = fixture.nativeElement.querySelector('[data-testid="returning-guest-message"]');
    expect(guestMsg).toBeInstanceOf(HTMLElement);
    expect(guestMsg.textContent).toContain('Continuing as guest');
  });
});
