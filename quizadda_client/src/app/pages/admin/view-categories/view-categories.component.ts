import { Component } from '@angular/core';
import { CategoryService } from 'src/app/services/category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-categories',
  templateUrl: './view-categories.component.html',
  styleUrls: ['./view-categories.component.css']
})
export class ViewCategoriesComponent {

  categories = [{
    cat_id: 23,
    title: "Programming",
    description: "this is testing category"
  }];

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
}
