import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, RouterLink],
  template: `
    <div class="container text-center mt20">
      <mat-card>
        <mat-card-content>
          <h1>404 — Page Not Found</h1>
          <p>The page you're looking for doesn't exist or has been moved.</p>
          <a mat-raised-button color="primary" routerLink="/">Take me home</a>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .text-center { text-align: center; }
    .mt20 { margin-top: 20px; }
  `]
})
export class NotFoundComponent {}
