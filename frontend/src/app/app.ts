import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header />
    <main class="pt-16 min-h-screen bg-neutral-50">
      <div class="max-w-screen-xl mx-auto px-4 py-8">
        <router-outlet />
      </div>
    </main>
    <app-footer />
  `,
})
export class App {
  title = 'Workshop Store';
}
