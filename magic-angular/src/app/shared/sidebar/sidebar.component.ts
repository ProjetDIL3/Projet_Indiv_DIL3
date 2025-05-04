import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth/auth.service';
import { AdminEventsService } from '../../core/api/admin-events.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isGenerating: boolean = false;

  constructor(private authService: AuthService,
              private adminService: AdminEventsService,
              private snackBar: MatSnackBar) {}


  logout(): void {
    this.authService.logout();
  }


  generateRandomEvents(): void {
    if (this.isGenerating) {
      this.snackBar.open('Génération d\'événements déjà en cours', 'Fermer', {
        duration: 3000
      });
      return;
    }

    this.isGenerating = true;
    this.snackBar.open('Génération de 10 événements en cours...', 'Fermer', {
      duration: 3000
    });

    this.adminService.generateEvents(10).subscribe({
      next: (result) => {
        this.snackBar.open(result.message, 'Fermer', {
          duration: 5000
        });
        this.isGenerating = false;
      },
      error: (error) => {
        console.error('Erreur lors de la génération:', error);
        this.snackBar.open('Erreur lors de la génération des événements', 'Fermer', {
          duration: 5000
        });
        this.isGenerating = false;
      }
    });
  }
}