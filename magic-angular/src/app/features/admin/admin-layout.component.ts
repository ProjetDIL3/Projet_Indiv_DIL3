import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

// Pour ne pas repeter le code de la sidebar dans chaque composant de la page admin.
@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [RouterOutlet, SidebarComponent],
    template: `
      <div class="admin-layout">
        <app-sidebar></app-sidebar>
        <div class="admin-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    `,
    styleUrls: ['./admin-board/admin-board.component.scss']
  })
  export class AdminLayoutComponent {}