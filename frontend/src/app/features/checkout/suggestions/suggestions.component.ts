import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HlmButton } from '@spartan-ng/helm/button';
import { SuggestionService } from '../../../core/services/suggestion.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [CurrencyPipe, HlmButton],
  template: `
    @if (suggestions().length > 0) {
      <section data-testid="suggestions-section" class="mt-8">
        <h3 class="text-lg font-semibold text-foreground mb-4">You might also need</h3>
        <div class="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory pr-4 lg:flex-col lg:overflow-x-visible lg:snap-none lg:pr-0">
          @for (product of suggestions(); track product.id) {
            <div
              data-testid="suggestion-item"
              class="flex-shrink-0 w-44 snap-start rounded-lg border border-border bg-card p-3 flex flex-col gap-2 lg:w-auto lg:flex-row lg:items-center lg:gap-3"
            >
              <img
                [src]="product.imageUrl"
                [alt]="product.name"
                class="w-full aspect-[4/3] object-cover rounded lg:w-14 lg:h-14 lg:aspect-square"
              />
              <div class="flex flex-col gap-1 lg:flex-1 lg:min-w-0">
                <span class="text-sm font-medium text-card-foreground line-clamp-2 lg:line-clamp-1">{{
                  product.name
                }}</span>
                <span class="text-sm font-bold text-card-foreground whitespace-nowrap">{{
                  product.price | currency: 'CHF' : 'symbol' : '1.2-2'
                }}</span>
              </div>
              <button
                hlmBtn
                size="sm"
                class="shrink-0 mt-auto lg:mt-0"
                data-testid="suggestion-add-btn"
                (click)="addToCart(product)"
              >
                Add
              </button>
            </div>
          }
        </div>
      </section>
    }
  `,
})
export class SuggestionsComponent implements OnInit {
  private readonly suggestionService = inject(SuggestionService);
  private readonly cartService = inject(CartService);

  readonly suggestions = signal<Product[]>([]);

  ngOnInit(): void {
    this.loadSuggestions();
  }

  addToCart(product: Product): void {
    this.cartService.addItem({ productId: product.id, quantity: 1 }).subscribe(() => {
      this.loadSuggestions();
    });
  }

  private loadSuggestions(): void {
    this.suggestionService.getSuggestions().subscribe((products) => {
      this.suggestions.set(products);
    });
  }
}
