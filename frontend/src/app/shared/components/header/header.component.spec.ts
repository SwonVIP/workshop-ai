import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
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
