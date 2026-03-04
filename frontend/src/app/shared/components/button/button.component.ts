import { Component, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button [class]="buttonClasses()" [disabled]="disabled()" [type]="type()">
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly disabled = input(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  private readonly baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  private readonly variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-white hover:bg-primary-hover',
    secondary: 'bg-secondary text-white hover:bg-secondary-hover',
    danger: 'bg-danger text-white hover:bg-danger-hover',
    outline: 'border border-primary text-primary bg-transparent hover:bg-primary-light',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100',
  };

  private readonly sizeClasses: Record<ButtonSize, string> = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };

  readonly buttonClasses = computed(() =>
    `${this.baseClasses} ${this.variantClasses[this.variant()]} ${this.sizeClasses[this.size()]}`
  );
}
