import { Component, computed, input, output } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-pagination',
  imports: [HlmButton],
  template: `
    <nav class="flex items-center justify-center gap-1.5 mt-8" data-testid="pagination">
      <button hlmBtn variant="ghost" size="sm"
        [disabled]="isFirstPage()"
        (click)="previousPage()">
        &larr; Previous
      </button>

      @for (page of visiblePages(); track page) {
        <button hlmBtn
          [variant]="page === currentPage() ? 'default' : 'outline'"
          size="icon"
          class="w-9 h-9 text-sm"
          (click)="goToPage(page)">
          {{ page + 1 }}
        </button>
      }

      <button hlmBtn variant="ghost" size="sm"
        [disabled]="isLastPage()"
        (click)="nextPage()">
        Next &rarr;
      </button>
    </nav>
  `,
})
export class PaginationComponent {
  readonly currentPage = input(0);
  readonly totalPages = input(1);
  readonly pageChange = output<number>();

  readonly isFirstPage = computed(() => this.currentPage() === 0);
  readonly isLastPage = computed(() => this.currentPage() >= this.totalPages() - 1);

  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i);
    }

    let start = Math.max(0, current - Math.floor(maxVisible / 2));
    const end = Math.min(total, start + maxVisible);
    start = Math.max(0, end - maxVisible);

    return Array.from({ length: end - start }, (_, i) => start + i);
  });

  previousPage(): void {
    if (!this.isFirstPage()) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (!this.isLastPage()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  goToPage(page: number): void {
    this.pageChange.emit(page);
  }
}
