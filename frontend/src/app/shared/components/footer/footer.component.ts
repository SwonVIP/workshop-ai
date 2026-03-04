import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-neutral-900 text-white py-8">
      <div class="max-w-screen-xl mx-auto px-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-sm text-neutral-300">
            &copy; {{ currentYear }} Workshop Store. All rights reserved.
          </p>
          <nav class="flex gap-6 text-sm">
            <a routerLink="/catalog" class="text-neutral-300 hover:text-white transition-colors">
              Catalog
            </a>
            <a routerLink="/cart" class="text-neutral-300 hover:text-white transition-colors">
              Cart
            </a>
          </nav>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
