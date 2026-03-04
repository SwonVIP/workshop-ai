import { TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();
  });

  it('should display page numbers', () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('totalPages', 3);
    fixture.componentRef.setInput('currentPage', 0);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    // Previous + 3 pages + Next = 5 buttons
    expect(buttons.length).toBe(5);
  });

  it('should disable Previous button on first page', () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('totalPages', 3);
    fixture.componentRef.setInput('currentPage', 0);
    fixture.detectChanges();

    const prevButton = fixture.nativeElement.querySelector('button');
    expect(prevButton.disabled).toBe(true);
  });

  it('should disable Next button on last page', () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('totalPages', 3);
    fixture.componentRef.setInput('currentPage', 2);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const nextButton = buttons[buttons.length - 1];
    expect(nextButton.disabled).toBe(true);
  });

  it('should emit pageChange on next click', () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('totalPages', 3);
    fixture.componentRef.setInput('currentPage', 0);
    fixture.detectChanges();

    const spy = vi.spyOn(fixture.componentInstance.pageChange, 'emit');
    fixture.componentInstance.nextPage();

    expect(spy).toHaveBeenCalledWith(1);
  });

  it('should emit pageChange on previous click', () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('totalPages', 3);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();

    const spy = vi.spyOn(fixture.componentInstance.pageChange, 'emit');
    fixture.componentInstance.previousPage();

    expect(spy).toHaveBeenCalledWith(0);
  });

  it('should emit pageChange on page number click', () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('totalPages', 3);
    fixture.componentRef.setInput('currentPage', 0);
    fixture.detectChanges();

    const spy = vi.spyOn(fixture.componentInstance.pageChange, 'emit');
    fixture.componentInstance.goToPage(2);

    expect(spy).toHaveBeenCalledWith(2);
  });

  it('should highlight current page with default variant', () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('totalPages', 3);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    // buttons: [Prev, Page1, Page2, Page3, Next] — Page2 (index 2) should be active
    // Spartan hlmBtn default variant applies bg-primary
    expect(buttons[2].classList).toContain('bg-primary');
  });

  it.each([
    { totalPages: 10, currentPage: 0, expectedPages: [0, 1, 2, 3, 4], description: 'first page shows first 5' },
    { totalPages: 10, currentPage: 5, expectedPages: [3, 4, 5, 6, 7], description: 'middle page centers window' },
    { totalPages: 10, currentPage: 9, expectedPages: [5, 6, 7, 8, 9], description: 'last page shows last 5' },
    { totalPages: 3, currentPage: 1, expectedPages: [0, 1, 2], description: 'small total shows all pages' },
  ])('should display $description when totalPages=$totalPages and currentPage=$currentPage', ({ totalPages, currentPage, expectedPages }) => {
    // given — pagination with specific totalPages and currentPage
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('totalPages', totalPages);
    fixture.componentRef.setInput('currentPage', currentPage);
    fixture.detectChanges();

    // when — visiblePages is computed
    const visiblePages = fixture.componentInstance.visiblePages();

    // then — the sliding window matches expected pages
    expect(visiblePages).toEqual(expectedPages);
  });

  it('should not emit pageChange when clicking previous on first page', () => {
    // given — pagination on first page
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 0);
    fixture.detectChanges();

    const spy = vi.spyOn(fixture.componentInstance.pageChange, 'emit');

    // when — previousPage is called
    fixture.componentInstance.previousPage();

    // then — no event emitted
    expect(spy).not.toHaveBeenCalled();
  });

  it('should not emit pageChange when clicking next on last page', () => {
    // given — pagination on last page
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 4);
    fixture.detectChanges();

    const spy = vi.spyOn(fixture.componentInstance.pageChange, 'emit');

    // when — nextPage is called
    fixture.componentInstance.nextPage();

    // then — no event emitted
    expect(spy).not.toHaveBeenCalled();
  });

  it('should handle totalPages 0 gracefully', () => {
    // given — pagination with 0 total pages
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('totalPages', 0);
    fixture.componentRef.setInput('currentPage', 0);
    fixture.detectChanges();

    // then — no page number buttons rendered, only Previous and Next
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(2); // Previous + Next only
  });

  it('should handle totalPages 1', () => {
    // given — pagination with exactly 1 page
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('totalPages', 1);
    fixture.componentRef.setInput('currentPage', 0);
    fixture.detectChanges();

    // then — single page button rendered
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(3); // Previous + 1 page + Next

    // and — both Previous and Next are disabled
    const prevButton = buttons[0];
    const nextButton = buttons[buttons.length - 1];
    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(true);
  });

  it('should display 1-indexed page labels', () => {
    // given — pagination with 3 pages
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('totalPages', 3);
    fixture.componentRef.setInput('currentPage', 0);
    fixture.detectChanges();

    // then — page buttons show 1-indexed labels (page 0 → "1", page 1 → "2", page 2 → "3")
    const buttons = fixture.nativeElement.querySelectorAll('button');
    // buttons: [Previous, Page0, Page1, Page2, Next]
    expect(buttons[1].textContent.trim()).toBe('1');
    expect(buttons[2].textContent.trim()).toBe('2');
    expect(buttons[3].textContent.trim()).toBe('3');
  });
});
