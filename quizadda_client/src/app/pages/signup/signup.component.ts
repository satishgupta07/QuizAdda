import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {

  constructor(private userService: UserService, private _snackBar: MatSnackBar) {}

  public user = {
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  }

  formSubmit() {
    console.log(this.user);
    if(this.user.username == '' || this.user.username == null) {
      // alert('Username is required !!');
      this._snackBar.open('Username is required !!', '', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
      return;
    }

    // validate

    // addUser: userservice
    this.userService.addUser(this.user).subscribe(
      (data:any) => {
        //success
        console.log(data);
        // alert('success');
        Swal.fire('User is registered successfully', 'With userId '+data.id, 'success');
      },
      (error) => {
        //Error
        console.log(error);
        // alert('something went wrong');
        this._snackBar.open('Something went wrong !!', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      }
    )
  }
}
