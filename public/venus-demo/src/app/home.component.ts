import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'home-component',
  template: ` <router-outlet></router-outlet> `,
  imports: [RouterOutlet],
})
export class HomeComponent {}
