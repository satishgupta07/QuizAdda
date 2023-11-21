import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css']
})
export class AddCategoryComponent {

  category = {
    title: '',
    description: ''
  }

  constructor(private _category:CategoryService, private _snack:MatSnackBar, private router: Router) {}

  formSubmit() {
    if(this.category.title == '' || this.category.title == null) {
      this._snack.open('Title Required !!', '', {
        duration: 3000
      })
      return;
    }

    this._category.addCategory(this.category).subscribe(
      (data:any) => {
        this.router.navigate(['/admin/categories'])
        Swal.fire('Success !!', 'Category added successfully', 'success');
        
      },
      (error) => {
        Swal.fire('Error !!', 'Something went wrong', 'error');
      }
    )
  }

}
