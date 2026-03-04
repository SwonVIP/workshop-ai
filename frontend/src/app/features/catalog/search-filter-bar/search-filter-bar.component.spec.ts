import { TestBed } from '@angular/core/testing';
import { SearchFilterBarComponent } from './search-filter-bar.component';
import { ProductFilter } from '../../../core/models/product.model';

describe('SearchFilterBarComponent', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [SearchFilterBarComponent],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createComponent(categories = [{ id: 1, name: 'Electronics', description: '' }, { id: 2, name: 'Books', description: '' }]) {
    const fixture = TestBed.createComponent(SearchFilterBarComponent);
    fixture.componentRef.setInput('categories', categories);
    fixture.detectChanges();
    return fixture;
  }

  it('should emit search filter after debounce when user types', () => {
    // given — the filter bar is rendered
    const fixture = createComponent();

    const emitted: ProductFilter[] = [];
    fixture.componentInstance.filterChange.subscribe((f: ProductFilter) => emitted.push(f));

    // when — user types "headphones" in the search input
    const input = fixture.nativeElement.querySelector('input[type="text"]');
    input.value = 'headphones';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    vi.advanceTimersByTime(300); // debounce time

    // then — filter change is emitted with search term
    expect(emitted.length).toBeGreaterThanOrEqual(1);
    expect(emitted[emitted.length - 1].search).toBe('headphones');
  });

  it('should not emit search filter before debounce completes', () => {
    // given — the filter bar is rendered
    const fixture = createComponent();

    const emitted: ProductFilter[] = [];
    fixture.componentInstance.filterChange.subscribe((f: ProductFilter) => emitted.push(f));

    // when — user types but we don't wait for debounce
    const input = fixture.nativeElement.querySelector('input[type="text"]');
    input.value = 'head';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    vi.advanceTimersByTime(100); // less than debounce

    // then — no filter emitted yet from search
    const searchEmissions = emitted.filter(f => f.search === 'head');
    expect(searchEmissions.length).toBe(0);

    // cleanup — let remaining timer fire
    vi.advanceTimersByTime(200);
  });

  it('should emit category filter when category dropdown changes', () => {
    // given — filter bar with categories
    const fixture = createComponent();

    const emitted: ProductFilter[] = [];
    fixture.componentInstance.filterChange.subscribe((f: ProductFilter) => emitted.push(f));

    // when — selecting Electronics
    const select = fixture.nativeElement.querySelector('[data-testid="category-filter"]');
    select.value = 'Electronics';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    // then — filter change is emitted
    expect(emitted.length).toBeGreaterThanOrEqual(1);
    expect(emitted[emitted.length - 1].category).toBe('Electronics');
  });

  it('should emit price range filter when price dropdown changes', () => {
    // given — filter bar is rendered
    const fixture = createComponent([]);

    const emitted: ProductFilter[] = [];
    fixture.componentInstance.filterChange.subscribe((f: ProductFilter) => emitted.push(f));

    // when — selecting price range 50-100
    const select = fixture.nativeElement.querySelector('[data-testid="price-filter"]');
    select.value = '50-100';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    // then — filter emitted with minPrice and maxPrice
    expect(emitted.length).toBeGreaterThanOrEqual(1);
    expect(emitted[emitted.length - 1].minPrice).toBe(50);
    expect(emitted[emitted.length - 1].maxPrice).toBe(100);
  });

  it('should emit sort filter when sort dropdown changes', () => {
    // given — filter bar is rendered
    const fixture = createComponent([]);

    const emitted: ProductFilter[] = [];
    fixture.componentInstance.filterChange.subscribe((f: ProductFilter) => emitted.push(f));

    // when — selecting "Price Low-High"
    const select = fixture.nativeElement.querySelector('[data-testid="sort-filter"]');
    select.value = 'price-asc';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    // then — sort filter emitted
    expect(emitted.length).toBeGreaterThanOrEqual(1);
    expect(emitted[emitted.length - 1].sort).toBe('price');
    expect(emitted[emitted.length - 1].direction).toBe('asc');
  });

  it('should render all category options in the dropdown', () => {
    // given — categories are provided
    const fixture = createComponent();

    // then — dropdown has the categories plus the "All" default
    const select = fixture.nativeElement.querySelector('[data-testid="category-filter"]');
    const options = select.querySelectorAll('option');
    expect(options.length).toBe(3); // "All Categories" + Electronics + Books
    expect(options[1].textContent.trim()).toBe('Electronics');
    expect(options[2].textContent.trim()).toBe('Books');
  });

  it('should render all price range options in the dropdown', () => {
    // given — filter bar is rendered
    const fixture = createComponent([]);

    // then — price dropdown has all predefined options
    const select = fixture.nativeElement.querySelector('[data-testid="price-filter"]');
    const options = select.querySelectorAll('option');
    expect(options.length).toBe(5); // Any Price, Under 25, 25-50, 50-100, Over 100
  });

  it('should render all sort options in the dropdown', () => {
    // given — filter bar is rendered
    const fixture = createComponent([]);

    // then — sort dropdown has 4 options + default
    const select = fixture.nativeElement.querySelector('[data-testid="sort-filter"]');
    const options = select.querySelectorAll('option');
    expect(options.length).toBe(5); // Default + 4 sort options
  });

  it('should have a search placeholder', () => {
    // given — the filter bar is rendered
    const fixture = createComponent([]);

    // then — search input has a placeholder
    const input = fixture.nativeElement.querySelector('input[type="text"]');
    expect(input.getAttribute('placeholder')).toBe('Search products...');
  });

  it('should clear price range when "Any Price" is selected', () => {
    // given — filter bar with a price filter already set
    const fixture = createComponent([]);

    const emitted: ProductFilter[] = [];
    fixture.componentInstance.filterChange.subscribe((f: ProductFilter) => emitted.push(f));

    // when — selecting "Any Price" (empty value)
    const select = fixture.nativeElement.querySelector('[data-testid="price-filter"]');
    select.value = '';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    // then — filter emitted without minPrice and maxPrice
    expect(emitted.length).toBeGreaterThanOrEqual(1);
    expect(emitted[emitted.length - 1].minPrice).toBeUndefined();
    expect(emitted[emitted.length - 1].maxPrice).toBeUndefined();
  });

  it('should cancel previous debounce and only emit final value on rapid typing', () => {
    // given — the filter bar is rendered
    const fixture = createComponent();

    const emitted: ProductFilter[] = [];
    fixture.componentInstance.filterChange.subscribe((f: ProductFilter) => emitted.push(f));
    const input = fixture.nativeElement.querySelector('input[type="text"]');

    // when — user types 'a', then quickly 'ab', then 'abc' before debounce completes
    input.value = 'a';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(100);

    input.value = 'ab';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(100);

    input.value = 'abc';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(300);

    // then — only the final value 'abc' is emitted
    expect(emitted.length).toBe(1);
    expect(emitted[0].search).toBe('abc');
  });

  it('should emit filter without search when input is cleared to empty string', () => {
    // given — user previously searched for something
    const fixture = createComponent();

    const emitted: ProductFilter[] = [];
    fixture.componentInstance.filterChange.subscribe((f: ProductFilter) => emitted.push(f));
    const input = fixture.nativeElement.querySelector('input[type="text"]');

    // when — user types then clears the input
    input.value = 'headphones';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(300);

    input.value = '';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(300);

    // then — second emission has no search property
    expect(emitted.length).toBe(2);
    expect(emitted[1].search).toBeUndefined();
  });

  it('should emit combined filter when multiple filters are active', () => {
    // given — filter bar with categories
    const fixture = createComponent();

    const emitted: ProductFilter[] = [];
    fixture.componentInstance.filterChange.subscribe((f: ProductFilter) => emitted.push(f));

    // when — setting category, price, sort, and search all at once
    const categorySelect = fixture.nativeElement.querySelector('[data-testid="category-filter"]');
    categorySelect.value = 'Electronics';
    categorySelect.dispatchEvent(new Event('change'));

    const priceSelect = fixture.nativeElement.querySelector('[data-testid="price-filter"]');
    priceSelect.value = '50-100';
    priceSelect.dispatchEvent(new Event('change'));

    const sortSelect = fixture.nativeElement.querySelector('[data-testid="sort-filter"]');
    sortSelect.value = 'price-asc';
    sortSelect.dispatchEvent(new Event('change'));

    const input = fixture.nativeElement.querySelector('input[type="text"]');
    input.value = 'headphones';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(300);

    // then — the last emission contains all filters combined
    const lastEmitted = emitted[emitted.length - 1];
    expect(lastEmitted.category).toBe('Electronics');
    expect(lastEmitted.minPrice).toBe(50);
    expect(lastEmitted.maxPrice).toBe(100);
    expect(lastEmitted.sort).toBe('price');
    expect(lastEmitted.direction).toBe('asc');
    expect(lastEmitted.search).toBe('headphones');
  });

  it('should clean up debounce subscription on component destroy', () => {
    // given — a search input with a pending debounce timer
    const fixture = createComponent();

    const emitted: ProductFilter[] = [];
    fixture.componentInstance.filterChange.subscribe((f: ProductFilter) => emitted.push(f));

    const input = fixture.nativeElement.querySelector('input[type="text"]');
    input.value = 'pending';
    input.dispatchEvent(new Event('input'));

    // when — the component is destroyed before debounce fires
    fixture.destroy();
    vi.advanceTimersByTime(300);

    // then — no emission occurs (timer was cleaned up)
    expect(emitted.length).toBe(0);
  });
});
