import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { CategoryResponse } from 'src/app/models/category.interface';
import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-user-sidebar',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatListModule, RouterLink],
  templateUrl: './user-sidebar.component.html',
  styleUrls: ['./user-sidebar.component.css']
})
export class UserSidebarComponent {

  private readonly categoryService = inject(CategoryService);
  private readonly destroyRef = inject(DestroyRef);

  categories: CategoryResponse[] = [];

  ngOnInit(): void {
    this.categoryService.list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => (this.categories = data)
        // Failures here are surfaced by the global error interceptor; no
        // contextual handling needed because an empty sidebar is graceful.
      });
  }

  trackByCatId(_: number, c: CategoryResponse): number {
    return c.catId;
  }
}
