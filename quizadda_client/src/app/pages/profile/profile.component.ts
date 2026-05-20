import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UserResponse } from 'src/app/models/user.interface';
import { AuthService } from 'src/app/services/auth.service';

/**
 * Read-only profile view. The user payload is already cached in
 * {@link AuthService}, so this reads synchronously instead of refetching.
 * No edit affordance yet — that endpoint doesn't exist on the backend.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  user: UserResponse | null = null;

  ngOnInit(): void {
    this.user = inject(AuthService).getCurrentUser();
  }
}
