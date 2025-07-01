import { Routes } from '@angular/router';
import { TerraformComponent } from './terraform.component';
import { VenusComponent } from './venus.component';
import { HomeComponent } from './home.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => HomeComponent,
    children: [
      {
        path: 'venus',
        loadComponent: () => VenusComponent,
      },
      {
        path: 'terraform',
        loadComponent: () => TerraformComponent,
      },
    ],
  },
];
