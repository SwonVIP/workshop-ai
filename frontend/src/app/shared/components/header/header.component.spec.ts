import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of } from 'rxjs';
import { HeaderComponent } from './header.component';
import {
  HlmSheet,
  HlmSheetContent,
  HlmSheetHeader,
  HlmSheetTitle,
  HlmSheetDescription,
  HlmSheetFooter,
  HlmSheetTrigger,
  HlmSheetClose,
  HlmSheetPortal,
} from '@spartan-ng/helm/sheet';
import { CartService } from '../../../core/services/cart.service';

const SHEET_IMPORTS = [
  HlmSheet,
  HlmSheetContent,
  HlmSheetHeader,
  HlmSheetTitle,
  HlmSheetDescription,
  HlmSheetFooter,
  HlmSheetTrigger,
  HlmSheetClose,
  HlmSheetPortal,
];

describe('HeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    })
      .overrideComponent(HeaderComponent, {
        remove: { imports: SHEET_IMPORTS },
        add: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('should display store name when rendered', () => {
    // given — header component rendered
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    // then — "Workshop Store" is visible
    expect(fixture.nativeElement.textContent).toContain('Workshop Store');
  });

  it('should contain catalog link when rendered', () => {
    // given — header rendered
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    // then — catalog link exists with correct text and href
    const catalogLink = fixture.nativeElement.querySelector('a[href="/catalog"]');
    expect(catalogLink).toBeInstanceOf(HTMLAnchorElement);
    expect(catalogLink.textContent.trim()).toContain('Catalog');
  });

  it('should render sheet trigger element when rendered', () => {
    // given — header rendered (Sheet components replaced by NO_ERRORS_SCHEMA)
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    // then — hlm-sheet element exists in DOM
    const sheet = fixture.nativeElement.querySelector('hlm-sheet');
    expect(sheet).toBeInstanceOf(HTMLElement);
  });

  it('should have fixed position when rendered', () => {
    // given — header rendered
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    // then — header element has fixed class
    const header = fixture.nativeElement.querySelector('header');
    expect(header).toBeInstanceOf(HTMLElement);
    expect(header.classList).toContain('fixed');
  });
});

describe('HeaderComponent interactive methods', () => {
  function createMockCartService() {
    return {
      cart: signal(null),
      itemCount: signal(0),
      loadCart: vi.fn(),
      getCart: vi.fn().mockReturnValue(of({})),
      addItem: vi.fn().mockReturnValue(of({})),
      updateItem: vi.fn().mockReturnValue(of({})),
      removeItem: vi.fn().mockReturnValue(of(undefined)),
      clearCart: vi.fn().mockReturnValue(of({})),
      cartItemsByProductId: signal(new Map()),
    };
  }

  let mockCartService: ReturnType<typeof createMockCartService>;

  beforeEach(async () => {
    mockCartService = createMockCartService();

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([]), { provide: CartService, useValue: mockCartService }],
    })
      .overrideComponent(HeaderComponent, {
        remove: { imports: SHEET_IMPORTS },
        add: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('should call cart service updateItem when quantity changes', () => {
    // given — header component with mock cart service
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    // when — onUpdateQuantity is called with itemId 5 and quantity 3
    fixture.componentInstance.onUpdateQuantity(5, 3);

    // then — cartService.updateItem is called with correct args
    expect(mockCartService.updateItem).toHaveBeenCalledWith(5, { quantity: 3 });
  });

  it('should call cart service removeItem when item is removed', () => {
    // given — header component with mock cart service
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    // when — onRemoveItem is called with itemId 7
    fixture.componentInstance.onRemoveItem(7);

    // then — cartService.removeItem is called with correct id
    expect(mockCartService.removeItem).toHaveBeenCalledWith(7);
  });

  it('should call cart service clearCart when cart is cleared', () => {
    // given — header component with mock cart service
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    // when — onClearCart is called
    fixture.componentInstance.onClearCart();

    // then — cartService.clearCart is called
    expect(mockCartService.clearCart).toHaveBeenCalledOnce();
  });

  it('should return correct item count from cartItemCount computed signal', () => {
    // given — cart service reports 5 items
    mockCartService.itemCount.set(5);
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    // then — cartItemCount reflects the service value
    expect(fixture.componentInstance.cartItemCount()).toBe(5);
  });
});
