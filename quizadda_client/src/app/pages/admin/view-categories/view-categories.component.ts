import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { CategoryResponse } from 'src/app/models/category.interface';
import { CategoryService } from 'src/app/services/category.service';

/**
 * Admin list view of all categories. Delete uses a Swal confirm before issuing
 * the request — failures themselves are surfaced by the global error
 * interceptor, so this component only needs to handle the success path.
 */
@Component({
  selector: 'app-view-categories',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatListModule, RouterLink],
  templateUrl: './view-categories.component.html',
  styleUrls: ['./view-categories.component.css']
})
export class ViewCategoriesComponent {

  private readonly categoryService = inject(CategoryService);
  private readonly destroyRef = inject(DestroyRef);

  categories: CategoryResponse[] = [];

  ngOnInit(): void {
    this.loadCategories();
  }

  deleteCategory(catId: number): void {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure you want to delete this category ?',
      showCancelButton: true,
      confirmButtonText: 'Yes'
    }).then(result => {
      if (result.isConfirmed) {
        this.categoryService.delete(catId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              Swal.fire('Success', 'Category deleted successfully !!', 'success');
              this.loadCategories();
            }
            // Errors flow through the error interceptor's global Swal.
          });
      }
    });
  }

  trackByCatId(_: number, c: CategoryResponse): number {
    return c.catId;
  }

  private loadCategories(): void {
    this.categoryService.list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: data => (this.categories = data) });
  }
}
