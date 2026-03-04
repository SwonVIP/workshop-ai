import { Component } from '@angular/core';

@Component({
  selector: 'app-checkout',
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="max-w-lg p-8 border-2 border-dashed border-border rounded-lg bg-muted">
        <h2 class="text-2xl font-bold text-foreground mb-4">Checkout</h2>
        <p class="text-muted-foreground mb-6">
          This page is your canvas. Use Claude Code CLI to build your checkout experience here.
        </p>
        <ul class="text-sm text-muted-foreground space-y-1 text-left">
          <li>Shipping information form</li>
          <li>Payment form (simulated)</li>
          <li>Order summary sidebar</li>
          <li>Order confirmation page</li>
        </ul>
      </div>
    </div>
  `,
})
export class CheckoutComponent {}
