import { Component } from '@angular/core';
import { User } from 'src/app/models/user.interface';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  user:User = {
    id: 0,
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    enabled: true,
    authorities: undefined
  };

  constructor(private login: LoginService) {}
  
  ngOnInit(): void {
    this.user = this.login.getUser();
  }
}
