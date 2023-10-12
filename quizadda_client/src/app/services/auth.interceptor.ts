import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HTTP_INTERCEPTORS
    } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginService } from './login.service';
 
@Injectable()
export class AppInterceptor implements HttpInterceptor {
    constructor(private login:LoginService) {}
    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        // add the jwt token (localStorage) request
        let authReq=req;
        const token = this.login.getToken();
        if(token != null) {
            authReq = authReq.clone({
                setHeaders: {Authorization: `Bearer ${token}`}
            });
        }
        return next.handle(authReq);
    }
}

export const authInterceptorProviders=[
    {
        provide: HTTP_INTERCEPTORS,
        useClass: AppInterceptor,
        multi: true
    }
];