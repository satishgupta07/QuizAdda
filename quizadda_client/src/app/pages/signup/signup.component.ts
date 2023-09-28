import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {

  constructor(private userService: UserService) {}

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
      alert('Username is required !!');
      return;
    }

    // addUser: userservice
    this.userService.addUser(this.user).subscribe(
      (data:any) => {
        //success
        console.log(data);
        alert('success');
      },
      (error) => {
        //Error
        console.log(error);
        alert('something went wrong');
      }
    )
  }
}
