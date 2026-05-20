import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private readonly path = `${baseUrl}/api/v1/categories`;

  constructor(private _http: HttpClient) { }

  public categories() {
    return this._http.get(this.path);
  }

  public addCategory(category: any) {
    return this._http.post(this.path, category);
  }

  public deleteCategory(catId: number) {
    return this._http.delete(`${this.path}/${catId}`);
  }
}
