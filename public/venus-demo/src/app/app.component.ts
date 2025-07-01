import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <div class="navigator-container">
      <a routerLink="/venus" routerLinkActive="active">venus</a>
      <br />
      <a routerLink="/terraform" routerLinkActive="active">terraform</a>
    </div>
    <section class="renderer-wrapper">
      <router-outlet></router-outlet>
    </section>
  `,
  styleUrl: './app.component.css',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
})
export class AppComponent {}
