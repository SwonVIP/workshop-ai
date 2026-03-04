import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-header />
      <main class="pt-16 flex-1 bg-muted/40">
        <div class="max-w-7xl mx-auto px-4 py-8">
          <router-outlet />
        </div>
      </main>
      <app-footer />
    </div>
  `,
})
export class App {
  title = 'Workshop Store';
}
