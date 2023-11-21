import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Category } from 'src/app/models/category.interface';
import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-user-sidebar',
  templateUrl: './user-sidebar.component.html',
  styleUrls: ['./user-sidebar.component.css']
})
export class UserSidebarComponent {

  categories: Category[] = [];

  constructor(private _category: CategoryService, private _snack: MatSnackBar) {}

  ngOnInit() {
    this._category.categories().subscribe(
      (data:any) => {
        this.categories = data;
      },
      (error) => {
        this._snack.open('Error while loading categories from server', '', {
          duration: 3000
        })
        console.log(error);
      }
    )
  }
}
