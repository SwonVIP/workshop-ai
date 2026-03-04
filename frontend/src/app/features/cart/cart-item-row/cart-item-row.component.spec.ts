import { TestBed } from '@angular/core/testing';
import { CartItemRowComponent } from './cart-item-row.component';
import { CartItem } from '../../../core/models/cart.model';

describe('CartItemRowComponent', () => {
  const mockItem: CartItem = {
    id: 10,
    product: { id: 42, name: 'Wireless Mouse', price: 29.99, imageUrl: '/images/mouse.jpg' },
    quantity: 2,
    subtotal: 59.98,
  };

  function createComponent(item: CartItem = mockItem) {
    const fixture = TestBed.createComponent(CartItemRowComponent);
    fixture.componentRef.setInput('item', item);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartItemRowComponent],
    }).compileComponents();
  });

  it('should display product name and subtotal', () => {
    // given — a cart item row with product data
    const fixture = createComponent();

    // then — product name and subtotal are displayed
    expect(fixture.nativeElement.textContent).toContain('Wireless Mouse');
    expect(fixture.nativeElement.textContent).toContain('59.98');
  });

  it('should display unit price', () => {
    // given — a cart item row with product data
    const fixture = createComponent();

    // then — the unit price is displayed with "each"
    expect(fixture.nativeElement.textContent).toContain('29.99');
    expect(fixture.nativeElement.textContent).toContain('each');
  });

  it('should display quantity value', () => {
    // given — a cart item with quantity 2
    const fixture = createComponent();

    // then — the quantity value is displayed
    const qtyEl = fixture.nativeElement.querySelector('[data-testid="qty-value"]');
    expect(qtyEl).toBeInstanceOf(HTMLElement);
    expect(qtyEl.textContent.trim()).toBe('2');
  });

  it('should disable minus button when quantity is 1', () => {
    // given — a cart item with quantity 1
    const singleItem: CartItem = { ...mockItem, quantity: 1, subtotal: 29.99 };
    const fixture = createComponent(singleItem);

    // then — the decrease button is disabled
    const decreaseBtn = fixture.nativeElement.querySelector('[data-testid="qty-decrease"]');
    expect(decreaseBtn.disabled).toBe(true);
  });

  it('should enable minus button when quantity is greater than 1', () => {
    // given — a cart item with quantity 2
    const fixture = createComponent();

    // then — the decrease button is enabled
    const decreaseBtn = fixture.nativeElement.querySelector('[data-testid="qty-decrease"]');
    expect(decreaseBtn.disabled).toBe(false);
  });

  it('should emit quantityChange with incremented quantity when plus clicked', () => {
    // given — a cart item row
    const fixture = createComponent();
    const emitted: { itemId: number; quantity: number }[] = [];
    fixture.componentInstance.quantityChange.subscribe((e) => emitted.push(e));

    // when — the increase button is clicked
    const increaseBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[data-testid="qty-increase"]',
    );
    increaseBtn.click();

    // then — quantityChange is emitted with incremented quantity
    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toEqual({ itemId: 10, quantity: 3 });
  });

  it('should emit quantityChange with decremented quantity when minus clicked', () => {
    // given — a cart item row with quantity 2
    const fixture = createComponent();
    const emitted: { itemId: number; quantity: number }[] = [];
    fixture.componentInstance.quantityChange.subscribe((e) => emitted.push(e));

    // when — the decrease button is clicked
    const decreaseBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[data-testid="qty-decrease"]',
    );
    decreaseBtn.click();

    // then — quantityChange is emitted with decremented quantity
    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toEqual({ itemId: 10, quantity: 1 });
  });

  it('should emit remove with item id when remove clicked', () => {
    // given — a cart item row
    const fixture = createComponent();
    const emitted: number[] = [];
    fixture.componentInstance.remove.subscribe((id) => emitted.push(id));

    // when — the remove button is clicked
    const removeBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[data-testid="remove-item"]',
    );
    removeBtn.click();

    // then — remove is emitted with item id
    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toBe(10);
  });
});
