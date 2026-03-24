import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SuggestionsComponent } from './suggestions.component';
import { SuggestionService } from '../../../core/services/suggestion.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';
import { signal } from '@angular/core';

describe('SuggestionsComponent', () => {
  const mockProducts: Product[] = [
    {
      id: 10,
      name: 'USB Cable',
      description: 'Fast charging cable',
      price: 9.99,
      imageUrl: 'https://placehold.co/400x300?text=USB',
      category: { id: 1, name: 'Electronics', description: 'Gadgets' },
    },
    {
      id: 11,
      name: 'Mouse Pad',
      description: 'Large gaming mouse pad',
      price: 19.99,
      imageUrl: 'https://placehold.co/400x300?text=MousePad',
      category: { id: 1, name: 'Electronics', description: 'Gadgets' },
    },
  ];

  function createMockSuggestionService(products: Product[] = mockProducts) {
    return {
      getSuggestions: vi.fn().mockReturnValue(of(products)),
    };
  }

  function createMockCartService() {
    return {
      cart: signal(null),
      itemCount: signal(0),
      loadCart: vi.fn(),
      addItem: vi.fn().mockReturnValue(of({})),
      getCart: vi.fn().mockReturnValue(of({})),
      updateItem: vi.fn().mockReturnValue(of({})),
      removeItem: vi.fn().mockReturnValue(of(undefined)),
      clearCart: vi.fn().mockReturnValue(of({})),
      cartItemsByProductId: signal(new Map()),
    };
  }

  function setup(products: Product[] = mockProducts) {
    const mockSuggestionService = createMockSuggestionService(products);
    const mockCartService = createMockCartService();

    TestBed.configureTestingModule({
      imports: [SuggestionsComponent],
      providers: [
        { provide: SuggestionService, useValue: mockSuggestionService },
        { provide: CartService, useValue: mockCartService },
      ],
    });

    const fixture = TestBed.createComponent(SuggestionsComponent);
    fixture.detectChanges();
    return { fixture, mockSuggestionService, mockCartService };
  }

  it('should render suggestion items when suggestions are available', () => {
    // given — suggestions service returns products
    const { fixture } = setup(mockProducts);

    // then — suggestion items are rendered
    const items = fixture.nativeElement.querySelectorAll('[data-testid="suggestion-item"]');
    expect(items.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('USB Cable');
    expect(fixture.nativeElement.textContent).toContain('Mouse Pad');
  });

  it('should display section title when suggestions exist', () => {
    // given — suggestions are available
    const { fixture } = setup(mockProducts);

    // then — the section title is shown
    expect(fixture.nativeElement.textContent).toContain('You might also need');
  });

  it('should call cartService.addItem when Add button is clicked', () => {
    // given — suggestions are rendered
    const { fixture, mockCartService, mockSuggestionService } = setup(mockProducts);

    // when — clicking the Add button on the first suggestion
    const addBtns = fixture.nativeElement.querySelectorAll(
      '[data-testid="suggestion-add-btn"]',
    ) as NodeListOf<HTMLButtonElement>;
    addBtns[0].click();

    // then — addItem is called with the correct product ID and quantity 1
    expect(mockCartService.addItem).toHaveBeenCalledWith({ productId: 10, quantity: 1 });
  });

  it('should refresh suggestions after adding an item to cart', () => {
    // given — suggestions are rendered
    const { fixture, mockSuggestionService } = setup(mockProducts);

    // initial load
    expect(mockSuggestionService.getSuggestions).toHaveBeenCalledTimes(1);

    // when — clicking the Add button
    const addBtns = fixture.nativeElement.querySelectorAll(
      '[data-testid="suggestion-add-btn"]',
    ) as NodeListOf<HTMLButtonElement>;
    addBtns[0].click();

    // then — getSuggestions is called again to refresh
    expect(mockSuggestionService.getSuggestions).toHaveBeenCalledTimes(2);
  });

  it('should hide the entire section when no suggestions are available', () => {
    // given — suggestions service returns empty list
    const { fixture } = setup([]);

    // then — the suggestions section is not rendered
    const section = fixture.nativeElement.querySelector('[data-testid="suggestions-section"]');
    expect(section).toBeFalsy();
  });
});
