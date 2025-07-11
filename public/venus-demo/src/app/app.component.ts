import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <div class="navigator-container">
      <a routerLink="/venus" routerLinkActive="active">venus</a>
      <a routerLink="/terraform" routerLinkActive="active">terraform</a>
      <a routerLink="/rover_terraform" routerLinkActive="active"
        >rover + terraform</a
      >
    </div>
    <section class="renderer-wrapper">
      <router-outlet></router-outlet>
    </section>
  `,
  styleUrl: './app.component.css',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
})
export class AppComponent implements OnInit {
  ngOnInit(): void {}
}
