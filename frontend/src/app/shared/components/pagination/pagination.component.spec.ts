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
});
