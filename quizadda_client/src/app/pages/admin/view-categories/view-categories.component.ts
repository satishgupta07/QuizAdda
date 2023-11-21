import { Component } from '@angular/core';
import { Category } from 'src/app/models/category.interface';
import { CategoryService } from 'src/app/services/category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-categories',
  templateUrl: './view-categories.component.html',
  styleUrls: ['./view-categories.component.css']
})
export class ViewCategoriesComponent {

  categories: Category[] = [];

  constructor(private _category: CategoryService) {}

  ngOnInit(): void {
    this._category.categories().subscribe((data:any) => {
      this.categories = data;
      console.log(this.categories);
    },
    (error) => {
      console.log(error);
      Swal.fire('Error !!', 'Error while loading data', 'error');
    })
  }

  deleteCategory(catId:Number) {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure you want to delete this category ?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        this._category.deleteCategory(catId).subscribe(
          (data: any) => {
            this.ngOnInit();
            Swal.fire('Success', 'Category deleted successfully !!', 'success');
          },
          (error) => {
            console.log(error);
            Swal.fire('Error !!', 'Error in deleting category', 'error');
          }
        );
      }
    });
  }

}
