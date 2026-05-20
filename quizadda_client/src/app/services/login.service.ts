import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from './helper';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  public loginStatusSubject = new Subject<boolean>();

  constructor(private http: HttpClient) { }

  public getCurrentUser() {
    return this.http.get(`${baseUrl}/api/v1/auth/me`);
  }

  public generateToken(loginData: any) {
    return this.http.post(`${baseUrl}/api/v1/auth/login`, loginData);
  }

  public loginUser(token: string) {
    localStorage.setItem('token', token);
    return true;
  }

  public isLoggedIn() {
    const tokenStr = localStorage.getItem('token');
    return !(tokenStr == undefined || tokenStr === '' || tokenStr == null);
  }

  public logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return true;
  }

  public getToken() {
    return localStorage.getItem('token');
  }

  public setUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  public getUser() {
    const userStr = localStorage.getItem('user');
    if (userStr != null) {
      return JSON.parse(userStr);
    }
    this.logout();
    return null;
  }

  // The backend returns `authorities` as a string[] (e.g. ["USER"] or ["ADMIN"]).
  public getUserRole(): string | null {
    const user = this.getUser();
    if (!user || !user.authorities || user.authorities.length === 0) {
      return null;
    }
    return user.authorities[0];
  }
}
