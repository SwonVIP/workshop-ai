import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                [attr.d]="iconPath()"/>
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-neutral-900 mb-1">{{ title() }}</h3>
      <p class="text-sm text-neutral-500 mb-6 max-w-sm">{{ message() }}</p>
      @if (actionLabel() && actionLink()) {
        <a [routerLink]="actionLink()"
           class="inline-flex items-center justify-center font-medium rounded-md bg-primary text-white px-4 py-2 hover:bg-primary-hover transition-colors">
          {{ actionLabel() }}
        </a>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input('');
  readonly message = input('');
  readonly actionLabel = input('');
  readonly actionLink = input('');
  readonly iconPath = input('M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4');
}
