import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  
  constructor(public login: LoginService, public router: Router) {}

  ngOnInit(): void {

    if(this.login.isLoggedIn() && this.login.getUserRole() == 'ADMIN') {
      this.router.navigate(['/admin']);
    } else if(this.login.isLoggedIn() && this.login.getUserRole() == 'USER') {
      this.router.navigate(['/user-dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
