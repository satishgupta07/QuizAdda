import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RegisterUserRequest, UserResponse } from '../models/user.interface';
import baseUrl from './helper';

@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly http = inject(HttpClient);
  private readonly path = `${baseUrl}/api/v1/users`;

  register(user: RegisterUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.path, user);
  }
}
