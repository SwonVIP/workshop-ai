import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { RegisterPromptComponent } from './register-prompt.component';
import { environment } from '../../../../../environments/environment';

@Component({
  imports: [RegisterPromptComponent],
  template: `<app-register-prompt [email]="email" [orderId]="orderId" />`,
})
class TestHostComponent {
  email = 'john@example.com';
  orderId = 42;
}

describe('RegisterPromptComponent', () => {
  let httpMock: HttpTestingController;
  let fixture: ComponentFixture<TestHostComponent>;

  function createComponent() {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    return fixture;
  }

  function getRegisterPrompt(): RegisterPromptComponent {
    return fixture.debugElement.children[0].componentInstance;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should render password input and create account button', () => {
    // given -- the component is created
    createComponent();

    // then -- input and button are present
    const input = fixture.nativeElement.querySelector(
      '[data-testid="register-password-input"]',
    );
    const button = fixture.nativeElement.querySelector(
      '[data-testid="register-submit-btn"]',
    );
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect(input.type).toBe('password');
    expect(button).toBeInstanceOf(HTMLButtonElement);
    expect(button.textContent).toContain('Create Account');
  });

  it('should disable button when password is empty', () => {
    // given -- the component is created with no password
    createComponent();

    // then -- button is disabled
    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[data-testid="register-submit-btn"]',
    );
    expect(button.disabled).toBe(true);
  });

  it('should show success message after successful registration', () => {
    // given -- the component is created
    createComponent();
    const component = getRegisterPrompt();

    // when -- a password is submitted and the API returns success
    component.password = 'SecurePass123';
    component.register();
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/customers/register`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'john@example.com',
      password: 'SecurePass123',
      orderId: 42,
    });
    req.flush({
      id: 1,
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+41791234567',
      street: 'Bahnhofstrasse 1',
      apartment: null,
      city: 'Zurich',
      postalCode: '8001',
    });
    fixture.detectChanges();

    // then -- success message is shown and form is hidden
    const success = fixture.nativeElement.querySelector(
      '[data-testid="register-success"]',
    );
    expect(success).toBeInstanceOf(HTMLElement);
    expect(success.textContent).toContain('Account created!');

    const prompt = fixture.nativeElement.querySelector(
      '[data-testid="register-prompt"]',
    );
    expect(prompt).toBeNull();
  });

  it('should show conflict error when email already exists', () => {
    // given -- the component is created
    createComponent();
    const component = getRegisterPrompt();

    // when -- a password is submitted and the API returns 409
    component.password = 'SecurePass123';
    component.register();
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/customers/register`,
    );
    req.flush(
      { message: 'Email already registered' },
      { status: 409, statusText: 'Conflict' },
    );
    fixture.detectChanges();

    // then -- conflict error message is displayed
    const error = fixture.nativeElement.querySelector(
      '[data-testid="register-error"]',
    );
    expect(error).toBeInstanceOf(HTMLElement);
    expect(error.textContent).toContain(
      'An account already exists for this email',
    );
  });

  it('should show generic error on unexpected failure', () => {
    // given -- the component is created
    createComponent();
    const component = getRegisterPrompt();

    // when -- a password is submitted and the API returns 500
    component.password = 'SecurePass123';
    component.register();
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/customers/register`,
    );
    req.flush(
      { message: 'Internal Server Error' },
      { status: 500, statusText: 'Internal Server Error' },
    );
    fixture.detectChanges();

    // then -- generic error message is displayed
    const error = fixture.nativeElement.querySelector(
      '[data-testid="register-error"]',
    );
    expect(error).toBeInstanceOf(HTMLElement);
    expect(error.textContent).toContain('Something went wrong');
  });

  it('should not submit when password is only whitespace', () => {
    // given -- the component is created
    createComponent();
    const component = getRegisterPrompt();

    // when -- register is called with whitespace-only password
    component.password = '   ';
    component.register();

    // then -- no HTTP request is made
    httpMock.expectNone(`${environment.apiBaseUrl}/customers/register`);
  });

  it('should show loading state while request is in progress', () => {
    // given -- the component is created
    createComponent();
    const component = getRegisterPrompt();

    // when -- a password is submitted
    component.password = 'SecurePass123';
    component.register();
    fixture.detectChanges();

    // then -- button shows loading text
    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[data-testid="register-submit-btn"]',
    );
    expect(button.textContent).toContain('Creating...');
    expect(button.disabled).toBe(true);

    // cleanup
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/customers/register`,
    );
    req.flush({
      id: 1,
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '',
      street: '',
      apartment: null,
      city: '',
      postalCode: '',
    });
  });
});
