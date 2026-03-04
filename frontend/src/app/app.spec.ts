import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { App } from './app';
import { HeaderComponent } from './shared/components/header/header.component';
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

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(HeaderComponent, {
        remove: { imports: SHEET_IMPORTS },
        add: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('should create app when bootstrapped', () => {
    // given/when — app component created
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    // then — instance exists
    expect(app).toBeTruthy();
  });

  it('should render header and footer elements when rendered', () => {
    // given — app rendered
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    // then — header and footer exist
    expect(fixture.nativeElement.querySelector('app-header')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-footer')).toBeTruthy();
  });

  it('should have main with pt-16 when rendered', () => {
    // given — app rendered
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    // then — main has pt-16 for header offset
    const main = fixture.nativeElement.querySelector('main');
    expect(main).toBeTruthy();
    expect(main.classList).toContain('pt-16');
  });

  it('should use min-h-screen flex layout when rendered', () => {
    // given — app rendered
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    // then — flex column layout with min-h-screen
    const wrapper = fixture.nativeElement.querySelector('div');
    expect(wrapper.classList).toContain('min-h-screen');
    expect(wrapper.classList).toContain('flex');
    expect(wrapper.classList).toContain('flex-col');
  });
});
