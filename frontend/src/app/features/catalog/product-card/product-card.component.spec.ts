import { TestBed } from '@angular/core/testing';
import { ProductCardComponent } from './product-card.component';
import { Product } from '../../../core/models/product.model';

describe('ProductCardComponent', () => {
  const mockProduct: Product = {
    id: 1,
    name: 'Wireless Headphones',
    description: 'Great sound quality with noise cancellation',
    price: 89.99,
    imageUrl: 'https://placehold.co/400x300',
    category: { id: 1, name: 'Electronics', description: '' },
  };

  function createComponent(product: Product = mockProduct) {
    const fixture = TestBed.createComponent(ProductCardComponent);
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
    }).compileComponents();
  });

  it('should display product name and price', () => {
    // given — a product card with product data
    const fixture = createComponent();

    // then — product name and price are displayed
    expect(fixture.nativeElement.textContent).toContain('Wireless Headphones');
    expect(fixture.nativeElement.textContent).toContain('89.99');
  });

  it('should display the category badge with data-testid', () => {
    // given — a product with a category
    const fixture = createComponent();

    // then — the category badge is visible with correct data-testid
    const badge = fixture.nativeElement.querySelector('[data-testid="category-badge"]');
    expect(badge).toBeInstanceOf(HTMLElement);
    expect(badge.textContent.trim()).toBe('Electronics');
  });

  it('should display the product image', () => {
    // given — a product with an image URL
    const fixture = createComponent();

    // then — the image element renders with the correct src
    const img = fixture.nativeElement.querySelector('img');
    expect(img).toBeInstanceOf(HTMLImageElement);
    expect(img.getAttribute('src')).toBe('https://placehold.co/400x300');
  });

  it('should display the Add to Cart button', () => {
    // given — a product card
    const fixture = createComponent();

    // then — the Add to Cart button is present with correct label
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    const addToCartButton = buttons.find((b) => b.textContent?.includes('Add to Cart'));
    expect(addToCartButton).toBeInstanceOf(HTMLButtonElement);
    expect(addToCartButton!.textContent!.trim()).toContain('Add to Cart');
  });

  it('should emit addToCart event when Add to Cart button clicked', () => {
    // given — a product card with a product
    const fixture = createComponent();

    // when — clicking Add to Cart
    const emitted: Product[] = [];
    fixture.componentInstance.addToCart.subscribe((p: Product) => emitted.push(p));

    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    const addToCartButton = buttons.find((b) =>
      b.textContent?.includes('Add to Cart'),
    ) as HTMLButtonElement;
    addToCartButton.click();

    // then — the product is emitted
    expect(emitted).toHaveLength(1);
    expect(emitted[0].id).toBe(1);
    expect(emitted[0].name).toBe('Wireless Headphones');
  });

  it('should truncate long product descriptions to two lines via line-clamp-2', () => {
    // given — a product with a very long description
    const longDescProduct: Product = {
      ...mockProduct,
      description: 'A'.repeat(500),
    };
    const fixture = createComponent(longDescProduct);

    // then — the description element has line-clamp-2 class and shows the long text
    const desc = fixture.nativeElement.querySelector('[data-testid="product-description"]');
    expect(desc).toBeInstanceOf(HTMLElement);
    expect(desc.classList).toContain('line-clamp-2');
    expect(desc.textContent.trim()).toBe('A'.repeat(500));
  });

  it('should have data-testid="product-card" on the root element', () => {
    // given — a rendered product card
    const fixture = createComponent();

    // then — root element has the correct data-testid
    const card = fixture.nativeElement.querySelector('[data-testid="product-card"]');
    expect(card).toBeInstanceOf(HTMLElement);
  });

  it('should display price in CHF format', () => {
    // given — a product with price 89.99
    const fixture = createComponent();

    // then — price is displayed with CHF
    expect(fixture.nativeElement.textContent).toContain('CHF');
    expect(fixture.nativeElement.textContent).toContain('89.99');
  });

  it.each([
    { price: 0, expected: '0.00' },
    { price: 10.5, expected: '10.50' },
    { price: 99999.99, expected: '99,999.99' },
  ])('should format price $price correctly', ({ price, expected }) => {
    // given — a product with a specific price
    const product: Product = { ...mockProduct, price };
    const fixture = createComponent(product);

    // when — the card is rendered
    const text = fixture.nativeElement.textContent;

    // then — the formatted price is displayed
    expect(text).toContain(expected);
  });

  it('should set alt attribute on product image to product name', () => {
    // given — a product card is rendered
    const fixture = createComponent();

    // then — image alt attribute matches product name
    const img = fixture.nativeElement.querySelector('img');
    expect(img.getAttribute('alt')).toBe('Wireless Headphones');
  });

  it('should display product description text', () => {
    // given — a product card with a description
    const fixture = createComponent();

    // then — description text is visible
    const desc = fixture.nativeElement.querySelector('[data-testid="product-description"]');
    expect(desc).toBeInstanceOf(HTMLParagraphElement);
    expect(desc.textContent.trim()).toBe('Great sound quality with noise cancellation');
  });

  // ── Cart quantity stepper ─────────────────────────────────────────

  it('should show Add to Cart button when cartQuantity is 0', () => {
    // given — a product card with cartQuantity = 0 (default)
    const fixture = createComponent();

    // then — Add to Cart button is present with correct label
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    const addBtn = buttons.find((b) => b.textContent?.includes('Add to Cart'));
    expect(addBtn).toBeInstanceOf(HTMLButtonElement);

    // and — stepper is not present
    const stepper = fixture.nativeElement.querySelector('[data-testid="card-qty-value"]');
    expect(stepper).toBeFalsy();
  });

  it('should show quantity stepper when cartQuantity is greater than 0', () => {
    // given — a product card with cartQuantity = 3
    const fixture = createComponent();
    fixture.componentRef.setInput('cartQuantity', 3);
    fixture.detectChanges();

    // then — stepper is visible with correct quantity
    const qtyValue = fixture.nativeElement.querySelector('[data-testid="card-qty-value"]');
    expect(qtyValue).toBeInstanceOf(HTMLElement);
    expect(qtyValue.textContent.trim()).toBe('3');

    // and — Add to Cart button is not present
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    const addBtn = buttons.find((b) => b.textContent?.includes('Add to Cart'));
    expect(addBtn).toBeFalsy();
  });

  it('should display cart quantity value in stepper', () => {
    // given — a product card with cartQuantity = 5
    const fixture = createComponent();
    fixture.componentRef.setInput('cartQuantity', 5);
    fixture.detectChanges();

    // then — quantity value displays 5
    const qtyValue = fixture.nativeElement.querySelector('[data-testid="card-qty-value"]');
    expect(qtyValue.textContent.trim()).toBe('5');
  });

  it('should emit removeFromCart when minus button clicked', () => {
    // given — a product card with cartQuantity > 0
    const fixture = createComponent();
    fixture.componentRef.setInput('cartQuantity', 2);
    fixture.detectChanges();

    // when — clicking the decrease button
    const emitted: Product[] = [];
    fixture.componentInstance.removeFromCart.subscribe((p: Product) => emitted.push(p));
    const decreaseBtn = fixture.nativeElement.querySelector(
      '[data-testid="card-qty-decrease"]',
    ) as HTMLButtonElement;
    decreaseBtn.click();

    // then — the product is emitted via removeFromCart
    expect(emitted).toHaveLength(1);
    expect(emitted[0].id).toBe(1);
  });

  it('should emit addToCart when plus button clicked in stepper mode', () => {
    // given — a product card with cartQuantity > 0
    const fixture = createComponent();
    fixture.componentRef.setInput('cartQuantity', 2);
    fixture.detectChanges();

    // when — clicking the increase button
    const emitted: Product[] = [];
    fixture.componentInstance.addToCart.subscribe((p: Product) => emitted.push(p));
    const increaseBtn = fixture.nativeElement.querySelector(
      '[data-testid="card-qty-increase"]',
    ) as HTMLButtonElement;
    increaseBtn.click();

    // then — the product is emitted via addToCart
    expect(emitted).toHaveLength(1);
    expect(emitted[0].id).toBe(1);
  });
});
