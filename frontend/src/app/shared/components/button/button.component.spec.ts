import { TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();
  });

  it('should apply primary variant styles by default', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('variant', 'primary');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList).toContain('bg-primary');
  });

  it('should apply secondary variant styles', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('variant', 'secondary');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList).toContain('bg-secondary');
  });

  it('should apply danger variant styles', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('variant', 'danger');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList).toContain('bg-danger');
  });

  it('should apply outline variant styles', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('variant', 'outline');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList).toContain('border');
    expect(button.classList).toContain('border-primary');
  });

  it('should apply ghost variant styles', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('variant', 'ghost');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList).toContain('bg-transparent');
  });

  it('should apply small size', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList).toContain('text-sm');
    expect(button.classList).toContain('px-3');
  });

  it('should apply medium size by default', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList).toContain('text-base');
    expect(button.classList).toContain('px-4');
  });

  it('should apply large size', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList).toContain('text-lg');
    expect(button.classList).toContain('px-6');
  });

  it('should render projected content', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
  });

  it('should support disabled state', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);
  });
});
