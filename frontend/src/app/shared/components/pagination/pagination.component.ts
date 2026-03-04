import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <nav class="flex items-center justify-center gap-2 mt-8" data-testid="pagination">
      <button
        class="px-3 py-1.5 text-sm rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        [disabled]="isFirstPage()"
        (click)="previousPage()">
        &larr; Previous
      </button>
      @for (page of visiblePages(); track page) {
        <button
          [class]="page === currentPage()
            ? 'px-3 py-1.5 text-sm rounded-md bg-primary text-white'
            : 'px-3 py-1.5 text-sm rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors'"
          (click)="goToPage(page)">
          {{ page + 1 }}
        </button>
      }
      <button
        class="px-3 py-1.5 text-sm rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
