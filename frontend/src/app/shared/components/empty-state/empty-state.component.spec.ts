import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should display configurable title', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('title', 'No items found');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No items found');
  });

  it('should display configurable message', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('message', 'Try adjusting your search');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Try adjusting your search');
  });

  it('should display action link when provided', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('actionLabel', 'Browse Catalog');
    fixture.componentRef.setInput('actionLink', '/catalog');
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a[href="/catalog"]');
    expect(link).toBeInstanceOf(HTMLAnchorElement);
    expect(link.textContent).toContain('Browse Catalog');
  });

  it('should not display action link when not provided', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('a');
    expect(links.length).toBe(0);
  });

  it('should display an icon', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeInstanceOf(SVGElement);
  });
});
