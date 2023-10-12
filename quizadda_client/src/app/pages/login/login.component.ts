import { Component } from '@angular/core';
import {Router} from '@angular/router'; 
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginData = {
    username:'',
    password:''
  }

  constructor(private snack:MatSnackBar, private login:LoginService, private router:Router) {}

  formSubmit() {
    console.log('login btn clicked');

    if(this.loginData.username.trim() == '' || this.loginData.username == null) {
      this.snack.open("Username is required !!", '', {
        duration: 3000
      })
      return;
    }
    if(this.loginData.password.trim() == '' || this.loginData.password == null) {
      this.snack.open("Password is required !!", '', {
        duration: 3000
      })
      return;
    }

    // request to server to generate token
    this.login.generateToken(this.loginData).subscribe(
      (data: any) => {
        console.log('Success');
        console.log(data);

        // login...
        this.login.loginUser(data.token);

        this.login.getCurrentUser().subscribe(
          (user:any) => {
            this.login.setUser(user);
            console.log(user);
            // redirect... ADMIN: admin-dashboard
            // redirect... USER: user-dashboard
            if(this.login.getUserRole() == "ADMIN") {
              this.router.navigate(['/admin']);
            } else if(this.login.getUserRole() == "USER") {
              this.router.navigate(['/user-dashboard']);
            } else {
              this.login.logout();
            }
          }
        )

      },
      (error)=>{
        console.log("Error !");
        console.log(error);
        this.snack.open("Invalid Details !! Try again", '', {
          duration: 3000
        })
      }
    )
  }
}
