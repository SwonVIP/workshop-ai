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
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain('Electronics');
  });

  it('should display the product image', () => {
    // given — a product with an image URL
    const fixture = createComponent();

    // then — the image element renders with the correct src
    const img = fixture.nativeElement.querySelector('img');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('https://placehold.co/400x300');
  });

  it('should display the Add to Cart button', () => {
    // given — a product card
    const fixture = createComponent();

    // then — the Add to Cart button is present
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    const addToCartButton = buttons.find(
      (b) => b.textContent?.includes('Add to Cart')
    );
    expect(addToCartButton).toBeTruthy();
  });

  it('should emit addToCart event when Add to Cart button clicked', () => {
    // given — a product card with a product
    const fixture = createComponent();

    // when — clicking Add to Cart
    const emitted: Product[] = [];
    fixture.componentInstance.addToCart.subscribe((p: Product) => emitted.push(p));

    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    const addToCartButton = buttons.find(
      (b) => b.textContent?.includes('Add to Cart')
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

    // then — the description element has line-clamp-2 class
    const desc = fixture.nativeElement.querySelector('[data-testid="product-description"]');
    expect(desc).toBeTruthy();
    expect(desc.classList.contains('line-clamp-2')).toBe(true);
  });

  it('should have data-testid="product-card" on the root element', () => {
    // given — a rendered product card
    const fixture = createComponent();

    // then — root element has the correct data-testid
    const card = fixture.nativeElement.querySelector('[data-testid="product-card"]');
    expect(card).toBeTruthy();
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
    expect(desc).toBeTruthy();
    expect(desc.textContent.trim()).toBe('Great sound quality with noise cancellation');
  });
});
