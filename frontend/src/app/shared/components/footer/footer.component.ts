import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="bg-muted border-t border-border">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <p class="text-sm text-muted-foreground">
            &copy; {{ currentYear }} Workshop Store. All rights reserved.
          </p>
          <nav class="flex gap-6 text-sm">
            <a routerLink="/catalog" class="text-muted-foreground hover:text-foreground transition-colors">
              Catalog
            </a>
            <a routerLink="/cart" class="text-muted-foreground hover:text-foreground transition-colors">
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
