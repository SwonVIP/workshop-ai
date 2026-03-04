import { TestBed } from '@angular/core/testing';
import { CheckoutComponent } from './checkout.component';

describe('CheckoutComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
    }).compileComponents();
  });

  it('should create the checkout component', () => {
    const fixture = TestBed.createComponent(CheckoutComponent);
    expect(fixture.componentInstance).toBeInstanceOf(CheckoutComponent);
  });

  it('should display workshop placeholder heading when rendered', () => {
    const fixture = TestBed.createComponent(CheckoutComponent);
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('h2');
    expect(heading).toBeInstanceOf(HTMLHeadingElement);
    expect(heading.textContent).toContain('Checkout');
  });

  it('should display implementation instructions when rendered', () => {
    const fixture = TestBed.createComponent(CheckoutComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Use Claude Code CLI to build your checkout experience here');
  });
});
